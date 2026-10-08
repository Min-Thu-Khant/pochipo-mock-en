import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,surveys,surveyReward,surveyRewardRange,completeSurvey,L,total} from '../model.js';

test('survey range follows the configured conversion rate without changing the actual award',()=>{
 const state=initialState(),q=surveys[0];
 L(state).surveyRate.screening=70;
 assert.deepEqual(surveyRewardRange(state,q),{min:210,max:2100});
 const before=total(state);
 assert.equal(completeSurvey(state,q.id),surveyReward(state,q));
 assert.equal(total(state)-before,2100);
 assert.equal(completeSurvey(state,q.id),false);
});

test('survey range supports missing minima, zero and a reversed range',()=>{
 const s=initialState();L(s).surveyRate.screening=70;
 const q={type:'screening',rewardYen:30};
 assert.deepEqual(surveyRewardRange(s,q),{min:2100,max:2100});
 assert.deepEqual(surveyRewardRange(s,{...q,rewardMinYen:0}),{min:0,max:2100});
 assert.deepEqual(surveyRewardRange(s,{...q,rewardMinYen:50}),{min:2100,max:2100});
 assert.deepEqual(surveyRewardRange(s,{...q,rewardMinYen:1.25}),{min:88,max:2100});
});
