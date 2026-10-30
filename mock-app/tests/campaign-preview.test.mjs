import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,featureById,featureOffers,featureIsPublished,setFeatureStopped,saveFeature} from '../model.js';
import {campaignPreviewState} from '../campaign-preview.js';

test('特集の保存・停止・再公開で他機能の設定を変更しない',()=>{
 const s=initialState(),f=s.features[0];
 const unrelated=state=>{const copy=structuredClone(state);delete copy.features;delete copy.logs;return copy;};
 const before=unrelated(s);
 saveFeature(s,{...f,headline:'見出しのみ更新'});
 setFeatureStopped(s,f.id,true);setFeatureStopped(s,f.id,false);
 assert.deepEqual(unrelated(s),before);
});

test('開始日・終了日を含み、停止解除でも期間外は非公開になる',()=>{
 const s=initialState(),f={...s.features[0],start:s.date,end:s.date};
 assert.equal(featureIsPublished(s,f),true);
 assert.equal(featureIsPublished(s,{...f,start:'2099-01-01',end:'2099-12-31'}),false);
 assert.equal(featureIsPublished(s,{...f,start:'2000-01-01',end:'2000-12-31'}),false);
 assert.equal(featureIsPublished(s,{...f,stopped:true}),false);
});

test('管理画面の未初期化データから保存前のLPを描画する状態を作れる',()=>{
 const source=initialState();delete source.accountAuth;
 const before=JSON.stringify(source),old=source.features.find(f=>f.kind==='single');
 const feature={...old,title:'保存前のLP',lead:'保存前の紹介文',start:'',end:''};
 const preview=campaignPreviewState(source,feature);
 assert.equal(preview.accountAuth.version,1);
 assert.equal(featureById(preview,old.id).title,'保存前のLP');
 assert.equal(featureById(preview,old.id).lead,'保存前の紹介文');
 assert.equal(featureById(preview,old.id).kind,'single');
 assert.equal(JSON.stringify(source),before);
});
test('全入口で共有するページを停止し、内容保存では再公開せず、再公開は期間に従う',()=>{
 const s=initialState(),f=s.features[0];f.start='';f.end='';
 setFeatureStopped(s,f.id,true);
 assert.equal(featureIsPublished(s,f),false);
 assert.deepEqual(featureOffers(s,f),[]);
 const saved=saveFeature(s,{...f,headline:'新しい見出し',lead:'新しい紹介文'});
 assert.equal(featureIsPublished(s,saved),false);
 assert.deepEqual(saved.offerIds,f.offerIds);
 setFeatureStopped(s,f.id,false);
 assert.equal(featureIsPublished(s,saved),true);
 saved.end='2000-01-01';setFeatureStopped(s,f.id,true);setFeatureStopped(s,f.id,false);
 assert.equal(featureIsPublished(s,saved),false);
});
test('停止中・期間外でも管理プレビューは表示でき、元の公開状態を変更しない',()=>{
 const s=initialState(),f=s.features[0];f.stopped=true;f.start='2099-01-01';f.end='2099-12-31';f.headline='運営向け確認';
 const before=JSON.stringify(s),preview=campaignPreviewState(s,f),shown=featureById(preview,f.id);
 assert.equal(featureIsPublished(preview,shown),true);
 assert.equal(shown.headline,'運営向け確認');
 assert.equal(JSON.stringify(s),before);
});
test('選択・除外・並び順をプレビューへ反映し、編集データを共有しない',()=>{
 const source=initialState(),base=source.features[0];
 const feature={...base,selectionMode:'selected',manualOfferIds:['travel','shop','interior'],excludedOfferIds:['travel'],offerOrder:['interior','shop'],offerIds:['interior','shop'],start:'',end:''};
 const preview=campaignPreviewState(source,feature);
 assert.deepEqual(featureOffers(preview,featureById(preview,feature.id)).map(o=>o.id),['interior','shop']);
 feature.manualOfferIds.push('pay');
 assert.equal(featureById(preview,feature.id).manualOfferIds.includes('pay'),false);
});
