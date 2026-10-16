import {day,L,stepMaxCount,stepMilestones,stepsClaimable} from './model.js';
import {walkPermissionDialog} from './dialogs.js?v=point-units';
let previousWalkProgress=null;
export function walkingMarkup(state,{button,icon,coin,poigigIcon}){
 const d=day(state),goal=L(state).stepGoal,max=stepMaxCount(state),total=goal*max;
 const reached=stepMilestones(state),can=stepsClaimable(state),linked=state.stepLink==='linked',done=d.stepsClaimed>=max;
 const count=linked?Math.min(total,Math.max(0,d.steps)):0,pct=Math.min(100,count/total*100),capped=linked&&count>=total;
 const prior=previousWalkProgress, moving=linked&&prior?.date===state.date&&prior.linked&&count>prior.count;
 previousWalkProgress={date:state.date,linked,count,pct};
 const permission=walkPermissionDialog(state),unavailable=state.stepLink==='unavailable';
 const cta=permission?button('歩数を連携する','step-select','pill dark'):unavailable?'':done?'<span class="walk-finished">本日分はすべて獲得済み</span>':button(can?`${coin()}ポイントを獲得する`:'次の目標まで歩こう','step-select','pill dark',can?'':'disabled');
 const bubble=linked?(capped?'目標達成':count===0?'スタート':''):'';
 const bubbleMarkup=bubble?`<span class="walk-bubble">${bubble}</span>`:'';
 return `<section class="walk-compact walk-v2 ${linked?'':'unlinked'} ${moving?'is-walking':''}" id="walk" style="--walk-progress:${pct}%;--walk-from:${moving?prior.pct:pct}%;--walk-inset:${18-pct*.36}px;--walk-from-inset:${18-(moving?prior.pct:pct)*.36}px">
 <div class="walk-heading"><b>毎日10,000歩チャレンジ</b></div>
 <div class="walk-total"><span>今日の歩数</span><div><strong>${linked?count.toLocaleString():'0'}</strong><span>歩</span></div></div>
 <div class="walk-scene"><div class="walk-landscape"><div class="walk-journey" aria-hidden="true"><span class="walk-goal-flag"><svg viewBox="0 0 32 40" fill="none"><path d="M8 37V4" stroke="#484D4A" stroke-width="2.5" stroke-linecap="round"/><path d="M9 5h19l-5 7 5 7H9Z" fill="#F46F63" stroke="#484D4A" stroke-width="2" stroke-linejoin="round"/><path d="M3 37h11" stroke="#484D4A" stroke-width="2.5" stroke-linecap="round"/></svg></span><div class="walk-runner">${bubbleMarkup}<span class="walk-shoe"><svg class="icon" viewBox="0 0 40 32" fill="none" aria-hidden="true"><path d="M5 20h30v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" fill="#F46F63" stroke="#484D4A" stroke-width="2.2"/><path d="M5 21V13c0-3 1-5 3-6 1 5 7 6 10 2l2-5c1-1 2 0 3 2l4 7c2 3 5 4 8 5 2 1 2 4 0 5H7c-1 0-2-1-2-2Z" fill="#fff" stroke="#484D4A" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="m23 12 3-2m0 6 3-2" stroke="#484D4A" stroke-width="1.7" stroke-linecap="round"/></svg></span></div></div>
 <div class="walk-progress-v2" role="progressbar" aria-label="今日の歩数目標${linked?'':'・未連携'}" aria-valuemin="0" aria-valuemax="${total}" ${linked?`aria-valuenow="${Math.min(count,total)}"`:''}><span></span></div>
 <div class="walk-scale"><span>0歩</span><span>目標 ${total.toLocaleString()}歩</span></div></div>
 <div class="walk-rewards-frame"><div class="walk-rewards" data-current-milestone="${Math.max(0,Math.min(max,linked?Math.floor(count/goal):0))}" tabindex="0" role="region" aria-label="歩数ごとのポイント獲得状況。横にスクロールして${total.toLocaleString()}歩まで確認できます"><div class="walk-reward walk-start"><span>${poigigIcon('walk')}</span><b>0歩</b></div>${Array.from({length:max},(_,i)=>{const n=i+1,claimed=linked&&n<=d.stepsClaimed,ready=linked&&!claimed&&n<=reached;return `<div class="walk-reward ${claimed?'claimed':ready?'ready':''}"><span>${claimed?icon('check'):coin()}</span><b>${(n*goal).toLocaleString()}歩</b></div>`;}).join('')}</div>
 <input class="walk-scroll-control" type="range" min="0" max="1000" value="0" aria-label="歩数の一覧を横にスクロール"></div></div>
 <div class="walk-action">${cta}</div>
 </section>`;
}


let walkRewardResizeObserver;
export function centerWalkReward(root){
 walkRewardResizeObserver?.disconnect();
 const track=root.querySelector('.walk-rewards');
 if(!track)return;
 const control=track.parentElement.querySelector('.walk-scroll-control');
 const sync=()=>{if(control)control.value=String(track.scrollLeft/Math.max(1,track.scrollWidth-track.clientWidth)*1000);};
 track.addEventListener('scroll',sync,{passive:true});
 control?.addEventListener('input',()=>{track.scrollLeft=Number(control.value)/1000*(track.scrollWidth-track.clientWidth);});
 const center=()=>{
  const items=track.querySelectorAll('.walk-reward');
  if(control&&items.length){
   const first=items[0].getBoundingClientRect();
   const frame=track.parentElement.getBoundingClientRect();
   const last=items[items.length-1].getBoundingClientRect();
   const maxScroll=track.scrollWidth-track.clientWidth;
   const start=first.left+first.width/2+track.scrollLeft-frame.left;
   const end=last.left+last.width/2+track.scrollLeft-maxScroll-frame.left;
   control.style.left=(start-26)+'px';
   control.style.width=(end-start+52)+'px';
  }
  const index=Number(track.dataset.currentMilestone);
  const item=items[index];
  if(!item)return;
  const box=track.getBoundingClientRect(), target=item.getBoundingClientRect();
  track.scrollLeft+=target.left+target.width/2-box.left-track.clientWidth/2;
  sync();
 };
 center();
 walkRewardResizeObserver=new ResizeObserver(center);
 walkRewardResizeObserver.observe(track);
}
