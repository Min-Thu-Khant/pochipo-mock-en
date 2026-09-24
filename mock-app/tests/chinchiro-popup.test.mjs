import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,ensureChinchiro,setChinchiro,rollChinchiro,CHINCHIRO_ROLES,drawChinchiro,claimChinchiro,prizeAmount,day,total,launchPopup,validateSlot} from '../model.js';
import {bannersAt} from '../carousel-model.js';

test('各役の出目と報酬、ウェイト0除外、動画前の未付与',()=>{for(const role of CHINCHIRO_ROLES){const s=initialState();ensureChinchiro(s);const table=s.chinchiro.normalTable.map(x=>({...x,weight:x.id===role.id?1:0}));setChinchiro(s,{normalTable:table,earlyTable:table});const before=total(s),r=drawChinchiro(s,true);assert.equal(r.prize.id,role.id);assert(r.dice.every(n=>n>=1&&n<=6));if(role.id==='pin')assert.deepEqual(r.dice,[1,1,1]);if(role.id==='triple')assert.equal(new Set(r.dice).size,1);if(role.id==='shigoro')assert.deepEqual(r.dice,[4,5,6]);if(role.id==='hifumi')assert.deepEqual(r.dice,[1,2,3]);if(role.id.startsWith('eye'))assert.equal(r.dice.filter(x=>x===Number(role.id.slice(3))).length,1);assert.equal(total(s),before);assert.equal(r.amount,prizeAmount(s,role));if(r.amount){const restored=JSON.parse(JSON.stringify(s));assert(claimChinchiro(restored,r.id));assert(!claimChinchiro(restored,r.id));assert.equal(total(restored),before+r.amount);}else assert.equal(s.user.chinchiroUnclaimed,null);}});
test('旧3役を新役へ一度だけ移行、負け役は0pt',()=>{const s=initialState();ensureChinchiro(s);const first=JSON.stringify(s.chinchiro);ensureChinchiro(s);assert.equal(JSON.stringify(s.chinchiro),first);assert.deepEqual(s.chinchiro.normalTable.map(x=>x.id),CHINCHIRO_ROLES.map(x=>x.id));for(const id of ['none','spill','hifumi'])assert.equal(s.chinchiro.normalTable.find(x=>x.id===id).pt,0);});
test('不正な役・全ウェイト0を拒否し、保存済み設定を維持する',()=>{
 const s=initialState();ensureChinchiro(s);const before=JSON.stringify(s);
 for(const table of [[],s.chinchiro.normalTable.slice(0,2),s.chinchiro.normalTable.map(r=>({...r,weight:0})),s.chinchiro.normalTable.map(r=>({...r,id:'other'}))]){assert.throws(()=>setChinchiro(s,{normalTable:table}));assert.equal(JSON.stringify(s),before);}
 setChinchiro(s,{normalTable:s.chinchiro.normalTable.map(r=>({...r,label:'書き換え'}))});assert.deepEqual(s.chinchiro.normalTable.map(x=>x.label),CHINCHIRO_ROLES.map(x=>x.label));
});
test('3回上限・翌日リセット・固定額切替・再挑戦で未受取を置換',()=>{const s=initialState();ensureChinchiro(s);const table=s.chinchiro.normalTable.map(r=>({...r,weight:r.id==='pin'?1:0,pt:123}));setChinchiro(s,{normalTable:table,earlyTable:table});const a=drawChinchiro(s),b=drawChinchiro(s);assert.equal(a.amount,123);assert(!claimChinchiro(s,a.id));assert.equal(s.user.chinchiroUnclaimed.id,b.id);drawChinchiro(s);assert.throws(()=>drawChinchiro(s),/終了/);s.date='2026-09-16';assert.equal(drawChinchiro(s).amount,123);delete s.chinchiro.normalTable[0].pt;assert.equal(prizeAmount(s,s.chinchiro.normalTable[0]),500);});
test('ポップアップは旧複数画像も先頭だけ配信し、新規複数枚は保存不可',()=>{
 const s=initialState(),slot={...s.slots.find(x=>x.id==='autumn'),placements:['popup'],slides:[{name:'1',to:'offer/travel',bannerImage:''},{name:'2',to:'offer/shop',bannerImage:''}]};s.slots=[slot];
 assert.equal(bannersAt(s,'popup').length,1);assert.equal(launchPopup(s).to,'offer/travel');assert.match(validateSlot(slot),/1枚/);assert.equal(validateSlot({...slot,slides:slot.slides.slice(0,1)}),'');
});
