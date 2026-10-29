import {monthEndExpiryMarkup} from './point-expiry-view.js';

// My Page and the report share the same exchange action and expiry placement.
export function pointWalletActionsMarkup(state,{conditions,pt,esc,icon,link,signupAction=''}){
 const {text}=conditions;
 return `<p class="mypage-exchange-state ${text.state}"><i aria-hidden="true"></i>${esc(text.label)}<i aria-hidden="true"></i></p>${signupAction||link(`${icon('gift')}好きなポイントに交換`,'exchange-destinations','btn primary wide')}${monthEndExpiryMarkup(state,{pt,esc})}`;
}
