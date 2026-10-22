import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,missionTasks,createConversion,claimMission,dailyMissionGroups} from '../model.js';
import {ensureLimitedCreditCardDemo} from '../limited-mission-demo.js';

test('期間限定のクレジットカード仮ミッションを追加し、指定案件の判定中で受け取れる',()=>{
 const s=initialState();const before=structuredClone(dailyMissionGroups(s)[0].missions);
 assert.equal(ensureLimitedCreditCardDemo(s),true);
 assert.deepEqual(dailyMissionGroups(s)[0].missions.slice(0,-1),before);
 const find=()=>missionTasks(s).items.find(m=>m.id==='limited-credit-card-demo');
 assert.equal(find().title,'クレジットカードを1枚作る');
 assert.equal(find().missionType,'limited');assert.equal(find().to,'offer/card');
 assert.equal(find().state,'todo');createConversion(s,'travel');assert.equal(find().state,'todo');
 createConversion(s,'card');assert.equal(find().state,'achieved');
 assert.deepEqual(claimMission(s,'limited-credit-card-demo'),{amount:100});
 assert.equal(find().state,'claimed');assert.ok(claimMission(s,'limited-credit-card-demo').error);
});
test('再読込で重複せず、運営による編集・削除を元に戻さない',()=>{
 let s=initialState();ensureLimitedCreditCardDemo(s);
 s=JSON.parse(JSON.stringify(s));assert.equal(ensureLimitedCreditCardDemo(s),false);
 const group=dailyMissionGroups(s)[0];
 assert.equal(group.missions.filter(m=>m.id==='limited-credit-card-demo').length,1);
 group.missions=group.missions.filter(m=>m.id!=='limited-credit-card-demo');
 assert.equal(ensureLimitedCreditCardDemo(s),false);
 assert.equal(group.missions.some(m=>m.id==='limited-credit-card-demo'),false);
});
