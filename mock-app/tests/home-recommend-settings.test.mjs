import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecommendSettings,recommendBundleOffers,validateHomeRecommendSettings} from '../home-recommend-settings.js';
test('ホームの入口はPontaを除いた5個で、保存済みの旧設定にも適用する',()=>{
 const defaults=homeRecommendSettings({});
 assert.deepEqual(defaults.pointLinks.map(x=>x.id),['mile','vpoint','rakuten','paypay','dpoint']);
 const legacy={...defaults,pointServices:[...defaults.pointServices,'ponta'],pointLinks:[...defaults.pointLinks,{id:'ponta',label:'Ponta',enabled:true}]};
 const current=homeRecommendSettings({homeRecommendation:legacy});
 assert.equal(current.pointLinks.length,5);
 assert.ok(!current.pointServices.includes('ponta'));
 assert.equal(legacy.pointLinks.length,6,'保存データ自体は書き換えない');
});
test('配信可能な案件の中から設定したバンドル属性に一致するものだけを表示する',()=>{const value=homeRecommendSettings({});value.sections.find(s=>s.key==='popular').bundleAttribute='人気';const saved=validateHomeRecommendSettings(value);assert.deepEqual(homeRecommendSettings({homeRecommendation:saved}),saved);const offers=[{id:'one',bundleTags:['人気']},{id:'two',bundleTags:['別']}];assert.deepEqual(recommendBundleOffers(offers,saved,'popular').map(o=>o.id),['one']);assert.deepEqual(recommendBundleOffers(offers.slice(1),saved,'popular'),[]);});
test('個別案件の旧設定は保存時に取り除き、バンドル属性を使用する',()=>{const value=homeRecommendSettings({});value.pointUpOfferIds=['old'];value.calloutOfferIds=['old'];const saved=validateHomeRecommendSettings(value);assert.equal('pointUpOfferIds' in saved,false);assert.equal('calloutOfferIds' in saved,false);assert.deepEqual(recommendBundleOffers([{id:'old'}],saved,'pointUp'),[]);});
test('不正なポイント入口と長すぎる交換案内を保存しない',()=>{const value=homeRecommendSettings({});assert.throws(()=>validateHomeRecommendSettings({...value,pointServices:['unknown']}));assert.throws(()=>validateHomeRecommendSettings({...value,campaignLine1:'あ'.repeat(13)}));});
