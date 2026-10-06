import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
async function get(url,html=false) {
  const r=await fetch(url,{headers:{'User-Agent':'Eye172-profile',Accept:html?'text/html':'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw new Error(`GitHub returned ${r.status}; keeping last successful assets.`);
  return html?r.text():r.json();
}
let repos=[],graph;
if(process.argv.includes('--offline')) {
  repos=JSON.parse((await readFile(path.join(root,'repos-source.json'),'utf8')).replace(/^\uFEFF/,''));
  graph=await readFile(path.join(root,'contributions-source.html'),'utf8');
}else{
  graph=await get('https://github.com/users/Eye172/contributions',true);
  for(let page=1;;page++){
    const batch=await get(`https://api.github.com/users/Eye172/repos?per_page=100&page=${page}`);
    repos.push(...batch);if(batch.length<100)break;
  }
}
const cells=[...graph.matchAll(/<td\b([^>]*\bdata-date="\d{4}-\d{2}-\d{2}"[^>]*)>/g)].map(m=>{
  const attr=name=>m[1].match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
  return {date:attr('data-date'),id:attr('id'),level:Number(attr('data-level'))};
});
if(cells.length<300)throw new Error('Calendar format changed; keeping last successful assets.');
const tips=new Map([...graph.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)].map(m=>[m[1],m[2].trim()]));
for(const cell of cells){
  const label=tips.get(cell.id);
  cell.count=/^No contributions/.test(label||'')?0:Number(label?.match(/^([\d,]+) contributions?/)?.[1]?.replaceAll(',',''));
  if(!Number.isFinite(cell.count)||!Number.isInteger(cell.level)||cell.level<0||cell.level>4)throw new Error(`Unrecognized activity for ${cell.date}`);
}
cells.sort((a,b)=>a.date.localeCompare(b.date));
const latest=cells.at(-1).date, end=new Date(latest+'T00:00:00Z');
const start=new Date(end);start.setUTCDate(start.getUTCDate()-start.getUTCDay()-15*7);
const startDate=start.toISOString().slice(0,10), days=cells.filter(c=>c.date>=startDate&&c.date<=latest);
const total=days.reduce((s,c)=>s+c.count,0), active=days.filter(c=>c.count>0).length;
const originals=repos.filter(r=>!r.fork&&r.name!=='Eye172'&&!r.name.endsWith('-showcase')&&r.size>0);
const themes={dark:{bg:'#101010',fg:'#ededed',muted:'#aaa',border:'#303030',levels:['#222','#535353','#828282','#b5b5b5','#ededed']},light:{bg:'#f7f7f5',fg:'#171717',muted:'#5a5a5a',border:'#d8d8d4',levels:['#e3e3de','#bdbdb7','#888883','#555550','#202020']}};
const title=`GitHub profile calendar: ${total} contributions across ${active} active days, ${startDate} to ${latest}. ${originals.length} non-fork, non-empty public code repositories, excluding this profile and project showcases.`;
for(const [theme,c] of Object.entries(themes))for(const mobile of [false,true]){
  const w=mobile?600:1120,h=mobile?430:252,pad=mobile?30:36;
  const txt=(x,y,size,value,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" ${extra}>${esc(value)}</text>`;
  let body=`<rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="10" fill="${c.bg}" stroke="${c.border}"/>`;
  body+=txt(pad,36,mobile?16:12,'ACTIVITY / 16-WEEK CALENDAR',`fill="${c.muted}" letter-spacing="1.5"`);
  body+=txt(pad,100,47,total,'font-weight="600"');
  body+=txt(pad,126,mobile?20:14,'contributions',`fill="${c.muted}"`);
  const sx=mobile?230:245;
  body+=txt(sx,100,47,originals.length,'font-weight="600"');
  body+=txt(sx,126,mobile?20:14,'public code repos',`fill="${c.muted}"`);
  body+=txt(pad,mobile?162:168,mobile?16:12,`${startDate} — ${latest}`,`fill="${c.muted}"`);
  const gx=mobile?pad:600, gy=mobile?191:58, size=mobile?22:18, step=mobile?34:29;
  for(const d of days){
    const offset=Math.round((new Date(d.date+'T00:00:00Z')-start)/86400000);
    body+=`<rect x="${gx+Math.floor(offset/7)*step}" y="${gy+(offset%7)*26}" width="${size}" height="18" rx="2" fill="${c.levels[d.level]}"><title>${d.date}: ${d.count} contributions</title></rect>`;
  }
  body+=txt(pad,h-22,12,'PUBLIC SNAPSHOT · REFRESHED WEEKLY',`fill="${c.muted}" letter-spacing=".7"`);
  body+=txt(w-pad,h-22,12,`${active} active days`,`fill="${c.muted}" text-anchor="end"`);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="${c.fg}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:Consolas,'Liberation Mono',Menlo,monospace}</style>${body}</svg>\n`;
  await writeFile(path.join(root,`activity-${mobile?'mobile-':''}${theme}.svg`),svg);
}
console.log(JSON.stringify({from:startDate,to:latest,contributions:total,activeDays:active,publicCodeRepos:originals.length}));
