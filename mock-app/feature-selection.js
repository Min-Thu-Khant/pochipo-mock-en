// グループは最新の所属を参照し、個別の掲載／非掲載と保存した順序を優先する。
export function featureSelectedIds(state, feature) {
  if (feature.selectionMode !== 'selected') return [...new Set(feature.offerIds || [])];
  const tags = feature.bundleTags || [];
  const grouped = (state.nacs?.intake?.bundles || []).filter(b => (b.tags || []).some(t => tags.includes(t))).map(b => b.id);
  const excluded = new Set(feature.excludedOfferIds || []);
  const selected = new Set([...grouped, ...(feature.manualOfferIds || [])].filter(id => !excluded.has(id)));
  return [...new Set([...(feature.offerOrder || []), ...selected])].filter(id => selected.has(id));
}
