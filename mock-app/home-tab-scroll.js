// Reveal only an icon that was partly visible when selected. Other selections keep the user's position.
export function homeTabScrollTarget(left,viewport,icon,button,inset=8){
 const visible=Math.max(0,Math.min(icon.right,viewport.right)-Math.max(icon.left,viewport.left));
 if(visible<.5||visible>=icon.right-icon.left-.5)return left;
 return Math.max(0,left+(icon.right>viewport.right?button.right-viewport.right+inset:button.left-viewport.left-inset));
}

export function createHomeTabScroll({duration=700,requestFrame=cb=>requestAnimationFrame(cb),cancelFrame=id=>cancelAnimationFrame(id),reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
 let left=0,pending=null,frame=null,currentNav=null,pressed=null;
 const stop=()=>{if(frame!==null)cancelFrame(frame);frame=null;};
 const target=(nav,button)=>homeTabScrollTarget(nav.scrollLeft,nav.getBoundingClientRect(),button.querySelector('.home-tab-icon').getBoundingClientRect(),button.getBoundingClientRect());
 function animate(nav,to){
  stop();const from=nav.scrollLeft;
  to=Math.min(Math.max(0,to),Math.max(0,nav.scrollWidth-nav.clientWidth));
  if(to===from||reducedMotion()){nav.scrollLeft=left=to;pending=null;return;}
  let started;
  const tick=time=>{
   started??=time;const progress=Math.min(1,(time-started)/duration);
   const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
   nav.scrollLeft=left=from+(to-from)*eased;
   if(progress<1)frame=requestFrame(tick);else{frame=null;pending=null;}
  };
  frame=requestFrame(tick);
 }
 return {
  remember(root){const nav=root.querySelector('.home-tabs');if(nav)left=nav.scrollLeft;stop();},
  select(button){
   stop();
   const nav=button.closest('.home-tabs');
   const beforeFocus=pressed?.key===button.dataset.value?pressed:null;pressed=null;
   left=beforeFocus?.left??nav.scrollLeft;nav.scrollLeft=left;
   const to=beforeFocus?.to??target(nav,button);pending=to===left?null:button.dataset.value;
   if(pending)animate(nav,to);
  },
  restore(root){
   stop();const nav=root.querySelector('.home-tabs');currentNav=nav;if(!nav)return;
   nav.scrollLeft=left;
   nav.addEventListener('scroll',()=>{if(currentNav===nav)left=nav.scrollLeft;},{passive:true});
   const interrupt=()=>{stop();pending=null;pressed=null;left=nav.scrollLeft;};
   nav.addEventListener('pointerdown',event=>{
    interrupt();const button=event.target.closest('button[data-value]');
    if(button)pressed={key:button.dataset.value,left:nav.scrollLeft,to:target(nav,button)};
   },{passive:true});
   nav.addEventListener('pointercancel',()=>{pressed=null;},{passive:true});
   nav.addEventListener('wheel',interrupt,{passive:true});
   const button=[...nav.querySelectorAll('button[data-value]')].find(el=>el.dataset.value===pending);
   if(button)animate(nav,target(nav,button));else pending=null;
  }
 };
}
