import {pointSymbol} from './point-symbol.js';
export function rouletteValues(state){
 const c=state.chinchiro;
 if(!c)return [0,100,200,300,400,500,600];
 return [...new Set([...c.normalTable,...c.earlyTable].map(r=>Number(r.pt??Math.round(c.baseReward*r.mult))))].sort((a,b)=>a-b);
}
export function rouletteArt(result,phase='',values=[0,100,200,300,400,500,600]){
 values=[...new Set([...values,...(result?[result.amount]:[])])].sort((a,b)=>a-b);
 const n=values.length,step=360/n,idx=result?values.indexOf(result.amount):0,angle=1800-idx*step;
 const point=(r,d)=>[160+r*Math.sin(d*Math.PI/180),154-r*Math.cos(d*Math.PI/180)];
 const colors=['#fff5df','#ffd5ca','#fffaf3','#f7b6ab'];
 const sectors=values.map((v,i)=>{const a=point(119,i*step-step/2),b=point(119,i*step+step/2),t=point(90,i*step),c=point(64,i*step);return `<path d="M160 154 L${a} A119 119 0 ${step>180?1:0} 1 ${b} Z" fill="${v===0?'#d6e9e3':i%2?'#f4a394':'#fff7e8'}" stroke="#fffaf4" stroke-width="2"/><text x="${t[0]}" y="${t[1]}" transform="rotate(${i*step} ${t[0]} ${t[1]})" text-anchor="middle" fill="#515a55" font-size="${v>9999?13:17}" font-weight="700">${v?v.toLocaleString('ja-JP'):'また次回'}${v?`<tspan dx="3" font-size="11">pt</tspan>`:''}</text>${v?`<foreignObject x="${c[0]-14}" y="${c[1]-14}" width="28" height="28" transform="rotate(${i*step} ${c[0]} ${c[1]})"><div xmlns="http://www.w3.org/1999/xhtml" class="roulette-sector-coin">${pointSymbol()}</div></foreignObject>`:''}`}).join('');

 return `<div class="roulette-art ${phase}" style="--roulette-end:${angle}deg" aria-label="${result?result.amount+'ポイントの結果':'ルーレット'}"><svg viewBox="-40 -46 400 420" role="img">
 <defs><linearGradient id="rw-rim" x2=".2" y2="1"><stop stop-color="#ffe7a0"/><stop offset=".45" stop-color="#ffcc60"/><stop offset="1" stop-color="#e8a43d"/></linearGradient><linearGradient id="rw-coral" x2="0" y2="1"><stop stop-color="#ff9b89"/><stop offset=".5" stop-color="#ef7264"/><stop offset="1" stop-color="#cf514f"/></linearGradient><linearGradient id="rw-pin" x2="1" y2="1"><stop stop-color="#646966"/><stop offset="1" stop-color="#333936"/></linearGradient><radialGradient id="rw-glow"><stop stop-color="#f9b8ca" stop-opacity=".75"/><stop offset=".65" stop-color="#ffe1e9" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><radialGradient id="rw-round-fade"><stop offset=".82" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient><mask id="rw-soft-edge" maskUnits="userSpaceOnUse" x="-50" y="-56" width="420" height="420"><circle cx="160" cy="154" r="195" fill="url(#rw-round-fade)"/></mask></defs>
 <rect x="-12" y="-44" width="356" height="418" fill="#fff"/>
 <g mask="url(#rw-soft-edge)"><circle cx="160" cy="154" r="213" fill="url(#rw-glow)"/>
 <g class="roulette-rays" fill="#f5b5c5" opacity=".17">${Array.from({length:12},(_,i)=>`<path d="M160 154L142 -35L178 -35Z" transform="rotate(${i*30} 160 154)"/>`).join('')}</g>
 <g class="roulette-sparkles" fill="#edaa8a">${[[19,37],[295,22],[5,238],[311,206],[55,-15]].map(([x,y],i)=>`<path style="--spark-delay:${i*.17}s" d="M${x} ${y-6}q0 6 6 6q-6 0-6 6q0-6-6-6q6 0 6-6Z"/>`).join('')}</g>
 </g><ellipse cx="160" cy="342" rx="112" ry="15" fill="#193943" opacity=".10"/>
 <path d="M129 255h62q-2 46 27 65H102q29-19 27-65" fill="url(#rw-coral)" stroke="#484d4a" stroke-width="2"/>
 <rect x="89" y="319" width="142" height="22" rx="11" fill="url(#rw-coral)" stroke="#484d4a" stroke-width="2"/><path d="M102 322h116" stroke="#ffb4a3" stroke-width="3" stroke-linecap="round"/>
 <circle cx="160" cy="15" r="30" fill="url(#rw-coral)" stroke="#484d4a" stroke-width="3"/>
 <circle cx="160" cy="159" r="135" fill="#c94c49"/><circle cx="160" cy="154" r="135" fill="url(#rw-rim)" stroke="#f5d48d" stroke-width="2"/>
 <circle cx="160" cy="154" r="121" fill="#e5645e" stroke="#484d4a" stroke-width="3"/>
 <circle cx="160" cy="154" r="136" fill="none" stroke="#343935" stroke-width="3" stroke-linecap="round" transform="rotate(-83 160 154)"/><g class="roulette-disc">${sectors}</g>
 ${Array.from({length:16},(_,i)=>{const [x,y]=point(128,i*22.5);return `<circle cx="${x}" cy="${y}" r="4" fill="#fff9d3"/><circle cx="${x-1}" cy="${y-1}" r="1.7" fill="#fff"/>`}).join('')}
 <circle cx="160" cy="160" r="39" fill="#c6524f" opacity=".45"/><circle cx="160" cy="154" r="39" fill="url(#rw-rim)" stroke="#484d4a" stroke-width="2"/><circle cx="160" cy="154" r="30" fill="url(#rw-coral)" stroke="#484d4a" stroke-width="2"/>
 <path d="m160 134 6 12 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2Z" fill="#ffe899" stroke="#484d4a" stroke-width="2" stroke-linejoin="round"/>
 <g class="roulette-pin"><g transform="translate(56 7) scale(.65)"><path d="M141 5C141-20 179-20 179 5Q175 25 160 48Q145 25 141 5" fill="url(#rw-pin)" stroke="#333936" stroke-width="2"/>
 <circle cx="160" cy="4" r="10" fill="#eeeeea" stroke="#7a807b" stroke-width="3"/></g></g>
 <image href="assets/roulette-cat-looking.png" x="226" y="281" width="98" height="82" preserveAspectRatio="xMidYMid meet"/>
 </svg></div>`;
}
