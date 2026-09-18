import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,saveCampaign,stopCampaign,applyTemplate} from '../console-model.js';
test('他アプリの配信は停止できず、下書きは分離される',()=>{const s=fresh();const c=saveCampaign(s,'tameruko',{title:'テスト',body:'本文',status:'下書き'});assert.throws(()=>stopCampaign(s,'mori',c.id));assert.equal(c.status,'下書き');stopCampaign(s,'tameruko',c.id);assert.equal(c.status,'停止');});
test('テンプレートは選択アプリの独立下書きになり公開されない',()=>{const s=fresh();applyTemplate(s,'beginner',['tameruko','mori']);assert.equal(s.campaigns.length,2);assert.ok(s.campaigns.every(c=>c.status==='下書き'));s.campaigns[0].body='変更';assert.notEqual(s.campaigns[1].body,'変更');assert.throws(()=>applyTemplate(s,'beginner',[]));});
test('過去予約と不正アプリを拒否し状態を変えない',()=>{const s=fresh();assert.throws(()=>saveCampaign(s,'tameruko',{title:'a',body:'b',status:'予約中',when:'2000-01-01T00:00'}));assert.throws(()=>saveCampaign(s,'missing',{title:'a',body:'b',status:'下書き'}));assert.equal(s.campaigns.length,0);});
