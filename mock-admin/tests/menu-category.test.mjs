import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,saveScreenSetting,homeTabsFor} from '../model.js';
import {menuCategoryOf,menuContentOptions,validateMenuGroups} from '../../mock-app/menu-model.js';
test('旧メニューを分類し、アフィリエイトと特集の選択肢を分離する',()=>{const s=initialState();assert.equal(menuCategoryOf({category:'game'}),'affiliate');assert.equal(menuCategoryOf({category:'daily'}),'daily');assert.deepEqual(Object.keys(menuContentOptions(s,'affiliate')),['game','shopping','credit']);assert.ok(menuContentOptions(s,'feature')['feature-autumn-trip']);});
test('カテゴリと内容の不一致・重複・存在しない特集を拒否する',()=>{const s=initialState();for(const groups of [[{menuCategory:'daily',category:'game'}],[{menuCategory:'feature',category:'feature-missing'}],[{category:'game'},{category:'game'}]])assert.throws(()=>validateMenuGroups(s,groups));});
test('保存した特集ページをホームタブとして取得でき、既存のタブを維持する',()=>{const s=initialState();const base=s.screens.home_tabs.settings[0];saveScreenSetting(s,'home_tabs',{...base,id:'menu-test',applyAt:s.date+'T00:00',groups:[...base.groups,{id:'special',name:'秋の特集',category:'feature-autumn-trip',menuCategory:'feature',icon:'plane',order:9,tags:true,unit:'jpy'}]});const tabs=homeTabsFor(s);assert.equal(tabs.length,8);assert.equal(tabs.at(-1).featureId,'autumn-trip');assert.equal(tabs.find(t=>t.key==='game').menuCategory,'affiliate');});
