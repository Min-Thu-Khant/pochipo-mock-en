import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,offerTerms,challenge,caseFor} from '../model.js';
import {retireTravelBoostPreview} from '../travel-preview.js';
import {campaignFixture} from './campaign-fixture.mjs';

test('旅行案件は通常報酬で表示され、秋・冬の増額見本を初期配信しない',()=>{
 const state=initialState();
 for(const date of ['2026-09-15','2026-11-15']){
  state.date=date;
  const terms=offerTerms(state,'travel');
  assert.equal(terms.reward,terms.offer.base);
  assert.equal(terms.slot,undefined);
  assert.equal(terms.challenge,undefined);
 }
 assert(!state.slots.some(slot=>['autumn','winter','pill-autumn'].includes(slot.id)));
});

test('旧旅行キャンペーンだけを除去し、過去成果・残高・独自設定を保つ',()=>{
 const state=initialState(),old=campaignFixture(state,{id:'autumn'});
 state.slots.push({...old,id:'winter',reward:150000},{...old,id:'pill-autumn',kind:'ticker'});
 const result=challenge(state,'travel');
 assert.equal(result.reward,120000);
 const other=campaignFixture(state,{id:'custom-campaign',destination:'card'});
 const user=structuredClone(state.user),slotsBefore=state.slots.length;
 assert.equal(retireTravelBoostPreview(state),true);
 assert.equal(state.slots.length,slotsBefore-3);
 assert(state.slots.includes(other));
 assert.deepEqual(state.user,user);
 assert.equal(caseFor(state,'travel').reward,120000);
 assert.equal(offerTerms(state,'travel').reward,50000);
 assert.equal(retireTravelBoostPreview(state),false);
 // The general period-limited price feature remains usable with explicit configuration.
 campaignFixture(state,{id:'custom-travel',reward:75000});
 assert.equal(retireTravelBoostPreview(state),false);
 assert.equal(offerTerms(state,'travel').reward,75000);
});
