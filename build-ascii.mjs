import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Original vector ASCII sculpture. No image service, JavaScript in SVG, or external fonts.
const root = path.dirname(fileURLToPath(import.meta.url));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = (x, y, size, content, attrs = '') => `<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${escape(content)}</text>`;
const normalize = v => { const n = Math.hypot(...v); return v.map(x => x / n); };
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const curve = t => [(1.5+.46*Math.cos(3*t))*Math.cos(2*t), (1.5+.46*Math.cos(3*t))*Math.sin(2*t), .8*Math.sin(3*t)];
const samples = [];
for (let t = 0; t < Math.PI*2; t += .019) {
  const p = curve(t), q = curve(t+.001), tangent = normalize(q.map((v,i) => v-p[i]));
  const n = normalize(cross(tangent, [0,0,1])), b = cross(tangent,n);
  for (let v = 0; v < Math.PI*2; v += .10) {
    const normal = n.map((x,i) => x*Math.cos(v)+b[i]*Math.sin(v));
    samples.push({p:p.map((x,i) => x+.38*normal[i]), n:normal});
  }
}
function rotate([x,y,z], phase) {
  const a = .65 + Math.sin(phase)*.30, b = -.50 + Math.cos(phase)*.30, c = -.40 + Math.sin(phase)*.12;
  [y,z] = [y*Math.cos(a)-z*Math.sin(a), y*Math.sin(a)+z*Math.cos(a)];
  [x,z] = [x*Math.cos(b)+z*Math.sin(b), -x*Math.sin(b)+z*Math.cos(b)];
  return [x*Math.cos(c)-y*Math.sin(c), x*Math.sin(c)+y*Math.cos(c), z];
}
const COLS=100, ROWS=58, FRAMES=64, DURATION=16;
function frame(index) {
  const depth = new Float32Array(COLS*ROWS).fill(-100), chars = Array(COLS*ROWS).fill(' ');
  const ramp = '.,:;+=xX#%@';
  for (const sample of samples) {
    const [x,y,z]=rotate(sample.p,index/FRAMES*Math.PI*2), n=rotate(sample.n,index/FRAMES*Math.PI*2);
    const perspective=5.5/(6.5-z), col=Math.round(COLS/2+x*21*perspective), row=Math.round(ROWS/2-y*13.4*perspective);
    if(col<0||col>=COLS||row<0||row>=ROWS) continue;
    const slot=row*COLS+col;
    if(z<=depth[slot]) continue;
    depth[slot]=z;
    const light=Math.max(0,n[0]*-.30+n[1]*.50+n[2]*.81);
    chars[slot]=ramp[Math.min(ramp.length-1, Math.floor((.10+light*.9)*(ramp.length-1)))];
  }
  let content='';
  for(let row=0;row<ROWS;row++) {
    const line=chars.slice(row*COLS,(row+1)*COLS).join('').trimEnd();
    const leading=line.length-line.trimStart().length;
    if(line.trim()) content+=text(leading*5.2,row*8,8.8,line.trimStart(),'xml:space="preserve"');
  }
  return `<g class="frame frame-${index}">${content}</g>`;
}
const frames=Array.from({length:FRAMES},(_,i)=>frame(i)).join('');
const frameStyles=Array.from({length:FRAMES},(_,i)=>`.frame-${i}{animation-delay:${(-DURATION+i*DURATION/FRAMES).toFixed(3)}s}`).join('');
const phrases=['turning ideas into software.','building with vision and AI.','from prototype to product.'];

function banner(mobile, still=false) {
  const w=mobile?600:1120, h=mobile?710:440;
  const x=mobile?32:44, typeY=mobile?264:320, typeSize=mobile?21:21, charWidth=12.6;
  const artX=mobile?75:678, artY=mobile?294:70, artScale=mobile?.85:.67;
  const headingSize=mobile?60:68;
  let css=`text{fill:#efefef;font-family:Consolas,'Liberation Mono',Menlo,monospace}.sans{font-family:Arial,Helvetica,sans-serif}.muted{fill:#969696}.micro{fill:#898989;letter-spacing:1.6px}.frame{display:none}.frame-0{display:inline}.sculpture text{fill:#dedede}.terminal-text{fill:#d2d2d2}.phrase{visibility:hidden}.phrase-0{visibility:visible}.cursor{fill:#d2d2d2}`;
  phrases.forEach((p,i)=>{css+=`.caret-${i}{transform:translateX(${p.length*charWidth+3}px)}`;});
  if(!still){
    css+=`@media(prefers-reduced-motion:no-preference){.frame{display:inline;opacity:0;animation:sculpture ${DURATION}s steps(1,end) infinite}${frameStyles}.phrase{visibility:visible;opacity:0;animation:phrase 18s steps(1,end) infinite}.phrase-0{animation-delay:0s}.phrase-1{animation-delay:6s}.phrase-2{animation-delay:12s}.cursor{animation:blink 1s steps(1,end) infinite}`;
    phrases.forEach((p,i)=>{css+=`.reveal-${i}{animation:type-${i} 6s steps(${p.length},end) infinite}.caret-${i}{animation:travel-${i} 6s steps(${p.length},end) infinite}`;});
    css+=`}@keyframes sculpture{0%,${(100/FRAMES-.002).toFixed(5)}%{opacity:1}${(100/FRAMES).toFixed(5)}%,100%{opacity:0}}@keyframes phrase{0%,33.332%{opacity:1}33.333%,100%{opacity:0}}@keyframes blink{0%,48%{opacity:1}49%,100%{opacity:0}}`;
    phrases.forEach((p,i)=>{const width=p.length*charWidth;css+=`@keyframes type-${i}{0%,9%{width:0}48%,89%{width:${width}px}99%,100%{width:0}}@keyframes travel-${i}{0%,9%{transform:translateX(0)}48%,89%{transform:translateX(${width+3}px)}99%,100%{transform:translateX(0)}}`;});
  }
  let content=`<rect width="${w}" height="${h}" fill="#080808"/><path d="M${x} 66H${w-x}" stroke="#292929"/>`;
  content+=text(x,39,13,'EYE172 / ENGINEERING','class="micro"');
  content+=text(w-x,39,12,mobile?'ASTANA, KZ':'ASTANA, KZ  /  UTC+05','text-anchor="end" class="micro"');
  content+=`<g class="sculpture" transform="translate(${artX} ${artY}) scale(${artScale})">${still?frame(0):frames}</g>`;
  content+=text(x,mobile?138:158,headingSize,'Shakhnazar','class="sans" font-weight="600" letter-spacing="-2.6"');
  content+=text(x,mobile?199:228,headingSize,'Akhmer.','class="sans" font-weight="600" letter-spacing="-2.6"');
  content+=text(x,mobile?232:269,mobile?19:18,'Software, ML & AI Engineer','class="muted"');
  content+=text(x,typeY,typeSize,'›','class="muted"');
  content+=`<defs>${phrases.map((p,i)=>`<clipPath id="typing-${i}"><rect x="${x+25}" y="${typeY-24}" width="${p.length*charWidth}" height="32" class="reveal-${i}"/></clipPath>`).join('')}</defs>`;
  phrases.forEach((phrase,i)=>{
    content+=`<g class="phrase phrase-${i}">`+text(x+25,typeY,typeSize,phrase,`class="terminal-text" clip-path="url(#typing-${i})" textLength="${phrase.length*charWidth}" lengthAdjust="spacingAndGlyphs"`)+`<g transform="translate(${x+25} ${typeY-19})"><g class="caret-${i}"><rect class="cursor" x="0" y="0" width="2" height="23"/></g></g></g>`;
  });
  content+=`<path d="M${x} ${h-55}H${w-x}" stroke="#292929"/>`;
  content+=text(x,h-26,12,'VISION · INTELLIGENCE · INTERFACES','class="micro"');
  if(!mobile) content+=text(w-x,h-26,12,'CREATE / REFINE / SHIP','text-anchor="end" class="micro"');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">Shakhnazar Akhmer — Software, ML &amp; AI Engineer</title><desc id="desc">A gently turning three-dimensional knot drawn with ASCII characters. Terminal text types: turning ideas into software; building with vision and AI; from prototype to product. Astana, Kazakhstan.</desc><style>${css}</style>${content}</svg>\n`;
}
for (const mobile of [false,true]) {
  await writeFile(path.join(root,`profile-banner${mobile?'-mobile':''}.svg`),banner(mobile));
  await writeFile(path.join(root,`profile-banner${mobile?'-mobile':''}-still.svg`),banner(mobile,true));
}
console.log('Built desktop/mobile ASCII banners and reduced-motion fallbacks.');
