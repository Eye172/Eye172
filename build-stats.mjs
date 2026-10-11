import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./',import.meta.url), out=new URL('widgets/',root);
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
async function get(url,html=false){
 const headers={'User-Agent':'Eye172-profile',Accept:html?'text/html':'application/vnd.github+json'};
 if(!html&&process.env.GITHUB_TOKEN)headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
 const r=await fetch(url,{headers,signal:AbortSignal.timeout(30000)});
 if(!r.ok)throw Error(`GitHub HTTP ${r.status}; keeping last successful snapshot`);
 return html?r.text():r.json();
}
let data;
if(process.argv.includes('--offline'))data=JSON.parse(await readFile(new URL('stats.json',out),'utf8'));
else{
 const localDate=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const end=new Date(localDate+'T23:59:59+05:00');
 const start=new Date(localDate+'T00:00:00+05:00');start.setUTCFullYear(start.getUTCFullYear()-1);
 const query=`{ user(login:"Eye172") { contributionsCollection(from:"${start.toISOString()}",to:"${end.toISOString()}") { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`;
 let calendar;
 const inputIndex=process.argv.indexOf('--calendar');
 if(inputIndex!==-1)calendar=JSON.parse(await readFile(process.argv[inputIndex+1],'utf8'));
 else{
  if(!process.env.GITHUB_TOKEN)throw Error('Use GITHUB_TOKEN, --calendar <export.json>, or --offline');
  const response=await fetch('https://api.github.com/graphql',{method:'POST',headers:{Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,'Content-Type':'application/json','User-Agent':'Eye172-profile'},body:JSON.stringify({query}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error(`Calendar HTTP ${response.status}; keeping last successful snapshot`);
  const result=await response.json();
  if(result.errors)throw Error('Calendar query failed; keeping last successful snapshot');
  calendar=result.data?.user?.contributionsCollection?.contributionCalendar;
 }
 const days=calendar.weeks.flatMap(w=>w.contributionDays).map(d=>({date:d.date,count:d.contributionCount})).sort((a,b)=>a.date.localeCompare(b.date));
 const total=calendar.totalContributions;
 if(days.some(d=>!Number.isInteger(d.count)||d.count<0))throw Error('Invalid calendar data');
 if(days.length<365||days.length>371||total!==days.reduce((s,d)=>s+d.count,0))throw Error('Public calendar validation failed');
 const repos=[];
 for(let page=1;;page++){
  const batch=await get(`https://api.github.com/users/Eye172/repos?type=owner&per_page=100&page=${page}`);
  repos.push(...batch);if(batch.length<100)break;
 }
 const code=repos.filter(r=>!r.private&&!r.fork&&r.size>0&&r.name!=='Eye172'&&!r.name.endsWith('-showcase'));
 const languages={};
 for(const repo of code){
  const bytes=await get(`https://api.github.com/repos/Eye172/${encodeURIComponent(repo.name)}/languages`);
  for(const [name,n]of Object.entries(bytes))languages[name]=(languages[name]||0)+n;
 }
 data={updated:new Date().toISOString().slice(0,10),from:days[0].date,to:days.at(-1).date,contributions:total,activeDays:days.filter(d=>d.count>0).length,publicCodeRepos:code.length,repositories:code.map(r=>r.name).sort(),languages:Object.entries(languages).sort((a,b)=>b[1]-a[1]).map(([name,bytes])=>({name,bytes})),source:'https://docs.github.com/en/graphql/reference/users#contributioncalendar',includesAnonymizedPrivateActivity:true,languageSource:'https://docs.github.com/en/rest/repos/repos#list-repository-languages'};
}
if(!data.languages.length||!data.publicCodeRepos)throw Error('Empty source data');
await mkdir(out,{recursive:true});
const sum=data.languages.reduce((s,l)=>s+l.bytes,0);
const top=data.languages.slice(0,5), remaining=data.languages.slice(5).reduce((s,l)=>s+l.bytes,0);
if(remaining)top.push({name:'Other',bytes:remaining});
const color={dark:{bg:'#101010',fg:'#f2f2f2',muted:'#a3a3a3',line:'#303030',track:'#242424'},light:{bg:'#fafafa',fg:'#181818',muted:'#606060',line:'#d5d5d5',track:'#e6e6e6'}};
for(const [theme,c]of Object.entries(color))for(const mobile of [false,true])for(const kind of ['overview','languages']){
 const w=mobile?600:1120,h=kind==='overview'?(mobile?410:256):(mobile?640:360),pad=mobile?28:36;
 const text=(x,y,size,value,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${c.fg}" ${attrs}>${esc(value)}</text>`;
 const muted=`fill="${c.muted}"`;
 let s=`<rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="6" fill="${c.bg}" stroke="${c.line}"/>`;
 s+=text(pad,40,mobile?19:14,kind==='overview'?'GITHUB / OVERVIEW':'CODE / LANGUAGE MIX',`letter-spacing="2"`).replace(`fill="${c.fg}"`,`fill="${c.muted}"`);
 if(kind==='overview'){
  const metrics=[[data.contributions,'contributions','incl. private · last year'],[data.activeDays,'active days','last year'],[data.publicCodeRepos,'code repositories','public · non-fork']];
  metrics.forEach(([n,label,note],i)=>{
   const x=mobile?pad:pad+i*354,y=mobile?102+i*104:126;
   s+=text(x,y,mobile?48:56,n,'font-weight="600"');
   s+=text(mobile?148:x,mobile?y-13:y+34,mobile?23:20,label);
   s+=text(mobile?148:x,mobile?y+15:y+61,mobile?17:13,note).replace(`fill="${c.fg}"`,muted);
   if(!mobile&&i<2)s+=`<path d="M${x+316} 79V193" stroke="${c.line}"/>`;
  });
 }else{
  s+=text(pad,78,mobile?18:15,'Share of code bytes in public source repositories.').replace(`fill="${c.fg}"`,muted);
  top.forEach((l,i)=>{
   const x=mobile?pad:pad+(i%2)*548,y=mobile?128+i*76:128+Math.floor(i/2)*70,bw=mobile?544:500,pct=l.bytes/sum*100;
   s+=text(x,y,mobile?23:19,l.name)+text(x+bw,y,mobile?21:18,pct<.1?'<0.1%':pct.toFixed(1)+'%','text-anchor="end"').replace(`fill="${c.fg}"`,muted);
   s+=`<rect x="${x}" y="${y+15}" width="${bw}" height="8" rx="4" fill="${c.track}"/><rect x="${x}" y="${y+15}" width="${Math.max(2,bw*pct/100).toFixed(2)}" height="8" rx="4" fill="${c.fg}" opacity="${1-i*.10}"/>`;
  });
 }
 s+=`<path d="M${pad} ${h-45}H${w-pad}" stroke="${c.line}"/>`;
 s+=text(pad,h-19,mobile?15:12,kind==='overview'?`${data.from} — ${data.to}`:'PROFILE + SHOWCASES EXCLUDED').replace(`fill="${c.fg}"`,muted);
 s+=text(w-pad,h-19,mobile?15:12,`UPDATED ${data.updated}`,'text-anchor="end"').replace(`fill="${c.fg}"`,muted);
 const title=kind==='overview'?`${data.contributions} contributions, ${data.activeDays} active days in the last year; ${data.publicCodeRepos} public code repositories.`:'Public code language distribution by bytes: '+top.map(l=>`${l.name} ${(l.bytes/sum*100).toFixed(1)}%`).join(', ');
 await writeFile(new URL(`${kind}-${theme}${mobile?'-mobile':''}.svg`,out),`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:Consolas,'Liberation Mono',Menlo,monospace}</style>${s}</svg>\n`);
}
await writeFile(new URL('stats.json',out),JSON.stringify(data,null,2)+'\n');
const version=createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0,12);
const readmeFile=new URL('README.md',root);
const readme=await readFile(readmeFile,'utf8');
await writeFile(readmeFile,readme.replace(/(?:https:\/\/raw\.githubusercontent\.com\/Eye172\/Eye172\/main\/)?widgets\/((?:overview|languages)-[\w-]+\.svg)(?:\?v=[^"\s]+)?/g,(_,file)=>`https://raw.githubusercontent.com/Eye172/Eye172/main/widgets/${file}?v=${version}`));
console.log(JSON.stringify({contributions:data.contributions,activeDays:data.activeDays,publicCodeRepos:data.publicCodeRepos,topLanguages:top}));
