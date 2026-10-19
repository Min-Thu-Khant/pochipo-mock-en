// Retire only the unapproved seeded travel-boost examples, not campaign capabilities.
const retiredIds=new Set(['autumn','winter','pill-autumn']);
const oldFeatureLead='旅行・お買い物でためる案件をまとめました。期間限定UPの案件はいまがチャンス。';
export function retireTravelBoostPreview(state){
 let changed=false;
 if(Array.isArray(state.slots)){
  const slots=state.slots.filter(slot=>!(slot.destination==='travel'&&retiredIds.has(slot.id)));
  if(slots.length!==state.slots.length){state.slots=slots;changed=true;}
 }
 const feature=state.features?.find(item=>item.id==='autumn-trip');
 if(feature?.lead===oldFeatureLead){feature.lead='旅行・お買い物でためる案件をまとめました。';changed=true;}
 return changed;
}
