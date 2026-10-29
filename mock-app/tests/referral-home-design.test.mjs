import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {goalArrowIcon} from '../goal-arrow.js';
import {inviteDetailMarkup} from '../invite-detail.js';

test('招待詳細は元のコード欄と4枚の手順を表示し、報酬額とAmeba要素を含めない',()=>{
 const html=inviteDetailMarkup({code:'TEST-CODE',esc:String,button:(label,action)=>`<button data-action="${action}">${label}</button>`,link:label=>label});
 assert.match(html,/あなたの紹介コード/);
 assert.equal((html.match(/class="invite-step-card"/g)||[]).length,4);
 assert.ok(html.indexOf('copy-invite')<html.indexOf('invite-steps-title'));
 assert.ok(html.indexOf('share-invite')>html.indexOf('STEP 4'));
 assert.match(html,/友達にタメルコを始めてもらう/);
 assert.match(html,/特典ポイント/);
 assert.doesNotMatch(html,/5,?000|特典pt|Ameba|<img|invite-hero/);
});

test('目標アイコンは共通寸法と外形2px・内部1.5pxの静止表示で、アニメーションを持たない',()=>{
 const html=goalArrowIcon('beginner-mark');
 assert.match(html,/viewBox="0 0 24 24" width="24" height="24"/);
 assert.match(html,/stroke="#626C69"/);
 assert.match(html,/fill="#EF7264" stroke="none"/);
 assert.match(html,/stroke-width="2"/);
 assert.match(html,/stroke-width="1.5"/);
 assert.match(html,/goal-coin/);
 assert.match(html,/goal-up-arrow/);
 assert.doesNotMatch(html,/goal-growth|<animate/);
 const css=readFileSync(new URL('../goal-growth.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/@keyframes|animation\s*:|transform\s*:/);
});

test('ヘッダーの比較額は表示設定にかかわらず取り消し線を維持する',()=>{
 const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
 const source=app.split('\n').find(line=>line.startsWith('function header('));
 for(const on of [true,false]){
  const context={state:{},homeRecommendSettings:()=>({campaignEnabled:false}),route:()=>['home'],URLSearchParams,location:{search:''},effectiveBalance:()=>200,noLossView:()=>({on,compare:1,net:2}),coin:()=>'',yen:String,button:(text,action,cls)=>`<button class="${cls}">${text}</button>`,attentionDot:()=>'',badgeFlags:{points:false},headerActions:()=>'',esc:String};
  vm.createContext(context);vm.runInContext(source,context);
  const html=context.header();
  assert.match(html,/<del>1円相当<\/del>/);
  assert.match(html,/data-header-balance-points="200">2</);
  assert.match(html,/balance-pill attention-anchor yen-only nl/);
 }
});
