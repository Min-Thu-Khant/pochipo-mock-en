import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryQuickLinks,initialState} from '../model.js';
import {homeRecommendSettings} from '../home-recommend-settings.js';
import {categoryQuickLinksMarkup} from '../category-quick-links.js';
import {companyIconVisual} from '../company-icon.js';

test('お得のおすすめはホームと企業アイコンの共通設定を使う',()=>{
 const state=initialState();
 assert.deepEqual(categoryQuickLinks(state,'offers'),homeRecommendSettings(state).pointLinks);
 assert.deepEqual(categoryQuickLinks(state,'offers').map(x=>x.label),['マイル','Vポイント','楽天','PayPay','dポイント']);
});
test('未使用の旧タブ設定は変更しない',()=>{
 const state=initialState();
 for(const key of ['high','quick']){
  const links=categoryQuickLinks(state,key);
  assert.equal(links.length,5);
  assert.deepEqual(links.map(x=>x.label),['楽天','PayPay','Vポイント','dポイント','Ponta']);
  assert.deepEqual(links.map(x=>x.image),['assets/quick-links/rakuten.png','assets/quick-links/paypay.png','assets/quick-links/vpoint.png','assets/quick-links/dpoint.png','assets/quick-links/ponta.png']);
 }
});

test('SALE・順序・画像・リンク先は共通設定の変更を両画面が参照する',()=>{
 const state=initialState(),c=homeRecommendSettings(state);
 c.pointLinks.reverse();
 for(const item of c.pointLinks)item.sale=item.id==='rakuten';
 c.pointLinks.find(x=>x.id==='rakuten').destination='共通テスト';
 state.homeRecommendation=c;
 const items=categoryQuickLinks(state,'offers');
 assert.deepEqual(items,c.pointLinks);
 const html=categoryQuickLinksMarkup(state,'offers');
 assert.match(html,/楽天・SALE/);assert.doesNotMatch(html,/Vポイント・SALE/);
 assert.ok(html.includes(encodeURIComponent('bundle:共通テスト')));
 assert.equal((html.match(/market-point-callout/g)||[]).length,1);
 assert.match(companyIconVisual(c.pointLinks.find(x=>x.id==='rakuten'),String),/>SALE</);
 c.pointLinks.find(x=>x.id==='rakuten').sale=false;
 assert.doesNotMatch(categoryQuickLinksMarkup(state,'offers'),/market-point-callout/);
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
