import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,homeTabsFor} from '../model.js';

test('ホームのカードタブは初期設定・保存済み旧名称ともカードと表示する',()=>{
 const state=initialState();
 assert.equal(homeTabsFor(state).find(t=>t.key==='credit').label,'カード');
 for(const setting of state.screens.home_tabs.settings){
  for(const group of setting.groups){
   if(group.category==='credit')group.name='クレカ';
  }
 }
 const card=homeTabsFor(state).find(t=>t.key==='credit');
 assert.equal(card.label,'カード');
 assert.equal(card.key,'credit');
 assert.equal(card.icon,'wallet');
});
