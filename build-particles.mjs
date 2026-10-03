import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Vector particles traced from the user's exact reference; no substitute geometry.
// Smooth CSS transforms keep the artwork usable as an ordinary GitHub README image.
const root=path.dirname(fileURLToPath(import.meta.url));
const {points}=JSON.parse(await readFile(path.join(root,'particle-points.json'),'utf8'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,size,s,attrs='')=>`<text x="${x}" y="${y}" font-size="${size}" ${attrs}>${escape(s)}</text>`;
const GROUPS=96,DURATION=12;
const paths=Array.from({length:GROUPS},()=>['','','']);
const random=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453123;return a-Math.floor(a)};
for(const [x,y,lum] of points){
  const group=Math.floor(random(x*13+y*73)*GROUPS);
  const shade=lum<65?0:lum<150?1:2;
  const size=+(Math.sqrt(lum/255)*1.94).toFixed(2);
  paths[group][shade]+=`M${x} ${y}h${size}v${size}h-${size}z`;
}
const particleMarkup=paths.map((shades,i)=>`<g class="dust dust-${i}">${shades.map((d,s)=>d?`<path fill="${['#888','#ccc','#fff'][s]}" d="${d}"/>`:'').join('')}</g>`).join('');
let particleCSS='';
for(let i=0;i<GROUPS;i++){
  const angle=random(i+63)*Math.PI*2,dist=80+random(i+991)*190;
  const dx=(Math.cos(angle)*dist).toFixed(1),dy=(Math.sin(angle)*dist*.68).toFixed(1),rot=((random(i+51)-.5)*50).toFixed(1);
  const arrive=(23+random(i+89)*10).toFixed(1),depart=(70+random(i+21)*10).toFixed(1);
  particleCSS+=`.dust-${i}{animation:assemble-${i} ${DURATION}s cubic-bezier(.22,.8,.25,1) infinite;transform-origin:367px 220px}`;
  particleCSS+=`@keyframes assemble-${i}{0%,100%{transform:translate(${dx}px,${dy}px) rotate(${rot}deg);opacity:0}7%{opacity:.2}${arrive}%,${depart}%{transform:translate(0,0) rotate(0);opacity:1}95%{transform:translate(${dx}px,${dy}px) rotate(${rot}deg);opacity:.05}}`;
}
const emberMarkup=Array.from({length:48},(_,i)=>{
  const r=(.55+random(i+87)*1.1).toFixed(2);
  return `<g class="ember ember-${i}"><circle cx="292" cy="155" r="${r}" fill="#fff"/></g>`;
}).join('');
let emberCSS='';
for(let i=0;i<48;i++){
  const a=random(i+998)*Math.PI*2,d=50+random(i+882)*135;
  const dx=(Math.cos(a)*d).toFixed(1),dy=(Math.sin(a)*d-30).toFixed(1),start=35+random(i+22)*22;
  emberCSS+=`.ember-${i}{animation:ember-${i} ${DURATION}s ease-out infinite}@keyframes ember-${i}{0%,${start.toFixed(2)}%{opacity:0;transform:translate(0,0)}${(start+2).toFixed(2)}%{opacity:1}${(start+23).toFixed(2)}%{opacity:0;transform:translate(${dx}px,${dy}px)}100%{opacity:0}}`;
}
const phrases=['turning ideas into software.','building with vision and AI.','from prototype to product.'];
function banner(mobile,still=false){
  const w=mobile?600:1120,h=mobile?700:440,x=mobile?32:44,typeY=mobile?264:320,charWidth=12.6;
  const artX=mobile?8:538,artY=mobile?300:60,artScale=mobile?.80:.79;
  let css=`text{fill:#efefef;font-family:Consolas,'Liberation Mono',Menlo,monospace}.sans{font-family:Arial,Helvetica,sans-serif}.muted{fill:#969696}.micro{fill:#898989;letter-spacing:1.6px}.phrase{visibility:hidden}.phrase-0{visibility:visible}.cursor{fill:#ddd}.embers{display:none}.spark{opacity:.9}.halo{opacity:.6}.dust{opacity:1}`;
  phrases.forEach((p,i)=>css+=`.caret-${i}{transform:translateX(${p.length*charWidth+3}px)}`);
  if(!still){
    css+=`@media(prefers-reduced-motion:no-preference){${particleCSS}${emberCSS}.embers{display:inline}.ember{opacity:0}.spark{animation:ignite ${DURATION}s ease-in-out infinite}.halo{animation:halo ${DURATION}s ease-in-out infinite}.spark-pulse{animation:heat 1.8s ease-in-out infinite;transform-origin:292px 155px}.phrase{visibility:visible;opacity:0;animation:phrase 18s steps(1,end) infinite}.phrase-0{animation-delay:0s}.phrase-1{animation-delay:6s}.phrase-2{animation-delay:12s}.cursor{animation:blink 1s steps(1,end) infinite}`;
    phrases.forEach((p,i)=>css+=`.reveal-${i}{animation:type-${i} 6s steps(${p.length},end) infinite}.caret-${i}{animation:travel-${i} 6s steps(${p.length},end) infinite}`);
    css+=`}@keyframes ignite{0%,26%,91%,100%{opacity:0}33%{opacity:.15}39%{opacity:1}44%{opacity:.75}48%,68%{opacity:1}79%{opacity:.25}}@keyframes halo{0%,27%,88%,100%{opacity:0}36%{opacity:.1}43%{opacity:.7}50%{opacity:.4}62%{opacity:.65}72%{opacity:.3}}@keyframes heat{0%,100%{transform:scale(.86)}50%{transform:scale(1.1)}}@keyframes phrase{0%,33.332%{opacity:1}33.333%,100%{opacity:0}}@keyframes blink{0%,48%{opacity:1}49%,100%{opacity:0}}`;
    phrases.forEach((p,i)=>{const width=p.length*charWidth;css+=`@keyframes type-${i}{0%,9%{width:0}48%,89%{width:${width}px}99%,100%{width:0}}@keyframes travel-${i}{0%,9%{transform:translateX(0)}48%,89%{transform:translateX(${width+3}px)}99%,100%{transform:translateX(0)}}`;});
  }
  const defs=`<defs><radialGradient id="aura"><stop stop-color="#fff" stop-opacity=".46"/><stop offset=".22" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><filter id="soft" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="7"/></filter><filter id="core" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter><clipPath id="art-window"><rect x="${mobile?0:500}" y="${mobile?292:67}" width="${mobile?600:620}" height="${mobile?350:313}"/></clipPath>${phrases.map((p,i)=>`<clipPath id="typing-${i}"><rect x="${x+25}" y="${typeY-24}" width="${p.length*charWidth}" height="32" class="reveal-${i}"/></clipPath>`).join('')}</defs>`;
  let content=`<rect width="${w}" height="${h}" fill="#000"/>${defs}`;
  content+=`<g clip-path="url(#art-window)"><g transform="translate(${artX} ${artY}) scale(${artScale})">${particleMarkup}<circle class="halo" cx="292" cy="155" r="116" fill="url(#aura)"/><g class="spark"><g class="spark-pulse"><circle cx="292" cy="155" r="17" fill="#fff" opacity=".7" filter="url(#soft)"/><path d="M292 117L296 149L324 155L296 160L292 191L288 161L261 155L288 150Z" fill="#fff" opacity=".8" filter="url(#core)"/><path d="M292 132L294 152L311 155L294 157L292 178L290 157L274 155L290 153Z" fill="#fff"/><circle cx="292" cy="155" r="5" fill="#fff"/></g></g><g class="embers">${emberMarkup}</g></g></g>`;
  content+=`<path d="M${x} 66H${w-x}" stroke="#252525"/>`;
  content+=text(x,39,13,'EYE172 / ENGINEERING','class="micro"');
  content+=text(w-x,39,12,mobile?'ASTANA, KZ':'ASTANA, KZ  /  UTC+05','text-anchor="end" class="micro"');
  content+=text(x,mobile?138:158,mobile?60:68,'Shakhnazar','class="sans" font-weight="600" letter-spacing="-2.6"');
  content+=text(x,mobile?199:228,mobile?60:68,'Akhmer.','class="sans" font-weight="600" letter-spacing="-2.6"');
  content+=text(x,mobile?232:269,mobile?19:18,'Software, ML & AI Engineer','class="muted"');
  content+=text(x,typeY,21,'›','class="muted"');
  phrases.forEach((p,i)=>content+=`<g class="phrase phrase-${i}">${text(x+25,typeY,21,p,`clip-path="url(#typing-${i})" textLength="${p.length*charWidth}" lengthAdjust="spacingAndGlyphs"`)}<g transform="translate(${x+25} ${typeY-19})"><g class="caret-${i}"><rect class="cursor" width="2" height="23"/></g></g></g>`);
  content+=`<path d="M${x} ${h-55}H${w-x}" stroke="#252525"/>`;
  content+=text(x,h-26,12,'VISION · INTELLIGENCE · INTERFACES','class="micro"');
  if(!mobile)content+=text(w-x,h-26,12,'CREATE / REFINE / SHIP','text-anchor="end" class="micro"');
  const desc='The hand from the supplied reference assembles from thousands of white particles, cradles a glowing spark, releases embers, and dissolves into the dark. Motion recreated from a still image.';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">Shakhnazar Akhmer — Software, ML &amp; AI Engineer</title><desc id="desc">${desc}</desc><style>${css}</style>${content}</svg>\n`;
}
for(const mobile of [false,true])for(const still of [false,true])await writeFile(path.join(root,`profile-banner${mobile?'-mobile':''}${still?'-still':''}.svg`),banner(mobile,still));
console.log(`Built particle-hand banners: ${points.length} particles, ${DURATION}s assembly / spark / dissolve loop.`);
