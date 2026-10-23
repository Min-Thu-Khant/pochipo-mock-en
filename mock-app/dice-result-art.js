import {diceFace} from './chinchiro-art.js';
import {diceResultLabel} from './mini-games-model.js?v=roulette-list-2';

// New draws use two dice. Keep a display adapter for same-day legacy results
// so an already saved reward can still be received without redrawing.
export function resultFaces(result){
 if(result.dice.length===2)return result.dice;
 const label=diceResultLabel(result),first=result.dice[0];
 if(label==='Pゾロ')return [1,1];
 if(label==='ゾロ目')return [first,first];
 return [first,label==='偶数'?(first+1)%6+1:first===6?5:first+1];
}
const pointCoinUrl=new URL('./assets/point-coin.png',import.meta.url).href;
let coinFilterSequence=0;
export function resultDice(result){
 const pin=diceResultLabel(result)==='Pゾロ';
 const filterId=`dice-red-coin-${++coinFilterSequence}`;
 const redCoin=`<defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".92 0 .08 0 0 .3 0 .7 0 0 .3 0 .7 0 0 0 0 0 1 0"/></filter></defs>`;
 return `<div class="dice-result-faces">${pin?`<svg width="0" height="0" aria-hidden="true" style="position:absolute">${redCoin}</svg>`:''}${resultFaces(result).map(n=>diceFace(n,{
  className:'dice-result-die',
  topMark:pin&&n===1?`<image class="dice-p-coin" href="${pointCoinUrl}" x="-.7" y="-.7" width="1.4" height="1.4" filter="url(#${filterId})"/>`:''
 })).join('')}</div>`;
}
export const diceConfetti='<span class="dice-result-confetti" aria-hidden="true">'+Array.from({length:10},()=>'<i></i>').join('')+'</span>';
