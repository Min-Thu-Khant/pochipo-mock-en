import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,challengeOrder,challengeSlots,moveChallenge,saveNacsChallenge,offerTerms,yen,pt} from '../model.js';
test('100ポイントを1円として換算する',()=>{assert.equal(yen(100),'1');assert.equal(yen(123450),'1,234.5');assert.equal(pt(123450),'123,450');});
test('並び替えは案件詳細を変えず、アプリにも反映する',()=>{const s=initialState(),list=challengeOrder(s),first=list[0],second=list[1];const before=structuredClone(first);assert.ok(moveChallenge(s,second.id,-1));assert.equal(challengeSlots(s)[0].id,second.id);delete first.displayOrder;assert.deepEqual(first,before);assert.equal(moveChallenge(s,second.id,-1),false);});
test('NACSで編集したチャレンジ条件は詳細に反映し、表示順を保持する',()=>{const s=initialState(),c=challengeOrder(s)[1];moveChallenge(s,c.id,-1);saveNacsChallenge(s,{...c,bonus:12300,challengeGoal:6000});assert.equal(offerTerms(s,c.destination).challenge.bonus,12300);assert.equal(challengeSlots(s)[0].id,c.id);assert.ok(s.nacs.logs[0].label.includes('チャレンジ'));const before=structuredClone(c);assert.throws(()=>saveNacsChallenge(s,{...c,bonus:-1}));assert.deepEqual(c,before);assert.throws(()=>saveNacsChallenge(s,{...c,participants:NaN}));});
