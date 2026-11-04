import {translateEnglish} from './english-text.js';
import {newerId} from './f03-display.js';
// Preview-only occurrence counts, not production analytics.
export const DEMO_SEARCH_CV_COUNTS=Object.freeze({
 card:120,'luna-card':80,'leaf-card':60,'trip-card':100,
 pay:110,sec:90,shop:70,travel:50,video:40,game:30
});

const DAY_MS=86400000;
function dayNumber(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return NaN;
 const value=Date.parse(date+'T00:00:00Z');
 return Number.isFinite(value)&&new Date(value).toISOString().slice(0,10)===date?value/DAY_MS:NaN;
}
// Daily rows use JST calendar dates and counts of CV occurrences, not approvals.
export function recentSearchCvCounts(rows,today){
 const end=dayNumber(today),counts=Object.create(null);
 if(!Number.isFinite(end))return counts;
 for(const row of rows||[]){
  const date=dayNumber(row.date),count=Number(row.count);
  if(!row.offerId||!Number.isFinite(date)||date<end-29||date>end||!Number.isInteger(count)||count<0)continue;
  counts[row.offerId]=(counts[row.offerId]||0)+count;
 }
 return counts;
}
export function searchCvCounts(state){
 const rows=state.searchCvDaily??Object.entries(DEMO_SEARCH_CV_COUNTS)
  .map(([offerId,count])=>({offerId,date:state.date,count}));
 return recentSearchCvCounts(rows,state.date);
}

export function searchOffers(offers,keyword,cvCounts=DEMO_SEARCH_CV_COUNTS){
 const query=String(keyword??'').trim();
 if(!query)return [];
 const count=id=>{
  const value=Number(cvCounts?.[id]??0);
  return Number.isFinite(value)&&value>=0?value:0;
 };
 return offers.filter(o=>(String(o.name??'').includes(query)||translateEnglish(o.name).toLowerCase().includes(query.toLowerCase())))
  .sort((a,b)=>count(b.id)-count(a.id)||newerId(a,b));
}
