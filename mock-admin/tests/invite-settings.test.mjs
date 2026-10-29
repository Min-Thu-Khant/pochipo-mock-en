import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,visibleOffers} from '../../mock-app/model.js';
import {initAccounts,activateAccount,emptyData} from '../../mock-app/account-model.js';
import {applyInvite,operationSettings,checkInvite} from '../../mock-app/operation-settings.js';
import {saveInviteSettings,inviteSettings} from '../../mock-app/invite-settings.js';
import {canShowReferralEntry} from '../../mock-app/referral-callout.js';
const fixture=()=>{const s=initialState();initAccounts(s);s.user.registered=s.date;s.accountAuth.accounts.demo.phone='09000000000';return s;};
const settings={enabled:true,condition:'phone',inviterReward:120,inviteeReward:240,perInviter:1,totalCap:360};
test('設定の保存・再表示と停止時の受付・入力案内制御',()=>{
 const s=fixture();saveInviteSettings(s,settings);assert.deepEqual(inviteSettings(s),settings);assert.ok(visibleOffers(s).length);
 saveInviteSettings(s,{...settings,enabled:false});assert.equal(canShowReferralEntry(s),false);assert.throws(()=>applyInvite(s,'FRIEND-DEMO'),/停止/);assert.equal(s.user.inviteApplied,undefined);
 saveInviteSettings(s,settings);assert.equal(canShowReferralEntry(s),true);assert.equal(applyInvite(s,'FRIEND-DEMO'),240);assert.equal(s.user.inviteApplied.amount,240);assert.throws(()=>applyInvite(s,'FRIEND-DEMO'),/適用済み/);
});
test('双方の異なる報酬と上限を成立時に適用する',()=>{
 const s=fixture();saveInviteSettings(s,settings);const inviter={id:'sample-friend',provider:'Google',status:'active',data:emptyData(s)};s.accountAuth.accounts[inviter.id]=inviter;
 applyInvite(s,'FRIEND-DEMO');assert.equal(s.user.history.find(h=>h.category==='REFERRAL')?.amount,240);assert.equal(inviter.data.user.history.find(h=>h.category==='REFERRAL')?.amount,120);
 const data=emptyData(s);data.user.registered=s.date;const second={id:'second',email:'second@example.com',provider:'Google',status:'active',phone:'09000000000',data};s.accountAuth.accounts.second=second;activateAccount(s,second);assert.throws(()=>applyInvite(s,'FRIEND-DEMO'),/成立上限/);
});
test('総額上限・72時間の境界を守る',()=>{
 const s=fixture();saveInviteSettings(s,{...settings,totalCap:359});assert.throws(()=>applyInvite(s,'FRIEND-DEMO'),/原資上限/);
 saveInviteSettings(s,settings);s.user.cases=[];assert.equal(applyInvite(s,'FRIEND-DEMO'),240);
 const fresh=fixture();fresh.date='2026-10-04';fresh.user.registered='2026-10-01';assert.throws(()=>checkInvite(fresh,'FRIEND-DEMO'),/期限/);
});
test('不正な設定値を保存しない',()=>{for(const bad of [{inviterReward:-1},{inviteeReward:1.2},{perInviter:0},{totalCap:''},{enabled:'true'},{condition:'other'}]){const s=fixture();operationSettings(s);const before=structuredClone(s);assert.throws(()=>saveInviteSettings(s,{...settings,...bad}));assert.deepEqual(s,before);}});
test('特典0の場合もコード適用は成立し、ポイント付与は行わない',()=>{const s=fixture();saveInviteSettings(s,{...settings,inviterReward:0,inviteeReward:0});assert.equal(applyInvite(s,'FRIEND-DEMO'),0);assert.equal(s.user.inviteApplied.amount,0);assert.equal(s.user.history.filter(h=>h.category==='REFERRAL').length,0);});

test('保存済みの旧条件でも初回案件承認を要求しない',()=>{const s=fixture();saveInviteSettings(s,settings);s.operatorWorkflows.invite.condition='first-approved';s.user.cases=[];assert.equal(inviteSettings(s).condition,'phone');assert.equal(applyInvite(s,'FRIEND-DEMO'),240);});
