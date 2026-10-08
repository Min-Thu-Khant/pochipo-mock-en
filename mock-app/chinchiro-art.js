// Original bowl and dice animation, shared with the component preview.
export const CHINCHIRO_ROLL_MS=1800;
function diceFace(n){return `<span class="die" data-n="${n}" aria-label="${n}"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>`;}
export function bowl(dice=[4,2,5],phase='',spill=false){return `<div class="ch-bowl-scene ${phase} ${spill?'spill':''}"><div class="ch-bowl-shadow"></div><div class="ch-bowl"><div class="ch-bowl-rim"></div><div class="ch-bowl-dice">${dice.map((v,i)=>`<div class="bowl-die die-${i}">${diceFace(v)}</div>`).join('')}</div><span class="bowl-pattern">福</span></div></div>`;}
export function settleChinchiro(root){
  const scene=root.querySelector('.ch-bowl-scene.tossing');
  if(!scene)return false;
  scene.classList.replace('tossing','settled');
  const play=scene.closest('.chinchiro-play');play?.classList.replace('rolling','result');
  const copy=play?.querySelector('.ch-result-copy');copy?.removeAttribute('inert');copy?.removeAttribute('aria-hidden');
  return true;
}
