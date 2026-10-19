import test from 'node:test';
import assert from 'node:assert/strict';
import {searchOffers,recentSearchCvCounts,searchCvCounts} from '../offer-search.js';

const offers=[
 {id:'a',name:'サンプルカード',category:'金融',condition:'無料登録'},
 {id:'b',name:'トリップカード',category:'金融',condition:'口座開設'},
 {id:'c',name:'サンプル旅行',category:'旅行',condition:'カード決済'}
];
test('直近30暦日JSTの発生CVを集計し、期間外・未来・不正値を除く',()=>{
 const counts=recentSearchCvCounts([
  {offerId:'a',date:'2026-09-20',count:2},
  {offerId:'a',date:'2026-10-19',count:3},
  {offerId:'b',date:'2026-09-19',count:1000},
  {offerId:'b',date:'2026-10-20',count:1000},
  {offerId:'b',date:'2026-10-01',count:8,status:'pending'},
  {offerId:'b',date:'2026-10-02',count:1,status:'rejected'},
  {offerId:'a',date:'2026-10-10',count:-1},
  {offerId:'a',date:'2026-09-31',count:1000}
 ],'2026-10-19');
 assert.deepEqual({...counts},{a:5,b:9});
 assert.deepEqual(searchOffers(offers,'カード',counts).map(o=>o.id),['b','a']);
});
test('明示的に空のCVデータを渡したらサンプル件数で補わない',()=>{
 assert.deepEqual({...searchCvCounts({date:'2026-10-19',searchCvDaily:[]})},{});
 assert.equal(searchCvCounts({date:'2026-10-19'}).card,120);
});
test('案件名の部分一致のみで検索する',()=>{
 assert.deepEqual(searchOffers(offers,'カード',{}).map(o=>o.id),['a','b']);
 assert.deepEqual(searchOffers(offers,'金融',{}),[]);
 assert.deepEqual(searchOffers(offers,'無料登録',{}),[]);
 assert.deepEqual(searchOffers(offers,' サンプル ',{}).map(o=>o.id),['a','c']);
 assert.deepEqual(searchOffers(offers,'存在しない',{}),[]);
 assert.deepEqual(searchOffers(offers,' ',{}),[]);
});
test('CV数降順、同数と未取得は候補順を維持し、元配列を変更しない',()=>{
 assert.deepEqual(searchOffers(offers,'カード',{a:2,b:10}).map(o=>o.id),['b','a']);
 assert.deepEqual(searchOffers(offers,'カード',{a:3,b:3}).map(o=>o.id),['a','b']);
 assert.deepEqual(searchOffers(offers,'カード',{a:NaN,b:-1}).map(o=>o.id),['a','b']);
 assert.deepEqual(offers.map(o=>o.id),['a','b','c']);
});
