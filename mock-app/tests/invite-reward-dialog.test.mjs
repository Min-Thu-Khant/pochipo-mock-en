import test from 'node:test';
import assert from 'node:assert/strict';
import {dialogMarkup} from '../dialogs.js';
import {initialState} from '../model.js';
import {initAccounts} from '../account-model.js';
import {saveInviteSettings} from '../invite-settings.js';
import {applyInvite} from '../operation-settings.js';
test('友達招待は管理画面の受取側設定額を共通獲得POPに表示する',()=>{
 for(const amount of [5000,7500]){
  const s=initialState();initAccounts(s);s.user.registered=s.date;s.accountAuth.accounts.demo.phone='09000000000';
  saveInviteSettings(s,{enabled:true,condition:'phone',inviterReward:100,inviteeReward:amount,perInviter:10,totalCap:1000000});
  const reward=applyInvite(s,'FRIEND-DEMO');
  const html=dialogMarkup('earned',{amount:reward,closeLabel:'戻る'});
  assert.match(html,/savings-coins\.png/);assert.match(html,/ゲット！/);assert.match(html,/戻る/);
  assert.ok(html.includes(`<strong>${amount.toLocaleString('ja-JP')}</strong><small>pt</small>`));
  assert.doesNotMatch(html,/fd-reward-label|特典ポイント/);
 }
 assert.match(dialogMarkup('earned',{amount:50}),/50<\/strong><small>pt/);
});
