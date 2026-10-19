import {offersOf,visibleOffers,offerTerms} from './model.js';

export const HIGH_REWARD_MIN=1_000_000;
export const HIGH_REWARD_LIMIT=100;
export const HIGH_REWARD_MANUAL_LIMIT=20;
export const HIGH_REWARD_SORT_NOTE='人気順の集計期間・指標は未定です。モックの自動枠は案件データの登録順で仮表示しています（人気順ではありません）。';
const points=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;

// maxRewardPoints は条件別の最大付与ポイントを提供側で算出した値。
// 率だけで上限額が不明な案件は、率をポイントとみなして自動掲載しない。
export function highRewardMaxPoints(s,o){
 const t=offerTerms(s,o.id);
 if(t.rewardMode==='rate')return points(o.maxRewardPoints);
 const base=points(o.maxRewardPoints)??(o.sur?.length?o.sur.reduce((n,step)=>n+(points(step.reward)??0),0):points(o.base));
 if(t.slot)return t.rewardMode==='multiplier'&&base!==null?Math.round(base*t.slot.reward):points(t.reward);
 return base;
}
export const validHighRewardMonth=v=>typeof v==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v);
function monthlyPlans(s){
 if(s.highRewardTab?.months)return s.highRewardTab.months;
 // 旧期間指定のデータは当月に有効な案件を当月設定として引き継ぐ。
 const legacy=s.highRewardTab?.manual;
 if(!Array.isArray(legacy)||!legacy.length)return {};
 const manual=legacy.filter(r=>r.start<=s.date&&r.end>=s.date).sort((a,b)=>a.order-b.order).slice(0,HIGH_REWARD_MANUAL_LIMIT).map((r,i)=>({offerId:r.offerId,order:i+1}));
 return {[s.date.slice(0,7)]:manual};
}
export function highRewardSettings(s,month=s.date.slice(0,7)){
 const months=monthlyPlans(s),sourceMonth=Object.keys(months).filter(m=>validHighRewardMonth(m)&&m<=month).sort().at(-1)||null;
 return {month,sourceMonth,inherited:!!sourceMonth&&sourceMonth!==month,configured:Object.hasOwn(months,month),popularity:{windowDays:null,metric:null},manual:sourceMonth?months[sourceMonth]:[]};
}
export function saveHighRewardManual(s,rows,month=s.date.slice(0,7)){
 if(!validHighRewardMonth(month))throw Error('対象月を正しく指定してください。');
 if(!Array.isArray(rows))throw Error('掲載案件を確認してください。');
 if(rows.length>HIGH_REWARD_MANUAL_LIMIT)throw Error('手動掲載は月ごとに最大20件です。');
 const ids=new Set(offersOf(s).map(o=>o.id)),seen=new Set(),orders=new Set();
 const manual=rows.map(row=>{
  if(!ids.has(row.offerId))throw Error('存在する案件を選択してください。');
  if(seen.has(row.offerId))throw Error('同じ案件は1件だけ登録してください。');
  if(!Number.isInteger(row.order)||row.order<1||row.order>20||orders.has(row.order))throw Error('表示順は重複しない1〜20の整数で指定してください。');
  seen.add(row.offerId);orders.add(row.order);
  return {offerId:row.offerId,order:row.order};
 }).sort((a,b)=>a.order-b.order);
 s.highRewardTab={...s.highRewardTab,months:{...monthlyPlans(s),[month]:manual}};
 return manual;
}
export function highRewardTabOffers(s){
 const eligible=visibleOffers(s),byId=new Map(eligible.map(o=>[o.id,o]));
 const seen=new Set(),manual=[];
 for(const row of [...highRewardSettings(s).manual].sort((a,b)=>a.order-b.order)){
  if(manual.length>=HIGH_REWARD_MANUAL_LIMIT)break;
  if(seen.has(row.offerId)||!byId.has(row.offerId))continue;
  seen.add(row.offerId);manual.push(byId.get(row.offerId));
 }
 // 集計条件が決まるまでは、既存の3日クリック順を流用しない。
 const automatic=eligible.filter(o=>!seen.has(o.id)&&(highRewardMaxPoints(s,o)??-1)>=HIGH_REWARD_MIN);
 return [...manual,...automatic].slice(0,HIGH_REWARD_LIMIT);
}
