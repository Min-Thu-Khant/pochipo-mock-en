// Inline goal entry below the daily mission list.
export function homeGoalEntry(page,tab){
 if(page!=='home'||tab==='minigames')return '';
 return '<a class="home-goal-entry" href="#points/goal" aria-label="いくらためる？ 実績レポートで目標を選ぶ"><span class="home-goal-mark" aria-hidden="true">🔰</span><span class="home-goal-copy"><b>いくらためる？</b><small>目標を決めて、ため方を見つけよう</small></span></a>';
}
export function focusReportGoal(root){
 const goal=root.querySelector('#report-goal');
 goal?.scrollIntoView({block:'start',behavior:'instant'});
 goal?.focus({preventScroll:true});
}
