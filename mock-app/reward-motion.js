// Presentation only: callers have already saved the reward. Never writes points.
export const REWARD_COUNT_MS=900;
export function rewardCountAt(before,after,progress){
 const t=Math.max(0,Math.min(1,progress));
 return Math.round(before+(after-before)*(1-Math.pow(1-t,3)));
}
export function rewardRing(){
 return `<div class="reward-ring" aria-hidden="true"><svg viewBox="0 0 64 64" focusable="false"><circle class="reward-ring-track" cx="32" cy="32" r="25"/><circle class="reward-ring-line" cx="32" cy="32" r="25" pathLength="100"/></svg><span>P</span></div>`;
}
export function startRewardMotion(dialog,{amount=0,balance=0}={}){
 const source=document.querySelector('.app-header .balance-pill');
 if(!source)return ()=>{};
 const rect=source.getBoundingClientRect();
 if(rect.bottom<=0||rect.top>=window.innerHeight||!rect.width)return ()=>{};
 // A top-layer copy uses the actual header geometry and resolved styles, not a second layout.
 const overlay=source.cloneNode(true);
 const originals=[source,...source.querySelectorAll('*')],copies=[overlay,...overlay.querySelectorAll('*')];
 originals.forEach((node,i)=>{
  const computed=getComputedStyle(node),copy=copies[i];
  for(const property of computed)copy.style.setProperty(property,computed.getPropertyValue(property));
  copy.removeAttribute('id');copy.removeAttribute('data-action');copy.removeAttribute('href');
 });
 overlay.classList.add('reward-header-overlay');overlay.setAttribute('aria-hidden','true');overlay.tabIndex=-1;
 Object.assign(overlay.style,{position:'fixed',margin:'0',transform:'none',pointerEvents:'none',zIndex:'2',animation:'none',transition:'none'});
 const number=overlay.querySelector('[data-header-points]');
 if(!number)return ()=>{};
 number.style.width=source.querySelector('[data-header-points]').getBoundingClientRect().width+'px';
 number.style.display='inline-block';number.style.textAlign='right';number.style.fontVariantNumeric='tabular-nums';
 const position=()=>{const r=source.getBoundingClientRect();Object.assign(overlay.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});};
 position();dialog.append(overlay);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const displayBalance=Number(number.dataset?.headerBalancePoints??balance);
 const before=Math.max(0,displayBalance-Math.max(0,amount));
 let frame=0,start=null,stopped=false;
 const paint=value=>{number.textContent=number.dataset?.headerUnit==='yen'
  ?(value/100).toLocaleString('ja-JP',{maximumFractionDigits:2})
  :value.toLocaleString('ja-JP');};
 paint(reduced?displayBalance:before);
 // Light without changing size or position. The circle is drawn independently in CSS.
 const glow=reduced?null:overlay.animate([
  {boxShadow:'0 0 0 0 #FF7A7000'},
  {boxShadow:'0 0 0 4px #FFB79555, 0 0 20px 5px #FF9A7388',offset:.4},
  {boxShadow:'0 0 0 0 #FF7A7000'}
 ],{duration:1200,easing:'ease-out'});
 const cleanup=()=>{if(stopped)return;stopped=true;cancelAnimationFrame(frame);glow?.cancel();overlay.remove();window.removeEventListener('resize',position);window.removeEventListener('scroll',position,true);};
 const tick=now=>{if(!dialog.open||!overlay.isConnected||!source.isConnected){cleanup();return;}start??=now;const progress=Math.min(1,(now-start)/REWARD_COUNT_MS);paint(rewardCountAt(before,displayBalance,progress));position();if(progress<1)frame=requestAnimationFrame(tick);};
 if(!reduced)frame=requestAnimationFrame(tick);
 window.addEventListener('resize',position);window.addEventListener('scroll',position,true);
 return cleanup;
}
