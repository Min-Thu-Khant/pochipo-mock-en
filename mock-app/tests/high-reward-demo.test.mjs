import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,tamerukoAllSectionOffers} from '../model.js';
import {highRewardTabOffers,highRewardSettings,saveHighRewardManual} from '../high-reward-model.js';
import {ensureHighRewardDemo} from '../high-reward-demo.js';

test('未設定モックには通常の月別手動設定で6件を登録し、おすすめは変更しない',()=>{
 const s=initialState(),before=tamerukoAllSectionOffers(s,'high-reward');
 assert.equal(ensureHighRewardDemo(s),true);
 assert.equal(highRewardSettings(s).manual.length,6);
 assert.equal(highRewardTabOffers(s).length,6);
 assert.deepEqual(tamerukoAllSectionOffers(s,'high-reward'),before);
 assert.equal(ensureHighRewardDemo(s),false);
 const saved=JSON.parse(JSON.stringify(s));assert.equal(ensureHighRewardDemo(saved),false);
});
test('空設定・翌月予約・旧設定を上書きせず、解除後の自動復活もない',()=>{
 for(const settings of [{months:{}},{months:{'2026-10':[]}},{months:{'2027-01':[{offerId:'card',order:1}]}},{manual:[]}]){
  const s=initialState();s.highRewardTab=structuredClone(settings);assert.equal(ensureHighRewardDemo(s),false);assert.deepEqual(s.highRewardTab,settings);
 }
 const s=initialState();ensureHighRewardDemo(s);saveHighRewardManual(s,[]);assert.equal(ensureHighRewardDemo(s),false);assert.equal(highRewardTabOffers(s).length,0);
});
test('サンプルも前月継続・公開停止除外・手動順・重複除外に従う',()=>{
 const s=initialState();ensureHighRewardDemo(s);const ids=highRewardSettings(s).manual.map(r=>r.offerId);
 s.date='2026-10-01';assert.equal(highRewardSettings(s).inherited,true);
 const first=s.nacs.offers.find(o=>o.id===ids[0]);first.active=false;
 assert.ok(!highRewardTabOffers(s).some(o=>o.id===first.id));
 const list=highRewardTabOffers(s).map(o=>o.id);assert.equal(new Set(list).size,list.length);
});
