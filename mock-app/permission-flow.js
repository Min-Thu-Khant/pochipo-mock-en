// Permission prompts are local UI simulations; no browser or native permissions are requested.
export function permissionPlan(state,{source,missionCompleted=false}={}){
 const progress=state.user.permissionProgress??={};const tracking=state.trackingPermission||'notDetermined';const canAskATT=(state.os||'ios')==='ios'&&!['authorized','restricted'].includes(tracking);
 if(missionCompleted&&!progress.missionPrompted){progress.missionPrompted=true;if(source==='video')progress.videoPrompted=true;return [...(state.notificationPermission!=='authorized'?['notification']:[]),...(canAskATT&&!progress.attIntroduced?['att']:[])];}
 if(source==='video'){if(progress.attIntroduced||progress.videoPrompted||!canAskATT)return [];progress.videoPrompted=true;return ['att'];}
 return source==='walk'&&progress.attIntroduced&&canAskATT?['att']:[];
}
export function createPermissionFlow({getState,save,modal,showModal,position,focus,onComplete=()=>{}}){
 let queue=[],current=null;
 const controls=(label,action,cls='fd-button fd-primary')=>`<button type="button" class="${cls}" data-permission="${action}">${label}</button>`;
 const active=()=>current!==null;
 function show(){current=queue.shift()||null;if(!current){modal.close();onComplete();return;}
  const s=getState();if(current==='att'){s.user.permissionProgress??={};s.user.permissionProgress.attIntroduced=true;save();}
  const att=current==='att',status=att?s.trackingPermission:s.notificationPermission;
  modal.className='figma-dialog permission-overlay';modal.removeAttribute('aria-describedby');modal.setAttribute('aria-labelledby','permission-title');modal.setAttribute('aria-label',att?'トラッキングの許可':'通知の許可');
  modal.innerHTML=`<div class="permission-content"><div class="permission-badge"><img src="./assets/permissions/emphasis-left.svg" alt=""><span>${att?'最適な広告をお届け':'いい調子です'}</span><img src="./assets/permissions/emphasis-right.svg" alt=""></div><h2 id="permission-title">${att?'あなたに合った広告を表示するためにトラッキングを利用します':'デイリーミッションの更新を通知でお知らせします'}</h2><img class="permission-illustration ${att?'att':''}" src="./assets/permissions/${att?'att':'notification'}.png" alt="${att?'トラッキングの許可画面の案内':'通知の許可画面の案内'}"></div><div class="permission-footer"><p>スマホの設定からいつでも変更できます</p>${controls(status==='denied'?'設定を確認する':'次へ','next')}${controls('今はしない','skip','fd-button fd-text')}</div>`;
  if(!modal.open)modal.showModal();position();focus();
 }
 function dismiss(){if(!active())return;show();}
 function afterReward(context){queue=permissionPlan(getState(),context);save();if(queue.length)show();}
 function settings(){if(!current)return;const att=current==='att',status=att?getState().trackingPermission:getState().notificationPermission;
  showModal((att?'トラッキング':'通知')+(status==='denied'?'設定':'の許可')+'（モック）',`<p>${att?'他のアプリやWebサイトでのアクティビティを利用したトラッキングを許可しますか？':'タメルコからの通知を許可しますか？'}</p>${controls('許可する','allow')}${controls(status==='denied'?'今は変更しない':'許可しない','deny','fd-button fd-secondary')}<p class="tiny">端末の権限は変更せず、モック内の表示だけ切り替えます。</p>`);
 }
 document.addEventListener('click',e=>{const target=e.target.closest('[data-permission]');if(!target||!current)return;e.preventDefault();const action=target.dataset.permission;if(action==='next'){settings();return;}if(action==='skip'){dismiss();return;}if(['allow','deny'].includes(action)){const s=getState();s[current==='att'?'trackingPermission':'notificationPermission']=action==='allow'?'authorized':'denied';save();show();}});
 return {afterReward,dismiss,get active(){return active();}};
}
