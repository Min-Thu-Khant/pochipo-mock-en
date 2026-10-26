import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,availableSurveys,surveyRewardRange,surveys} from '../model.js';
import {appSurveyNotice} from '../app-survey-notice.js';

test('通知対象と合計にはライフサーベイだけを含める',()=>{
 const s=initialState(),notice=appSurveyNotice(s);
 assert.ok(availableSurveys(s).some(q=>q.provider!=='life-survey'));
 assert.ok(notice.items.length>0);
 assert.ok(notice.items.every(q=>q.provider==='life-survey'));
 assert.equal(notice.count,2);assert.equal(notice.maxReward,5600);
});
test('回答済みのライフサーベイは通知対象・合計から除く',()=>{
 const s=initialState(),before=appSurveyNotice(s),answered=before.items.find(q=>q.id==='s2');
 s.user.answered.push(answered.id);
 const after=appSurveyNotice(s);
 assert.equal(after.count,before.count-1);
 assert.equal(after.maxReward,before.maxReward-surveyRewardRange(s,answered).max);
 assert.ok(after.items.every(q=>q.id!==answered.id));
});
test('他社案件だけが回答可能な場合は0件・0ポイントになる',()=>{
 const s=initialState();s.user.answered.push(...surveys.filter(q=>q.provider==='life-survey').map(q=>q.id));
 assert.ok(availableSurveys(s).some(q=>q.provider!=='life-survey'));
 assert.deepEqual(appSurveyNotice(s),{items:[],count:0,maxReward:0});
});
test('回答可能な案件がない場合は0件・0ポイントになる',()=>{
 const s=initialState();s.scenario='empty';
 assert.deepEqual(appSurveyNotice(s),{items:[],count:0,maxReward:0});
});
