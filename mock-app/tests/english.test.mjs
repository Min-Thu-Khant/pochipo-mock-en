import test from 'node:test';
import assert from 'node:assert/strict';
import {englishCatalog,translateEnglish} from '../english-text.js';
import {searchOffers} from '../offer-search.js';

test('English screens use consistent navigation and dynamic mission labels',()=>{
 for(const [source,expected] of [['デイリーミッション','Daily Missions'],['マイページ','My Page'],['チャレンジボーナスとは','What Is a Challenge Bonus?'],['歩いてため','Earn by Walking'],['アンケートに答え','Answer Surveys']])assert.equal(translateEnglish(source),expected);
});
test('Japanese UI catalog renders without remaining Japanese characters',()=>{
 for(const source of Object.keys(englishCatalog))assert.doesNotMatch(translateEnglish(source),/[\u3040-\u30ff\u3400-\u9fff]/,source);
});
test('English localization preserves numbers, point units, codes, and URLs',()=>{
 assert.equal(translateEnglish('5,000円相当'),'5,000 yen equivalent');
 for(const value of ['12,345pt','ABC123','https://example.com/offer?id=12','#offer/travel','2026-11-04','user@example.com'])assert.equal(translateEnglish(value),value);
});
test('English offer searches find original model names without changing stored data',()=>{
 const offers=[{id:'card',name:'サンプルクレジットカード'},{id:'travel',name:'旅日和トラベル'}];
 assert.deepEqual(searchOffers(offers,'CREDIT').map(o=>o.id),['card']);
 assert.deepEqual(searchOffers(offers,'クレジット').map(o=>o.id),['card']);
 assert.equal(offers[0].name,'サンプルクレジットカード');
});

test('English dates, onboarding progress, and sign-in labels read naturally',()=>{
 assert.equal(translateEnglish('2026年11月4日'),'Nov 4, 2026');
 assert.equal(translateEnglish('2ページ中1ページ'),'1 of 2');
 assert.equal(translateEnglish('Googleで続ける'),'Continue with Google');
});
