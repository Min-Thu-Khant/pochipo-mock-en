// Visible impressions only; a history entry identifies a visit across re-renders.
export function recordPlacement(s,{visit,screen,slot,ad,target,kind,id}){
 s.placementEvents??=[];
 const key=id||[visit,screen,slot,ad,kind].join('|');
 if(s.placementEvents.some(e=>e.id===key))return false;
 s.placementEvents.push({id:key,date:s.date,screen,slot,ad,target,kind});return true;
}
let observer;
export function observePlacements(root,{getState,save,visit,screen}){
 observer?.disconnect();
 const context=el=>({visit,screen,slot:el.dataset.slot,ad:el.closest('[data-ad-id]')?.dataset.adId||el.dataset.slot,target:el.getAttribute('href')||''});
 observer=new IntersectionObserver(entries=>{let changed=false;for(const e of entries)if(e.isIntersecting&&e.intersectionRatio>=0.5){changed=recordPlacement(getState(),{...context(e.target),kind:'imp'})||changed;}if(changed)save();},{root:root.querySelector('.phone-scroll'),threshold:[0.5]});
 for(const el of root.querySelectorAll('[data-slot]')){
  observer.observe(el);
  el.addEventListener('click',()=>{recordPlacement(getState(),{...context(el),kind:'tap',id:crypto.randomUUID()});save();},{capture:true});
 }
}
