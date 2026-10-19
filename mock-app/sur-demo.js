// Illustrative stages for the existing fictional game offers. Totals keep their original rewards.
export const gameSurDemoStages={
 'starquest':[{label:'初回会員登録',reward:5000},{label:'ステージ1をクリア',reward:10000},{label:'ステージ2をクリア',reward:10000},{label:'ステージ3をクリア',reward:20000}],
 'cafe-game':[{label:'初回会員登録',reward:10000},{label:'カフェをレベル3にする',reward:8000},{label:'カフェをレベル5にする',reward:10000},{label:'カフェをレベル7にする',reward:12000},{label:'カフェをレベル10にする',reward:20000}],
 'ocean-game':[{label:'初回会員登録',reward:3000},{label:'パズルを10面クリア',reward:5000},{label:'パズルを15面クリア',reward:7000},{label:'パズルを20面クリア',reward:15000}]
};
export function ensureGameSurDemo(state){
 let changed=false;
 for(const offer of state.nacs?.offers||[]){
  const stages=gameSurDemoStages[offer.id];
  // Preserve edited stage definitions and any past conversions made under the former flat fixture.
  if(!stages||!offer.description?.includes('モック用の架空サービス')||offer.sur?.length||state.user?.cases?.some(c=>c.offerId===offer.id)||offer.base!==stages.reduce((sum,s)=>sum+s.reward,0))continue;
  offer.sur=structuredClone(stages);changed=true;
 }
 return changed;
}
