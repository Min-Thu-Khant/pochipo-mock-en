import {icon} from './design-system/app-theme/library-icons.js?v=chevron-unified';

import {defaultServiceNotices,validArticleURL,announcementRecords} from './service-notices.js';
export const serviceNotices=defaultServiceNotices;
export const noticesFor = (state,items) => (items
  ? [...items,...announcementRecords(state).filter(n=>!serviceNotices.some(d=>d.id===n.id))]
  : announcementRecords(state))
  .filter(n=>(n.status===undefined||n.status==='published')&&n.date<=state.date&&(!n.end||n.end>=state.date)&&validArticleURL(n.target))
  .slice().sort((a,b)=>b.date.localeCompare(a.date));
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Preview titles stay out of saved state and are shared by both comparison views.
const previewTitles = {
  'update-september':'アプリのアップデートについて：ホーム画面とポイント獲得履歴の表示改善、お知らせの外部記事へのリンク対応、ならびに一部の端末で発生していた表示崩れの修正に関するご案内',
  'steps-recovered':'歩数が反映されにくい不具合の修正について：対象となる端末の確認方法と、アップデート後も歩数が更新されない場合にお試しいただきたい設定の見直し手順について',
};
export function notificationsMarkup(state,{preview=''}={}) {
  const comparing=['full','two-lines'].includes(preview);
  const items=comparing?serviceNotices.map(n=>({...n,title:previewTitles[n.id]||n.title})):undefined;
  const rows=noticesFor(state,items).map(n=>`<a class="notice-item" href="${esc(n.target)}" target="_blank" rel="noopener noreferrer"><span class="notice-copy"><time datetime="${esc(n.date)}">${esc(n.date.replaceAll('-','/'))}</time><strong>${esc(n.title)}</strong></span>${icon('arrow','notice-arrow')}</a>`).join('');
  return `<section id="notice-panel" data-notice-layout="${preview==='two-lines'?'two-lines':'full'}" aria-label="お知らせ一覧">${rows||'<div class="notice-empty">新しいお知らせはありません</div>'}</section>`;
}
