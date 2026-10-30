import test from 'node:test';
import assert from 'node:assert/strict';
import {createAccountUI} from '../account-ui.js';
import {initialState} from '../model.js';
import {initAccounts,activateAccount,logoutAccount} from '../account-model.js';

test('アカウント情報の属性・登録方法と削除画面の表記',t=>{
 const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 const previousStorage=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{addEventListener(){}}});
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem(){return null;}}});
 t.after(()=>{
  if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else delete globalThis.document;
  if(previousStorage)Object.defineProperty(globalThis,'sessionStorage',previousStorage);else delete globalThis.sessionStorage;
 });
 const s=initialState();initAccounts(s,{fresh:true});
 const esc=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const ui=createAccountUI({getState:()=>s,esc,icon:()=>'',nav:()=>''});
 const profile=()=>ui.page(['account','profile']);
 assert.match(profile(),/生年月日：未登録/);
 assert.match(profile(),/性別：未登録/);
 s.demographics={birthDate:'1990-01-11',gender:'female',confirmedAt:'2026-10-22'};
 const account={id:'test',provider:'Google',email:'test@example.com',name:'テスト',status:'active'};
 activateAccount(s,account,{newAccount:true});
 assert.match(profile(),/生年月日：1990\/01\/11/);
 assert.match(profile(),/性別：女性/);
 assert.doesNotMatch(profile(),/name="(?:year|month|day|gender)"/);
 for(const provider of ['Google','Apple','LINE']){
  account.provider=provider;
  assert.ok(profile().includes('登録方法：'+provider));
  assert.equal(ui.page(['account','edit']),profile());
 }
 account.provider='email';
 assert.match(profile(),/登録方法：確認できません/);
 assert.doesNotMatch(profile(),/メールアドレス|登録方法：email/);
 assert.equal(ui.page(['account','edit']),profile());
 assert.doesNotMatch(profile(),/ニックネーム|会員情報を編集|name="name"|test@example/);
 account.phone='09012345678';
 assert.match(profile(),/電話番号（下4桁）：5678/);
 assert.doesNotMatch(profile(),/09012345678/);
 const withdrawal=ui.page(['account','withdraw']);
 assert.match(withdrawal,/アカウント削除を申請する/);
 assert.match(withdrawal,/アカウントを削除しない/);
 assert.doesNotMatch(withdrawal,/退会/);
 assert.doesNotMatch(ui.page(['auth','withdrawn']),/退会/);
 logoutAccount(s);
 assert.match(profile(),/生年月日：未登録/);
 assert.doesNotMatch(profile(),/1990\/01\/11|性別：女性/);
 activateAccount(s,account);
 assert.match(profile(),/生年月日：1990\/01\/11/);
 assert.match(profile(),/性別：女性/);
});
