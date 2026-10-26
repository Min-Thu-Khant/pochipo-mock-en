import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {initialState,publishSlot} from '../../mock-admin/model.js';
import {bannersAt,normalizeBannerRecords} from '../carousel-model.js';
import {bannerPreviewTarget} from '../banner-preview-model.js';
import {pngImage} from '../../mock-admin/tests/image-fixture.mjs';

test('廃止した320×50枠は保存済みデータを消さず、入稿・配信・プレビューを止める',()=>{
 const state=initialState();
 const legacy={...state.slots[0],id:'legacy-strip',placements:['daily-middle'],enabled:true,start:'2020-01-01',end:'2099-12-31',slides:undefined,bannerImage:pngImage(320,50)};
 state.slots=[legacy];
 normalizeBannerRecords(state);
 assert.deepEqual(state.slots,[legacy]);
 assert.deepEqual(bannersAt(state,'daily-middle'),[]);
 assert.throws(()=>publishSlot(state,legacy),/廃止/);
 assert.match(bannerPreviewTarget('daily-middle','','top',['daily']).error,/廃止/);
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 assert.ok(!app.includes("bannerCarousel(bannersAt(state,'daily-middle')"));
});

test('将来用のレシート枠はモックで配信・プレビューできる',()=>{
 const state=initialState();
 state.slots=[{...state.slots[0],id:'future-receipt',placements:['category'],tab:'receipt',position:'top',enabled:true,start:'2020-01-01',end:'2099-12-31',slides:undefined,to:'https://example.com/receipt',bannerImage:pngImage(320,100)}];
 assert.equal(bannersAt(state,'category','receipt','top').length,1);
 assert.equal(bannerPreviewTarget('category','receipt','top',[]).route,'home/receipt');
});

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const offerList=source.split('\n').find(line=>line.startsWith('function offerList(){'));
for(const [query,items] of [['',[{}]],['カード',[{}]],['該当なし',[]]]){
 test(`検索窓の直下にテキスト広告を表示する：${query||'検索前'}`,()=>{
  const blank=()=>'';
  const context={state:initialState(),search:query,category:'すべて',route:()=>['offers'],screenGroups:()=>[],allCategoryOffers:()=>items,visibleOffers:()=>items,searchOffers:()=>items,searchCvCounts:()=>({}),applyPins:(_,list)=>list,epcOffers:(_,list)=>list,header:blank,guideButton:blank,offerNav:blank,campaignBanner:blank,categoryQuickLinksMarkup:blank,icon:blank,button:blank,nav:blank,esc:x=>x,pillTicker:()=>'<aside>テキスト広告</aside>',tamerukoSections:()=>'<section>一覧</section>',categoryOfferCard:()=>'<article>案件</article>',empty:()=>'<section>0件</section>'};
  const html=vm.runInNewContext(offerList+';offerList()',context);
  assert.match(html,/<\/form><aside>テキスト広告<\/aside>/);
  assert.equal(html.split('<aside>テキスト広告</aside>').length-1,1);
  if(!items.length)assert.match(html,/<section>0件<\/section>/);
 });
}
