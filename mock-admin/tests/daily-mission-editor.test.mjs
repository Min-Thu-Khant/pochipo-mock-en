import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,dailyMissionGroups} from '../../mock-app/model.js';
import {dailyMissionRow,readDailyMissionRow,dailyMissionRule} from '../daily-mission-editor.js';
import {saveDailyMissionDetail} from '../daily-mission-management.js';
const form=values=>({dataset:{dailyId:values.id},querySelector:selector=>{const key=selector.match(/name=(\w+)/)[1];return values[key]===undefined?null:{value:String(values[key])};}});
test('活動の1回単位・歩数固定段階を保存し、追加報酬を読み取らない',()=>{
 for(const category of ['video','survey','minigame','steps']){
  const row=readDailyMissionRow(form({id:'sample',category,missionType:'daily',title:'ミッション',targetCount:999,reward:900,activitySlot:2,gameId:category==='minigame'?'dice':''}));
  assert.equal(row.targetCount,category==='steps'?2000:1);assert.equal(row.reward,undefined);assert.equal(row.activitySlot,2);
  if(category==='minigame'){assert.equal(row.to,'home/minigames');assert.equal(row.gameId,'dice');}
  if(category==='survey')assert.equal(row.to,'surveys');
 }
});
test('アフィリエイトの件数と追加報酬だけを編集して保存する',()=>{
 const s=initialState();dailyMissionGroups(s);
 const m=readDailyMissionRow(form({id:'affiliate-editor',category:'affiliate',missionType:'limited',title:'2件利用',targetCount:2,reward:120,offerMode:'count',startDate:s.date,endDate:s.date}));
 saveDailyMissionDetail(s,m,true);
 const saved=dailyMissionGroups(s)[0].missions.find(m=>m.id==='affiliate-editor');assert.equal(saved.targetCount,2);assert.equal(saved.reward,120);
 assert.match(dailyMissionRule(saved,s).condition,/異なる2件/);
});
test('活動別の編集画面は固定条件・受取方法を表示し、不要な回数・歩数・報酬入力を出さない',()=>{
 const old=globalThis.location;globalThis.location={href:'http://localhost:4173/mock-admin/'};
 try{const s=initialState();for(const kind of ['video','survey','steps','minigame']){
  const html=dailyMissionRow({id:kind,kind,activitySlot:2},s);
  assert.doesNotMatch(html,/name="reward"/);assert.doesNotMatch(html,/必要な実施回数|達成歩数（歩）|遷移先ディープリンク/);
  assert.match(html,/達成条件・報酬/);assert.match(html,/受取方法/);
 }
 const survey=dailyMissionRow({id:'survey',kind:'survey'},s);assert.match(survey,/自動的に「受け取り済」/);
 const steps=dailyMissionRow({id:'steps',kind:'steps',activitySlot:2},s);assert.match(steps,/2,000歩/);
 const affiliate=dailyMissionRow({id:'affiliate',kind:'affiliate',missionType:'limited'},s);assert.match(affiliate,/name="reward"/);assert.match(affiliate,/必要な異なる案件数/);
 }finally{globalThis.location=old;}
});
