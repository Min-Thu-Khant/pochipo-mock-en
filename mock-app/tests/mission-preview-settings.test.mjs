import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {requestDailySurveyQuote} from '../mission-preview-settings.js';

test('その日最初の取得だけで最大案件額を保存し、再描画・再読込では再取得しない',async()=>{
 const s=initialState();let calls=0;
 const fetcher=async()=>{calls++;return {ok:true,json:async()=>({items:[{reward:100},{reward:3500},{reward:800}]})};};
 await Promise.all([requestDailySurveyQuote(s,fetcher),requestDailySurveyQuote(s,fetcher)]);
 assert.equal(calls,1);assert.equal(s.user.daily[s.date].surveyMissionQuote.maxReward,3500);
 await requestDailySurveyQuote(JSON.parse(JSON.stringify(s)),fetcher);assert.equal(calls,1);
 s.date='2026-09-16';await requestDailySurveyQuote(s,fetcher);assert.equal(calls,2);
});
test('空一覧は最大0、取得失敗や不正データは最大額として保存しない',async()=>{
 const empty=initialState();await requestDailySurveyQuote(empty,async()=>({ok:true,json:async()=>({items:[]})}));
 assert.equal(empty.user.daily[empty.date].surveyMissionQuote.maxReward,0);
 for(const response of [{ok:false},{ok:true,json:async()=>({items:[{reward:-1}]})}]){
  const s=initialState();assert.equal(await requestDailySurveyQuote(s,async()=>response),false);
  assert.equal(s.user.daily[s.date].surveyMissionQuote,undefined);assert.equal(s.user.daily[s.date].surveyMissionQuoteError,true);
 }
});

test('通信失敗直後に一度だけ表示を更新し、再描画で取得や更新を繰り返さない',async()=>{
 const s=initialState();let calls=0,updates=0,shown='取得中';
 const fetcher=async()=>{calls++;throw Error('offline');};
 const update=()=>{updates++;shown=s.user.daily[s.date].surveyMissionQuoteError?'取得できません':'取得中';requestDailySurveyQuote(s,fetcher,update);};
 await requestDailySurveyQuote(s,fetcher,update);
 assert.equal(shown,'取得できません');assert.equal(updates,1);assert.equal(calls,1);
 await requestDailySurveyQuote(s,fetcher,update);assert.equal(updates,1);assert.equal(calls,1);
 s.date='2026-09-16';await requestDailySurveyQuote(s,fetcher,update);assert.equal(updates,2);assert.equal(calls,2);
});
