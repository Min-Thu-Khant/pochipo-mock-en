import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,saveFeature,featureById,featurePublication,featureIsPublished,featureOffers,recordClick,collectionOffers,setListPinned} from '../../mock-app/model.js';

test('旧特集の期間と件数を維持し、開始日・終了日を含めて掲載する',()=>{
 const s=initialState(),f=s.features[0];
 assert.deepEqual(featurePublication(f),{start:'2026-09-01',end:'2026-09-30',displayLimit:3});
 for(const [date,expected] of [['2026-08-31',false],['2026-09-01',true],['2026-09-30',true],['2026-10-01',false]]){s.date=date;assert.equal(featureIsPublished(s,f),expected);if(!expected)assert.deepEqual(featureOffers(s,f),[]);}
 const saved=saveFeature(s,{...f,title:'新しい特集',lead:'紹介文\n2行目',start:'',end:'',displayLimit:1});
 assert.equal(featureIsPublished(s,saved),true);assert.equal(featureById(s,f.id).lead,'紹介文\n2行目');
});
test('掲載可能な案件に絞ってから上限を適用し、候補不足・空にも対応する',()=>{
 const s=initialState(),f={...s.features[0],offerIds:['travel','shop','interior'],displayLimit:1};
 s.nacs.offers.find(o=>o.id==='travel').active=false;
 assert.deepEqual(featureOffers(s,f).map(o=>o.id),['shop']);
 f.displayLimit=20;assert.deepEqual(featureOffers(s,f).map(o=>o.id),['shop','interior']);
 s.nacs.offers.find(o=>o.id==='shop').platforms=['android'];
 s.nacs.offers.find(o=>o.id==='interior').end='2026-09-01';assert.deepEqual(featureOffers(s,f),[]);
});
test('期間・件数・案件の不正な入力は保存前に拒否する',()=>{
 const s=initialState(),f=s.features[0],before=JSON.stringify(s);
 for(const patch of [{start:'2026-09-31'},{start:'2026-10-01',end:'2026-09-30'},{displayLimit:0},{displayLimit:1.5},{displayLimit:NaN},{offerIds:[]},{offerIds:['missing']}]){
  assert.throws(()=>saveFeature(s,{...f,...patch}));assert.equal(JSON.stringify(s),before);
 }
});
test('ガポガポ・すぐできるも対象案件のクリック順とピン留めを反映する',()=>{
 const s=initialState();for(let i=0;i<3;i++)recordClick(s,'interior');recordClick(s,'pay');
 assert.equal(collectionOffers(s,true)[0].id,'interior');assert.equal(collectionOffers(s)[0].id,'pay');
 setListPinned(s,'LIST_ALL','shop',true);assert.equal(collectionOffers(s,true)[0].id,'shop');
 assert.equal(collectionOffers(s)[0].id,'pay');
});
