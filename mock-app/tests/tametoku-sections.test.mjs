import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,tamerukoSectionSettings,tamerukoSectionOffers,tamerukoAllSectionOffers,tamerukoSectionChallenges,challengeSlots} from '../model.js';

test('お得タブは3セクションの既定順と人気ランキング固定を持つ',()=>{
 const state=initialState();
 const settings=tamerukoSectionSettings(state);
 assert.deepEqual(settings.order,['challenge','new','high-reward']);
 assert.equal(tamerukoSectionChallenges(state).length,4);
 assert.ok(tamerukoSectionOffers(state,'new').length>0);
 assert.ok(tamerukoSectionOffers(state,'high-reward').length>0);
});

test('お得タブは保存したセクション順・案件順を反映する',()=>{
 const state=initialState();
 const first=tamerukoSectionOffers(state,'new').map(x=>x.id);
 state.tametokuSections={order:['high-reward','challenge','new'],sections:{challenge:{offerIds:['sec','marche']},new:{offerIds:first.slice().reverse()},'high-reward':{offerIds:first.slice(0,2)}}};
 assert.deepEqual(tamerukoSectionSettings(state).order,['high-reward','challenge','new']);
 assert.deepEqual(tamerukoSectionChallenges(state).map(x=>x.destination),challengeSlots(state).map(x=>x.destination));
 assert.deepEqual(tamerukoSectionOffers(state,'new').map(x=>x.id),first);
 assert.deepEqual(tamerukoSectionOffers(state,'high-reward').map(x=>x.id),first.slice(0,2));
});

test('新着・高還元のもっと見る一覧は6件を超えて表示できる',()=>{
 const state=initialState();
 assert.ok(tamerukoAllSectionOffers(state,'new').length>6);
 assert.ok(tamerukoAllSectionOffers(state,'high-reward').length>6);
});
