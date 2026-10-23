import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,total} from '../model.js';
import {diceProbabilities,diceRoleFor,drawDiceGame,ensureDiceGame,setDiceGame,diceStatus,miniGamesMode,miniGamesEntry,setMiniGamesMode,diceEntryState} from '../dice-game-model.js';
import {drawGame,claimGame,gameHeld} from '../mini-games-model.js';
import {createGameView} from '../mini-games-view.js';

test('36通りをPゾロ1・ゾロ目5・偶数12・奇数18に分ける',()=>{
 const counts={pin:0,double:0,even:0,odd:0};
 for(let a=1;a<=6;a++)for(let b=1;b<=6;b++)counts[diceRoleFor([a,b])]++;
 assert.deepEqual(counts,{pin:1,double:5,even:12,odd:18});
 assert.deepEqual(diceProbabilities().map(r=>r.probability),[1/36,5/36,12/36,18/36]);
 assert.deepEqual(diceProbabilities(true).map(r=>r.probability),[1/30,5/30,12/30,12/30]);
});
test('実抽選は通常50%・動画後60%、役と2個の出目・報酬が必ず一致する',()=>{
 for(const boosted of [false,true]){
  const s=initialState(),before=total(s),counts={pin:0,double:0,even:0,odd:0};ensureDiceGame(s);
  for(let i=0;i<180;i++){
   s.user.daily[s.date]={chinchiro:0};let call=0;
   const r=drawDiceGame(s,boosted,()=>call++===0?(i+.5)/180:((i%36)+.5)/36);
   counts[r.prize.id]++;assert.equal(r.dice.length,2);assert.equal(diceRoleFor(r.dice),r.prize.id);
   assert.equal(r.amount>0,r.prize.id!=='odd');assert.equal(total(s),before);
  }
  assert.deepEqual(counts,boosted?{pin:6,double:30,even:72,odd:72}:{pin:5,double:25,even:60,odd:90});
 }
});
test('管理画面の報酬・回数・公開状態は実抽選へ反映し、不正な設定は保存しない',()=>{
 const s=initialState();setDiceGame(s,{enabled:true,dailyLimit:1,rewards:{pin:777,double:333,even:111}});
 const r=drawGame(s,'dice',false,()=>0);assert.equal(r.amount,777);assert.deepEqual(r.dice,[1,1]);assert.equal(diceStatus(s).remaining,0);
 assert.throws(()=>drawGame(s,'dice'),/終了/);assert(claimGame(s,'dice',r.id));assert(!claimGame(s,'dice',r.id));
 const saved=JSON.stringify(s.diceGame);assert.throws(()=>setDiceGame(s,{rewards:{even:0}}));assert.equal(JSON.stringify(s.diceGame),saved);
 assert.throws(()=>setDiceGame(s,{dailyLimit:4}));
 setDiceGame(s,{enabled:false});assert.equal(diceStatus(s).visible,false);
});
test('Tier1と全体版を切り替えても残回数と当日未受取は保持する。再入場はB/A/Cへ分岐',()=>{
 const s=initialState();assert.equal(miniGamesMode(s),'tier1');assert.equal(miniGamesEntry(s),'home/minigames/dice');assert.equal(diceEntryState(s),'A');
 const r=drawGame(s,'dice',false,()=>0);assert.equal(diceEntryState(s),'B');
 setMiniGamesMode(s,'all');assert.equal(miniGamesEntry(s),'home/minigames');assert.equal(gameHeld(s,'dice').id,r.id);assert.equal(diceStatus(s).remaining,2);
 setMiniGamesMode(s,'tier1');assert.equal(gameHeld(s,'dice').id,r.id);
 claimGame(s,'dice',r.id);assert.equal(diceEntryState(s),'A');
 drawGame(s,'dice',false,()=>.99);drawGame(s,'dice',false,()=>.99);assert.equal(diceEntryState(s),'C');
 const view=createGameView({game:{id:'dice'},getState:()=>s,button:()=>'',esc:String});
 const html=view.sheet(diceStatus(s));assert.match(html,/また明日もチャレンジしてね/);assert.doesNotMatch(html,/chinchiro-roll|また明日、運だめし/);
 s.date='2026-10-24';assert.equal(diceEntryState(s),'A');
});
