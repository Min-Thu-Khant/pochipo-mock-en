import test from 'node:test';
import assert from 'node:assert/strict';
import {bannerPreviewTarget} from '../../mock-app/banner-preview-model.js';
import {bannerFrames,framePlacement,frameOf} from '../../mock-app/carousel-model.js';
import {slotBannerSize,sizeLabel} from '../../mock-app/banner-sizes.js';
import {readFileSync} from 'node:fs';

test('管理画面の画像18枠すべてが実際のモックへプレビューでき、配信キーを維持する',()=>{
 const expected={surveys:['survey:bottom'],receipt:['receipt:top'],home:['top','daily-middle','challenge:top','game:top','game:bottom','shopping:top','shopping:bottom','credit:top','credit:bottom','steps:top','steps:bottom'],offers:['offers:top','high:top','quick:top'],launch:['popup'],transition:['interstitial']};
 assert.deepEqual(Object.fromEntries(Object.entries(bannerFrames).map(([k,g])=>[k,Object.keys(g.positions)])),expected);
 const tabs=['daily','challenge','game','shopping','credit','steps'];
 let count=0;for(const [frame,g]of Object.entries(bannerFrames))for(const [position,label]of Object.entries(g.positions)){
  count++;const placement=framePlacement(frame,position);
  assert.deepEqual(frameOf(placement),[frame,position]);
  const preview=bannerPreviewTarget(placement.placements[0],placement.tab,placement.position,tabs);
  assert.ok(preview.route,`${frame}/${position}: ${preview.error}`);
  assert.doesNotMatch(label,/クレカ|ガポガポ|インステ|おすすめバナー/);
 }
 assert.equal(count+1,19); // テキスト広告1枠を含む。
});
test('追加対応した4枠とアンケート・歩くの説明がモックの表示位置に一致する',()=>{
 assert.equal(bannerPreviewTarget('category','receipt','top',[]).route,'home/receipt');
 assert.equal(bannerPreviewTarget('category','offers','top',[]).route,'offers');
 assert.equal(bannerPreviewTarget('category','steps','bottom',['steps']).route,'home/steps');
 assert.equal(bannerPreviewTarget('interstitial').route,'home');
 assert.match(bannerPreviewTarget('category','survey','bottom',[]).label,/上部/);
 assert.match(bannerPreviewTarget('category','steps','top',['steps']).description,/上に/);
 assert.equal(sizeLabel(slotBannerSize(framePlacement('home','steps:bottom'))),'300×300px');
 const app=readFileSync(new URL('../../mock-app/app.js',import.meta.url),'utf8');
 assert.ok(app.includes("else if(placement==='interstitial')showInterstitial(bannersAt(state,'interstitial')[0])"));
});
test('実際の配信先に対応する画面と説明を返す',()=>{assert.equal(bannerPreviewTarget('top','','',['daily']).route,'home/daily');assert.equal(bannerPreviewTarget('category','game','bottom',['game']).route,'home/game');assert.match(bannerPreviewTarget('category','game','bottom',['game']).description,/一覧の下/);assert.equal(bannerPreviewTarget('category','high','top',[]).route,'high');assert.equal(bannerPreviewTarget('popup').route,'home');});
test('未実装の配置・存在しないタブを表示できるように見せない',()=>{for(const p of ['carousel','feed','sub'])assert.match(bannerPreviewTarget(p).error,/表示されません/);assert.ok(bannerPreviewTarget('category','steps','bottom',[]).error);assert.ok(bannerPreviewTarget('category','game','top',[]).error);assert.ok(bannerPreviewTarget('top','','',[]).error);assert.ok(bannerPreviewTarget('category','daily','top',['daily']).error);});
