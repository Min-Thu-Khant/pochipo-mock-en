import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialState,featureOffers,saveFeature} from '../../mock-app/model.js';
import {featureSelectedIds} from '../../mock-app/feature-selection.js';
import {featureOfferEditor,readFeatureSelection} from '../feature-offer-editor.js';
function fixture(){const state=initialState();state.nacs.intake??={};state.nacs.intake.bundles=[{id:'travel',tags:['特集']},{id:'shop',tags:['特集']}];return state;}
test('編集画面で保存する順序には選択案件だけを含め、後のグループ追加は末尾になる',()=>{
 const s=fixture();
 const inputs=['pay','shop','travel'].map(value=>({value,dataset:{manual:'false'}}));
 const root={dataset:{excluded:'[]'},querySelectorAll:()=>inputs};
 const form={querySelector:()=>root,querySelectorAll:()=>[{value:'特集'}]};
 const selection=readFeatureSelection(form,s);
 assert.deepEqual(selection.offerOrder,['shop','travel']);
 s.nacs.intake.bundles.push({id:'pay',tags:['特集']});
 assert.deepEqual(featureSelectedIds(s,selection),['shop','travel','pay']);
});
test('掲載する案件を選択し、グループ内でも非掲載にできる',()=>{
 const s=fixture(),f={selectionMode:'selected',bundleTags:['特集'],manualOfferIds:['interior'],excludedOfferIds:['travel'],offerOrder:['interior','shop']};
 assert.deepEqual(featureSelectedIds(s,f),['interior','shop']);
 const saved=saveFeature(s,{...s.features[0],...f,start:'',end:'',offerIds:featureSelectedIds(s,f),displayLimit:1});
 assert.deepEqual(featureOffers(s,saved).map(o=>o.id),['interior','shop']);
 const restored=JSON.parse(JSON.stringify(s));assert.deepEqual(featureOffers(restored,restored.features[0]).map(o=>o.id),['interior','shop']);
});
test('グループの追加・削除は再保存なしで反映し、配置順と個別選択を保つ',()=>{
 const s=fixture(),f={selectionMode:'selected',bundleTags:['特集'],manualOfferIds:['interior'],excludedOfferIds:[],offerOrder:['shop','travel','interior']};
 s.nacs.intake.bundles.push({id:'pay',tags:['特集']});assert.deepEqual(featureSelectedIds(s,f),['shop','travel','interior','pay']);
 s.nacs.intake.bundles=s.nacs.intake.bundles.filter(b=>b.id!=='travel');assert.deepEqual(featureSelectedIds(s,f),['shop','interior','pay']);
 f.excludedOfferIds=['pay'];assert.deepEqual(featureSelectedIds(s,f),['shop','interior']);
});
test('編集UIは案件の掲載チェックと並び替えを持ち、件数入力欄は持たない',()=>{
 const s=fixture(),html=featureOfferEditor(s,{offerIds:['travel'],bundleTags:[]},[{id:'travel',name:'旅行 <案件>'}]);
 assert.match(html,/name="offerIds"/);assert.match(html,/data-feature-move="up"/);assert.match(html,/旅行 &lt;案件&gt;/);assert.doesNotMatch(html,/name="displayLimit"/);
 const admin=readFileSync(new URL('../admin.js',import.meta.url),'utf8');assert.match(admin,/readFeatureSelection\(form,state\)/);assert.match(admin,/readFeatureSelection\(f,state\)/);assert.doesNotMatch(admin,/最大 \$\{featurePublication\(f\).displayLimit\}/);
});
