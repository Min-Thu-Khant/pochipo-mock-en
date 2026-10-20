import {nextExpiry} from './point-ledger.js';

// Shared by My Page and the points report so the label and amount stay in sync.
export function monthEndExpiryMarkup(state,{pt,esc}){
 const next=nextExpiry(state);
 const expiry=next?.date.slice(0,7)===state.date.slice(0,7)?next:null;
 return `<p class="mypage-expiry">今月末の失効予定：${expiry?`${esc(expiry.date)}・${pt(expiry.amount)}pt`:'0pt'}</p>`;
}
