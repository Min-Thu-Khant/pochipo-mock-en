// ATT belongs to the native app. Web previews use an explicitly simulated status.
export const trackingStatuses=['authorized','denied','notDetermined','restricted'];
export const normalizeTracking=value=>trackingStatuses.includes(value)?value:'unknown';
export const needsTracking=(os,status)=>os==='ios'&&status!=='authorized';

export function applicationURL(offer){
  try {
    const url=new URL(offer?.clickUrl);
    if(!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;
    // Seed data uses reserved example domains, not real application pages.
    if(/(^|\.)(example|invalid|test)$/.test(url.hostname))return null;
    return url.href;
  } catch {return null;}
}

export function outboundDecision(state,offer,status){
  if(!offer||offer.active===false)return {error:'この案件は現在ご利用いただけません。'};
  if((offer.start&&offer.start>state.date)||(offer.end&&offer.end<state.date))return {error:'現在チャレンジ期間外です。'};
  if(offer.platforms&&!offer.platforms.includes(state.os||'ios'))return {error:'お使いの端末ではチャレンジできません。'};
  if(needsTracking(state.os||'ios',status))return {settings:true};
  const url=applicationURL(offer);
  return url?{url}:{error:'申し込みページを開けません。URLが未設定、または利用できない形式です。'};
}

export async function readTracking(native,simulatedStatus){
  if(!native)return normalizeTracking(simulatedStatus??'notDetermined');
  // A broken native connection must never fall back to a simulated permission.
  let timer;
  try{return normalizeTracking(await Promise.race([
    Promise.resolve().then(()=>native.getTrackingAuthorizationStatus()),
    new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),3000);})
  ]));}catch{return 'unknown';}finally{clearTimeout(timer);}
}
