import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {initAccounts,syncAccount,currentAccount,activateAccount,logoutAccount,expireSession,withdrawAccount,updateProfile,findAccount,passwordDigest,checkPassword,emptyData} from '../account-model.js';
const create=()=>{const s=initialState();initAccounts(s,{fresh:true});return s;};
const member=(s,id)=>({id,email:id+'@example.com',name:id,phone:'09012345678',provider:'email',status:'active',data:emptyData(s)});
test('ゲストの残高・履歴を一度だけ移し、再ログインでは追加しない',()=>{
 const s=create();s.user.approved=250;s.user.pending=40;s.user.history=[{id:'earned',amount:250}];syncAccount(s);const a=member(s,'one');activateAccount(s,a,{newAccount:true});assert.equal(s.user.approved,250);assert.equal(s.user.pending,40);assert.equal(s.user.history.length,1);assert.equal(s.accountAuth.guest.user.approved,0);logoutAccount(s);activateAccount(s,a);assert.equal(s.user.approved,250);assert.throws(()=>activateAccount(s,a,{newAccount:true}),/登録済み/);
});
test('会員間の残高・履歴を分離し、他人のプロフィールを更新できない',()=>{
 const s=create(),a=member(s,'one'),b=member(s,'two');activateAccount(s,a,{newAccount:true});s.user.approved=321;s.user.history=[{id:'one'}];syncAccount(s);logoutAccount(s);activateAccount(s,b,{newAccount:true});assert.equal(s.user.approved,0);assert.deepEqual(s.user.history,[]);assert.throws(()=>updateProfile(s,a.id,'別会員'),/本人/);updateProfile(s,b.id,'二人目');assert.equal(currentAccount(s).name,'二人目');logoutAccount(s);activateAccount(s,a);assert.equal(s.user.approved,321);assert.equal(s.user.history[0].id,'one');
});
test('期限切れでは会員の残高を表示せず、再認証後に復元する',()=>{
 const s=create(),a=member(s,'one');activateAccount(s,a,{newAccount:true});s.user.approved=500;expireSession(s);assert.equal(currentAccount(s),null);assert.equal(s.user.approved,0);assert.throws(()=>updateProfile(s,a.id,'期限切れ'),/本人/);activateAccount(s,a);assert.equal(s.user.approved,500);
});
test('退会は会員・残高・通知を停止し再ログインを拒否する',()=>{
 const s=create(),a=member(s,'one');activateAccount(s,a,{newAccount:true});s.user.approved=500;withdrawAccount(s,a.id);assert.equal(a.status,'withdrawn');assert.equal(a.notifications,false);assert.equal(a.data.user.approved,0);assert.equal(currentAccount(s),null);assert.throws(()=>activateAccount(s,a),/退会済み/);
});
test('パスワードは平文を保存せず、更新後は旧パスワードが一致しない',async()=>{
 const s=create(),a=member(s,'one');a.passwordHash=await passwordDigest(a.email,'Before123');activateAccount(s,a,{newAccount:true});assert.equal(await checkPassword(a,'Before123'),true);assert.equal(await checkPassword(a,'Wrong123'),false);a.passwordHash=await passwordDigest(a.email,'After123');assert.equal(await checkPassword(a,'Before123'),false);assert.equal(await checkPassword(a,'After123'),true);assert.equal(JSON.stringify(s).includes('After123'),false);assert.equal(findAccount(s,'ONE@EXAMPLE.COM'),a);
});
test('ゲストIDは再初期化で変わらず、登録・ログインだけではSMS認証済みにならない',()=>{
 const s=create(),guestId=s.accountAuth.guestId;initAccounts(s);assert.equal(s.accountAuth.guestId,guestId);
 const a=member(s,guestId);activateAccount(s,a,{newAccount:true});assert.equal(s.accountAuth.active,guestId);assert.notEqual(s.accountAuth.guestId,guestId);assert.equal(s.user.sms,false);
 s.user.sms=true;logoutAccount(s);activateAccount(s,a);assert.equal(s.user.sms,false);
});
