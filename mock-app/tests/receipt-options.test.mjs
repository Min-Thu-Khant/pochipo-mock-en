import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePlans} from '../receipt-options.js';
test('単一設定を移行してOFF・報酬・対象商品を保持',()=>{const [p]=normalizePlans({enabled:false,reward:20,campaignId:'tea'});assert.equal(p.enabled,false);assert.equal(p.reward,20);assert.equal(p.campaignId,'tea');assert.ok(p.id);assert.deepEqual(p.images,[])});
test('複数プランは個別設定と素材参照を維持',()=>{const items=[{id:'one',enabled:true,images:['asset-a']},{id:'two',enabled:false,video:'asset-b'}];assert.deepEqual(normalizePlans({plans:items}),items);assert.deepEqual(normalizePlans({plans:[]}),[])});
