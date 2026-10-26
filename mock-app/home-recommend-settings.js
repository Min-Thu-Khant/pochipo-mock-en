export const POINT_SERVICES=[['mile','マイル'],['vpoint','Vポイント'],['rakuten','楽天'],['paypay','PayPay'],['dpoint','dポイント'],['ponta','Ponta']];
export function homeRecommendSettings(state){return {campaignEnabled:true,campaignLine1:'ドットマネーへの',campaignLine2:'交換手数料ゼロ',pointServices:POINT_SERVICES.map(([id])=>id),pointUpOfferIds:null,popularOfferIds:null,recommendedOfferIds:null,calloutOfferIds:null,...state.homeRecommendation};}
export function recommendOffers(offers,ids,fallback){return ids===null?fallback:offers.filter(o=>ids.includes(o.id));}
export function validateHomeRecommendSettings(value,offers){
 const next={...value};
 for(const key of ['campaignLine1','campaignLine2']){next[key]=String(next[key]||'').trim();if(!next[key]||next[key].length>(key==='campaignLine1'?9:7))throw Error('吹き出しは1行目9文字、2行目7文字以内で入力してください。');}
 if(!Array.isArray(next.pointServices)||next.pointServices.some(id=>!POINT_SERVICES.some(([key])=>key===id)))throw Error('ポイント・マイルの種類が不正です。');
 const valid=new Set(offers.map(o=>o.id));
 for(const [key,max] of [['pointUpOfferIds',8],['popularOfferIds',6],['recommendedOfferIds',6],['calloutOfferIds',8]]){if(!Array.isArray(next[key])||next[key].length>max||new Set(next[key]).size!==next[key].length||next[key].some(id=>!valid.has(id)))throw Error(`掲載案件はポイントアップ8件、人気・おすすめ各6件までで選択してください。`);}
 if(next.calloutOfferIds.some(id=>!next.pointUpOfferIds.includes(id)))throw Error('「最高還元」は期間限定ポイントアップに選んだ案件に設定してください。');
 return next;
}
