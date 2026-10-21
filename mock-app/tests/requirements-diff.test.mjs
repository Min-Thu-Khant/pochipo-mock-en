import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,grant,visibleOffers,saveNacsOffer,rewardTypeOf} from '../model.js';
import {expiryDate,ensurePointAccount,effectiveBalance,nextExpiry,creditPoints,consumePoints,expirePoints} from '../point-ledger.js';
import {initAccounts,activateAccount,sessionExpiry,checkSession,currentAccount} from '../account-model.js';
import {connectExchange,createExchange,sendExchange} from '../exchange-model.js';
import {parseCatalog,applyCatalog} from '../../mock-nacs/catalog-operations.js';
import {applyInvite,checkInvite,operationSettings} from '../operation-settings.js';
const fresh=()=>{const s=initialState();s.user.approved=0;s.user.earned=0;s.user.history=[];return s;};
test('期限は付与から5か月後の月末。有効期限順に消費し、失効と再実行で二重減算しない',()=>{
 const s=fresh();s.date='2026-01-31';assert.equal(expiryDate(s.date),'2026-06-30');
 creditPoints(s,{requestId:'a',title:'A',amount:100});s.date='2026-02-01';creditPoints(s,{requestId:'b',title:'B',amount:200});
 assert.equal(creditPoints(s,{requestId:'a',title:'A',amount:100}),false);consumePoints(s,{requestId:'use',amount:50});
 assert.equal(nextExpiry(s).amount,50);s.date='2026-07-02';assert.equal(effectiveBalance(s),200);assert.equal(s.user.approved,250);
 assert.deepEqual(expirePoints(s),{count:1,amount:50});assert.equal(s.user.approved,200);assert.equal(expirePoints(s).amount,0);
 const before=structuredClone(s);assert.throws(()=>consumePoints(s,{requestId:'bad',amount:201}),/不足/);assert.deepEqual(s,before);
});
test('失効の中断後は未処理分のみ再開する',()=>{const s=fresh();s.date='2026-01-01';for(const id of ['a','b'])creditPoints(s,{requestId:id,title:id,amount:100});s.date='2026-07-02';assert.throws(()=>expirePoints(s,{failAfter:1}),/中断/);assert.equal(s.user.approved,100);assert.equal(expirePoints(s).amount,100);assert.equal(s.user.history.filter(h=>h.category==='EXPIRE').length,2);});
test('交換予約と消費は一度だけ。送信失敗後の再試行は再減算・二重送金しない',()=>{
 const s=fresh();initAccounts(s);s.user.sms=true;grant(s,'残高',1000);connectExchange(s);s.exchangeFailure='queue';
 const r=createExchange(s,{id:'exchange1',amount:500});assert.equal(s.user.approved,500);assert.equal(sendExchange(s,r.id).status,'pending');
 createExchange(s,{id:'exchange1',amount:500});assert.equal(s.user.approved,500);s.exchangeFailure='';sendExchange(s,r.id);sendExchange(s,r.id);
 assert.equal(s.user.exchangeAccount.balance,5);assert.equal(s.user.history.filter(x=>x.category==='EXCHANGE').length,1);assert.equal(s.user.approved,500);
 s.exchangeFailure='inactive';const before=structuredClone(s.user);assert.throws(()=>createExchange(s,{id:'bad',amount:100}),/停止/);assert.deepEqual(s.user,before);
});
test('CSVは引用符・改行を読み、検証失敗で一部だけ取り込まない。営業ロックと掲載NGを守る',()=>{
 assert.equal(parseCatalog('id,name\na,"A, B"')[0].name,'A, B');assert.throws(()=>parseCatalog('id,name\na,A\na,B'),/重複/);
 const s=initialState(),o=s.nacs.offers[0],before=structuredClone(s.nacs);
 assert.throws(()=>applyCatalog(s,[{id:o.id,name:'変更'},{id:'',name:'不正'}]));assert.deepEqual(s.nacs,before);
 s.nacs.governance={[o.id]:{locked:true}};assert.throws(()=>applyCatalog(s,[{id:o.id,name:o.name,gross:String(o.gross+1)}]),/ロック/);
 s.nacs.governance[o.id]={review:'ng'};assert.ok(!visibleOffers(s).some(x=>x.id===o.id));
});
test('最後のログインから6か月で非ログイン状態になり、再ログインで復帰できる',()=>{
 assert.equal(sessionExpiry('2026-08-31'),'2027-02-28');const s=initialState();initAccounts(s);const a=s.accountAuth.accounts.demo;activateAccount(s,a);const balance=s.user.approved,expiresAt=s.accountAuth.expiresAt;
 s.date='2027-01-01';assert.equal(checkSession(s),false);assert.equal(s.accountAuth.expiresAt,expiresAt,'利用しても期限は延びない');
 s.date=expiresAt;assert.equal(checkSession(s),true);assert.equal(currentAccount(s),null);assert.equal(s.accountAuth.active,null);assert.equal(s.accountAuth.sessionValid,true);assert.equal(s.persona,'guest');assert.equal(s.user.approved,0);assert.equal(s.accountAuth.expiredNotice,true);
 activateAccount(s,a);assert.equal(s.user.approved,balance);assert.equal(s.accountAuth.expiresAt,sessionExpiry(s.date),'再ログインから数え直す');
});
test('旧形式の期限切れ状態は非ログイン状態へ移行する',()=>{
 const s=initialState();initAccounts(s);activateAccount(s,s.accountAuth.accounts.demo);s.accountAuth.sessionValid=false;assert.equal(checkSession(s),true);assert.equal(s.accountAuth.active,null);assert.equal(s.accountAuth.sessionValid,true);
});
test('6か月の前日はログインを維持し、当日から解除する。履歴を保持し再読み込みで繰り返さない',()=>{
 for(const [login,previous,expiry] of [['2026-10-21','2027-04-20','2027-04-21'],['2026-08-31','2027-02-27','2027-02-28'],['2027-08-31','2028-02-28','2028-02-29']]){
  const s=initialState();s.date=login;initAccounts(s);const account=s.accountAuth.accounts.demo;activateAccount(s,account);
  const history=structuredClone(s.user.history),balance=s.user.approved;
  assert.equal(s.accountAuth.expiresAt,expiry);
  s.date=previous;assert.equal(checkSession(s),false);assert.equal(currentAccount(s)?.id,account.id);
  s.date=expiry;assert.equal(checkSession(s),true);assert.equal(currentAccount(s),null);
  assert.deepEqual(account.data.user.history,history);assert.equal(account.data.user.approved,balance);
  delete s.accountAuth.expiredNotice;
  const restored=JSON.parse(JSON.stringify(s));assert.equal(checkSession(restored),false);assert.equal(restored.accountAuth.expiredNotice,undefined);
  activateAccount(restored,restored.accountAuth.accounts.demo);assert.deepEqual(restored.user.history,history);assert.equal(restored.user.approved,balance);
 }
});
test('招待コードを検証し、電話登録後に一度だけ付与する',()=>{
 const s=initialState();initAccounts(s);s.user.registered=s.date;s.accountAuth.accounts.demo.phone='09000000000';const before=s.user.approved;
 assert.throws(()=>checkInvite(s,'INVALID'),/有効/);applyInvite(s,'FRIEND-DEMO');assert.equal(s.user.approved,before+5000);assert.throws(()=>applyInvite(s,'FRIEND-DEMO'),/適用済み/);
});

test('ロック中でも本文だけの更新は可能で、未設定の付与目安は捏造しない',()=>{
 const s=initialState(),o=s.nacs.offers[0];s.nacs.governance={[o.id]:{locked:true}};
 applyCatalog(s,[{id:o.id,name:'本文だけ更新',time:''}]);const updated=s.nacs.offers.find(x=>x.id===o.id);assert.equal(updated.name,'本文だけ更新');assert.equal(updated.time,'');
});
test('実在する別会員への招待は双方に一度だけ付与し、退会した招待元を除外する',()=>{
 const s=initialState();initAccounts(s);s.user.registered=s.date;const other=structuredClone(s.accountAuth.accounts.demo);other.id='inviter';s.accountAuth.accounts.inviter=other;
 operationSettings(s).invite.codes.push({code:'INVITER',owner:'inviter'});const before=other.data.user.approved;
 applyInvite(s,'INVITER');assert.equal(other.data.user.approved,before+5000);assert.equal(operationSettings(s).invite.results[0].inviterCredited,true);
 delete s.user.inviteApplied;other.status='withdrawn';assert.throws(()=>checkInvite(s,'INVITER'),/利用できません/);
});
