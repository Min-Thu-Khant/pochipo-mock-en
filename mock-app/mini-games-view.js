import {rouletteArt,rouletteValues} from './roulette-art.js?v=round-cat';
import {chevron} from './chevron.js';
import {bowl} from './chinchiro-art.js';
import {resultDice,diceConfetti} from './dice-result-art.js';
import {omikujiArt} from './omikuji-art.js';
import {pointAmount} from './point-symbol.js';
import {miniGames,gameStatus,gameHeld,fortuneLabel,diceResultLabel} from './mini-games-model.js?v=roulette-list-2';

export function miniGamesList(state){
 return '<section class="section mini-games-catalog"><h2>ミニゲーム</h2><p class="mini-games-lead">好きなゲームで、今日の運だめし！</p><div class="mini-games-list">'+miniGames.map(game=>{
  const status=gameStatus(state,game.id),held=gameHeld(state,game.id);
  const label=!status.visible?'ただいまお休み中':held?'受け取れるポイントがあります':status.remaining?'本日あと '+status.remaining+' 回':'本日の挑戦は終了しました';
  const illustration=game.id==='roulette'?rouletteArt(null,'',rouletteValues(state)):game.id==='dice'?bowl([4,2]):omikujiArt();
  return `<a class="mini-game-card" href="#home/minigames/${game.id}"><span class="mini-game-art" aria-hidden="true">${illustration}</span><span class="mini-game-copy"><strong>${game.title}</strong><span>${game.description}</span><small>${label}</small><span class="mini-game-cta">遊ぶ</span></span><span class="mini-game-arrow" aria-hidden="true">${chevron()}</span></a>`;
 }).join('')+'</div></section>';
}

// Dice composition follows Tameruko-Preview-20261008; fortune follows Li's preview.
export function createGameView({game,getState,button,esc}){
 const art=(result,phase='')=>game.id==='roulette'?rouletteArt(result,phase,rouletteValues(getState())):game.id==='omikuji'
  ?omikujiArt(result?.dice,phase,false,result?fortuneLabel(result):'運勢')
  :bowl([4,2],phase);
 const remaining=st=>Math.max(0,Math.min(st.remaining,3-st.used));
 function resultHeading(result){
  if(game.id==='roulette')return `<h3>${result.amount>0?'おめでとう！':'また次のチャンスに！'}</h3>`;
  if(game.id==='dice'){
   const label=diceResultLabel(result);
   return `<h3>${label}</h3>`;
  }
  const label=fortuneLabel(result),level=({'大吉':'great','中吉':'medium','小吉':'small','吉':'good'})[label]||'quiet';
  const message=({'大吉':'うれしい幸運が訪れそう！','中吉':'新しい挑戦にツキがある日。','小吉':'小さな幸せが見つかりそう。','吉':'身近なところに幸運のきざし！','末吉':'焦らず、自分のペースで。'})[label];
  return `<div class="ch-result-heading fortune-${level}"><span class="sr-only">${label}</span><p class="ch-result-fortune">${message}</p></div>`;
 }
 function choice(st){
  const left=remaining(st),held=gameHeld(getState(),game.id);
  return `<div class="chinchiro-play">${art()}${left===0?'<div class="ch-attempts is-finished" role="status"><p>本日の挑戦は終了しました。<br><span>また明日もチャレンジしてね</span></p></div>':''}${left?`<p class="ch-boost-hint">当選確率20%アップ</p>${button('動画を見てスタート','chinchiro-boost','btn primary wide','aria-label="動画を見てスタート、当選確率20%アップ"')}${button('スタート','chinchiro-roll','btn secondary wide','aria-label="スタート"')}`:''}${held?button('戻ってポイントを受け取る','chinchiro','text-link wide ch-return-claim'):''}</div>`;
 }
 function sheet(st,result=gameHeld(getState(),game.id),rolling=false){
  const left=remaining(st);
  if(rolling)return `<div class="chinchiro-play rolling">${art(result,'tossing')}<div class="ch-roll-callout" role="status"><span class="ch-roll-eyebrow">なにが出るかな？</span><strong>${game.id==='roulette'?'ルーレット回転中！':game.id==='dice'?'いざ、勝負！':'今日の運勢を占っています'}</strong><span class="ch-roll-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div>`;
  if(!result)return choice(st);
  const win=result.amount>0&&(game.id!=='dice'||diceResultLabel(result)!=='奇数');
  const diceResult=game.id==='dice'?`<div class="dice-result ${win?'is-win':'is-miss'}" role="status">${win?diceConfetti:''}<span class="dice-result-state">${win?'当たり！':'はずれ'}</span><div class="dice-result-medallion">${resultHeading(result)}${resultDice(result)}${win?`<div class="dice-result-reward"><span class="dice-result-reward-label">当選ポイント</span><div class="ch-win-points">${pointAmount(result.amount)}</div></div>`:''}</div>${!win&&!left?'<p class="dice-result-note">また明日もチャレンジしてね</p>':''}</div>`:'';
  return `<div class="chinchiro-play result">${game.id==='dice'?'':art(result,'settled')}${diceResult|| (win?`<div class="ch-win" role="status">${resultHeading(result)}<div class="ch-win-points">${pointAmount(result.amount)}</div></div>`:`${resultHeading(result)}<p>次のチャンスに挑戦しよう</p>`)}${win?`${button('動画を見て受け取る','chinchiro-claim','btn primary wide')}${left?button('受け取らずにもう一度チャレンジ','chinchiro-retry','btn secondary wide','aria-label="受け取らずにもう一度チャレンジ"'):''}${left?'<p class="tiny">再挑戦すると今回のポイントはなくなります。</p>':''}`:left?button(game.id==='dice'?'もう一度チャレンジ':'遊ぶ','chinchiro-retry','btn primary wide'): '<p class="tiny">本日の挑戦は終了しました。</p>'}</div>`;
 }
 return {sheet,choice};
}
