import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,tamerukoSectionOffers,tamerukoAllSectionOffers} from '../model.js';
import {highRewardTabOffers,highRewardMaxPoints,saveHighRewardManual,highRewardSettings} from '../high-reward-model.js';
import {highRewardEditor} from '../../mock-admin/high-reward-editor.js';
function fixture(){const s=initialState();s.date='2026-10-19';s.slots=[];s.nacs.offers=[{id:'low',name:'Low',base:999999},{id:'equal',name:'Equal',base:1000000},{id:'high',name:'High',base:1500000}].map(o=>({...o,category:'金融',active:true}));return s;}
const ids=s=>highRewardTabOffers(s).map(o=>o.id);
const row=(offerId,order=1)=>({offerId,order});
test('100万ptちょうどを含めて抽出。人気順は未設定のまま',()=>{
 const s=fixture();assert.deepEqual(ids(s),['equal','high']);
 assert.deepEqual(highRewardSettings(s).popularity,{windowDays:null,metric:null});
 s.nacs.clickDaily={'2026-10-19':{high:999}};
 assert.deepEqual(ids(s),['equal','high']); // 既存クリック集計を勝手に流用しない
});
test('手動は閾値未満も掲載し、指定順・自動との重複除外を適用',()=>{
 const s=fixture();saveHighRewardManual(s,[row('equal',2),row('low',1)]);
 assert.deepEqual(ids(s),['low','equal','high']);
 assert.deepEqual(ids(JSON.parse(JSON.stringify(s))),ids(s));
});
test('翌月を予約しても当月は変わらず、月初に切り替わる',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low')],'2026-10');
 saveHighRewardManual(s,[row('high')],'2026-11');
 s.date='2026-10-31';assert.deepEqual(ids(s),['low','equal','high']);
 s.date='2026-11-01';assert.deepEqual(ids(s),['high','equal']);
});
test('未設定月は直近の過去月を継続し、未来の予約は先取りしない',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low')],'2026-10');saveHighRewardManual(s,[row('high')],'2027-02');
 s.date='2026-12-01';assert.deepEqual(ids(s),['low','equal','high']);assert.equal(highRewardSettings(s).sourceMonth,'2026-10');assert.equal(highRewardSettings(s).inherited,true);
 s.date='2027-01-01';assert.deepEqual(ids(s),['low','equal','high']);
 s.date='2026-09-30';assert.deepEqual(ids(s),['equal','high']);
});
test('明示的に0件保存した月は自動のみとなり、その設定も継続する',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low')],'2026-10');saveHighRewardManual(s,[],'2026-11');
 s.date='2026-11-01';assert.deepEqual(ids(s),['equal','high']);assert.equal(highRewardSettings(s).configured,true);
 s.date='2026-12-01';assert.deepEqual(ids(s),['equal','high']);assert.equal(highRewardSettings(s).sourceMonth,'2026-11');
});
test('公開停止・対象OS外・公開期間外は手動掲載でも除外',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low'),row('equal',2),row('high',3)]);
 s.nacs.offers[0].active=false;s.nacs.offers[1].platforms=['android'];s.nacs.offers[2].end='2026-10-18';
 assert.deepEqual(ids(s),[]);
});
test('段階報酬は全段階合計、条件別は最大値、率のみは自動判定しない',()=>{
 const s=fixture(),o=s.nacs.offers[0];
 o.sur=[{reward:600000},{reward:400000}];assert.equal(highRewardMaxPoints(s,o),1000000);assert.ok(ids(s).includes('low'));
 delete o.sur;o.maxRewardPoints=1200000;assert.equal(highRewardMaxPoints(s,o),1200000);
 o.rate=5;delete o.maxRewardPoints;assert.equal(highRewardMaxPoints(s,o),null);assert.ok(!ids(s).includes('low'));
 o.maxRewardPoints=1000000;assert.ok(ids(s).includes('low'));
});
test('期間限定の付与ポイント変更を閾値判定に反映',()=>{
 const s=fixture(),o=s.nacs.offers[0];
 s.slots=[{id:'boost',destination:'low',kind:'campaign',enabled:true,start:s.date,end:s.date,segment:'all',priority:1,rewardMode:'multiplier',reward:2}];
 assert.equal(highRewardMaxPoints(s,o),1999998);assert.ok(ids(s).includes('low'));
 s.slots[0].rewardMode='flat';s.slots[0].reward=500000;assert.ok(!ids(s).includes('low'));
});
test('入力エラーで保存済み設定を壊さない',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low')]);const before=structuredClone(s.highRewardTab);
 for(const rows of [[row('missing')],[row('low'),row('low',2)],[row('low'),row('high')],[row('low',0)],[row('low',21)],[row('low',1.5)]]){
  assert.throws(()=>saveHighRewardManual(s,rows));assert.deepEqual(s.highRewardTab,before);
 }
 for(const month of ['2026-13','2026-00','2026-1','',null]){assert.throws(()=>saveHighRewardManual(s,[],month));assert.deepEqual(s.highRewardTab,before);}
});
test('おすすめのセクション・もっと見るとは独立',()=>{
 const s=fixture(),before=tamerukoSectionOffers(s,'high-reward').map(o=>o.id),more=tamerukoAllSectionOffers(s,'high-reward').map(o=>o.id);
 saveHighRewardManual(s,[row('low')]);
 assert.deepEqual(tamerukoSectionOffers(s,'high-reward').map(o=>o.id),before);
 assert.deepEqual(tamerukoAllSectionOffers(s,'high-reward').map(o=>o.id),more);
 s.tametokuSections={sections:{'high-reward':{offerIds:[]}}};assert.deepEqual(ids(s),['low','equal','high']);
});
test('100件制限より先に手動を優先・重複除外',()=>{
 const s=fixture();s.nacs.offers.push(...Array.from({length:105},(_,i)=>({id:'extra-'+i,name:'Extra',base:1000000})));
 saveHighRewardManual(s,[row('extra-104'),row('low',2)]);assert.equal(ids(s).length,100);assert.deepEqual(ids(s).slice(0,2),['extra-104','low']);assert.equal(new Set(ids(s)).size,100);
});
test('上位20件を手動設定でき、21件目は拒否。欠員は自動補充する',()=>{
 const s=fixture();s.nacs.offers.push(...Array.from({length:30},(_,i)=>({id:'extra-'+i,name:'Extra',base:1000000})));
 const manual=Array.from({length:20},(_,i)=>row('extra-'+(29-i),i+1));saveHighRewardManual(s,manual);
 assert.deepEqual(ids(s).slice(0,20),manual.map(r=>r.offerId));assert.equal(ids(s)[20],'equal');
 assert.throws(()=>saveHighRewardManual(s,[...manual,row('low',21)]));
 s.nacs.offers.find(o=>o.id==='extra-29').active=false;
 assert.equal(ids(s)[19],'equal');assert.equal(new Set(ids(s)).size,ids(s).length);
 saveHighRewardManual(s,[row('low')]);assert.equal(ids(s)[1],'equal');assert.equal(ids(s).length,32);
});
test('旧期間指定を当月の月別設定に引き継いで翌月を予約できる',()=>{
 const s=fixture();s.highRewardTab={manual:[{...row('low'),start:'2026-10-01',end:'2026-10-31'}]};
 saveHighRewardManual(s,[row('high')],'2026-11');assert.deepEqual(ids(s),['low','equal','high']);
 assert.deepEqual(s.highRewardTab.months['2026-10'],[row('low')]);
});
test('管理画面は人気順未定・対象月・前月継続を表示',()=>{
 const s=fixture();saveHighRewardManual(s,[row('low')],'2026-10');const html=highRewardEditor(s,'2026-11');
 for(const text of ['人気順：未定','人気順ではありません','high-reward-form','type="month"','name="order"','最大20件','2026-10の手動設定を継続'])assert.ok(html.includes(text));
 assert.ok(!html.includes('name="start"'));assert.ok(!html.includes('name="end"'));
});
