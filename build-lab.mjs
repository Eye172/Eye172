import {mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const out=new URL('./widgets/',import.meta.url);mkdirSync(out,{recursive:true});
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(const kind of ['agent','resonance'])for(const theme of ['dark','light'])for(const mobile of [false,true]){
 const w=mobile?640:1120,h=mobile?340:216;
 const ink=theme==='dark'?'#f0eee9':'#171717',muted=theme==='dark'?'#9b9b98':'#60605b',bg=theme==='dark'?'#0b0c0d':'#fafaf7',line=theme==='dark'?'#333536':'#d5d5ce';
 const title=kind==='agent'?'Agent Deck':'Resonance Lab';
 const sub=kind==='agent'?'Architecture you can inspect.':'Sound, translated into motion.';
 const command=kind==='agent'?'open / blueprints':'play / frequency';
 let art='';const ox=mobile?350:790,oy=mobile?215:108;
 if(kind==='agent'){
  const pts=[[0,0],[62,-40],[62,40],[140,0],[215,0]];
  for(const [a,b] of [[0,1],[0,2],[1,3],[2,3],[3,4]]){const [x,y]=pts[a],[xx,yy]=pts[b];art+=`<path d="M${ox+x} ${oy+y}L${ox+xx} ${oy+yy}" stroke="${line}"/><path class="signal s${a}" d="M${ox+x} ${oy+y}L${ox+xx} ${oy+yy}" stroke="${ink}" stroke-dasharray="4 100"/>`;}
  for(let i=0;i<pts.length;i++){const [x,y]=pts[i];art+=`<rect x="${ox+x-6}" y="${oy+y-6}" width="12" height="12" fill="${i===4?ink:bg}" stroke="${ink}"/>`;}
  if(!mobile)art+=`<text x="${ox+106}" y="${oy+76}" fill="${muted}" text-anchor="middle" font-size="11" letter-spacing="2">PLAN / ROUTE / VERIFY</text>`;
 }else{
  for(let row=0;row<11;row++){
   let d='';for(let x=0;x<=244;x+=4){const t=x/244,env=Math.sin(t*Math.PI);const y=Math.sin(t*Math.PI*4+row*.31)*env*(24+row*.75)+(row-5)*3;d+=(x?'L':'M')+(ox-12+x).toFixed(1)+' '+(oy+y).toFixed(1);}
   art+=`<path class="wave" style="animation-delay:${-row*.32}s" d="${d}" stroke="${ink}" opacity="${.16+row*.065}"/>`;
  }
  if(!mobile)art+=`<text x="${ox+106}" y="${oy+76}" fill="${muted}" text-anchor="middle" font-size="11" letter-spacing="2">AUDIO / FIELDS / FORM</text>`;
 }
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}: ${sub} Open the interactive project.">
 <title>${title}</title><desc>${esc(sub)} A link to the working browser project, with public source and documentation.</desc>
 <style>text{font-family:'Courier New',monospace}.title{font-family:Georgia,'Times New Roman',serif}.signal{animation:travel 5s linear infinite}.s1{animation-delay:-1.2s}.s2{animation-delay:-2.4s}.s3{animation-delay:-3.6s}.wave{animation:breathe 6s ease-in-out infinite;transform-origin:${ox+106}px ${oy}px}.cursor{animation:blink 1.4s steps(1) infinite}@keyframes travel{to{stroke-dashoffset:-208}}@keyframes breathe{0%,100%{transform:scaleY(.78)}50%{transform:scaleY(1.18)}}@keyframes blink{0%,55%{opacity:1}56%,100%{opacity:0}}@media(prefers-reduced-motion:reduce){.signal,.wave,.cursor{animation:none}}</style>
 <rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="3" fill="${bg}" stroke="${line}"/>
 <text x="32" y="${mobile?38:34}" font-size="${mobile?18:11}" fill="${muted}" letter-spacing="2">${kind==='agent'?'01':'02'} / INTERACTIVE STUDY</text>
 <text class="title" x="30" y="${mobile?108:100}" font-size="${mobile?50:46}" fill="${ink}">${title}</text>
 <text x="32" y="${mobile?151:134}" font-size="${mobile?22:16}" fill="${muted}">${sub}</text>
 <g fill="none" stroke-width="1">${art}</g>
 <path d="M32 ${h-55}H${w-32}" stroke="${line}"/>
 <text x="32" y="${h-25}" font-size="${mobile?18:12}" fill="${ink}">&gt; ${command}</text>
 <rect class="cursor" x="${mobile?(kind==='agent'?251:264):(kind==='agent'?179:187)}" y="${h-(mobile?39:35)}" width="${mobile?10:7}" height="${mobile?17:12}" fill="${ink}"/>
 <text x="${w-32}" y="${h-25}" font-size="${mobile?18:12}" text-anchor="end" fill="${muted}">LAUNCH ↗</text>
 </svg>`;
 writeFileSync(new URL(`${kind}-${theme}${mobile?'-mobile':''}.svg`,out),svg);
}
console.log('Rendered 8 responsive monochrome project cards.');
