import {pouchTiers,savingsPouchMarkup} from './savings-pouch-animation.js';
const fmt=n=>n.toLocaleString('ja-JP');
const yen=n=>fmt(n/100);
export const reportGoalOptions=Object.freeze([50000,100000,300000,500000,1000000,2000000]);
export function normalizeReportGoal(value){
 const amount=Number(value);
 if(!Number.isFinite(amount))return reportGoalOptions[0];
 return reportGoalOptions.reduce((closest,n)=>Math.abs(n-amount)<Math.abs(closest-amount)?n:closest);
}
// Points, not yen. Both ends are inclusive; the first choice has no lower tier.
export function reportRewardRange(goal){
 const upper=normalizeReportGoal(goal),index=reportGoalOptions.indexOf(upper);
 return {lower:index>0?reportGoalOptions[index-1]:0,upper};
}
export function pointComparison(values,goal=50000){
 const current=Math.max(0,Number(values.balance)||0),additional=Math.max(0,Number(goal)||0);
 return {current,additional,target:current+additional};
}
export function savingsPresentation(goal){
 const level=reportGoalOptions.indexOf(normalizeReportGoal(goal));
 return pouchTiers[level];
}
// Illustration only: choosing a target never grants points or alters the wallet.
export function savingsGoalMarkup(values,goal=50000,{animate=false,fromGoal=goal}={}){
 const p=pointComparison(values,goal),visual=savingsPresentation(goal),from=savingsPresentation(fromGoal);
 return `<div class="mr-savings-goal${animate?' is-celebrating':''}" data-goal="${p.additional}" data-bag-scale="${visual.scale}" style="--bag-scale:${visual.scale};--bag-from:${from.scale};--coin-fall:${227-150*visual.scale}px">
  <div class="mr-savings-values">
   <div><span>今のポイント</span><strong>${fmt(p.current)}<small>pt</small></strong><span>${yen(p.current)}円相当</span></div>
   <div class="mr-savings-target"><span>頑張ったら<br>貯まるポイント</span><strong>${fmt(p.target)}<small>pt</small></strong><span>${yen(p.target)}円相当</span></div>
  </div>
  ${savingsPouchMarkup(visual.level,{animate,fromLevel:from.level})}
 </div>`;
}
