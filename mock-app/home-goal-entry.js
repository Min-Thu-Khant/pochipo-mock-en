// Inline goal entry below the daily mission list.
export function homeGoalEntry(page,tab){
 if(page!=='home'||tab==='minigames')return '';
 return '<a class="home-goal-entry" href="#points/goal" aria-label="いくら貯める 今のポイントと目標を確認"><span class="home-goal-mark" aria-hidden="true">N</span><span class="home-goal-copy"><b>いくら貯める</b><small>今のポイントと目標を確認する</small></span></a>';
}
export function focusReportGoal(root){
 const report=root.querySelector('.monthly-report');
 report?.scrollIntoView({block:'start',behavior:'instant'});
 report?.focus({preventScroll:true});
}
