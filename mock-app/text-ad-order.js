export const isTextAd=slot=>slot.kind==='ticker'||slot.placements?.includes('pill');
export const compareTextAds=(a,b)=>(a.displayOrder??Infinity)-(b.displayOrder??Infinity)||(b.priority??0)-(a.priority??0)||a.id.localeCompare(b.id);
// 既存の表示順を初期順として移行。後から追加した広告は末尾に置く。
export function normalizeTextAdOrder(state){
 const records=state.slots.filter(isTextAd);
 let last=Math.max(0,...records.map(s=>Number.isFinite(s.displayOrder)?s.displayOrder:0));
 for(const slot of records.filter(s=>!Number.isFinite(s.displayOrder)).sort(compareTextAds))slot.displayOrder=++last;
}
