import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,pillSlots,publishSlot} from '../model.js';
import {frameOf,reorderBannerRecords,normalizeBannerRecords} from '../../mock-app/carousel-model.js';
import {isTextAd,compareTextAds,normalizeTextAdOrder} from '../../mock-app/text-ad-order.js';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function setup(){const state=initialState();state.persona='regular';for(const slot of state.slots.filter(isTextAd)){slot.enabled=true;slot.segment='all';slot.start=state.date;slot.end=state.date;delete slot.displayOrder;}return state;}
test('既存テキスト広告の表示順を維持して移行し、二回目以降も順番を保つ',()=>{
 const s=setup(),before=pillSlots(s).map(x=>x.id);normalizeTextAdOrder(s);
 assert.deepEqual(s.slots.filter(isTextAd).sort(compareTextAds).map(x=>x.id),before);
 const saved=JSON.stringify(s);normalizeTextAdOrder(s);assert.equal(JSON.stringify(s),saved);
});
test('並び替えをアプリにも反映し、再読み込み・編集でも順番と配信条件を保持する',()=>{
 const s=setup();normalizeBannerRecords(s);const records=s.slots.filter(isTextAd).sort(compareTextAds),ids=records.map(x=>x.id).reverse();
 const fields=records.map(({displayOrder,...rest})=>structuredClone(rest));reorderBannerRecords(s,ids);
 assert.deepEqual(pillSlots(s).map(x=>x.id),ids);
 assert.deepEqual(records.map(({displayOrder,...rest})=>rest),fields);
 const restored=JSON.parse(JSON.stringify(s));normalizeBannerRecords(restored);assert.deepEqual(pillSlots(restored).map(x=>x.id),ids);
 const edited=restored.slots.find(x=>x.id===ids[1]);publishSlot(restored,{...edited,title:'編集後の広告文'});
 assert.deepEqual(pillSlots(restored).map(x=>x.id),ids);
 const stopped=restored.slots.find(x=>x.id===ids[0]);stopped.enabled=false;
 assert.deepEqual(pillSlots(restored).map(x=>x.id),ids.slice(1));stopped.enabled=true;
 assert.deepEqual(pillSlots(restored).map(x=>x.id),ids);
 stopped.end='2000-01-01';assert.deepEqual(pillSlots(restored).map(x=>x.id),ids.slice(1));
});
test('新規・複製は末尾へ追加し、画像バナーとの混在した並び替えは拒否する',()=>{
 const s=setup();normalizeTextAdOrder(s);const ids=pillSlots(s).map(x=>x.id),base=s.slots.find(isTextAd);
 for(const id of ['new-text','copy-text']){publishSlot(s,{...base,id,name:id,displayOrder:undefined,priority:100});ids.push(id);assert.deepEqual(pillSlots(s).map(x=>x.id),ids);}
 const before=JSON.stringify(s);const banner=s.slots.find(x=>x.placements.includes('top'));
 assert.throws(()=>reorderBannerRecords(s,[base.id,banner.id]),/同じ配信枠/);assert.equal(JSON.stringify(s),before);
});
test('テキスト広告一覧にバナーと共通の並び替えハンドルと順番を表示する',()=>{
 const source=readFileSync(new URL('../admin.js',import.meta.url),'utf8');
 const start=source.indexOf('function bannerFramePage('),end=source.indexOf('\n',start);
 const s=setup();normalizeTextAdOrder(s);
 const context=vm.createContext({state:s,bannerFrames:{offers:{label:'お得枠'}},belongsToSection:isTextAd,editingSlot:null,esc:String,adDeliveryForm:()=>'',slotStatus:()=>['on','配信中'],badge:()=>'',frameOf});
 vm.runInContext(source.slice(start,end),context);const html=vm.runInContext("bannerFramePage('offers','text')",context);
 assert.equal((html.match(/data-drag-banner=/g)||[]).length,s.slots.filter(isTextAd).length);
 assert.match(html,/上下矢印キーでも操作できます/);assert.match(html,/ドラッグして表示順/);
});
