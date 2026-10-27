import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {mypageMarkup} from '../mypage.js';
const ui={pt:String,esc:String,icon:()=>'',coin:()=>'',button:(text,action,cls)=>`<button class="${cls}" data-action="${action}">${text}</button>`,link:()=>'',header:()=>'',nav:()=>'',total:0,conditions:{text:{state:'ready',label:''}}};
test('招待入力枠は72時間直前まで表示し、72時間以降は枠ごと非表示にする',()=>{
 for(const guest of [true,false])for(const hours of [0,71.999,72,73,100]){
  const s=initialState();s.user.registered='2026-10-01T00:00:00Z';s.user.inviteApplied=false;
  s.date=new Date(Date.parse(s.user.registered)+hours*3600000).toISOString();
  const html=mypageMarkup(s,{...ui,guest});
  assert.equal(html.includes('mypage-invite-entry'),hours<72);
  assert.equal(html.includes('友達から招待された方'),hours<72);
  if(hours<72)assert.ok(html.includes('72時間有効です。'));
  assert.ok(html.includes('mypage-invite-banner'),'招待する側のバナーは残す');
 }
});
test('コード適用済みの場合も招待入力枠を非表示にする',()=>{
 const s=initialState();s.date=s.user.registered='2026-10-01';s.user.inviteApplied='FRIEND';
 assert.ok(!mypageMarkup(s,{...ui,guest:false}).includes('mypage-invite-entry'));
});
