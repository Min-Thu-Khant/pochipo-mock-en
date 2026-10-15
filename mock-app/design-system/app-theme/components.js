export {icon,iconNames} from '../../poigig-icons.js?v=chevron-unified';
export const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const button=(text,disabled=false)=>`<button class="sample-button" ${disabled?'disabled':''}>${escapeHtml(text)}</button>`;
export const reward=(points=2100)=>`<strong class="reward"><i class="point-symbol" aria-hidden="true">P</i>${points.toLocaleString('ja-JP')}<small> pt</small></strong>`;
