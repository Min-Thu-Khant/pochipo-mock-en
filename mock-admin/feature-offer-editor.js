import {translateEnglish} from '../mock-app/english-text.js';
import {featureSelectedIds} from '../mock-app/feature-selection.js';
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function featureOfferEditor(state, feature, offers) {
  const selected = featureSelectedIds(state, feature);
  const grouped=(state.nacs?.intake?.bundles||[]).filter(b=>(b.tags||[]).some(t=>(feature.bundleTags||[]).includes(t))).map(b=>b.id);
  const manual = feature.manualOfferIds ?? (feature.offerIds || []).filter(id=>!grouped.includes(id));
  const ordered = [...new Set([...selected, ...offers.map(o => o.id)])];
  return `<section class="wide" data-feature-offers data-excluded="${esc(JSON.stringify(feature.excludedOfferIds || []))}"><h3>掲載する案件</h3><p class="tiny">掲載する案件にチェックを入れてください。グループ内の案件も個別に非掲載にできます。件数の入力は不要です。↑↓で表示順を変更できます。</p><label>案件名・IDで検索<input type="search" data-feature-search></label><div data-feature-offer-list>${ordered.map(id => {const o=offers.find(x=>x.id===id);return o ? `<div class="toolbar" data-feature-offer="${esc(id)}" data-name="${esc(o.name)}"><label class="grow"><input type="checkbox" name="offerIds" value="${esc(id)}" data-manual="${manual.includes(id)}" ${selected.includes(id)?'checked':''}>${esc(o.name)} <small>${esc(id)}</small></label><button type="button" class="btn" data-feature-move="up" aria-label="${esc(o.name)}を上へ">↑</button><button type="button" class="btn" data-feature-move="down" aria-label="${esc(o.name)}を下へ">↓</button></div>` : '';}).join('')}</div><p data-feature-count role="status">掲載対象 ${selected.length}件</p></section>`;
}
export function readFeatureSelection(form, state) {
  const root=form.querySelector('[data-feature-offers]');
  const inputs=[...root.querySelectorAll('[name=offerIds]')];
  const selection={selectionMode:'selected',bundleTags:[...form.querySelectorAll('[name=bundleTags]')].map(x=>x.value),manualOfferIds:inputs.filter(x=>x.dataset.manual==='true').map(x=>x.value),excludedOfferIds:JSON.parse(root.dataset.excluded),offerOrder:inputs.map(x=>x.value)};
  const offerIds=featureSelectedIds(state,selection);
  // 未選択の行を保存順に含めると、後からグループへ追加された案件が途中へ割り込む。
  return {...selection,offerIds,offerOrder:selection.offerOrder.filter(id=>offerIds.includes(id))};
}
export function bindFeatureOfferEditor(getState) {
  const update = form => {
    const selection=readFeatureSelection(form,getState()),ids=selection.offerIds;
    for(const input of form.querySelectorAll('[name=offerIds]'))input.checked=ids.includes(input.value);
    form.querySelector('[data-feature-count]').textContent=`掲載対象 ${ids.length}件`;
  };
  document.addEventListener('change',e=>{
    if(!e.target.matches('#feature-form [name=offerIds]'))return;
    const input=e.target,form=input.closest('form'),root=form.querySelector('[data-feature-offers]'),excluded=new Set(JSON.parse(root.dataset.excluded));
    input.dataset.manual=String(input.checked);
    if(input.checked)excluded.delete(input.value);else excluded.add(input.value);
    root.dataset.excluded=JSON.stringify([...excluded]);update(form);
  });
  document.addEventListener('click',e=>{
    const group=e.target.closest('#feature-form [data-group-tag]');
    if(group)update(group.closest('form'));
    const button=e.target.closest('[data-feature-move]');if(!button)return;
    const row=button.closest('[data-feature-offer]'),peer=button.dataset.featureMove==='up'?row.previousElementSibling:row.nextElementSibling;
    if(peer){if(button.dataset.featureMove==='up')peer.before(row);else peer.after(row);}
  });
  document.addEventListener('input',e=>{
    if(!e.target.matches('[data-feature-search]'))return;
    const query=e.target.value.trim().toLowerCase();
    for(const row of e.target.closest('[data-feature-offers]').querySelectorAll('[data-feature-offer]'))row.hidden=!translateEnglish(`${row.dataset.name} ${row.dataset.featureOffer}`).toLowerCase().includes(query);
  });
}
