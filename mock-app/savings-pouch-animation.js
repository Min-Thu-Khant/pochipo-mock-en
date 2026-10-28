// Adapted from Tameruko_Point_Animation_20261026_v3, including the approved open ending.
// This module changes decoration only; it never reads or writes the points ledger.
export const pouchTiers=Object.freeze([.4416,.51328,.58496,.65664,.72832,.8].map((scale,level)=>Object.freeze({
 level,scale,coinCount:[10,20,30,40,50,60][level],overflowCount:[2,2,4,8,32,64][level],
 mouthCount:[4,7,9,10,11,12][level],rainSeconds:[2,2.6,2.8,3,3.2,3.4][level],
 flightReferenceSeconds:[3,4.2,4.4,4.6,4.8,5][level],duration:[4550,5150,5350,5550,5750,5950][level]
})));
const normalizeLevel=value=>Math.max(0,Math.min(5,Math.round(Number(value)||0)));
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const controllers=new Map();
export function savingsPouchMarkup(level,{animate=false,fromLevel=level}={}){
 level=normalizeLevel(level);fromLevel=normalizeLevel(fromLevel);
 return `<div class="mr-savings-stage mr-pouch-stage" data-pouch-level="${level}" data-pouch-from="${fromLevel}" data-pouch-animate="${animate}" aria-hidden="true">
 <div class="mr-pouch-rays"></div><div class="mr-pouch-glow"></div><div class="mr-pouch-twinkles"></div><div class="mr-pouch-shadow"></div>
 <div class="mr-money-bag mr-pouch-bag"><div class="mr-pouch-rig"><div class="mr-pouch-art mr-pouch-tied"></div><div class="mr-pouch-art mr-pouch-untied"></div><div class="mr-pouch-mouth"></div><div class="mr-pouch-badge"></div><div class="mr-pouch-shine"></div></div></div>
 <div class="mr-pouch-rain"></div><div class="mr-pouch-overflow"></div>
 <div class="mr-pouch-bag mr-pouch-bag-front"><div class="mr-pouch-rig"><div class="mr-pouch-art mr-pouch-front"></div></div></div></div>`;
}
export function mountSavingsPouches(root){
 for(const [stage,controller] of controllers)if(!stage.isConnected){controller.cancel();controllers.delete(stage);}
 for(const stage of root.querySelectorAll('.mr-pouch-stage')){
  if(!controllers.has(stage))controllers.set(stage,createSavingsPouchAnimation(stage));
 }
}
export function createSavingsPouchAnimation(stage,options={}){
 const view=stage.ownerDocument.defaultView;
 const requestFrame=options.requestFrame||view.requestAnimationFrame.bind(view);
 const cancelFrame=options.cancelFrame||view.cancelAnimationFrame.bind(view);
 const now=options.now||(()=>view.performance.now());
 const motion=options.motion||view.matchMedia('(prefers-reduced-motion: reduce)');
 const i=normalizeLevel(stage.dataset.pouchLevel),fromLevel=normalizeLevel(stage.dataset.pouchFrom);
 const tier=pouchTiers[i],scales=pouchTiers.map(t=>t.scale);
 const $=selector=>stage.querySelector(selector);
 let raf,cancelled=false,finished=false;
 function cancel(){cancelled=true;if(raf!==undefined)cancelFrame(raf);}
 function coinEdge(face){const depth=2.7*(1.1+(1-face)*1.5);return `drop-shadow(0 ${depth}px 0 #edb32e)`;}
 function neck(open){
  $('.mr-pouch-untied').style.opacity=ease(open);
  $('.mr-pouch-tied').style.opacity=1-ease(open);
  $('.mr-pouch-front').style.opacity=ease(open);
 }
 function pose(scale,lift=0,sx=1,sy=1){
  const h=stage.clientHeight;stage.style.setProperty('--scale',scale);
  stage.querySelectorAll('.mr-pouch-bag').forEach(el=>el.style.bottom=(h/2-18.4-92.6*scale)+'px');
  stage.querySelectorAll('.mr-pouch-rig').forEach(el=>el.style.transform=`translateY(${lift}px) scale(${sx},${sy})`);
  const shadow=$('.mr-pouch-shadow');shadow.style.top=(h/2+91*scale+2)+'px';
  shadow.style.transform=`translate(-50%,-50%) scale(${scale*(1+lift/180)})`;shadow.style.opacity=.85+lift/90;
 }
 const openingSeconds=.65,rainSeconds=tier.rainSeconds,flightReferenceSeconds=tier.flightReferenceSeconds;
 const finalOnly=stage.dataset.pouchAnimate!=='true'||motion.matches;
 const from=finalOnly?scales[i]:Math.min(pouchTiers[fromLevel].scale,scales[i]*.9),count=tier.coinCount,coins=[];
 for(let n=0;n<count;n++){let el=stage.ownerDocument.createElement('img');el.src='assets/report/pouch-coin.svg';el.className='mr-pouch-coin';el.style.opacity=0;$('.mr-pouch-rain').append(el);coins.push(el)}

 const overflow=[];
 for(let n=0;n<tier.overflowCount;n++){
  const el=stage.ownerDocument.createElement('img');el.src='assets/report/pouch-coin.svg';el.className='mr-pouch-overflow-coin';$('.mr-pouch-overflow').append(el);overflow.push(el);
 }
 const mouthCoins=[];
 for(let n=0;n<tier.mouthCount;n++){
  const el=stage.ownerDocument.createElement('img');el.src='assets/report/pouch-coin.svg';
  const positions=[[83,57,-17],[103,57,12],[122,56,-9],[76,51,-22],[94,50,16],[114,49,-12],[126,47,24],[84,43,-15],[104,42,8],[118,40,-18],[94,35,15],[108,34,-9]];
  const [x,y,angle]=positions[n];el.style.left=x+'px';el.style.top=y+'px';
  el.dataset.angle=angle;$('.mr-pouch-mouth').append(el);mouthCoins.push(el);
 }
 const stars=[];
 for(let n=0;n<[2,4,6,9,12,16][i];n++){
 const star=stage.ownerDocument.createElement('i');star.className='mr-pouch-twinkle';
 const side=n%2?-1:1,x=50+side*(28+(n*7)%16),y=12+(n*29)%71;
 star.style.cssText=`--left:${x}%;--top:${y}%;--size:${7+(n%3)*3+i*.65}px`;
 $('.mr-pouch-twinkles').append(star);stars.push(star);
 }
 const start=now();
 function frame(timestamp,finish=false){
 if(cancelled)return;
 if(!stage.isConnected){cancel();return;}
 finish=finish||motion.matches;
 const elapsed=(timestamp-start)/1000;


 const t=finish?7.5:elapsed<openingSeconds?elapsed:
 elapsed<openingSeconds+rainSeconds?openingSeconds+(elapsed-openingSeconds)*(4.95/rainSeconds):
 5.6+elapsed-openingSeconds-rainSeconds;
 const fill=ease((t-.65)/4.9),scale=mix(from,scales[i],fill),open=t<.65?ease(t/.65):1;
 neck(open);let lift=0,sx=1,sy=1;
 $('.mr-pouch-mouth').style.opacity=ease(open);
 mouthCoins.forEach((coin,n)=>{

  const mouthDiameter=36*.85/scale;
  coin.style.width=coin.style.height=mouthDiameter+'px';
  coin.style.marginLeft=coin.style.marginTop=(22-mouthDiameter)/2+'px';
  const reveal=ease((t-(1.4+n/Math.max(1,mouthCoins.length-1)*2.5))/.5);
  coin.style.opacity=reveal;
  coin.style.transform=`translateY(${16+(1-reveal)*12}px) rotate(${coin.dataset.angle}deg) scaleY(.64)`;
 });

 const shineProgress=clamp((t-6.18)/.68);
 $('.mr-pouch-shine').style.opacity=Math.sin(Math.PI*shineProgress)*.82;
 $('.mr-pouch-shine').style.setProperty('--shine-x',mix(-100,100,shineProgress)+'px');
 const rayStrength=ease((t-.65)/.55)*(1-ease((t-5.1)/.5));
 $('.mr-pouch-rays').style.opacity=motion.matches?0:rayStrength*[.07,.09,.12,.15,.19,.23][i];
 $('.mr-pouch-rays').style.transform=`translate(-50%,-50%) rotate(${t*(4+i*1.6)}deg)`;

 const sparkleEnvelope=ease((t-.8)/.65)*(1-ease((t-6.9)/.6));
 const finale=ease((t-6.2)/.4)*(1-ease((t-6.8)/.7));
 $('.mr-pouch-glow').style.opacity=sparkleEnvelope*(.06+i*.035)+finale*i*.025;
 stars.forEach((star,n)=>{
 const phase=(t/(2.3+(n%3)*.25)+n*.381)%1;
 const pulse=Math.pow(Math.max(0,Math.sin(phase*Math.PI)),4);
 star.style.opacity=sparkleEnvelope*pulse*(.38+i*.085);
 star.style.transform=`translate(-50%,-50%) translateY(${-pulse*(2+i*.6)}px) scale(${.5+pulse*.65+finale*.15}) rotate(${n%2?15:-10}deg)`;
 });
 const keys=[[3.2,0,1,1],[3.38,-21,0.98,1.025],[3.58,0,1.12,.88],[3.68,0,1.08,.92],[3.85,-11,.98,1.02],[4.02,0,1.06,.94],[4.17,-3,1,1],[4.3,0,1.025,.975],[4.48,0,1,1]];
 const landingT=t-2.95; if(landingT>=3.2){for(let k=0;k<keys.length-1;k++){const a=keys[k],b=keys[k+1];if(landingT>=a[0]&&landingT<b[0]){let u=(landingT-a[0])/(b[0]-a[0]);u=k===1||k===4?u*u:ease(u);lift=mix(a[1],b[1],u);sx=mix(a[2],b[2],u);sy=mix(a[3],b[3],u);break}}}
 if(t>.95&&t<5.5){const weight=Math.sin((t-.95)*41)*.008; sx=1+weight;sy=1-weight;}
 if(i===5){
  const thump=Math.sin(Math.PI*clamp((t-6.48)/.32));
  lift+=thump*4;sx+=thump*.045;sy-=thump*.04;
 }
 pose(scale,lift,sx,sy);
 overflow.forEach((coin,n)=>{

  const noise=k=>{const v=Math.sin((n+1)*127.1+k*311.7)*43758.5453;return v-Math.floor(v);};
  const emission=3.5+n/Math.max(1,overflow.length-1)*.95+noise(1)*.08;
  const flight=.9+noise(2)*.15,u=clamp((t-emission)/flight);
  if(t<emission){coin.style.opacity=0;return;}
  const side=n%2===0?-1:1;
  const radius=18,size=radius/14.5;
  const restAngle=(noise(4)-.5)*74,restFace=.45+noise(5)*.36;
  const spread=(noise(6)+noise(7))*.5;

  const scattered=n===overflow.length-1||(overflow.length>=6&&n===overflow.length-3);
  const rawEndX=scattered?(n===overflow.length-1?-27:44):side*(58*scales[i]+14+spread*(i===5?56:46));
  const edge=Math.max(0,stage.clientWidth/2-radius-2);
  const endX=Math.max(-edge,Math.min(edge,rawEndX));
  const floor=stage.clientHeight/2+91*scales[i]+2;
  const pileHeight=scattered?0:Math.max(0,n-3)*(i===5?.5:.48)*(.45+noise(8)*.55)+(n>3?noise(9)*4:0);
  const angleRad=restAngle*Math.PI/180;
  const halfHeight=radius*Math.sqrt(Math.sin(angleRad)**2+(restFace*Math.cos(angleRad))**2);
  const endY=floor-halfHeight-pileHeight+(scattered?(n===overflow.length-1?13:8):0);
  const startY=stage.clientHeight/2-50.4*scale;
  const x=mix(side*8*scale,endX,Math.sin(u*Math.PI/2));
  const y=mix(startY,endY,u*u)-Math.sin(Math.PI*u)*(20+noise(10)*10);
  const settle=Math.max(0,t-emission-flight);
  const bounce=settle<.38?-Math.abs(Math.sin(settle/.38*Math.PI*2))*Math.exp(-settle*9)*(3+noise(11)*3):0;
  const roll=settle<.38?Math.sin(settle/.38*Math.PI)*side*2:0;
  const face=mix(.3+.65*Math.abs(Math.cos(u*5+n)),restFace,ease((u-.65)/.35));
  const angle=mix(side*(55+noise(12)*100),restAngle,ease(u));
  coin.style.opacity=ease(u/.1);
  coin.style.filter=coinEdge(face);
  coin.style.transform=`translate(${x+roll}px,${y-14.5+bounce}px) rotate(${angle}deg) scale(${size},${size*face})`;
 });
 coins.forEach((c,n)=>{

 const kind=n%3;
 const mouthY=stage.clientHeight/2-50.4*scale;
 const initialY=-40-(n%4)*14,vy=85+kind*20,gravity=420;
 const travel=mouthY+20-initialY;
 const baseFlight=(-vy+Math.sqrt(vy*vy+2*gravity*travel))/gravity/1.2;

 const realFlight=baseFlight*(flightReferenceSeconds/4.95)+.2;
 const flight=realFlight*(4.95/rainSeconds);
 const launch=.65+Math.min(4.2,4.95-flight-.04)*n/(count-1),uTime=t-launch;
 const u=uTime/flight;
 if(u<0||u>1){c.style.opacity=0;return}
 const width=stage.clientWidth,r=[10,14,18][kind]*(.78+.22*scale);
 const startX=20+((n*137.508)%(width-40))-width/2;
 const drift=[-18,12,22][kind]*uTime;
 const end=(-5+((n*19)%5-2))*scale;

 const gather=ease(u/.68);
 const x=mix(startX+drift,end,gather);
 const step=u*baseFlight*1.2,y=initialY+vy*step+.5*gravity*step*step;

 const entry=ease((y-(mouthY-48))/(32));
 const spinningAngle=n*1.7+[2.4,-3.1,2.8][kind]*step;
 const alignedAngle=Math.PI/2+Math.round((spinningAngle-Math.PI/2)/Math.PI)*Math.PI;
 const angle=mix(spinningAngle,alignedAngle,entry);
 const face=mix(Math.max(.18,Math.abs(Math.cos(n*.8+3.6*step))),.5,entry);
 c.style.opacity=1;
 c.style.filter=coinEdge(face);
 c.style.transform=`translate(${x}px,${y-14.5}px) rotate(${angle}rad) scale(${r/14.5},${r/14.5*face})`;
 $('.mr-pouch-rain').style.clipPath=`inset(0 0 ${Math.max(0,stage.clientHeight-mouthY-24*scale)}px 0)`;

 });
 if(t<7.5)raf=requestFrame(frame);else{finished=true;pose(scales[i]);neck(1);$('.mr-pouch-rain').innerHTML='';$('.mr-pouch-twinkles').innerHTML='';$('.mr-pouch-glow').style.opacity=0;$('.mr-pouch-rays').style.opacity=0}}
 if(finalOnly)frame(start,true);else{neck(0);raf=requestFrame(frame);}
 return {cancel,get finished(){return finished;},duration:tier.duration};
}
