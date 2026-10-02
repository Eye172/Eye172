import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Public GitHub data only. --offline reads saved public fixtures.
// --metrics-only is used by the existing scheduled refresh workflow.
const dir=path.dirname(fileURLToPath(import.meta.url));
const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const mono='font-family="Consolas,Menlo,monospace"';
const save=(name,value)=>writeFile(path.join(dir,name),value);
const palettes={dark:{bg:'#0b0b0b',fg:'#f5f5f5',muted:'#aaa',levels:['#202020','#505050','#808080','#b8b8b8','#f0f0f0']},light:{bg:'#fafafa',fg:'#111',muted:'#555',levels:['#e5e5e5','#b0b0b0','#808080','#505050','#171717']}};
const text=(x,y,size,fill,value,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${attrs}>${esc(value)}</text>`;
const svg=(w,h,c,title,body,style='')=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><style>text{font-family:Arial,Helvetica,sans-serif}text[font-family]{font-family:Consolas,Menlo,monospace}${style}</style><rect width="${w}" height="${h}" fill="${c.bg}"/>${body}</svg>
`;
if(!process.argv.includes('--metrics-only')) {
 const art=(await readFile(path.join(dir,'hands-reference.png'))).toString('base64');
 for(const mobile of [false,true]) {
  const w=mobile?480:1120,h=mobile?400:340,x=mobile?28:48;
  const font=mobile?48:48,roleFont=mobile?26:25;
  const name='Shakhnazar Akhmer',role='Software, ML & AI Engineer';
  const first=mobile?'Shakhnazar':name,second='Akhmer';
  const lineWidth=first.length*font*.6,roleWidth=role.length*roleFont*.6;
  const y=mobile?84:150,ry=mobile?188:199;
  const clips=`<defs><clipPath id="n"><rect class="type-name" x="${x}" y="${y-font}" width="${lineWidth}" height="${font+8}"/></clipPath><clipPath id="s"><rect class="type-second" x="${x}" y="92" width="172.8" height="55"/></clipPath><clipPath id="r"><rect class="type-role" x="${x}" y="${ry-roleFont}" width="${roleWidth}" height="${roleFont+7}"/></clipPath></defs>`;
  const style=`@media(prefers-reduced-motion:no-preference){.type-name{animation:n ${mobile?1:1.7}s steps(${first.length},end) .15s both}.type-second{animation:s .6s steps(6,end) 1.2s both}.type-role{animation:r 1.3s steps(${role.length},end) 1.95s both}.cursor{animation:blink .55s step-end 3.25s 2}}.cursor{opacity:0}@keyframes n{from{width:0}to{width:${lineWidth}px}}@keyframes s{from{width:0}to{width:172.8px}}@keyframes r{from{width:0}to{width:${roleWidth}px}}@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}`;
  let body=clips+`<image href="data:image/png;base64,${art}" x="${mobile?0:590}" y="${mobile?163:30}" width="${mobile?480:530}" height="${mobile?270:298}"/>`;
  body+=text(x,y,font,'#f5f5f5',first,`${mono} textLength="${lineWidth}" lengthAdjust="spacingAndGlyphs" clip-path="url(#n)"`);
  if(mobile)body+=text(x,140,font,'#f5f5f5',second,`${mono} textLength="172.8" lengthAdjust="spacingAndGlyphs" clip-path="url(#s)"`);
  body+=text(x,ry,roleFont,'#b8b8b8',role,`${mono} textLength="${roleWidth}" lengthAdjust="spacingAndGlyphs" clip-path="url(#r)"`);
  body+=`<path class="cursor" d="M${x+roleWidth+4} ${ry-roleFont+3}v${roleFont}" stroke="#ddd" stroke-width="2"/>`;
  const header=svg(w,h,{bg:'#000'},'Shakhnazar Akhmer — Software, ML & AI Engineer. Terminal-style typing and monochrome ASCII hands.',body,style);
  for(const theme of ['dark','light'])await save(`header-${mobile?'mobile-':''}${theme}.svg`,header);
 }
}
async function get(url, asText = false) {
  const response = await fetch(url, { headers: { 'User-Agent': 'Eye172-profile', Accept: asText ? 'text/html' : 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return asText ? response.text() : response.json();
}
let repos = [], graph;
if (process.argv.includes('--offline')) {
  repos = JSON.parse((await readFile(path.join(dir, 'repos-source.json'), 'utf8')).replace(/^\uFEFF/, ''));
  graph = await readFile(path.join(dir, 'contributions-source.html'), 'utf8');
} else {
  graph = await get('https://github.com/users/Eye172/contributions', true);
  for (let page = 1; ; page++) {
    const batch = await get(`https://api.github.com/users/Eye172/repos?per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
}
const cells = [...graph.matchAll(/<td\b[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="([0-4])"[^>]*>/g)].map(m => ({ date: m[1], id: m[2], level: Number(m[3]) }));
if (cells.length < 300) throw new Error('GitHub calendar markup changed; keeping the last successful widgets.');
const tips = new Map([...graph.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)].map(m => [m[1], m[2].trim()]));
for (const cell of cells) {
  const label = tips.get(cell.id);
  if (!label) throw new Error(`Missing contribution count for ${cell.date}`);
  cell.count = /^No contributions/.test(label) ? 0 : Number(label.match(/^([\d,]+) contributions?/)?.[1]?.replaceAll(',', ''));
  if (!Number.isFinite(cell.count)) throw new Error(`Unrecognized contribution count: ${label}`);
}
cells.sort((a, b) => a.date.localeCompare(b.date));
const days = cells.slice(-112);
const total = days.reduce((sum, day) => sum + day.count, 0);
const active = days.filter(day => day.count > 0).length;
const selected = repos.filter(r => !r.fork && r.name !== 'Eye172' && r.size > 0);
const counts = {};
for (const repo of selected) if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1;
const languages = Object.entries(counts).sort((a, b) => b[1] - a[1]);
const date = cells.at(-1).date;
const title = `${total} public GitHub contributions across ${active} active days in the last 16 weeks, ${days[0].date} to ${date}. ${selected.length} original public code repositories. Primary languages: ${languages.map(([name, count]) => `${name} ${count}`).join(', ')}.`;
for(const [theme,c] of Object.entries(palettes)) {
 for(const mobile of [false,true]) {
  const w=mobile?480:960,h=mobile?324:180;
  let body=text(24,38,mobile?25:22,c.fg,'Public activity',mono);
  body+=text(24,mobile?75:88,mobile?24:27,c.fg,total+' contributions',mono);
  body+=text(24,mobile?107:121,mobile?23:19,c.muted,'Last 16 weeks',mono);
  const size=mobile?20:16,gap=mobile?7:5,gx=mobile?24:586,gy=mobile?128:22;
  days.forEach((day,i)=>{body+=`<rect x="${gx+Math.floor(i/7)*(size+gap)}" y="${gy+i%7*(size+gap)}" width="${size}" height="${size}" rx="1" fill="${c.levels[day.level]}"><title>${day.date}: ${day.count} contributions</title></rect>`});
  if(!mobile)body+=text(24,154,18,c.muted,'Updated '+date,mono);
  // Mobile calendar is fitted to 16 columns; no separate data rank or skill score.
  await save(`activity-${mobile?'mobile-':''}${theme}.svg`,svg(w,h,c,title,body));
 }
}
console.log(JSON.stringify({contributions:total,from:days[0].date,to:date}));
