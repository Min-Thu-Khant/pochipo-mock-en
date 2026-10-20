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
 return {level,scale:[0.56,0.64,0.75,0.84,0.92,1][level],coinCount:10+level*3};
}
const bagArt=`<svg class="mr-money-bag-art" viewBox="0 0 180 200" fill="none" aria-hidden="true">
 <path d="M66 48 51 18Q63 9 77 18Q89 6 102 18Q116 10 130 18L114 48Z" fill="#FBE1C4" stroke="#B87543" stroke-width="3" stroke-linejoin="round"/>
 <path d="m75 23 7 22m24-22-7 22" stroke="#D9AA7A" stroke-width="3" stroke-linecap="round"/>
 <path d="M66 51C58 69 18 91 14 139C10 177 38 190 90 190S170 177 166 139C162 91 122 69 114 51Z" fill="#F5CA91" stroke="#B87543" stroke-width="3"/>
 <path d="M38 108C19 151 32 176 67 180" stroke="#FFE8C6" stroke-width="10" stroke-linecap="round"/>
 <path d="M127 84C161 134 163 173 116 180" stroke="#DFA55E" stroke-width="9" stroke-linecap="round"/>
 <path d="M65 49Q89 42 115 49M64 56Q90 50 116 56" stroke="var(--brand-primary,#D96F4B)" stroke-width="7" stroke-linecap="round"/>
 <path d="M114 53Q143 41 141 57Q139 68 114 53Q126 75 139 75" stroke="var(--brand-primary,#D96F4B)" stroke-width="4" stroke-linecap="round"/>
 <circle cx="90" cy="127" r="28" fill="#FFF2DC" stroke="#E7B16B" stroke-width="2"/>
 <path d="M80 145V109H94C110 109 110 130 94 130H80M80 114H93C101 114 101 125 93 125H80" fill="none" stroke="#B87543" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// Illustration only: choosing a target never grants points or alters the wallet.
export function savingsGoalMarkup(values,goal=50000,{animate=false,fromGoal=goal}={}){
 const p=pointComparison(values,goal),visual=savingsPresentation(goal),from=savingsPresentation(fromGoal);
 const coins=animate?Array.from({length:visual.coinCount},(_,i)=>{
  const x=((i*37)%101)-50;
  return `<span class="mr-falling-coin" style="--coin-x:${x}px;--coin-end-x:${Math.round(x*0.14)}px;--coin-delay:${i*45}ms;--coin-duration:${900+(i%4)*100}ms;--coin-turn:${(i%2?1:-1)*(280+i*23)}deg"><img src="assets/point-coin.png" alt="" width="24" height="24"></span>`;
 }).join(''):'';
 return `<div class="mr-savings-goal${animate?' is-celebrating':''}" data-goal="${p.additional}" data-bag-scale="${visual.scale}" style="--bag-scale:${visual.scale};--bag-from:${from.scale};--coin-fall:${227-150*visual.scale}px">
  <div class="mr-savings-values">
   <div><span>今のポイント</span><strong>${fmt(p.current)}<small>pt</small></strong><span>${yen(p.current)}円相当</span></div>
   <div class="mr-savings-target"><span>頑張ったら<br>貯まるポイント</span><strong>${fmt(p.target)}<small>pt</small></strong><span>${yen(p.target)}円相当</span></div>
  </div>
  <div class="mr-savings-stage" aria-hidden="true"><div class="mr-bag-shadow"></div><div class="mr-coin-rain">${coins}</div><div class="mr-money-bag">${bagArt}</div></div>
  <p class="mr-savings-increase">増えるポイント <strong>＋${fmt(p.additional)} pt</strong><span>（＋${yen(p.additional)}円相当）</span></p>
 </div>`;
}
