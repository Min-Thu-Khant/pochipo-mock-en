// Local mock classification. Explicit fee/category tags from the feed take priority.
export const reportCostOptions={free:'完全無料',trial:'初回無料',paid:'有料'};
export const emptyReportFilters=()=>({costs:[],categories:[]});
export const reportFilterCount=filters=>filters.costs.length+filters.categories.length;

const categoryOptions=['ゲーム','アプリ','クレジットカード','銀行・決済','証券・投資','通販・日用品','コスメ・美容','家具・インテリア','旅行・宿泊','アンケート'];
export function recommendationCategory(offer){
 if(offer.kind==='survey'||offer.category==='アンケート')return 'アンケート';
 if(offer.reportCategory)return offer.reportCategory;
 const text=String(offer.name||'')+' '+String(offer.condition||'');
 if(offer.category==='金融'){
  if(offer.creditCard||offer.art==='card'||/カード/.test(text))return 'クレジットカード';
  if(/証券|投資|FX/.test(text))return '証券・投資';
  if(/口座|銀行|決済|チャージ/.test(text))return '銀行・決済';
  return 'その他金融';
 }
 if(offer.category==='買い物'){
  if(/コスメ|美容|化粧/.test(text))return 'コスメ・美容';
  if(/インテリア|家具/.test(text))return '家具・インテリア';
  return '通販・日用品';
 }
 if(offer.category==='旅行')return '旅行・宿泊';
 return offer.category||'その他';
}

export function recommendationTraits(offer){
 const cost=String(offer.cost||'').trim(),condition=String(offer.condition||'');
 let costType=Object.hasOwn(reportCostOptions,offer.costType)?offer.costType:'';
 if(!costType){
  // Annual-fee-free cards still require purchases; lodging is not a free action.
  if(/購入|ショッピング利用|万円利用|利用条件達成|宿泊完了/.test(condition))costType='paid';
  else if(/初回無料|無料体験|無料トライアル|初月無料/.test(cost))costType='trial';
  else if(/購入|有料|年会費あり/.test(cost))costType='paid';
  else if(/^(完全)?無料$/.test(cost)&&!/入金|チャージ|取引/.test(condition))costType='free';
 }
 return {costType};
}

export function matchesReportFilters(item,filters=emptyReportFilters()){
 const traits=item.kind==='survey'
  ?{costType:'free'}
  :recommendationTraits(item);
 return (!filters.costs.length||filters.costs.includes(traits.costType))
  &&(!filters.categories.length||filters.categories.includes(recommendationCategory(item)));
}

export function reportCategories(values,filters=emptyReportFilters()){
 return [...new Set([...categoryOptions,
  ...(values.candidates||[]).map(recommendationCategory),...filters.categories])].filter(Boolean);
}
