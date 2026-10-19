import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,daily,addSteps,claimSteps,stepsClaimable,stepMaxCount,L} from '../model.js';
import {walkingMarkup} from '../walking-view.js';
import {migrateWalkingPreview} from '../walking-preview.js';
import {icon} from '../design-system/app-theme/library-icons.js';
const ui={icon,poigigIcon:icon,coin:()=>'<span class="coin">P</span>',button:(label,action,cls='',attrs='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`};

test('旧4000歩設定だけを10000歩に移行し、歩数・獲得履歴・任意設定を維持する',()=>{
 const state=initialState();state.limits.stepMax=4000;
 daily(state).steps=3500;daily(state).stepsClaimed=2;
 const user=JSON.stringify(state.user);
 migrateWalkingPreview(state);
 assert.equal(state.limits.stepMax,10000);
 assert.equal(JSON.stringify(state.user),user);
 state.limits.stepMax=6000;migrateWalkingPreview(state);
 assert.equal(state.limits.stepMax,6000);
 const custom=initialState();custom.limits.stepMax=8000;migrateWalkingPreview(custom);
 assert.equal(custom.limits.stepMax,8000);
});

test('歩数未連携・利用不可では獲得を案内せず、連携後は残り歩数と受取状態を表示',()=>{
 const state=initialState();daily(state).steps=2500;daily(state).stepsClaimed=1;
 let html=walkingMarkup(state,ui);
 assert.match(html,/歩数を連携する/);assert.match(html,/class="walk-bubble">スタート<\/span>/);
 assert.doesNotMatch(html,/class="walk-reward ready"/);
 state.stepLink='unavailable';html=walkingMarkup(state,ui);
 assert.doesNotMatch(html,/data-action="step-select"/);
 state.stepLink='linked';html=walkingMarkup(state,ui);
 assert.match(html,/今日の歩数.*<strong>2,500<\/strong>/);
 assert.doesNotMatch(html,/class="walk-bubble"/);
 assert.equal((html.match(/class="walk-reward claimed"/g)||[]).length,1);
 assert.equal((html.match(/class="walk-reward ready"/g)||[]).length,1);
 assert.match(html,/目標 10,000歩/);
 assert.match(html,/type="range"/);
 assert.match(html,/aria-valuemax="10000" aria-valuenow="2500"/);
});

test('10000歩まで1節目ずつ受け取り、上限後は二重獲得せず翌日にリセット',()=>{
 const state=initialState();state.stepLink='linked';daily(state).steps=10000;daily(state).stepsClaimed=0;
 assert.equal(stepMaxCount(state),10);
 for(let i=0;i<10;i++){assert.equal(stepsClaimable(state),true);assert.equal(claimSteps(state,false),L(state).stepRewardNoAd);}
 assert.equal(stepsClaimable(state),false);assert.equal(claimSteps(state,false),false);
 let html=walkingMarkup(state,ui);
 assert.equal((html.match(/class="walk-reward claimed"/g)||[]).length,10);
 assert.match(html,/目標達成/);
 daily(state).steps=9999;assert.equal(addSteps(state,10),10000);assert.match(walkingMarkup(state,ui),/目標達成/);
 state.date='2026-10-10';html=walkingMarkup(state,ui);
 assert.match(html,/今日の歩数.*<strong>1,000<\/strong>/);
 assert.doesNotMatch(html,/class="walk-reward claimed"/);
 // A new mock day starts with the existing 1,000-step demo seed.
 assert.equal(daily(state).stepsClaimed,0);
 assert.equal(stepsClaimable(state),true);
 assert.equal(claimSteps(state,false),L(state).stepRewardNoAd);
});

test('歩数の途中では靴上の吹き出しを出さず、0歩と10000歩だけ表示する',()=>{
 const state=initialState();state.stepLink='linked';daily(state).steps=0;
 assert.match(walkingMarkup(state,ui),/class="walk-bubble">スタート<\/span>/);
 daily(state).steps=5000;
 assert.doesNotMatch(walkingMarkup(state,ui),/class="walk-bubble"/);
 daily(state).steps=10000;
 assert.match(walkingMarkup(state,ui),/class="walk-bubble">目標達成<\/span>/);
});
