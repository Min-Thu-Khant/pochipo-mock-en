import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,ensureChinchiro,setChinchiro,rollChinchiro,CHINCHIRO_ROLES,day,total,launchPopup,validateSlot} from '../model.js';
import {bannersAt} from '../carousel-model.js';

test('3つの役のサイコロ・結果・報酬が一致し、ウェイト0の役には当選しない',()=>{
 const random=Math.random;
 try {for(const value of [0,.01,.5,.999])for(const [id,unique] of [['miss',3],['hit',2],['big',1]]){
  Math.random=()=>value;const s=initialState();const table=s.chinchiro.normalTable.map(r=>({...r,weight:r.id===id?1:0}));
  setChinchiro(s,{normalTable:table,earlyTable:table});const before=total(s),result=rollChinchiro(s);
  assert.equal(result.prize.id,id);assert.equal(new Set(result.dice).size,unique);assert.ok(result.dice.every(n=>n>=1&&n<=6));
  assert.equal(result.amount,id==='miss'?0:id==='hit'?500:2000);assert.equal(total(s)-before,result.amount);assert.equal(day(s).chinchiro,1);
 }}finally{Math.random=random;}
});
test('旧小当たりのウェイトを当たりへ一度だけ統合し、ラベルとハズレ0ptを固定する',()=>{
 const s=initialState();s.chinchiro.normalTable=[{id:'miss',label:'旧外れ',weight:45,mult:10,pt:200},{id:'small',label:'小当たり',weight:35,mult:0,pt:100},{id:'hit',label:'旧当たり',weight:15,mult:7},{id:'big',label:'旧大当たり',weight:5,mult:20}];
 ensureChinchiro(s);ensureChinchiro(s);assert.deepEqual(s.chinchiro.normalTable.map(x=>x.weight),[45,50,5]);assert.deepEqual(s.chinchiro.normalTable.map(x=>x.label),CHINCHIRO_ROLES.map(x=>x.label));assert.equal(s.chinchiro.normalTable[0].pt,0);assert.equal(s.chinchiro.normalTable[1].mult,7);
});
test('不正な役・全ウェイト0を拒否し、保存済み設定を維持する',()=>{
 const s=initialState();ensureChinchiro(s);const before=JSON.stringify(s);
 for(const table of [[],s.chinchiro.normalTable.slice(0,2),s.chinchiro.normalTable.map(r=>({...r,weight:0})),s.chinchiro.normalTable.map(r=>({...r,id:'other'}))]){assert.throws(()=>setChinchiro(s,{normalTable:table}));assert.equal(JSON.stringify(s),before);}
 setChinchiro(s,{normalTable:s.chinchiro.normalTable.map(r=>({...r,label:'書き換え'}))});assert.deepEqual(s.chinchiro.normalTable.map(x=>x.label),CHINCHIRO_ROLES.map(x=>x.label));
});
test('日次上限・翌日リセット・固定ptを維持する',()=>{
 const s=initialState(),table=s.chinchiro.normalTable.map(r=>({...r,weight:r.id==='hit'?1:0,pt:r.id==='miss'?0:123}));setChinchiro(s,{dailyLimit:1,normalTable:table,earlyTable:table});assert.equal(rollChinchiro(s).amount,123);assert.throws(()=>rollChinchiro(s),/終了/);s.date='2026-09-16';assert.equal(rollChinchiro(s).amount,123);
});
test('ポップアップは旧複数画像も先頭だけ配信し、新規複数枚は保存不可',()=>{
 const s=initialState(),slot={...s.slots.find(x=>x.id==='autumn'),placements:['popup'],slides:[{name:'1',to:'offer/travel',bannerImage:''},{name:'2',to:'offer/shop',bannerImage:''}]};s.slots=[slot];
 assert.equal(bannersAt(s,'popup').length,1);assert.equal(launchPopup(s).to,'offer/travel');assert.match(validateSlot(slot),/1枚/);assert.equal(validateSlot({...slot,slides:slot.slides.slice(0,1)}),'');
});
