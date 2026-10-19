import {rouletteArt,rouletteValues} from './roulette-art.js?v=round-cat';
import {chevron} from './chevron.js';
import {bowl} from './chinchiro-art.js';
import {omikujiArt} from './omikuji-art.js';
import {pointAmount} from './point-symbol.js';
import {miniGames,gameStatus,gameHeld,fortuneLabel} from './mini-games-model.js?v=roulette-list-2';

export function miniGamesList(state){
 return '<section class="section mini-games-catalog"><h2>ミニゲーム</h2><p class="mini-games-lead">好きなゲームで、今日の運だめし！</p><div class="mini-games-list">'+miniGames.map(game=>{
  const status=gameStatus(state,game.id),held=gameHeld(state,game.id);
  const label=!status.visible?'ただいまお休み中':held?'受け取れるポイントがあります':status.remaining?'本日あと '+status.remaining+' 回':'本日の挑戦は終了しました';
  const illustration=game.id==='roulette'?rouletteArt(null,'',rouletteValues(state)):game.id==='dice'?bowl():omikujiArt();
  return `<a class="mini-game-card" href="#home/minigames/${game.id}"><span class="mini-game-art" aria-hidden="true">${illustration}</span><span class="mini-game-copy"><strong>${game.title}</strong><span>${game.description}</span><small>${label}</small><span class="mini-game-cta">遊ぶ</span></span><span class="mini-game-arrow" aria-hidden="true">${chevron()}</span></a>`;
 }).join('')+'</div></section>';
}

// Dice composition follows Tameruko-Preview-20261008; fortune follows Li's preview.
export function createGameView({game,getState,button,esc}){
 const art=(result,phase='')=>game.id==='roulette'?rouletteArt(result,phase,rouletteValues(getState())):game.id==='omikuji'
  ?omikujiArt(result?.dice,phase,false,result?fortuneLabel(result):'運勢')
  :bowl(result?.dice,phase,result?.prize.id==='spill');
 const remaining=st=>Math.max(0,Math.min(st.remaining,3-st.used));
 function resultHeading(result){
  if(game.id==='roulette')return `<h3>${result.amount>0?'おめでとう！':'また次のチャンスに！'}</h3>`;
  if(game.id==='dice')return `<h3>${esc(result.prize.label)}<small>（${result.dice.join('・')}）</small></h3>`;
  const label=fortuneLabel(result),level=({'大吉':'great','中吉':'medium','小吉':'small','吉':'good'})[label]||'quiet';
  const message=({'大吉':'うれしい幸運が訪れそう！','中吉':'新しい挑戦にツキがある日。','小吉':'小さな幸せが見つかりそう。','吉':'身近なところに幸運のきざし！','末吉':'焦らず、自分のペースで。'})[label];
  return `<div class="ch-result-heading fortune-${level}"><span class="sr-only">${label}</span><p class="ch-result-fortune">${message}</p></div>`;
 }
 function choice(st){
  const left=remaining(st),held=gameHeld(getState(),game.id);
  return `<div class="chinchiro-play">${art()}<div class="ch-attempts ${left===0?'is-finished':''}" role="status"><div class="ch-attempts-count"><span>本日あと</span><strong>${left}</strong><span>回</span></div>${left===0?'<p>本日の挑戦は終了しました。<br><span>また明日、運だめし！</span></p>':''}</div>${held?`<p class="tiny">再挑戦すると、未受取の${pointAmount(held.amount)}はなくなります。</p>`:''}${left?`${button('遊ぶ','chinchiro-boost','btn primary wide','aria-label="動画を見て当選確率UPで遊ぶ"')}${button('遊ぶ','chinchiro-roll','btn secondary wide','aria-label="そのまま遊ぶ"')}<p class="tiny ch-play-notes"><span>当選確率UPは今回のみ。獲得ポイントは変わりません。</span><span>当選ポイントの受け取りには動画視聴が必要です。</span></p>`:''}${held?button('当たりに戻る','chinchiro','text-link wide'):''}</div>`;
 }
 function sheet(st,result=gameHeld(getState(),game.id),rolling=false){
  const left=remaining(st);
  if(rolling)return `<div class="chinchiro-play rolling">${art(result,'tossing')}<div class="ch-roll-callout" role="status"><span class="ch-roll-eyebrow">なにが出るかな？</span><strong>${game.id==='roulette'?'ルーレット回転中！':game.id==='dice'?'いざ、勝負！':'今日の運勢を占っています'}</strong><span class="ch-roll-dots" aria-hidden="true"><i></i><i></i><i></i></span></div></div>`;
  if(!result)return choice(st);
  const win=result.amount>0;
  return `<div class="chinchiro-play result">${art(result,'settled')}${win?`<div class="ch-win" role="status">${resultHeading(result)}<div class="ch-win-points">${pointAmount(result.amount)}</div></div>`:`${resultHeading(result)}<p>次のチャンスに挑戦しよう</p>`}${win?`<p class="ch-claim-hint">＼ 当たったポイントを自分のものに！ ／</p>${button('動画を見て'+pointAmount(result.amount)+'を受け取る','chinchiro-claim','btn primary wide')}${left?button('遊ぶ','chinchiro-retry','btn secondary wide','aria-label="受け取らずに再挑戦"'):''}${left?'<p class="tiny">再挑戦すると今回のポイントはなくなります。次はハズレになることもあります。</p>':''}`:left?button('遊ぶ','chinchiro-retry','btn primary wide'): '<p class="tiny">本日の挑戦は終了しました。また明日！</p>'}</div>`;
 }
 return {sheet,choice};
}
