import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,claimVideo,completeSurvey,availableSurveys,missionTasks,total} from '../model.js';
import {resetDailyMissionDemo} from '../mission-demo-reset.js';
test('ミッションだけ再操作可能にし、残高と履歴は保持・同一リセットは一度だけ',()=>{
 const s=initialState();s.user.installUnlocked=true;
 claimVideo(s);const id=availableSurveys(s)[0].id;completeSurvey(s,id);
 const balance=total(s),history=structuredClone(s.user.history),persona=s.persona;
 assert(resetDailyMissionDemo(s,'demo-1'));assert.equal(missionTasks(s).done,0);
 assert.equal(total(s),balance);assert.deepEqual(s.user.history,history);assert.equal(s.persona,persona);
 assert(availableSurveys(s).some(q=>q.id===id));
 const reward=completeSurvey(s,id);assert.equal(total(s),balance+reward);
 assert.equal(completeSurvey(s,id),false);
 assert.equal(resetDailyMissionDemo(s,'demo-1'),false);assert.equal(missionTasks(s).done,1);
 claimVideo(s);assert(missionTasks(s).done>=2);
});

test('7件入稿サンプルは未完了7件で、報酬を増減させず再操作できる',async()=>{
 const {configureSevenMissionDemo}=await import('../mission-demo-reset.js');
 const s=initialState(),before=total(s);configureSevenMissionDemo(s,'seven');
 const tasks=missionTasks(s);assert.equal(tasks.total,7);assert.equal(tasks.done,0);assert.equal(total(s),before);
 assert.equal(tasks.items.slice(0,5).length,5);assert.equal(tasks.items.slice(5).length,2);
 assert.deepEqual(tasks.items.slice(5).map(x=>x.id),['survey-s1','survey-s2']);
 const amount=completeSurvey(s,'s1');assert.equal(total(s),before+amount);assert.equal(missionTasks(s).total,7);
});
