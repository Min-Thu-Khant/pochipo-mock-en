// Local mock values stand in for ASP-provided fields; no EPC is calculated here.
const sampleEpc={travel:18,shop:24,marche:12,card:90,pay:32,sec:75,game:8,news:4,video:6};
const sampleAttributes={travel:['楽天'],shop:['楽天'],sec:['楽天'],pay:['yahoo'],marche:['yahoo'],card:['三井住友'],'luna-card':['三井住友'],news:['dポイント'],video:['dポイント'],interior:['Ponta'],cosme:['Ponta']};
export const newerId=(a,b)=>String(b.id).localeCompare(String(a.id),'en',{numeric:true});
export const offerAttributes=o=>o.bundleTags??o.bundleAttributes??sampleAttributes[o.id]??[];
export const bundleOffers=(list,attribute)=>list.filter(o=>offerAttributes(o).includes(attribute));
export function epcValue(o){const v=Object.hasOwn(o,'epc')?o.epc:sampleEpc[o.id];return v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;}
export function applyPins(s,list,surface){const code={'category:買い物':'LIST_SHOPPING','category:旅行':'LIST_TRAVEL','category:ゲーム':'LIST_GAME','category:アプリ':'LIST_APP','category:金融':'LIST_FINANCE','category:すべて':'LIST_ALL'}[surface],legacy=s.nacs?.lists?.find(l=>l.code===code),ids=s.nacs?.f03Pins?.[surface]??legacy?.offerIds?.filter(id=>legacy.pinnedIds?.includes(id))??[],rank=new Map(ids.map((id,i)=>[id,i]));return [...new Map(list.map(o=>[o.id,o])).values()].sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity)||0);}
export function epcOffers(s,list,surface){return applyPins(s,list.slice().sort((a,b)=>{const av=epcValue(a),bv=epcValue(b);return av===null?(bv===null?newerId(a,b):1):bv===null?-1:bv-av||newerId(a,b);}),surface);}
export function cvOffers(s,list,counts,surface){return applyPins(s,list.slice().sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0)||newerId(a,b)),surface);}
export function newOffers(s,list){const order=s.nacs?.newArrivalIds??s.nacs?.offers?.map(o=>o.id)??list.map(o=>o.id),rank=new Map(order.map((id,i)=>[id,i]));return applyPins(s,list.slice().sort((a,b)=>(rank.get(a.id)??Infinity)-(rank.get(b.id)??Infinity)||newerId(a,b)),'new');}
