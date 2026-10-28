// History entries, rather than route names, distinguish repeated visits to a page.
export function createNavigation(win){
 const key='pochipoNavigation';
 const make=(index=0)=>({id:win.crypto.randomUUID(),index,href:win.location.href,view:null});
 const valid=entry=>entry?.href===win.location.href&&Number.isInteger(entry.index)&&entry.index>=0&&typeof entry.id==='string';
 let current=valid(win.history.state?.[key])?win.history.state[key]:make();
 const views=new Map();let pendingBack=false,replaceNext=false;
 const write=()=>win.history.replaceState({...win.history.state,[key]:current},'',win.location.href);
 write();win.history.scrollRestoration='manual';
 return {
  get view(){return current.view;},
  get notificationOrigin(){return current.notificationOrigin||'home';},
  get pointsOrigin(){return current.pointsOrigin||'mypage';},
  capture(view){
   current={...current,view};views.set(current.id,view);
   if(current.href===win.location.href)write();
  },
  arrive(previousView){
   views.set(current.id,previousView);
   const target=win.history.state?.[key];
   const fromHash=new URL(current.href).hash.slice(1)||'home';
   const notificationOrigin=fromHash.split('/')[0]==='notifications'?current.notificationOrigin||'home':fromHash;
   const pointsOrigin=fromHash.split('/')[0]==='points'?current.pointsOrigin||'mypage':fromHash;
   current=valid(target)?{...target,view:views.get(target.id)??target.view}:make(replaceNext?current.index:current.index+1);
   if(win.location.hash.startsWith('#notifications')&&!current.notificationOrigin)current={...current,notificationOrigin};
   if(/^#points(?:\/|$)/.test(win.location.hash)&&!current.pointsOrigin)current={...current,pointsOrigin};
   pendingBack=false;replaceNext=false;write();return current.view;
  },
  replace(hash){
   const url=new URL(win.location.href);url.hash=hash;
   current={...current,href:url.href};
   win.history.replaceState({...win.history.state,[key]:current},'',url.href);
  },
  back(fallback='home'){
   if(pendingBack)return;
   if(current.index>0){pendingBack=true;win.history.back();return;}
   // A direct link has no preceding in-app entry. Do not leave the mock or
   // add another entry that would bounce back to the detail page.
   const url=new URL(win.location.href);url.hash=fallback||'home';
   if(url.href!==win.location.href){replaceNext=true;win.location.replace(url.href);}
  }
 };
}
