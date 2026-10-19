import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryQuickLinks,initialState} from '../model.js';

test('お得タブの企業リンクは3タブとも5枠の初期値を持つ',()=>{
 const state=initialState();
 for(const key of ['offers','high','quick']){
  const links=categoryQuickLinks(state,key);
  assert.equal(links.length,5);
  assert.deepEqual(links.map(x=>x.label),['楽天','PayPay','Vポイント','dポイント','Ponta']);
  assert.deepEqual(links.map(x=>x.image),['assets/quick-links/rakuten.png','assets/quick-links/paypay.png','assets/quick-links/vpoint.png','assets/quick-links/dpoint.png','assets/quick-links/ponta.png']);
 }
});

test('お得タブの企業リンクは保存済み設定を枠ごとに上書きする',()=>{
 const state=initialState();
 state.categoryQuickLinks={quick:[{label:'別リンク',destinationType:'offer-detail',destination:'travel',image:'data:image/png;base64,mock'}]};
 const links=categoryQuickLinks(state,'quick');
 assert.equal(links[0].label,'別リンク');
 assert.equal(links[0].destinationType,'offer-detail');
 assert.equal(links[0].destination,'travel');
 assert.equal(links[0].image,'data:image/png;base64,mock');
 assert.equal(links[1].label,'PayPay');
});
