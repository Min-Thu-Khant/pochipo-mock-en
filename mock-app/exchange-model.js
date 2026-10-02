import {consumePoints,effectiveBalance} from './point-ledger.js';
export const exchangeErrors={inactive:'ドットマネーのアカウントが利用停止中です。ヘルプをご確認ください。',limit:'ドットマネーの残高上限に達しています。ドットマネーを利用してから再度お試しください。',points:'ポイント口座を確認できません。時間をおいて再度お試しください。',service:'ドットマネーと通信できません。送金予約を保持しています。時間をおいて再試行してください。',queue:'送信に失敗しました。送金予約は保持されています。再試行してもポイントは重複して消費されません。'};
export function exchangeAccount(s){return s.user.exchangeAccount??={status:'unlinked',balance:0};}
export function connectExchange(s){const a=exchangeAccount(s);a.status='active';a.id='mock-dotmoney-'+(s.accountAuth?.active||'demo');return a;}
export function createExchange(s,{id,amount}){
 const old=s.user.exchangeRequests?.find(x=>x.id===id);if(old)return old;
 if(!s.accountAuth?.active||!s.user.sms)throw Error('本人確認からやり直してください。');
 const a=exchangeAccount(s);if(a.status!=='active')throw Error(a.status==='unlinked'?'ドットマネーとの連携を完了してください。':exchangeErrors.inactive);
 if(['inactive','limit','points'].includes(s.exchangeFailure))throw Error(exchangeErrors[s.exchangeFailure]);
 if(!Number.isSafeInteger(amount)||amount<100||amount%100||amount>effectiveBalance(s))throw Error('100pt以上、100pt単位で交換可能ポイントの範囲内を入力してください。');
 const totals=s.exchangeTotals??{};const used=totals[s.date]??(!s.exchangeUsedDate||s.exchangeUsedDate===s.date?s.exchangeUsedToday:0)??0;
 if(s.scenario==='cap'||used+amount>s.limits.exchangeDailyCap)throw Error('本日のサービス全体の交換上限に達しています。翌日お試しください。');
 const copy=structuredClone(s);copy.user.exchangeRequests??=[];
 const r={id,amount,money:amount/100,status:'pending',date:s.date,attempts:0};copy.user.exchangeRequests.push(r);
 consumePoints(copy,{requestId:'exchange:'+id,amount,title:'ドットマネーへの交換',desc:(amount/100).toLocaleString()+'マネー・手数料0円'});
 s.user=copy.user;s.exchangeTotals??={};s.exchangeTotals[s.date]=used+amount;s.exchangeUsedDate=s.date;s.exchangeUsedToday=used+amount;return r;
}
export function sendExchange(s,id){const r=s.user.exchangeRequests?.find(x=>x.id===id);if(!r)throw Error('交換申請が見つかりません。');if(r.status==='completed')return r;
 r.attempts++;if(exchangeErrors[s.exchangeFailure]){r.error=exchangeErrors[s.exchangeFailure];return r;}
 const a=exchangeAccount(s);if(a.status!=='active'){r.error=exchangeErrors.inactive;return r;}
 a.balance+=r.money;r.status='completed';r.error='';r.completedAt=s.date;r.moneyBalance=a.balance;return r;
}
