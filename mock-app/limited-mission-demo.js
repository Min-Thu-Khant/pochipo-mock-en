import {dailyMissionGroups} from './model.js';

// Preview data only. Do not restore a mission removed or edited by the operator.
export function ensureLimitedCreditCardDemo(state){
 if(state.limitedCreditCardDemoV1)return false;
 const group=dailyMissionGroups(state)[0];
 if(!group.missions.some(m=>m.id==='limited-credit-card-demo'))group.missions.push({
  id:'limited-credit-card-demo',kind:'affiliate',missionType:'limited',
  title:'クレジットカードを1枚作る',sub:'対象案件が判定中になると受け取り可能',
  offerMode:'specific',offerId:'card',to:'offer/card',targetCount:1,reward:100,
  startDate:'2026-09-01',endDate:'2026-12-31',enabled:true,
 });
 state.limitedCreditCardDemoV1=true;
 return true;
}
