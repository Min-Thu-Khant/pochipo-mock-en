// Browser-only ledger. No production points or money are transferred.
export function expiryDate(date){const d=new Date(date.slice(0,7)+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+6);d.setUTCDate(0);return d.toISOString().slice(0,10);}
export function ensurePointAccount(s){
 const u=s.user;u.history??=[];
 if(!u.pointAccount)u.pointAccount={lots:u.approved>0?[{id:'opening',remaining:u.approved,expires:expiryDate(s.date),processed:false}]:[],requests:{},sequence:0};
 const a=u.pointAccount;
 // Reconcile legacy mock controls that still change the opening balance directly.
 const diff=u.approved-a.lots.reduce((n,l)=>n+l.remaining,0);
 if(diff>0)a.lots.push({id:crypto.randomUUID(),remaining:diff,expires:expiryDate(s.date),processed:false});
 if(diff<0){let left=-diff;for(const l of a.lots){const n=Math.min(l.remaining,left);l.remaining-=n;left-=n;if(!left)break;}}
 return a;
}
export function effectiveBalance(s){return ensurePointAccount(s).lots.filter(l=>l.expires>=s.date&&!l.processed).reduce((n,l)=>n+l.remaining,0);}
export function nextExpiry(s){const lots=ensurePointAccount(s).lots.filter(l=>l.remaining>0&&!l.processed&&l.expires>=s.date).sort((a,b)=>a.expires.localeCompare(b.expires));if(!lots.length)return null;return {date:lots[0].expires,amount:lots.filter(l=>l.expires===lots[0].expires).reduce((n,l)=>n+l.remaining,0)};}
function transaction(s,a,{id,title,amount,category,desc='',expires}){const row={id,title,amount,category,desc,expires,date:s.date,status:'approved',sequence:++a.sequence};s.user.history.unshift(row);return row;}
export function creditPoints(s,{requestId=crypto.randomUUID(),title,amount,category='ADMIN',desc=''}){
 const a=ensurePointAccount(s);if(a.requests[requestId])return false;
 if(!Number.isSafeInteger(amount)||amount<=0)throw Error('付与ポイントは正の整数で指定してください。');
 const expires=expiryDate(s.date);a.lots.push({id:requestId,remaining:amount,expires,processed:false});
 s.user.approved+=amount;s.user.earned+=amount;a.requests[requestId]=true;
 transaction(s,a,{id:requestId,title,amount,category,desc,expires});return true;
}
export function consumePoints(s,{requestId,title='ポイント交換',amount,category='EXCHANGE',desc=''}){
 const a=ensurePointAccount(s);if(a.requests[requestId])return false;
 if(!Number.isSafeInteger(amount)||amount<=0||amount>effectiveBalance(s))throw Error('交換可能ポイントが不足しています。');
 let left=amount;for(const l of a.lots.filter(l=>!l.processed&&l.expires>=s.date).sort((a,b)=>a.expires.localeCompare(b.expires))){const n=Math.min(left,l.remaining);l.remaining-=n;left-=n;if(!left)break;}
 s.user.approved-=amount;a.requests[requestId]=true;transaction(s,a,{id:requestId,title,amount:-amount,category,desc});return true;
}
export function expirePoints(s,{failAfter=Infinity}={}){
 const a=ensurePointAccount(s);let count=0,amount=0;
 for(const l of a.lots.filter(l=>!l.processed&&l.expires<s.date)){
  if(count>=failAfter)throw Error('失効処理を中断しました。再実行すると未処理分から再開します。');
  if(l.remaining){transaction(s,a,{id:'expire:'+l.id,title:'有効期限による失効',amount:-l.remaining,category:'EXPIRE',desc:l.expires+'期限分'});s.user.approved-=l.remaining;amount+=l.remaining;count++;}
  l.remaining=0;l.processed=true;
 }return {count,amount};
}
