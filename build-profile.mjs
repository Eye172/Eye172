import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const dir = path.dirname(fileURLToPath(import.meta.url));
await mkdir(dir, {recursive:true});
const esc = x => String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const palettes={dark:{bg:'#101719',fg:'#f0eee7',muted:'#a3b4b5',line:'#2d4143',accent:'#82ddc8',soft:'#162b2b'},light:{bg:'#f5f5ef',fg:'#172e30',muted:'#51686a',line:'#cbd9d4',accent:'#167b69',soft:'#e4eeE7'}};
const svg=(w,h,c,body,title)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:Arial,Helvetica,sans-serif} .mono{font-family:Consolas,monospace} .flow{stroke-dasharray:6 13;animation:flow 18s linear infinite} .orbit{transform-origin:766px 145px;animation:orbit 40s linear infinite} @keyframes flow{to{stroke-dashoffset:-190}} @keyframes orbit{to{transform:rotate(360deg)}} @media(prefers-reduced-motion:reduce){.flow,.orbit{animation:none}}</style><rect width="${w}" height="${h}" rx="18" fill="${c.bg}"/>${body}</svg>`;
const t=(x,y,size,fill,str,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(str)}</text>`;
const write=(name,data)=>writeFile(path.join(dir,name),data+'\n');
if (!process.argv.includes('--metrics-only')) {
 for(const [theme,c] of Object.entries(palettes)){
  let body=`<path d="M36 46H560 M36 249H924" stroke="${c.line}"/>`;
  body+=t(36,31,12,c.accent,'EYE172  /  SOFTWARE · ML · PRODUCT ENGINEERING','class="mono" letter-spacing="1.3"');
  body+=t(36,113,48,c.fg,'Shakhnazar Akhmer','font-weight="600" letter-spacing="-1.5"');
  body+=t(38,156,23,c.fg,'From an idea to a working system.');
  body+=t(38,198,15,c.muted,'AI workflows, computer vision, mobile & web applications.');
  body+=t(38,278,12,c.muted,'ASTANA, KAZAKHSTAN','class="mono" letter-spacing="1.5"');
  body+=t(922,278,12,c.accent,'BUILD / MEASURE / ITERATE','class="mono" text-anchor="end" letter-spacing="1.5"');
  body+=`<g fill="none" stroke="${c.line}"><circle cx="766" cy="145" r="104"/><circle cx="766" cy="145" r="79"/><path d="M634 145H898 M766 20V232"/><ellipse cx="766" cy="145" rx="45" ry="104"/><ellipse cx="766" cy="145" rx="104" ry="39"/></g><g class="orbit"><ellipse cx="766" cy="145" rx="104" ry="60" fill="none" stroke="${c.accent}" stroke-opacity=".5" transform="rotate(-35 766 145)"/><circle cx="851" cy="85" r="5" fill="${c.accent}"/></g><path d="M680 145Q766 53 852 145Q766 237 680 145Z" fill="${c.soft}" stroke="${c.accent}" stroke-width="1.5"/><circle cx="766" cy="145" r="30" fill="${c.bg}" stroke="${c.accent}"/><circle cx="766" cy="145" r="10" fill="${c.accent}"/><path class="flow" d="M662 220L709 182M824 107L872 67" stroke="${c.accent}"/>`;
  await write(`header-${theme}.svg`,svg(960,304,c,body,'Shakhnazar Akhmer — Software, ML and Product Engineering'));
  let stack='';
  const groups=[['01','SOFTWARE','Python · TypeScript · C#','React · Next.js · FastAPI'],['02','MACHINE LEARNING','PyTorch · OpenCV · Transformers','CNNs · fine-tuning · evaluation'],['03','INTERACTIVE SYSTEMS','React Native · Expo · Kotlin','Three.js · React Flow · LangGraph']];
  groups.forEach((g,i)=>{const x=28+i*310;if(i)stack+=`<path d="M${x-15}26V137" stroke="${c.line}"/>`;stack+=t(x,35,12,c.accent,g[0]+' / '+g[1],'class="mono"');stack+=t(x,78,16,c.fg,g[2]);stack+=t(x,108,15,c.muted,g[3]);});
  await write(`stack-${theme}.svg`,svg(960,158,c,stack,'Project stack: Python, TypeScript, C#, React, Next.js, FastAPI, PyTorch, OpenCV, Transformers, React Native, Expo, Kotlin, Three.js, React Flow and LangGraph'));
 }
 const c=palettes.dark;
 const projects=[['synapse','01 / MOBILE + COMPUTER VISION','SYNAPSE','Exercise technique, made visible.','React Native · Kotlin · MediaPipe','ANDROID APPLICATION'],['campus','02 / AI + GEOSPATIAL','CampusLense','Explore a university before you arrive.','React · FastAPI · 3D Maps','LOCUS 2026 · 1ST PLACE'],['agrofly','03 / MACHINE LEARNING','AgroFly','Multispectral imagery to field maps.','PyTorch · ResNet18 · OpenCV','SOFTWARE + ML'],['aedexa','04 / PRODUCT ENGINEERING','AEDEXA','From drawings to spatial decisions.','Python · TypeScript · Three.js','QWERTYS · TEAM PROJECT']];
 for(const [id,label,name,tag,stack,status] of projects){
  let art='';
  if(id==='synapse')art=`<g fill="none" stroke="${c.accent}" stroke-width="2"><path d="M368 58L365 83L338 111M365 83L397 107M365 83L369 123L345 153M369 123L395 154"/><circle cx="369" cy="43" r="10"/></g>`;
  if(id==='campus')art=`<g fill="none" stroke="${c.accent}" opacity=".8"><ellipse cx="371" cy="93" rx="48" ry="49"/><ellipse cx="371" cy="93" rx="20" ry="49"/><ellipse cx="371" cy="93" rx="48" ry="18"/><path d="M323 93H419M371 44V142"/></g>`;
  if(id==='agrofly'){for(let r=0;r<5;r++)for(let col=0;col<5;col++)art+=`<rect x="${326+col*19}" y="${45+r*19}" width="14" height="14" rx="3" fill="${c.accent}" opacity="${.12+((r*3+col*2)%5)*.14}"/>`;}
  if(id==='aedexa')art=`<g fill="none" stroke="${c.accent}" stroke-width="1.5"><path d="M323 78L365 55L414 79L373 105Z M323 78V126L373 152L414 127V79 M373 105V152 M337 86V119L359 131V98 M384 99V127L402 117V89"/></g>`;
  const body=t(26,31,11,c.accent,label,'class="mono" letter-spacing=".9"')+art+t(26,91,34,c.fg,name,'font-weight="600" letter-spacing="-1"')+t(26,129,15,c.muted,tag)+`<path d="M26 164H424" stroke="${c.line}"/>`+t(26,189,13,c.fg,stack)+t(26,219,10,c.accent,status,'class="mono" letter-spacing="1.2"');
  await write(`${id}.svg`,svg(450,242,c,body,`${name}: ${tag} ${stack}`));
 }
}
async function get(url){const r=await fetch(url,{headers:{'User-Agent':'Eye172-profile','Accept':'application/vnd.github+json'},signal:AbortSignal.timeout(30000)});if(!r.ok)throw new Error(`GitHub ${r.status}`);return r.json();}
const repos=[];
for(let page=1;;page++){const batch=await get(`https://api.github.com/users/Eye172/repos?per_page=100&page=${page}`);repos.push(...batch);if(batch.length<100)break;}
const selected=repos.filter(r=>!r.fork&&r.name!=='Eye172'&&r.size>0);
const counts={};for(const r of selected)if(r.language)counts[r.language]=(counts[r.language]||0)+1;
const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
const date=new Date().toISOString().slice(0,10);
for(const [theme,c] of Object.entries(palettes)){
 let body=t(28,33,12,c.accent,'PUBLIC CODE / AT A GLANCE','class="mono" letter-spacing="1.4"')+t(930,33,11,c.muted,`UPDATED ${date} UTC`,'class="mono" text-anchor="end"');
 body+=t(28,99,44,c.fg,selected.length,'font-weight="600"')+t(100,83,16,c.fg,'public code repositories')+t(100,108,13,c.muted,'Original repositories with committed content');
 let x=430;const total=Object.values(counts).reduce((a,b)=>a+b,0);sorted.forEach(([lang,n],i)=>{const width=480*n/total;body+=`<rect x="${x}" y="67" width="${Math.max(0,width-3)}" height="10" rx="3" fill="${c.accent}" opacity="${1-i*.18}"/>`;x+=width;});
 body+=t(430,103,13,c.fg,sorted.map(([k,v])=>`${k}: ${v}`).join('  ·  '));
 body+=`<path d="M28 137H932" stroke="${c.line}"/>`+t(28,164,12,c.muted,'Repository count by primary language · excludes forks, empty repositories and this profile.');
 await write(`activity-${theme}.svg`,svg(960,188,c,body,`Public code snapshot ${date}. ${selected.length} repositories. ${sorted.map(([k,v])=>`${k}: ${v}`).join(', ')}`));
}
console.log('Profile SVGs generated successfully.');
