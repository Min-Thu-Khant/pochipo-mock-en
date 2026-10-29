import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {initAccounts} from '../account-model.js';
import {createAccountUI} from '../account-ui.js';
function harness(){
 const saved={document:globalThis.document,sessionStorage:globalThis.sessionStorage,FormData:globalThis.FormData};
 const events={};globalThis.document={addEventListener:(type,fn)=>(events[type]??=[]).push(fn),querySelector:()=>null};
 globalThis.sessionStorage={getItem:()=>null,setItem:()=>{}};
 globalThis.FormData=class{constructor(form){this.values=form.values;}[Symbol.iterator](){return Object.entries(this.values)[Symbol.iterator]();}};
 const s=initialState();initAccounts(s);s.user.registered=s.date;s.accountAuth.accounts.demo.phone='';
 const dialogs=[],routes=[],rewards=[];let saves=0,closes=0;
 const ui=createAccountUI({getState:()=>s,save:()=>saves++,render:()=>{},go:r=>routes.push(r),button:()=>'',icon:()=>'',esc:String,toast:()=>{},showModal:(title,html)=>dialogs.push({title,html}),close:()=>closes++,nav:()=>'',onInviteReward:amount=>rewards.push(amount)});
 const submit=(kind,values)=>{const form={dataset:{accountForm:kind},values,querySelector:()=>null};const e={preventDefault(){},target:{closest:selector=>selector==='[data-account-form]'?form:null}};for(const fn of events.submit)fn(e);};
 return {s,ui,submit,dialogs,routes,rewards,get saves(){return saves},get closes(){return closes},cleanup(){Object.assign(globalThis,saved);}};
}
test('ページ遷移せずコード・電話番号・獲得POPへ進み、途中では付与しない',()=>{
 const h=harness();try{
  h.ui.openInvite();assert.equal(h.dialogs.at(-1).title,'招待コードの入力');
  h.submit('invite-dialog-code',{inviteCode:'FRIEND-DEMO'});assert.equal(h.dialogs.at(-1).title,'電話番号の入力');assert.equal(h.saves,0);assert.equal(h.s.user.inviteApplied,undefined);
  h.submit('invite-dialog-phone',{phone:'09000000000'});assert.deepEqual(h.routes,[]);assert.deepEqual(h.rewards,[5000]);assert.equal(h.closes,1);assert.equal(h.saves,1);assert.equal(h.s.user.inviteApplied.code,'FRIEND-DEMO');
  h.submit('invite-dialog-phone',{phone:'09000000000'});assert.deepEqual(h.rewards,[5000]);
 }finally{h.cleanup();}
});
test('エラーはPOP内に表示し、未成立では電話番号・ポイントを保存しない',()=>{
 const h=harness();try{
  h.ui.openInvite();h.submit('invite-dialog-code',{inviteCode:'INVALID'});assert.match(h.dialogs.at(-1).html,/有効な招待コード/);assert.equal(h.dialogs.at(-1).title,'招待コードの入力');
  h.submit('invite-dialog-code',{inviteCode:'FRIEND-DEMO'});h.submit('invite-dialog-phone',{phone:'123'});assert.match(h.dialogs.at(-1).html,/11桁/);assert.equal(h.dialogs.at(-1).title,'電話番号の入力');assert.equal(h.saves,0);assert.equal(h.s.accountAuth.accounts.demo.phone,'');assert.deepEqual(h.rewards,[]);assert.deepEqual(h.routes,[]);
 }finally{h.cleanup();}
});
