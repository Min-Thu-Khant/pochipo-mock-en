// Explicit fixtures keep generic campaign tests independent of UI sample data.
export function campaignFixture(state,overrides={}){
 const slot={...state.slots.find(item=>item.id==='staff'),id:'test-campaign',name:'期間限定単価のテスト',destination:'travel',kind:'campaign',placements:['carousel','feed','popup'],rewardMode:'flat',reward:120000,priority:90,mission:true,notification:'獲得条件を確認してください。',...overrides};
 state.slots.push(slot);
 return slot;
}
