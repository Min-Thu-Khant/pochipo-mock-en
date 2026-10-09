import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,setChinchiro,total,ensureChinchiro} from '../model.js';
import {initAccounts,syncAccount} from '../account-model.js';
import {miniGames,gameStatus,gameHeld,drawGame,claimGame,fortuneLabel} from '../mini-games-model.js';
import {miniGamesList,createGameView} from '../mini-games-view.js';

function setup(role='pin'){
 const state=initialState();initAccounts(state,{fresh:true});ensureChinchiro(state);
 const table=state.chinchiro.normalTable.map(row=>({...row,weight:row.id===role?1:0,pt:123}));
 setChinchiro(state,{normalTable:table,earlyTable:table});return state;
}
test('ゲーム別の未受取結果を保存し、他ゲームのIDで受け取らず二重付与を防ぐ',()=>{
 let state=setup();const before=total(state);
 const dice=drawGame(state,'dice'),fortune=drawGame(state,'omikuji',true);
 assert.equal(total(state),before);
 assert.equal(gameHeld(state,'dice').id,dice.id);
 assert.equal(gameHeld(state,'omikuji').id,fortune.id);
 syncAccount(state);state=JSON.parse(JSON.stringify(state));
 assert.equal(state.accountAuth.guest.user.omikujiUnclaimed.id,fortune.id);
 assert(!claimGame(state,'omikuji',dice.id));assert(!claimGame(state,'dice',fortune.id));
 assert(claimGame(state,'omikuji',fortune.id));assert(!claimGame(state,'omikuji',fortune.id));
 assert.equal(gameHeld(state,'dice').id,dice.id);assert.equal(total(state),before+123);
 assert(claimGame(state,'dice',dice.id));assert(!claimGame(state,'dice',dice.id));
 assert.equal(total(state),before+246);
 assert(state.user.history.some(row=>row.title==='おみくじで獲得'&&row.category==='OMIKUJI'));
});
test('再挑戦は選択したゲームの結果だけを置換し、残回数も個別に減る',()=>{
 const state=setup();const dice=drawGame(state,'dice'),first=drawGame(state,'omikuji');
 const next=drawGame(state,'omikuji');
 assert(!claimGame(state,'omikuji',first.id));
 assert.equal(gameHeld(state,'omikuji').id,next.id);
 assert.equal(gameHeld(state,'dice').id,dice.id);
 assert.equal(gameStatus(state,'dice').remaining,2);assert.equal(gameStatus(state,'omikuji').remaining,1);
});
test('各ゲーム3回で停止、翌日リセット、設定による停止と上限短縮も尊重する',()=>{
 const state=setup();
 for(const {id} of miniGames){for(let i=0;i<3;i++)drawGame(state,id);assert.equal(gameStatus(state,id).remaining,0);assert.throws(()=>drawGame(state,id),/終了/);}
 state.date='2026-10-10';
 for(const {id} of miniGames)assert.equal(gameStatus(state,id).remaining,3);
 state.chinchiro.dailyLimit=1;drawGame(state,'omikuji');assert.throws(()=>drawGame(state,'omikuji'),/終了/);
 assert.equal(gameStatus(state,'dice').remaining,1);
 state.chinchiro.enabled=false;
 for(const {id} of miniGames){assert(!gameStatus(state,id).visible);assert.throws(()=>drawGame(state,id),/停止|終了/);}
});
test('外れのおみくじでは報酬を作らず、既存サイコロ結果を保持する',()=>{
 const state=setup();const dice=drawGame(state,'dice'),before=total(state);
 const table=state.chinchiro.normalTable.map(row=>({...row,weight:row.id==='none'?1:0}));
 setChinchiro(state,{normalTable:table,earlyTable:table});
 const result=drawGame(state,'omikuji');
 assert.equal(fortuneLabel(result),'末吉');assert.equal(result.amount,0);
 assert.equal(gameHeld(state,'omikuji'),null);assert(!claimGame(state,'omikuji',result.id));
 assert.equal(gameHeld(state,'dice').id,dice.id);assert.equal(total(state),before);
});
test('一覧から2ゲームを選べて、抽選中は受取操作を表示しない',()=>{
 const state=setup(),list=miniGamesList(state);
 assert.match(list,/href="#home\/minigames\/dice"/);assert.match(list,/href="#home\/minigames\/omikuji"/);
 assert.match(list,/サイコロゲーム/);assert.match(list,/おみくじ/);
 const button=(label,action,cls)=>`<button class="${cls}" data-action="${action}">${label}</button>`;
 for(const game of miniGames){
  const view=createGameView({game,getState:()=>state,button,esc:value=>value}),status=gameStatus(state,game.id);
  assert.match(view.sheet(status),/chinchiro-roll/);
  const result=drawGame(state,game.id);
  assert.doesNotMatch(view.sheet(status,result,true),/data-action=/);
  assert.match(view.sheet(status,result),/chinchiro-claim/);
  assert.doesNotMatch(view.sheet(status,result),/あとで受け取る|chinchiro-later/);
  if(game.id==='dice')assert.match(view.sheet(status,result),/出目 1/);
  else {assert.match(view.sheet(status,result),/fortune-great/);assert.match(view.sheet(status,result),/omikuji-scene/);}
 }
});
