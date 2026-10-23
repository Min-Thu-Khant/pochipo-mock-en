import {bowl,DICE_ROLL_MS} from '../../chinchiro-art.js';
import {resultDice} from '../../dice-result-art.js';

// An isolated component example. Never draw, save or award an app reward here.
export {DICE_ROLL_MS};
export function dicePreviewMarkup(rolling=false){
 return `<div class="chinchiro-stage" data-game="dice"><div class="chinchiro-play ${rolling?'rolling':'result'}">${rolling?bowl([4,2],'tossing'):resultDice({dice:[1,1],prize:{id:'pin'},amount:200})}${rolling?'<span role="status">いざ、勝負！</span>':'<b>Pゾロの表示例</b>'}</div></div>`;
}
