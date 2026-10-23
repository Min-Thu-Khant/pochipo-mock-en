import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,setChinchiro,total,ensureChinchiro} from '../model.js';
import {initAccounts,syncAccount} from '../account-model.js';
import {miniGames,gameStatus,gameHeld,drawGame as drawGameImpl,claimGame,fortuneLabel} from '../mini-games-model.js';
import {miniGamesList,createGameView} from '../mini-games-view.js';
import {resultFaces} from '../dice-result-art.js';
import {ensureDiceGame} from '../dice-game-model.js';
import {DICE_ROLL_MS} from '../chinchiro-art.js';

const testRoles=new WeakMap();
const drawGame=(s,id,boosted=false)=>drawGameImpl(s,id,boosted,()=>({pin:0,triple:.08,eye3:.99}[testRoles.get(s)]??0));

function setup(role='pin'){
 const state=initialState();initAccounts(state,{fresh:true});ensureChinchiro(state);
 const table=state.chinchiro.normalTable.map(row=>({...row,weight:row.id===role?1:0,pt:123}));
 setChinchiro(state,{normalTable:table,earlyTable:table});ensureDiceGame(state).rewards={pin:123,double:123,even:123,odd:0};testRoles.set(state,role);return state;
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
 state.chinchiro.dailyLimit=1;state.diceGame.dailyLimit=1;drawGame(state,'omikuji');assert.throws(()=>drawGame(state,'omikuji'),/終了/);
 assert.equal(gameStatus(state,'dice').remaining,1);
 state.chinchiro.enabled=false;state.diceGame.enabled=false;
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
test('一覧から3ゲームを選べて、抽選中は受取操作を表示しない',()=>{
 const state=setup(),list=miniGamesList(state);
 assert.match(list,/href="#home\/minigames\/dice"/);assert.match(list,/href="#home\/minigames\/omikuji"/);
 assert.match(list,/サイコロゲーム/);assert.match(list,/おみくじ/);
 assert.equal((list.match(/mini-game-cta">遊ぶ/g)||[]).length,miniGames.length);
 const button=(label,action,cls)=>`<button class="${cls}" data-action="${action}">${label}</button>`;
 for(const game of miniGames){
  const view=createGameView({game,getState:()=>state,button,esc:value=>value}),status=gameStatus(state,game.id);
  assert.match(view.sheet(status),/chinchiro-roll/);assert.match(view.sheet(status),/>動画を見てスタート<\/button>/);assert.match(view.sheet(status),/>スタート<\/button>/);
  const result=drawGame(state,game.id);
  assert.doesNotMatch(view.sheet(status,result,true),/data-action=/);
  assert.match(view.sheet(status,result),/data-action="chinchiro-claim">動画を見て受け取る<\/button>/);
  assert.doesNotMatch(view.sheet(status,result),/ch-claim-hint|当たったポイントを自分のものに/);
  assert.doesNotMatch(view.sheet(status,result),/あとで受け取る|chinchiro-later/);
  if(game.id==='dice')assert.match(view.sheet(status,result),/出目 1/);
  else if(game.id==='roulette')assert.match(view.sheet(status,result),/roulette-art settled/);
  else {assert.match(view.sheet(status,result),/fortune-great/);assert.match(view.sheet(status,result),/omikuji-scene/);}
 }
});

test('ルーレットは独立した回数・保存・二重受取防止を持つ',()=>{
 const s=setup();const before=total(s);const dice=drawGame(s,'dice');
 const r=drawGame(s,'roulette');assert.equal(r.amount,123);
 assert.equal(gameStatus(s,'roulette').remaining,2);
 assert.equal(gameStatus(s,'omikuji').remaining,3);
 const saved=JSON.parse(JSON.stringify(s));
 assert(!claimGame(saved,'roulette',dice.id));
 assert(claimGame(saved,'roulette',r.id));assert(!claimGame(saved,'roulette',r.id));
 assert.equal(total(saved),before+123);
 drawGame(saved,'roulette');drawGame(saved,'roulette');
 assert.equal(gameStatus(saved,'roulette').remaining,0);
 assert.throws(()=>drawGame(saved,'roulette'));
 saved.date='2026-09-16';assert.equal(gameStatus(saved,'roulette').remaining,3);
});

test('奇数は通常・動画後とも0ptで、未受取結果や受取操作を作らない',()=>{
 for(const boosted of [false,true]){
  const state=setup('eye3'),before=total(state);
  const result=drawGame(state,'dice',boosted);
  assert.equal(result.dice.reduce((sum,n)=>sum+n,0)%2,1);
  assert.equal(result.amount,0);
  assert.equal(gameHeld(state,'dice'),null);
  assert.equal(claimGame(state,'dice',result.id),false);
  assert.equal(total(state),before);
  const view=createGameView({game:miniGames[0],getState:()=>state,button:(text,action)=>`<button data-action="${action}">${text}</button>`,esc:String});
  const html=view.sheet(gameStatus(state,'dice'),result);
  assert.match(html,/is-miss/);assert.match(html,/<h3>奇数<\/h3>/);
  assert.doesNotMatch(html,/chinchiro-claim|ch-win-points|当たり！/);
 }
});
test('旧保存データの報酬付き奇数でも受け取れず、当たり表示をしない',()=>{
 const state=setup(),before=total(state);
 const legacy={id:'old-odd',prize:{id:'eye3'},dice:[2,2,3],amount:600};
 state.user.chinchiroUnclaimed=legacy;
 assert.equal(gameHeld(state,'dice'),null);
 assert.equal(claimGame(state,'dice',legacy.id),false);
 assert.equal(total(state),before);
 const view=createGameView({game:miniGames[0],getState:()=>state,button:(text,action)=>`<button data-action="${action}">${text}</button>`,esc:String});
 assert.doesNotMatch(view.sheet(gameStatus(state,'dice'),legacy),/chinchiro-claim|ch-win-points|当たり！/);
});
test('Pゾロ・ゾロ目は奇数合計でも当たりとして受け取れる',()=>{
 for(const role of ['pin','triple']){
  const state=setup(role),result=drawGame(state,'dice');
  assert.equal(result.amount,123);
  assert.equal(gameHeld(state,'dice').id,result.id);
  assert.equal(claimGame(state,'dice',result.id),true);
 }
});

test('サイコロの未受取は同日の再入場・再読込で受け取れるが翌日には消える',()=>{
 const state=setup(),before=total(state),r=drawGame(state,'dice');
 assert.equal(r.drawDate,state.date);
 const restored=JSON.parse(JSON.stringify(state));
 assert.equal(gameHeld(restored,'dice').id,r.id);
 restored.date='2026-10-24';
 assert.equal(gameStatus(restored,'dice').remaining,3);
 assert.equal(gameHeld(restored,'dice'),null);
 assert.equal(restored.user.chinchiroUnclaimed,null);
 assert.equal(claimGame(restored,'dice',r.id),false);
 assert.equal(total(restored),before);
});
test('受取動画中に翌日へ変わっても古い結果を付与しない。受取済みポイントは消さない',()=>{
 const state=setup(),before=total(state),r=drawGame(state,'dice');
 state.date='2026-10-24';
 assert.equal(claimGame(state,'dice',r.id),false);
 assert.equal(total(state),before);
 const today=drawGame(state,'dice');assert.equal(claimGame(state,'dice',today.id),true);
 state.date='2026-10-25';gameStatus(state,'dice');
 assert.equal(total(state),before+123);
});
test('有効な奇数ハズレの再挑戦ボタンは残回数がある時だけ表示する',()=>{
 const state=setup('eye3'),result=drawGame(state,'dice');
 const view=createGameView({game:miniGames[0],getState:()=>state,button:(text,action)=>`<button data-action="${action}">${text}</button>`,esc:String});
 assert.match(view.sheet(gameStatus(state,'dice'),result),/data-action="chinchiro-retry">もう一度チャレンジ<\/button>/);
 assert.doesNotMatch(view.sheet(gameStatus(state,'dice'),result),/また明日もチャレンジしてね/);
 drawGame(state,'dice');const last=drawGame(state,'dice');
 assert.doesNotMatch(view.sheet(gameStatus(state,'dice'),last),/chinchiro-retry/);
 assert.match(view.sheet(gameStatus(state,'dice'),last),/また明日もチャレンジしてね/);
});


test('サイコロの演出は結果と無関係な同一の2個で、着地前に終了する',()=>{
 const state=setup(),view=createGameView({game:miniGames[0],getState:()=>state,button:()=>'',esc:String});
 const results=[{prize:{id:'pin'},dice:[1,1,1],amount:600},{prize:{id:'spill'},dice:[1,3,5],amount:0}];
 const rolling=results.map(result=>view.sheet(gameStatus(state,'dice'),result,true));
 assert.equal(rolling[0],rolling[1]);
 assert.equal((rolling[0].match(/class="bowl-die /g)||[]).length,2);
 assert.doesNotMatch(rolling[0],/spill|dice-result|当たり！|chinchiro-claim/);
 assert.equal(DICE_ROLL_MS,2000);
});
test('結果だけに静止した立体サイコロ2個を表示し、旧結果の役・偶奇と受取データを保持する',()=>{
 const state=setup(),view=createGameView({game:miniGames[0],getState:()=>state,button:()=>'',esc:String});
 for(const result of [{prize:{id:'pin'},dice:[1,1,1],amount:600},{prize:{id:'triple'},dice:[5,5,5],amount:300},{prize:{id:'eye4'},dice:[5,5,4],amount:100},{prize:{id:'eye3'},dice:[2,2,3],amount:0}]){
  const before=JSON.stringify(result),faces=resultFaces(result),html=view.sheet(gameStatus(state,'dice'),result);
  assert.equal(faces.length,2);assert(faces.every(n=>Number.isInteger(n)&&n>=1&&n<=6));
  if(result.prize.id==='pin')assert.deepEqual(faces,[1,1]);
  else if(result.prize.id==='triple')assert.deepEqual(faces,[5,5]);
  else {assert.notEqual(faces[0],faces[1]);assert.equal((faces[0]+faces[1])%2,result.dice.reduce((a,b)=>a+b,0)%2);}
  assert.equal((html.match(/class="dice-result-die"/g)||[]).length,2);
  assert.doesNotMatch(html,/ch-bowl-scene/);assert.equal(JSON.stringify(result),before);
 }
});
