// Fixed inside the phone viewport, above the shared bottom navigation.
export function homeGoalEntry(page,tab){
 if(page!=='home'||tab==='minigames')return '';
 return '<a class="home-goal-entry" href="#points/goal" aria-label="いくら貯める？ 実績レポートで目標を選ぶ"><span class="home-goal-mark" aria-hidden="true">🔰</span><span>いくら貯める？</span></a>';
}
export function focusReportGoal(root){
 const goal=root.querySelector('#report-goal');
 goal?.scrollIntoView({block:'start',behavior:'instant'});
 goal?.focus({preventScroll:true});
}
