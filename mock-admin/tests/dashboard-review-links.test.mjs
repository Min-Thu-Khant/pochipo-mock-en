import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('ダッシュボードは5タブと今回の確認先・未接続範囲を案内する',()=>{
  const source=readFileSync(new URL('../admin.js',import.meta.url),'utf8');
  assert.match(source,/下部 5 タブ/);
  assert.doesNotMatch(source,/下部 4 タブ/);
  for(const route of ['home','mypage','invite','contact']){
    assert.ok(source.includes(`href="../mock-app/#${route}"`));
  }
  assert.match(source,/Pコインと右上への曲線矢印/);
  assert.match(source,/特典ポイント/);
  assert.match(source,/送信・履歴取得、端末設定への遷移は未接続/);
});
