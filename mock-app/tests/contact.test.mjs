import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {contactPage,createContactDraft,updateContactDraft,contactNext} from '../contact.js';
const ui={header:t=>'<header>'+t+'</header>',nav:()=>'',button:(t,a,c,attrs)=>`<button data-action="${a}" class="${c}" ${attrs}>${t}</button>`};
test('all contact routes highlight only My Page in the actual shared navigation',()=>{
 const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const nav=source.split('\n').find(line=>line.startsWith('function nav(){'));
 for(const step of ['', 'type','detail','form','list']){
  const html=runInNewContext('('+nav+')()',{
   route:()=>['contact',step],navigation:{},state:{},
   miniGamesEntry:()=> 'home/minigames/dice',poigigIcon:()=> '',
  });
  assert.match(html,/<a href="#mypage" class="active" aria-current="page"/);
  assert.doesNotMatch(html,/<a href="#home" class="active"/);
  assert.equal((html.match(/aria-current="page"/g)||[]).length,1);
 }
});
test('new contact offers two choices and requires unchecked confirmation',()=>{
 const html=contactPage(undefined,ui);
 assert.match(html,/新規お問い合わせ/);assert.match(html,/お問い合わせ一覧/);
 assert.match(html,/type="checkbox" id="contact-confirm"/);assert.doesNotMatch(html,/ checked/);
 assert.match(html,/disabled aria-describedby/);assert.match(html,/EDOCODE/);
});
test('history shows empty state without submission controls',()=>{
 const html=contactPage('list',ui);
 assert.match(html,/お問い合わせの記録はまだありません/);assert.doesNotMatch(html,/contact-continue/);
});
test('confirmation and each required selection gate the next step',()=>{
 const d=createContactDraft();assert.equal(contactNext('notice',d),null);
 updateContactDraft(d,'confirmed',true);assert.equal(contactNext('notice',d),'contact/type');
 assert.equal(contactNext('type',d),null);updateContactDraft(d,'type','points');
 assert.equal(contactNext('type',d),'contact/detail');assert.equal(contactNext('detail',d),null);
 updateContactDraft(d,'detail','missing');assert.equal(contactNext('detail',d),'contact/form');
 updateContactDraft(d,'confirmed',false);assert.equal(contactNext('detail',d),null);
});
test('form preserves text safely and does not simulate submission',()=>{
 const d={confirmed:true,type:'points',detail:'missing',visit:'sample-visit',message:'<script>alert(1)</script>'};
 const html=contactPage('form',ui,d);
 assert.match(html,/このモックから送信はできません/);assert.match(html,/&lt;script&gt;/);
 assert.match(html,/value="sample-visit" selected/);assert.match(html,/contact-submit[^>]*disabled/);
 assert.doesNotMatch(html,/type="submit"/);
});
test('changing category clears only dependent draft fields',()=>{
 const d={confirmed:true,type:'points',detail:'missing',visit:'sample-visit',message:'test'};
 updateContactDraft(d,'type','points');assert.equal(d.message,'test');
 updateContactDraft(d,'type','usage');assert.equal(d.detail,'');assert.equal(d.message,'');assert.equal(d.visit,'');
 updateContactDraft(d,'detail','missing');assert.equal(d.detail,'');
});
test('deep links cannot skip required steps',()=>{
 assert.match(contactPage('form',ui,createContactDraft()),/注意事項を確認しました/);
 assert.match(contactPage('form',ui,{...createContactDraft(),confirmed:true}),/お問い合わせの種類をお選びください/);
 assert.match(contactPage('form',ui,{...createContactDraft(),confirmed:true,type:'points'}),/詳しいお問い合わせ/);
});
test('all inquiry steps use only the shared header back control',()=>{
 const d={confirmed:true,type:'points',detail:'missing',visit:'',message:'保持する入力'};
 const withHeader={...ui,header:(title,back)=>`<header><button aria-label="戻る" data-fallback="${back}">＜</button>${title}</header>`};
 for(const [step,back] of [['type','contact'],['detail','contact/type'],['form','contact/detail']]){
  const html=contactPage(step,withHeader,d);
  assert.equal((html.match(/aria-label="戻る"/g)||[]).length,1);
  assert.match(html,new RegExp('data-fallback="'+back+'"'));
  assert.doesNotMatch(html,/>戻る<\/a>/);
 }
 assert.match(contactPage('form',withHeader,d),/保持する入力/);
});
