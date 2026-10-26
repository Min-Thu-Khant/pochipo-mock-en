import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,saveDailyMissions,missionTasks,claimMission,createConversion,approveConversion,daily,total,claimSteps,beginMissionActivity,claimVideo,completeSurvey} from '../model.js';
import {newDailyMission,DAILY_MISSION_CATEGORIES,normalizeDailyMission} from '../daily-mission-categories.js';
import {drawGame,claimGame} from '../mini-games-model.js';
const task=s=>missionTasks(s).items[0];
function setup(kind,patch={}){const s=initialState();s.user.cases=[];saveDailyMissions(s,[{...newDailyMission(kind,'custom-1',{date:s.date}),...(kind==='affiliate'?{endDate:'2099-12-31'}:{}),...patch}]);return s;}

test('動画は1再生、アンケートは任意の1件で達成し追加報酬はない',()=>{
 assert.deepEqual(DAILY_MISSION_CATEGORIES.map(x=>x[0]),['video','survey','minigame','steps','affiliate']);
 const video=setup('video',{targetCount:3}),before=total(video),journey=beginMissionActivity(video,'custom-1');
 assert.ok(claimVideo(video,{mission:journey}));assert.equal(task(video).state,'achieved');assert.equal(total(video),before);
 assert.ok(claimMission(video,'custom-1').amount);assert.ok(claimMission(video,'custom-1').error);
 const survey=setup('survey',{targetCount:2}),balance=total(survey),amount=completeSurvey(survey,'s2');
 assert.equal(task(survey).state,'claimed');assert.equal(total(survey),balance+amount);assert.ok(claimMission(survey,'custom-1').error);
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
test('歩数は1000歩ごとの活動元受取、ゲームは当選動画受取を反映する',()=>{
 const steps=setup('steps',{reward:9999});steps.stepLink='linked';daily(steps).steps=999;
 assert.equal(task(steps).state,'todo');daily(steps).steps=1000;assert.equal(task(steps).state,'ready');
 const balance=total(steps),pending=steps.user.pending;assert.ok(claimMission(steps,'custom-1').error);const amount=claimSteps(steps,true);
 assert.ok(amount);assert.equal(task(steps).state,'claimed');assert.equal(total(steps),balance+amount);assert.equal(steps.user.pending,pending+amount);
 const game=setup('minigame',{reward:9999}),before=game.user.pending;
 const result=drawGame(game,'dice',false,()=>0);assert.equal(task(game).state,'claimed');assert.ok(claimMission(game,'custom-1').error);
 assert.equal(claimGame(game,'dice',result.id),true);assert.equal(task(game).state,'claimed');assert.equal(game.user.pending,before+result.amount);
 assert.equal(claimGame(game,'dice',result.id),false);
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
test('毎日の歩数受取済みは翌日に持ち越さない',()=>{
 const s=setup('steps');s.stepLink='linked';daily(s).steps=1000;assert.equal(task(s).state,'ready');
 claimSteps(s,true);assert.equal(task(s).state,'claimed');s.date='2026-09-16';daily(s).steps=999;
 assert.equal(task(s).state,'todo');daily(s).steps=1000;assert.equal(task(s).state,'ready');
});
test('アンケートは任意の1件で両区分が受取済みとなり、期間限定の状態を保持する',()=>{
 const s=initialState(),before=total(s),start=s.date;
 saveDailyMissions(s,[newDailyMission('survey','daily-survey'),{...newDailyMission('survey','limited-survey',{missionType:'limited',date:start}),endDate:'2026-09-20',targetCount:2}]);
 const amount=completeSurvey(s,'s2');assert.equal(total(s),before+amount);
 assert.ok(missionTasks(s).items.every(m=>m.state==='claimed'));assert.equal(completeSurvey(s,'s2'),false);
 s.date='2026-09-16';assert.equal(missionTasks(s).items.find(m=>m.id==='limited-survey').state,'claimed');
 assert.equal(missionTasks(s).items.find(m=>m.id==='daily-survey').state,'todo');assert.ok(claimMission(s,'limited-survey').error);
});
test('期間の逆転・存在しない日付・期間未入力は保存しない',()=>{
 const s=initialState();
 for(const dates of [{startDate:'2026-10-22',endDate:'2026-10-21'},{startDate:'2026-02-30',endDate:'2026-03-01'},{startDate:'',endDate:''}])assert.throws(()=>saveDailyMissions(s,[{...newDailyMission('affiliate','test'),...dates}]));
});

test('1000歩と2000歩の行は各段階の受取だけを反映し、追加付与しない',()=>{
 const s=initialState();saveDailyMissions(s,[newDailyMission('steps','walk-1'),newDailyMission('steps','walk-2')]);s.stepLink='linked';daily(s).steps=2000;
 assert.deepEqual(missionTasks(s).items.map(x=>x.state),['ready','ready']);
 const pending=s.user.pending,amount=claimSteps(s,true);assert.ok(amount);
 let restored=JSON.parse(JSON.stringify(s));assert.deepEqual(missionTasks(restored).items.map(x=>x.state),['claimed','ready']);
 assert.equal(restored.user.pending,pending+amount);assert.ok(claimMission(restored,'walk-1').error);
 claimSteps(restored,true);assert.deepEqual(missionTasks(restored).items.map(x=>x.state),['claimed','claimed']);assert.equal(restored.user.pending,pending+2*amount);
});
test('途中のハズレは再挑戦でき、次の当選で受取済みとなり追加付与しない',()=>{
 const s=setup('minigame'),balance=total(s);
 assert.equal(drawGame(s,'dice',false,()=>0.99).amount,0);
 assert.equal(task(s).state,'todo');assert.equal(missionTasks(s).done,0);
 assert.ok(beginMissionActivity(s,'custom-1').token);
 const win=drawGame(s,'dice',false,()=>0);
 assert.equal(task(s).state,'claimed');assert.equal(total(s),balance);
 assert.ok(claimMission(s,'custom-1').error);
 claimGame(s,'dice',win.id);assert.equal(task(s).state,'claimed');
 drawGame(s,'dice',false,()=>0.99);assert.equal(task(s).state,'claimed');
});
test('3回すべてハズレはまた明日となり、進捗・全件達成に含めず翌日リセットする',()=>{
 const s=setup('minigame'),balance=total(s);
 for(let i=1;i<=3;i++){
  const result=drawGame(s,'dice',false,()=>0.99);assert.equal(result.amount,0);
  assert.equal(task(s).state,i<3?'todo':'ended');assert.equal(claimGame(s,'dice',result.id),false);
 }
 assert.equal(missionTasks(s).done,0);assert.equal(missionTasks(s).complete,false);
 assert.ok(beginMissionActivity(s,'custom-1').error);assert.ok(claimMission(s,'custom-1').error);assert.equal(total(s),balance);
 const restored=JSON.parse(JSON.stringify(s));assert.equal(task(restored).state,'ended');
 restored.date='2026-09-16';assert.equal(task(restored).state,'todo');
});
test('最後の当選は未受取でもゲーム内で受け取れ、受取済みの表示で二重付与しない',()=>{
 const s=setup('minigame');drawGame(s,'dice',false,()=>0.99);drawGame(s,'dice',false,()=>0.99);
 const win=drawGame(s,'dice',false,()=>0);assert.equal(task(s).state,'claimed');
 const restored=JSON.parse(JSON.stringify(s)),before=total(restored);
 assert.equal(task(restored).state,'claimed');assert.equal(claimGame(restored,'dice',win.id),true);
 assert.equal(task(restored).state,'claimed');assert.equal(total(restored),before+win.amount);
 assert.equal(claimGame(restored,'dice',win.id),false);
});
test('未受取の当選を次の抽選で失い、その後も受け取れず終了した場合はまた明日',()=>{
 const s=setup('minigame');drawGame(s,'dice',false,()=>0);assert.equal(task(s).state,'claimed');
 drawGame(s,'dice',false,()=>0.99);assert.equal(task(s).state,'todo');
 drawGame(s,'dice',false,()=>0.99);assert.equal(task(s).state,'ended');
});
test('運営が入力したミッション名は特定の文言でも保存・再読込で変換しない',()=>{
 for(const [kind,title,id] of [['minigame','サイコロで遊ぶ','custom-1'],['video','動画を2回見る','custom-1'],['survey','任意のアンケート','survey-count-2']]){
  const s=setup(kind,{title,id});assert.equal(task(s).title,title);
  const restored=JSON.parse(JSON.stringify(s));assert.equal(task(restored).title,title);
  assert.equal(normalizeDailyMission({id,kind,title}).title,title);
 }
});
test('後ろの動画行から実行しても、1視聴で他の行を達成にしない',()=>{
 const s=initialState();saveDailyMissions(s,[newDailyMission('video','one'),newDailyMission('video','two'),newDailyMission('video','three')]);
 const journey=beginMissionActivity(s,'three');assert.ok(claimVideo(s,{mission:journey}));
 assert.deepEqual(missionTasks(s).items.map(x=>x.state),['todo','todo','achieved']);
 const amount=claimMission(s,'three').amount;assert.ok(amount);assert.deepEqual(missionTasks(s).items.map(x=>x.state),['todo','todo','claimed']);
 const restored=JSON.parse(JSON.stringify(s));assert.ok(claimMission(restored,'three').error);assert.equal(missionTasks(restored).done,1);
});
