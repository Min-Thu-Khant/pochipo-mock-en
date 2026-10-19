import {visibleOffers} from './model.js';
import {saveHighRewardManual} from './high-reward-model.js';

// モック専用の初期データ。掲載判定の例外や空一覧のフォールバックではない。
// 運営が保存した空設定・翌月予約・旧設定も含め、既存設定は上書きしない。
export function ensureHighRewardDemo(s){
 const settings=s.highRewardTab;
 if(settings&&(Object.hasOwn(settings,'months')||Object.hasOwn(settings,'manual')||settings.demoSeeded))return false;
 const preferred=['trip-card','luna-card','card','leaf-card','sec','travel'];
 const eligible=visibleOffers(s),byId=new Map(eligible.map(o=>[o.id,o]));
 const ids=[...preferred.filter(id=>byId.has(id)),...eligible.map(o=>o.id).filter(id=>!preferred.includes(id))].slice(0,6);
 if(!ids.length)return false;
 saveHighRewardManual(s,ids.map((offerId,i)=>({offerId,order:i+1})));
 s.highRewardTab.demoSeeded=true;
 return true;
}
