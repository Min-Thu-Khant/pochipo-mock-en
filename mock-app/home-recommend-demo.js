import {offersOf} from './model.js';
import {offerAttributes} from './f03-display.js';
import {homeRecommendSettings} from './home-recommend-settings.js';
export const HOME_DEMO_ATTRIBUTES={pointUp:'ホーム_期間限定ポイントアップ',popular:'ホーム_人気案件',recommended:'ホーム_おすすめ案件',challenges:'ホーム_チャレンジボーナス',callout:'ホーム_最高還元'};
// Assign attributes to the existing sample offers; do not change publication or reward settings.
export function ensureHomeRecommendDemo(state){
 if(state.homeRecommendationDemoVersion>=1)return false;
 const settings=homeRecommendSettings(state),offers=offersOf(state),existing=new Map(offers.map(o=>[o.id,o]));
 const groups={pointUp:['card','pay','trip-card','sec','luna-card','shop','leaf-card','travel'],popular:['card','pay','trip-card','sec','luna-card','shop'],recommended:['leaf-card','travel','starquest','ocean-game','marche','interior'],challenges:[...new Set((state.slots||[]).filter(slot=>slot.kind==='challenge').map(slot=>slot.destination))],callout:['card','sec']};
 for(const [key,ids] of Object.entries(groups)){
  for(const id of ids){const offer=existing.get(id);if(!offer)continue;const raw=state.nacs?.offers?.find(o=>o.id===id);if(raw)raw.bundleTags=[...new Set([...offerAttributes(offer),HOME_DEMO_ATTRIBUTES[key]])];const bundle=state.operatorWorkflows?.bundles?.find(b=>b.selectedId===id);if(bundle)bundle.tags=[...new Set([...(bundle.tags||[]),HOME_DEMO_ATTRIBUTES[key]])];if(raw)existing.set(id,raw);}
 }
 for(const row of settings.sections)if(HOME_DEMO_ATTRIBUTES[row.key]&&!row.bundleAttribute)row.bundleAttribute=HOME_DEMO_ATTRIBUTES[row.key];
 if(!settings.calloutAttribute)settings.calloutAttribute=HOME_DEMO_ATTRIBUTES.callout;
 state.homeRecommendation=settings;state.homeRecommendationDemoVersion=1;
 return true;
}
