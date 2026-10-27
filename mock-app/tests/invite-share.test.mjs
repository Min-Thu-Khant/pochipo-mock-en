import test from 'node:test';
import assert from 'node:assert/strict';
import {inviteShareData,shareInvite,inviteShareMenu} from '../invite-share.js';
test('OS共有へコード入りの文章を渡す。報酬額とローカルURLは含めない',async()=>{
 let payload;const result=await shareInvite({code:'FRIEND-123',navigator:{share:async data=>{payload=data;}},showFallback:()=>assert.fail('native share is available')});
 assert.equal(result,'shared');assert.equal(payload.text,inviteShareData('FRIEND-123').text);assert.match(payload.text,/特典ポイント/);assert.doesNotMatch(payload.text,/5,?000|localhost|127\.0\.0\.1/);
});
test('OS共有をキャンセルした場合は代替メニューを開かない',async()=>{
 assert.equal(await shareInvite({code:'A',navigator:{share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}},showFallback:()=>assert.fail('cancel must return to the page')}),'cancelled');
});
test('非対応・起動失敗時は共有先を選べるメニューへ戻る',async()=>{
 for(const navigator of [{},{share:async()=>{throw new Error('unavailable');}}]){let count=0;assert.equal(await shareInvite({code:'A',navigator,showFallback:()=>count++}),'fallback');assert.equal(count,1);}
});
test('共有先のURLへ改行・特殊文字を含むコードと本文を引き継ぐ',()=>{
 const code='A&B #日本語',html=inviteShareMenu({code,esc:s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;'),button:()=>''});
 assert.ok(html.includes('https://line.me/R/share?'+encodeURIComponent(inviteShareData(code).text)));
 assert.ok(html.includes('https://twitter.com/intent/tweet?text='+encodeURIComponent(inviteShareData(code).text)));
 assert.ok(html.includes('mailto:?subject='));assert.match(html,/noopener noreferrer/);
});
