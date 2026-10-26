import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,dailyMissionGroups,missionTasks} from '../../mock-app/model.js';
import {normalizeDailyMission,newDailyMission} from '../../mock-app/daily-mission-categories.js';
import {dailyMissionList,dailyMissionDetail,dailyMissionStatus,saveDailyMissionDetail,updateDailyMissionList} from '../daily-mission-management.js';
import {saveDailyMissions,claimMission,createConversion} from '../../mock-app/model.js';
test('停止期間は両端を含み、終了翌日に再開し手動停止・掲載終了を優先する',()=>{
 const s=initialState();dailyMissionGroups(s);
 const m={...newDailyMission('affiliate','paused-card',{date:s.date}),offerMode:'specific',offerId:'card',endDate:'2026-09-30',pauseStartDate:'2026-09-16',pauseEndDate:'2026-09-17'};
 saveDailyMissions(s,[m]);createConversion(s,'card');
 assert.equal(missionTasks(s).items[0].state,'achieved');
 for(const date of ['2026-09-16','2026-09-17']){s.date=date;assert.equal(missionTasks(s).items.length,0);assert.equal(dailyMissionStatus(m,date)[1],'期間停止中');assert.ok(claimMission(s,m.id).error);}
 s.date='2026-09-18';assert.equal(missionTasks(s).items[0].state,'achieved');
 assert.ok(claimMission(s,m.id).amount);assert.equal(missionTasks(s).items[0].state,'claimed');
 updateDailyMissionList(s,m.id,'toggle');assert.equal(missionTasks(s).items.length,0);
 s.date='2026-10-01';updateDailyMissionList(s,m.id,'toggle');assert.equal(missionTasks(s).items.length,0);
});
test('停止日の片側のみ・逆転・不正日は保存せず、空欄で予約を解除できる',()=>{
 const s=initialState(),m=newDailyMission('steps','paused-steps');saveDailyMissions(s,[m]);
 const before=JSON.stringify(s.dailyMissionGroups);
 for(const patch of [{pauseStartDate:'2026-09-16'},{pauseEndDate:'2026-09-17'},{pauseStartDate:'2026-09-18',pauseEndDate:'2026-09-17'},{pauseStartDate:'2026-02-30',pauseEndDate:'2026-09-17'}]){assert.throws(()=>saveDailyMissions(s,[{...m,...patch}]));assert.equal(JSON.stringify(s.dailyMissionGroups),before);}
 saveDailyMissions(s,[{...m,pauseStartDate:s.date,pauseEndDate:s.date}]);assert.equal(missionTasks(s).items.length,0);
 saveDailyMissions(s,[{...m,pauseStartDate:'',pauseEndDate:''}]);assert.equal(missionTasks(s).items.length,1);
 assert.match(dailyMissionList(s),/停止期間/);
});
test('入口は一覧で、個別の編集と停止・配信再開を表示する',()=>{
 const s=initialState(),html=dailyMissionList(s);
 assert.match(html,/登録済みミッション/);assert.match(html,/#missions\/new/);assert.match(html,/編集/);
 assert.doesNotMatch(html,/<form/);assert.match(html,/data-action="daily-toggle"/);
 updateDailyMissionList(s,'video','toggle');assert.match(dailyMissionList(s),/配信再開/);
 assert.equal(missionTasks(s).items.some(m=>m.id==='video'),false);
 updateDailyMissionList(s,'video','toggle');assert.equal(missionTasks(s).items.some(m=>m.id==='video'),true);
});
test('個別保存は他のミッションと停止状態を維持する',()=>{
 const s=initialState(),rows=dailyMissionGroups(s)[0].missions;
 updateDailyMissionList(s,'video','toggle');
 const other=structuredClone(rows.filter(m=>m.id!=='video'));
 const m=normalizeDailyMission(dailyMissionGroups(s)[0].missions.find(m=>m.id==='video'));
 saveDailyMissionDetail(s,{...m,title:'動画の設定を変更',enabled:true});
 const next=dailyMissionGroups(s)[0].missions;
 assert.equal(next.find(m=>m.id==='video').enabled,false);
 assert.equal(next.find(m=>m.id==='video').title,'動画の設定を変更');
 assert.deepEqual(next.filter(m=>m.id!=='video'),other.map(normalizeDailyMission));
});
test('新規作成・並べ替え・削除と期間別ステータスを扱える',()=>{
 const s=initialState();dailyMissionGroups(s);
 const m={...newDailyMission('affiliate','new-limited',{date:s.date}),offerMode:'specific',offerId:'card'};
 saveDailyMissionDetail(s,m,true);assert.equal(dailyMissionGroups(s)[0].missions.at(-1).id,m.id);
 updateDailyMissionList(s,m.id,'up');assert.equal(dailyMissionGroups(s)[0].missions.at(-2).id,m.id);
 updateDailyMissionList(s,m.id,'delete');assert.equal(dailyMissionGroups(s)[0].missions.some(x=>x.id===m.id),false);
 assert.equal(dailyMissionStatus({...m,startDate:'2099-01-01'},s.date)[1],'配信予定');
 assert.equal(dailyMissionStatus({...m,endDate:'2000-01-01'},s.date)[1],'期間終了');
 assert.equal(dailyMissionStatus({...m,enabled:false},s.date)[1],'停止中');
});
test('個別の詳細画面はカテゴリーの表示チェックを持たない',()=>{
 const old=globalThis.location;globalThis.location={href:'http://localhost:4208/mock-admin/'};
 try{const s=initialState(),html=dailyMissionDetail(s,'video');assert.match(html,/daily-mission-detail-form/);assert.match(html,/ミッションの種類/);assert.match(html,/カテゴリー/);assert.doesNotMatch(html,/type="checkbox"/);assert.match(dailyMissionDetail(s,'missing'),/見つかりません/);}finally{globalThis.location=old;}
});
