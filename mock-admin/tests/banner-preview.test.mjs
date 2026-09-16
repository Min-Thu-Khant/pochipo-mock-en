import test from 'node:test';
import assert from 'node:assert/strict';
import {bannerPreviewTarget} from '../../mock-app/banner-preview-model.js';
test('実際の配信先に対応する画面と説明を返す',()=>{assert.equal(bannerPreviewTarget('top','','',['daily']).route,'home/daily');assert.equal(bannerPreviewTarget('category','game','bottom',['game']).route,'home/game');assert.match(bannerPreviewTarget('category','game','bottom',['game']).description,/一覧の下/);assert.equal(bannerPreviewTarget('category','high','top',[]).route,'high');assert.equal(bannerPreviewTarget('popup').route,'home');});
test('未実装の配置・存在しないタブを表示できるように見せない',()=>{for(const p of ['carousel','feed','sub'])assert.match(bannerPreviewTarget(p).error,/表示されません/);assert.ok(bannerPreviewTarget('category','steps','bottom',['steps']).error);assert.ok(bannerPreviewTarget('category','game','top',[]).error);assert.ok(bannerPreviewTarget('top','','',[]).error);assert.ok(bannerPreviewTarget('category','daily','top',['daily']).error);});
