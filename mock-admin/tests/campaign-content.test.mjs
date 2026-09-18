import test from 'node:test';import assert from 'node:assert/strict';
import {initialState,saveFeature,homeTabsFor} from '../../mock-app/model.js';
import {validateBlocks,renderBlocks} from '../../mock-app/campaign-content.js';
test('記事は案件なしでも内容があれば保存できる',()=>{const s=initialState();const f={id:'article-test',title:'記事',kind:'article',offerIds:[],blocks:[{type:'text',text:'記事本文'}],displayLimit:20};saveFeature(s,f);assert.equal(s.features.find(x=>x.id===f.id).blocks[0].text,'記事本文');assert.throws(()=>saveFeature(s,{...f,blocks:[]}),/内容/);});
test('単一案件LPとCTAは対象案件を検証する',()=>{const s=initialState();assert.throws(()=>saveFeature(s,{id:'lp',title:'LP',kind:'single',offerIds:[],blocks:[]}),/案件/);assert.throws(()=>saveFeature(s,{id:'article',title:'記事',kind:'article',offerIds:[],blocks:[{type:'cta',offerId:'missing'}]}),/ボタン/);});
test('ブロックの危険なHTMLと画像をそのまま描画しない',()=>{assert.match(renderBlocks([{type:'text',text:'<script>alert(1)</script>'}]),/&lt;script&gt;/);assert.throws(()=>validateBlocks([{type:'image',image:'javascript:alert(1)'}]),/画像/);assert.equal(renderBlocks([{type:'cta',offerId:'missing'}],[]).includes('href'),false);});
test('TOPメニュー画像は表示用データに引き継がれる',()=>{const s=initialState();s.screens.home_tabs.settings[0].groups[0].iconImage='sample';assert.equal(homeTabsFor(s)[0].iconImage,'sample');});
