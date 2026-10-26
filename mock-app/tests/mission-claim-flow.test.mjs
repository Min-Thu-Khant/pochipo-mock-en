import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,beginMissionActivity,claimVideo,completeSurvey,claimMission,missionTasks,total,day,L} from '../model.js';
import {configureFiveMissionDemo,resetDailyMissionDemo} from '../mission-demo-reset.js';
import {missionAction} from '../design-system/app-theme/library-components.js';
import {dialogMarkup} from '../dialogs.js';

function fresh(){const s=initialState();configureFiveMissionDemo(s,crypto.randomUUID());s.dailyMissionGroups[0].missions=[{id:"video",kind:"video"},{id:"video-2",kind:"video"},{id:"video-3",kind:"video"},{id:"survey",kind:"survey"},{id:"survey-s1",kind:"survey"}];return s;}
const task=(s,id)=>missionTasks(s).items.find(x=>x.id===id);

test('動画の行動完了では付与せず、受け取り操作で一度だけ即時獲得する',()=>{
 const s=fresh(),balance=total(s),pending=s.user.pending,history=s.user.history.length;
 const mission=beginMissionActivity(s,'video');
 assert.equal(task(s,'video').state,'todo');
 assert.ok(claimVideo(s,{mission}));
 assert.equal(task(s,'video').state,'achieved');assert.equal(missionTasks(s).claimable,1);
 assert.equal(total(s),balance);assert.equal(s.user.history.length,history);assert.equal(s.user.pending,pending);
 assert.equal(claimVideo(s,{mission}),false);
 const amount=L(s).videoReward;
 assert.deepEqual(claimMission(s,'video'),{amount});
 assert.equal(total(s),balance+amount);assert.equal(s.user.pending,pending);
 assert.equal(task(s,'video').state,'claimed');
 assert.ok(claimMission(s,'video').error);assert.equal(total(s),balance+amount);
});
test('未完了や日付違いでは付与せず、再読込しても未受け取りを保持する',()=>{
 let s=fresh();const balance=total(s);
 assert.ok(claimMission(s,'video').error);
 const mission=beginMissionActivity(s,'video');claimVideo(s,{mission});
 s=JSON.parse(JSON.stringify(s));
 assert.equal(task(s,'video').state,'achieved');
 assert.ok(claimMission(s,'video',{date:'2000-01-01'}).error);assert.equal(total(s),balance);
 assert.ok(claimMission(s,'video').amount);const after=total(s);
 s=JSON.parse(JSON.stringify(s));assert.ok(claimMission(s,'video').error);assert.equal(total(s),after);
});
test('広告未完了・日跨ぎ・古い操作トークンは活動を完了にしない',()=>{
 const s=fresh(),balance=total(s),old=beginMissionActivity(s,'video');
 assert.equal(task(s,'video').state,'todo');assert.equal(total(s),balance);
 const current=beginMissionActivity(s,'video');assert.equal(claimVideo(s,{mission:old}),false);
 s.date='2026-10-09';assert.equal(claimVideo(s,{mission:current}),false);
 assert.equal(day(s).video,0);assert.equal(task(s,'video').state,'todo');
});
test('動画の各段階は達成した行に受取を出し、報酬は視聴分だけになる',()=>{
 const s=fresh(),balance=total(s);
 for(let count=1;count<=3;count++){
  const id=count===1?'video':'video-'+count;
  const mission=beginMissionActivity(s,id);assert.ok(claimVideo(s,{mission}));
  assert.equal(task(s,id).state,'achieved');assert.equal(task(s,id).reward,L(s).videoReward);
  assert.ok(claimMission(s,id).amount);
 }
 assert.equal(total(s),balance+3*L(s).videoReward);
});
test('動画の2回・3回という旧設定も1再生で個別に達成する',()=>{
 const s=fresh(),balance=total(s);s.dailyMissionGroups[0].missions=[{id:'video-2',enabled:true}];
 const mission=beginMissionActivity(s,'video-2');claimVideo(s,{mission});
 assert.equal(task(s,'video-2').state,'achieved');assert.deepEqual(claimMission(s,'video-2'),{amount:L(s).videoReward});
 assert.equal(total(s),balance+L(s).videoReward);
});
test('ミッション経由のアンケートも活動元で一度だけ報酬を受け取る',()=>{
 const s=fresh(),balance=total(s),mission=beginMissionActivity(s,'survey-s1');
 const amount=completeSurvey(s,'s1',{mission});assert.ok(amount);assert.equal(total(s),balance+amount);
 assert.equal(task(s,'survey').state,'claimed');assert.equal(task(s,'survey-s1').state,'claimed');
 assert.equal(completeSurvey(s,'s1',{mission}),false);assert.ok(claimMission(s,'survey-s1').error);assert.equal(total(s),balance+amount);
});
test('対象外アンケートの回答や失敗でミッション受取を発生させない',()=>{
 const s=fresh(),balance=total(s),mission=beginMissionActivity(s,'survey-s1');
 assert.equal(completeSurvey(s,'s2',{mission}),false);
 assert.equal(total(s),balance);assert.equal(day(s).surveys,0);
 assert.equal(task(s,'survey-s1').state,'todo');
});
test('受取前に運用の報酬額が変わっても、行動完了時の額を付与する',()=>{
 const s=fresh(),mission=beginMissionActivity(s,'video'),amount=L(s).videoReward;
 claimVideo(s,{mission});s.limits.videoReward=9999;
 assert.equal(task(s,'video').reward,amount);assert.deepEqual(claimMission(s,'video'),{amount});
});
test('活動後に広告配信が不可になっても、未受取の報酬は受け取れる',()=>{
 const s=fresh(),mission=beginMissionActivity(s,'video');claimVideo(s,{mission});
 s.persona='minor';assert.equal(task(s,'video').state,'achieved');
 assert.ok(claimMission(s,'video').amount);
});
test('通常の動画・アンケートから付与済みの報酬を二重受取しない',()=>{
 const s=fresh();claimVideo(s);completeSurvey(s,'s1');const balance=total(s);
 assert.equal(task(s,'video').state,'claimed');assert.equal(task(s,'survey-s1').state,'claimed');
 assert.ok(claimMission(s,'video').error);assert.ok(claimMission(s,'survey-s1').error);
 assert.equal(total(s),balance);
});
test('デモリセットで保留と導線を初期化し、既に獲得した残高は保持する',()=>{
 const s=fresh(),mission=beginMissionActivity(s,'video');claimVideo(s,{mission});claimMission(s,'video');
 const balance=total(s);resetDailyMissionDemo(s,'new-demo');
 assert.equal(s.user.dailyMissionJourney,undefined);assert.equal(missionTasks(s).claimable,0);
 assert.equal(task(s,'video').state,'todo');assert.equal(total(s),balance);
});
test('受取・受取済・戻るの共通UIを表示する',()=>{
 assert.match(missionAction('achieved'),/>受け取る</);
 assert.doesNotMatch(missionAction('achieved'),/disabled|mission-action-chevron/);
 assert.match(missionAction('ended'),/また明日/);assert.match(missionAction('ended'),/disabled/);assert.doesNotMatch(missionAction('ended'),/受け取り済|やってみる/);
 assert.match(missionAction('claimed'),/disabled/);assert.match(missionAction('claimed'),/受け取り済/);
 assert.match(dialogMarkup('earned',{amount:100,closeLabel:'戻る'}),/>戻る</);
});
