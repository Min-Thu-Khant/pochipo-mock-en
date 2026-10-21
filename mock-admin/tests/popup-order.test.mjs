import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {initialState,launchPopup,publishSlot} from '../model.js';
import {bannerFrames,frameOf,framePlacement,normalizeBannerRecords,reorderBannerRecords,bannersAt,equalBannerSelection} from '../../mock-app/carousel-model.js';
import {slotBannerSize,sizeLabel} from '../../mock-app/banner-sizes.js';
import {adDeliveryForm} from '../overlay-settings.js';
function setup(){const s=initialState();s.slots=['a','b','c'].map(id=>({id,name:id,title:id,kind:'banner',placements:['popup'],enabled:true,start:s.date,end:'2099-12-31',to:'https://example.com/'+id,priority:0,reward:0,rewardMode:'flat'}));return s;}
test('未設定ではランダム候補のまま。並び替え後は配信可能な先頭1件を選ぶ',()=>{
 const s=setup();normalizeBannerRecords(s);assert.ok(s.slots.every(x=>x.displayOrder===undefined));
 assert.notEqual(equalBannerSelection(bannersAt(s,'popup'),()=>0)[0].id,equalBannerSelection(bannersAt(s,'popup'),()=>0.999)[0].id);
 const before=s.slots.map(x=>({...x}));reorderBannerRecords(s,['c','a','b']);assert.equal(launchPopup(s).id,'c');
 assert.deepEqual(s.slots.map(({displayOrder,...rest})=>rest),before);
 s.slots[2].enabled=false;assert.equal(launchPopup(s).id,'a');s.slots[0].end='2000-01-01';assert.equal(launchPopup(s).id,'b');
 s.slots[2].enabled=true;assert.equal(launchPopup(s).id,'c');
});
test('再読み込み・編集で順番を保持し、新規は末尾に追加する',()=>{
 let s=setup();reorderBannerRecords(s,['c','a','b']);s=JSON.parse(JSON.stringify(s));normalizeBannerRecords(s);assert.equal(launchPopup(s).id,'c');
 publishSlot(s,{...s.slots[2],title:'編集済み'});assert.equal(launchPopup(s).id,'c');
 publishSlot(s,{...s.slots[0],id:'new',displayOrder:undefined});normalizeBannerRecords(s);
 assert.deepEqual(s.slots.slice().sort((a,b)=>a.displayOrder-b.displayOrder).map(x=>x.id),['c','a','b','new']);
 const saved=JSON.stringify(s);normalizeBannerRecords(s);assert.equal(JSON.stringify(s),saved);
});
test('起動時POPUPだけ並び替えハンドルを追加し、ランダム固定の説明を削除する',()=>{
 const source=readFileSync(new URL('../admin.js',import.meta.url),'utf8');const start=source.indexOf('function bannerFramePage('),end=source.indexOf('\n',start);
 const context=vm.createContext({state:setup(),bannerFrames,belongsToSection:()=>true,editingSlot:null,esc:String,adDeliveryForm,slotStatus:()=>['on','配信中'],badge:()=>'',frameOf,framePlacement,frameTitle:()=> '起動時POPUP',slotBannerSize,sizeLabel});
 vm.runInContext(source.slice(start,end),context);const html=vm.runInContext("bannerFramePage('launch','popup')",context);
 assert.equal((html.match(/data-drag-banner=/g)||[]).length,3);assert.match(html,/上下矢印キー/);assert.doesNotMatch(html,/均等に1枚|1枚を均等/);
});
