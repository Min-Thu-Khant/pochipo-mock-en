import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecommendSettings,recommendOffers,validateHomeRecommendSettings} from '../home-recommend-settings.js';
const offers=Array.from({length:12},(_,i)=>({id:'o'+i}));
const input=()=>({...homeRecommendSettings({}),pointUpOfferIds:['o0'],popularOfferIds:['o1'],recommendedOfferIds:['o2'],calloutOfferIds:['o0']});
test('保存設定を再取得し掲載対象を配信可能な案件に絞る',()=>{const value=validateHomeRecommendSettings(input(),offers);assert.deepEqual(homeRecommendSettings({homeRecommendation:value}),value);assert.deepEqual(recommendOffers(offers.slice(1),value.pointUpOfferIds,offers),[]);assert.deepEqual(recommendOffers(offers,[],offers),[]);});
test('掲載上限と対象外の最高還元を保存しない',()=>{assert.throws(()=>validateHomeRecommendSettings({...input(),popularOfferIds:offers.slice(0,7).map(o=>o.id)},offers));assert.throws(()=>validateHomeRecommendSettings({...input(),calloutOfferIds:['o2']},offers));assert.throws(()=>validateHomeRecommendSettings({...input(),pointUpOfferIds:['missing']},offers));});
test('不正なポイント入口と長すぎる交換案内を保存しない',()=>{assert.throws(()=>validateHomeRecommendSettings({...input(),pointServices:['unknown']},offers));assert.throws(()=>validateHomeRecommendSettings({...input(),campaignLine1:'あ'.repeat(13)},offers));});
