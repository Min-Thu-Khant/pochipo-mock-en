import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,grant} from '../model.js';
import {initAccounts} from '../account-model.js';
import {connectExchange,createExchange,sendExchange} from '../exchange-model.js';
import {selectOEMProduct,setOEMAmount,depositOEM,submitOEMDestination,createExchangeOEMUI} from '../exchange-oem.js';
const fresh=()=>{const s=initialState();initAccounts(s);s.user.approved=0;s.user.history=[];s.user.earned=0;s.user.sms=true;grant(s,'交換テスト',10000);return s;};
function ui(s){return createExchangeOEMUI({getState:()=>s,save:()=>{},go:()=>{},button:(label,action,cls,extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`,esc:String,pt:n=>n.toLocaleString(),accountUI:{exchangeAllowed:()=>true,endExchange:()=>{}},showModal:()=>{},close:()=>{},readInput:()=>null});}
test('交換先一覧→初回規約→ドットマネー提供の入力画面。減算は確定まで行わない',()=>{
 const s=fresh(),view=ui(s);assert.match(view.page(),/交換先を選ぶ/);assert.match(view.page(),/画面モック/);
 selectOEMProduct(s,'amazon');assert.match(view.page('input','amazon'),/利用規約に同意/);assert.doesNotMatch(view.page('input','amazon'),/id="exchange-amount"/);
 connectExchange(s);assert.match(view.page('input','amazon'),/id="exchange-amount"/);
 setOEMAmount(s,500);assert.equal(s.user.approved,10000);assert.equal(s.user.exchangeRequests?.length??0,0);
 assert.match(view.page('confirm','amazon'),/確定して次へ/);
});
test('マネー付与と交換先への申請を区別し、戻る・連打でも二重消費しない',()=>{
 const s=fresh();connectExchange(s);selectOEMProduct(s,'amazon');setOEMAmount(s,500);
 let r=depositOEM(s,'one');assert.equal(r.status,'completed');assert.ok(r.historyId);assert.equal(s.user.approved,9500);assert.equal(s.user.exchangeAccount.balance,5);
 assert.match(ui(s).page('result','amazon'),/交換先への交換は完了していません/);
 assert.match(ui(s).page('confirm','amazon'),/マネーへの交換が完了/);
 depositOEM(s,'two');assert.equal(s.user.exchangeRequests.length,1);assert.equal(s.user.approved,9500);assert.equal(s.user.exchangeAccount.balance,5);
 assert.throws(()=>setOEMAmount(s,100),/申請済み/);assert.throws(()=>selectOEMProduct(s,'bank'),/手続き中/);
 submitOEMDestination(s);submitOEMDestination(s);assert.equal(s.user.exchangeAccount.balance,0);assert.equal(s.user.approved,9500);
 assert.equal(r.withdrawalStatus,'submitted');assert.match(ui(s).page('result','amazon'),/反映完了とは異なります/);
 selectOEMProduct(s,'bank');assert.match(ui(s).page('input','bank'),/交換に使うポイントを入力/);
});
test('送信失敗・再読込後も同じ依頼IDで再試行する',()=>{
 let s=fresh();connectExchange(s);selectOEMProduct(s,'paypay');setOEMAmount(s,1000);s.exchangeFailure='queue';
 assert.equal(depositOEM(s,'retry').status,'pending');assert.equal(s.user.approved,9000);
 assert.match(ui(s).page('result','paypay'),/同じ申請で再確認する/);assert.match(ui(s).page(),/手続き中の交換を確認/);
 assert.throws(()=>submitOEMDestination(s),/結果を先に/);
 s=JSON.parse(JSON.stringify(s));s.exchangeFailure='';depositOEM(s,'new-id');
 assert.equal(s.user.exchangeRequests.length,1);assert.equal(s.user.exchangeRequests[0].id,'retry');assert.equal(s.user.exchangeAccount.balance,10);assert.equal(s.user.approved,9000);
});
test('FROZENは付与可能だが交換先への利用は不可。BLACK/INVALIDは付与不可',()=>{
 const s=fresh();connectExchange(s);selectOEMProduct(s,'dpoint');setOEMAmount(s,100);depositOEM(s,'frozen');
 s.user.exchangeAccount.status='frozen';assert.throws(()=>submitOEMDestination(s),/停止/);assert.match(ui(s).page('result','dpoint'),/マネーの利用が停止/);
 const r=createExchange(s,{id:'frozen-deposit',amount:100});assert.equal(sendExchange(s,r.id).status,'completed');
 for(const status of ['black','invalid']){s.user.exchangeAccount.status=status;const before=s.user.approved;assert.throws(()=>createExchange(s,{id:status,amount:100}),/停止/);assert.equal(s.user.approved,before);}
});
test('残高不足・単位違い・認証切れでは申請不可。API送信前のエラーなら入力修正可能',()=>{
 const s=fresh();connectExchange(s);selectOEMProduct(s,'bank');
 for(const amount of [0,99,150,10001,Infinity])assert.throws(()=>setOEMAmount(s,amount));
 setOEMAmount(s,100);s.exchangeFailure='inactive';assert.throws(()=>depositOEM(s,'bad'));assert.equal(s.user.approved,10000);
 s.exchangeFailure='';setOEMAmount(s,200);s.user.sms=false;assert.throws(()=>depositOEM(s,'auth'),/本人確認/);assert.equal(s.user.approved,10000);
});
