import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createAccountUI} from '../account-ui.js';

test('オンボーディングの交換訴求は2枚目の画像上だけに表示し、既存の原稿・遷移を維持する',t=>{
 t.mock.method(globalThis,'setTimeout',()=>0);
 const previousDocument=Object.getOwnPropertyDescriptor(globalThis,'document');
 const previousStorage=Object.getOwnPropertyDescriptor(globalThis,'sessionStorage');
 Object.defineProperty(globalThis,'document',{configurable:true,value:{addEventListener(){}}});
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem(){return null;}}});
 try{
  const ui=createAccountUI({});
  const first=ui.page(['onboarding','1']),second=ui.page(['onboarding','2']);
  assert.match(first,/自分に合ったお仕事でポイントを貯めよう。<br>「これならできる！」がきっと見つかる。/);
  assert.doesNotMatch(first,/onboarding-exchange-callout|手数料無料/);
  assert.match(second,/<p class="onboarding-exchange-callout"><span class="onboarding-callout-mark" aria-hidden="true">＼<\/span><span class="onboarding-callout-gap-third" aria-hidden="true"> <\/span><span class="onboarding-callout-fee">手数料無料<\/span><span class="onboarding-callout-gap-half" aria-hidden="true"> <\/span><span class="onboarding-callout-connector">で<\/span><span class="onboarding-callout-gap-half" aria-hidden="true"> <\/span>まるごとおトク<span class="onboarding-callout-mark" aria-hidden="true">／<\/span><\/p><img src="\.\/assets\/onboarding\/exchange-borderless.png"/);
  assert.match(first,/onboarding-message--earn/);
  assert.doesNotMatch(second,/onboarding-message--earn/);
  assert.match(second,/onboarding-earn-copy/);
  assert.match(second,/ポイントをためて、現金や好きなサービスに交換しよう。/);
  assert.match(first,/data-auth="slide" data-step="2">次へ/);
  assert.match(first,/data-auth="finish-onboarding"\s*>スキップ/);
  assert.doesNotMatch(second,/>スキップ</);
  assert.match(second,/data-auth="slide" data-step="1">戻る/);
  assert.match(second,/data-auth="finish-onboarding" data-step="3">次へ/);
  const css=readFileSync(new URL('../account.css',import.meta.url),'utf8');
  const rule=css.match(/\.onboarding-exchange-callout\{([^}]+)\}/)[1];
  for(const value of ['text-align:center','color:var(--brand-primary)','font-family:var(--ds-font)','font-weight:var(--ds-bold)'])assert.ok(rule.includes(value));
  const marks=css.match(/\.onboarding-callout-mark\{([^}]+)\}/)[1];
  for(const value of ['font-size:.75em','transform:translateY(.2em)','color:color-mix(in srgb,var(--brand-primary) 85%,var(--ink))'])assert.ok(marks.includes(value));
  assert.match(css,/\.onboarding-callout-connector\{font-size:var\(--ds-size-14\)\}/);
  assert.match(css,/\.onboarding-callout-gap-third\{font-size:calc\(1em \/ 3\);white-space:pre\}/);
  assert.match(css,/\.onboarding-callout-gap-half\{font-size:\.5em;white-space:pre\}/);
  assert.match(css,/\.onboarding-callout-fee\{letter-spacing:\.08em;margin-right:-\.08em\}/);
  assert.match(css,/\.onboarding-earn-copy\{display:block;font-size:min\(var\(--ds-size-14\),4\.8cqi\)/);
 }finally{
  if(previousDocument)Object.defineProperty(globalThis,'document',previousDocument);else delete globalThis.document;
  if(previousStorage)Object.defineProperty(globalThis,'sessionStorage',previousStorage);else delete globalThis.sessionStorage;
 }
});
