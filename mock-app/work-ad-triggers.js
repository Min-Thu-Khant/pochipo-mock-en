// One acquisition per work reward, at its first credit (pending or immediate).
const workCategories=new Set(['STEP','REWARD_AD','SURVEY','MISSION','AFFILIATE','AFFILIATE_RATE','CHINCHIRO','RECEIPT']);
export const defaultWorkAdDelivery={enabled:true,rewardEvery:3};
export function workAdConfig(s){return {enabled:s.adDelivery?.enabled??true,rewardEvery:s.adDelivery?.rewardEvery??defaultWorkAdDelivery.rewardEvery};}
export function workAdProgress(s){return s.user.workAdProgress??={seen:[],total:0,sinceThreshold:0,reportHandledThrough:0,queue:[]};}
export function recordWorkReward(s,{id,amount,category}){
 if(!id||!(amount>0)||!workCategories.has(category))return false;
 const p=workAdProgress(s);if(p.seen.includes(id))return false;
 p.seen.push(id);p.total++;p.sinceThreshold++;
 const config=workAdConfig(s);
 if(p.sinceThreshold>=config.rewardEvery){p.sinceThreshold=0;if(config.enabled)p.queue.push({id:'reward:'+p.total,kind:'reward',through:p.total});}
 return true;
}
export function reportRewardSnapshot(s){return s.user.workAdProgress?.total||0;}
export function queueReportReturnAd(s,viewedThrough){
 const p=workAdProgress(s);
 if(!Number.isSafeInteger(viewedThrough)||viewedThrough<=p.reportHandledThrough||viewedThrough>p.total)return false;
 p.reportHandledThrough=viewedThrough;
 if(!workAdConfig(s).enabled)return false;
 p.queue.push({id:'report:'+viewedThrough,kind:'report-return',through:viewedThrough});return true;
}
export function finishWorkAd(s,id){const p=workAdProgress(s);const i=p.queue.findIndex(x=>x.id===id);if(i>=0)p.queue.splice(i,1);}
