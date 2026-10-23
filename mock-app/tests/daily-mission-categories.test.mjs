import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,saveDailyMissions,missionTasks,claimMission,createConversion,approveConversion,daily,total,beginMissionActivity,claimVideo,completeSurvey} from '../model.js';
import {newDailyMission,DAILY_MISSION_CATEGORIES} from '../daily-mission-categories.js';
import {drawGame} from '../mini-games-model.js';
const task=s=>missionTasks(s).items[0];
function setup(kind,patch={}){const s=initialState();s.user.cases=[];saveDailyMissions(s,[{...newDailyMission(kind,'custom-1',{date:s.date}),...(kind==='affiliate'?{endDate:'2099-12-31'}:{}),...patch}]);return s;}

test('5カテゴリーを設定でき、既存動画・アンケートの複数回条件も使える',()=>{
 assert.deepEqual(DAILY_MISSION_CATEGORIES.map(x=>x[0]),['video','survey','minigame','steps','affiliate']);
 for(const kind of ['video','survey']){
  const s=setup(kind,{targetCount:2}),before=total(s);
  for(let i=0;i<2;i++){
   const mission=beginMissionActivity(s,'custom-1');
   if(kind==='video')assert.ok(claimVideo(s,{mission}));else assert.ok(completeSurvey(s,i?'s2':'s1',{mission}));
   assert.equal(total(s),before);
   assert.equal(task(s).state,i?'achieved':'todo');
  }
  assert.ok(claimMission(s,'custom-1').amount);assert.equal(task(s).state,'claimed');
 }
});
test('指定案件は判定中になるまで未達成で、他案件やSUR挑戦中は対象外',()=>{
 const s=setup('affiliate',{offerMode:'specific',offerId:'travel',reward:350}),before=total(s);
 assert.equal(task(s).to,'offer/travel');assert.ok(claimMission(s,'custom-1').error);
 createConversion(s,'shop');createConversion(s,'game');assert.equal(task(s).state,'todo');
 createConversion(s,'travel');assert.equal(task(s).state,'achieved');assert.equal(total(s),before);
 assert.equal(s.user.pendings.some(p=>p.category==='AFFILIATE'),false);
 assert.deepEqual(claimMission(s,'custom-1'),{amount:350});assert.equal(total(s),before+350);
 assert.equal(task(s).state,'claimed');assert.ok(claimMission(s,'custom-1').error);
});
test('件数条件は当日の異なる案件だけを数え、同じ案件や過去成果で水増ししない',()=>{
 const s=setup('affiliate',{targetCount:2});
 s.user.cases.push({id:'old',offerId:'travel',status:'judging',date:'2000-01-01'});
 assert.equal(task(s).progress,0);
 createConversion(s,'travel');createConversion(s,'travel');assert.equal(task(s).progress,1);assert.equal(task(s).state,'todo');
 createConversion(s,'shop');assert.equal(task(s).state,'achieved');assert.equal(task(s).progress,2);
});
test('判定中の達成記録はその後の承認と再読み込みでも消えず、通常報酬と重複しない',()=>{
 let s=setup('affiliate',{reward:500});const cv=createConversion(s,'travel');
 approveConversion(s,cv.id);s=JSON.parse(JSON.stringify(s));
 const before=total(s),pending=s.user.pending;
 assert.equal(task(s).state,'achieved');assert.equal(task(s).reward,500);
 assert.deepEqual(claimMission(s,'custom-1'),{amount:500});assert.equal(s.user.pending,pending);
 const after=total(s);assert.equal(after,before+500);
 s=JSON.parse(JSON.stringify(s));assert.ok(claimMission(s,'custom-1').error);assert.equal(total(s),after);
});
test('期間限定の報酬は達成時に固定し、翌日も受取済みを保持する',()=>{
 const s=setup('affiliate',{reward:300});createConversion(s,'travel');assert.equal(task(s).reward,300);
 s.dailyMissionGroups[0].missions[0].reward=999;assert.equal(task(s).reward,300);
 assert.ok(claimMission(s,'custom-1',{date:'2000-01-01'}).error);
 assert.deepEqual(claimMission(s,'custom-1'),{amount:300});
 s.date='2026-10-23';assert.equal(task(s).state,'claimed');assert.ok(claimMission(s,'custom-1').error);
});
test('歩数とミニゲームの完了後に、設定したミッション報酬を一度だけ受け取れる',()=>{
 const steps=setup('steps',{targetCount:3000,reward:200});steps.stepLink='linked';
 daily(steps).steps=2999;assert.equal(task(steps).state,'todo');
 daily(steps).steps=3000;assert.equal(task(steps).state,'achieved');assert.deepEqual(claimMission(steps,'custom-1'),{amount:200});assert.ok(claimMission(steps,'custom-1').error);
 const game=setup('minigame',{targetCount:2,reward:400});
 drawGame(game,'dice');assert.equal(task(game).state,'todo');drawGame(game,'omikuji');assert.equal(task(game).state,'achieved');
 assert.deepEqual(claimMission(game,'custom-1'),{amount:400});assert.ok(claimMission(game,'custom-1').error);
});
test('不正カテゴリー・件数・報酬・指定案件は設定を一部だけ保存せず拒否する',()=>{
 const s=setup('affiliate'),before=JSON.stringify(s.dailyMissionGroups);
 for(const patch of [{kind:'unknown'},{targetCount:0},{targetCount:1.5},{reward:0},{reward:100000},{offerMode:'specific',offerId:'missing'}]){
  assert.throws(()=>saveDailyMissions(s,[{...newDailyMission('affiliate','custom-1',{date:s.date}),...patch}]));
  assert.equal(JSON.stringify(s.dailyMissionGroups),before);
 }
});

test('期間限定は掲載期間だけ表示し、期間内の異なる日の判定中を合算する',()=>{
 let s=setup('affiliate',{targetCount:2,startDate:'2026-09-15',endDate:'2026-09-20'});
 s.date='2026-09-14';assert.equal(missionTasks(s).items.length,0);createConversion(s,'pay');
 s.date='2026-09-15';createConversion(s,'travel');assert.equal(task(s).progress,1);
 s.date='2026-09-16';assert.equal(task(s).progress,1);createConversion(s,'shop');assert.equal(task(s).state,'achieved');
 s=JSON.parse(JSON.stringify(s));
 assert.ok(claimMission(s,'custom-1').amount);
 s.date='2026-09-17';assert.equal(task(s).state,'claimed');
 s.date='2026-09-21';assert.equal(missionTasks(s).items.length,0);assert.ok(claimMission(s,'custom-1').error);
});
test('毎日ミッションは翌日に再実施でき、期間限定の受取は日付で復活しない',()=>{
 const s=setup('steps',{targetCount:1000});s.stepLink='linked';
 assert.equal(task(s).state,'achieved');assert.ok(claimMission(s,'custom-1').amount);
 s.date='2026-09-16';assert.equal(task(s).state,'achieved');assert.ok(claimMission(s,'custom-1').amount);
});
test('アンケートは毎日と期間限定の両方で集計し、期間中の未受取報酬を翌日も保持する',()=>{
 const s=initialState(),before=total(s),start=s.date;
 saveDailyMissions(s,[newDailyMission('survey','daily-survey'),{...newDailyMission('survey','limited-survey',{missionType:'limited',date:start}),endDate:'2026-09-20',targetCount:2}]);
 let journey=beginMissionActivity(s,'limited-survey');const first=completeSurvey(s,'s1',{mission:journey});
 assert.equal(total(s),before);assert.equal(missionTasks(s).items.find(m=>m.id==='limited-survey').state,'todo');
 s.date='2026-09-16';journey=beginMissionActivity(s,'limited-survey');const second=completeSurvey(s,'s2',{mission:journey});
 assert.equal(missionTasks(s).items.find(m=>m.id==='limited-survey').state,'achieved');
 assert.deepEqual(claimMission(s,'limited-survey'),{amount:first+second});assert.equal(total(s),before+first+second);
 assert.ok(claimMission(s,'daily-survey').error);
});
test('期間の逆転・存在しない日付・期間未入力は保存しない',()=>{
 const s=initialState();
 for(const dates of [{startDate:'2026-10-22',endDate:'2026-10-21'},{startDate:'2026-02-30',endDate:'2026-03-01'},{startDate:'',endDate:''}])assert.throws(()=>saveDailyMissions(s,[{...newDailyMission('affiliate','test'),...dates}]));
});
