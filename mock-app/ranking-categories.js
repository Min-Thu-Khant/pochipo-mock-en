import {recommendationCategory} from './recommendation-filters.js';

export const RANKING_TABS=[['all','総合'],['credit','カード'],['finance','口座開設'],['game','ゲーム'],['entertainment','エンタメ'],['shopping','買い物'],['travel','旅行']];
export function matchesRankingCategory(offer,key){
 if(key==='all')return true;
 const category=recommendationCategory(offer);
 if(key==='credit')return category==='クレジットカード';
 if(key==='finance')return ['銀行・決済','証券・投資'].includes(category);
 if(key==='travel')return category==='旅行・宿泊';
 if(key==='game')return category==='ゲーム';
 if(key==='shopping')return ['通販・日用品','コスメ・美容','家具・インテリア','買い物'].includes(category);
 if(key==='entertainment')return category==='エンタメ'||(category==='アプリ'&&/動画|音楽|映画|ライブ配信|電子書籍|マンガ|漫画|VOD/.test(String(offer.name||'')+' '+String(offer.condition||'')));
 return false;
}
