import {icon} from './design-system/app-theme/library-icons.js?v=chevron-unified';

// Service announcements link to articles managed outside the app.
// These reserved example.com URLs are placeholders for the service LP articles.
export const serviceNotices = [
  {id:'update-september',date:'2026-09-15',title:'アプリのアップデートについて',target:'https://example.com/notices/update-september'},
  {id:'steps-recovered',date:'2026-09-14',title:'歩数が反映されにくい不具合の修正について',target:'https://example.com/notices/steps-recovered'},
  {id:'maintenance-complete',date:'2026-09-12',title:'メンテナンス終了のお知らせ',target:'https://example.com/notices/maintenance-complete'},
];
const externalArticle = target => {
  if(typeof target!=='string'||/\s/.test(target))return false;
  try {const url=new URL(target);return ['https:','http:'].includes(url.protocol)&&Boolean(url.hostname);}catch{return false;}
};
export const noticesFor = (state,items=serviceNotices) => [...items,...(state.operatorWorkflows?.notices||[]).filter(n=>n.enabled&&n.start<=state.date&&n.end>=state.date).map(n=>({...n,date:n.start}))].filter(n=>n.date<=state.date&&externalArticle(n.target)).sort((a,b)=>b.date.localeCompare(a.date));
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Preview titles stay out of saved state and are shared by both comparison views.
const previewTitles = {
  'update-september':'アプリのアップデートについて：ホーム画面とポイント獲得履歴の表示改善、お知らせの外部記事へのリンク対応、ならびに一部の端末で発生していた表示崩れの修正に関するご案内',
  'steps-recovered':'歩数が反映されにくい不具合の修正について：対象となる端末の確認方法と、アップデート後も歩数が更新されない場合にお試しいただきたい設定の見直し手順について',
};
export function notificationsMarkup(state,{preview=''}={}) {
  const comparing=['full','two-lines'].includes(preview);
  const items=comparing?serviceNotices.map(n=>({...n,title:previewTitles[n.id]||n.title})):serviceNotices;
  const rows=noticesFor(state,items).map(n=>`<a class="notice-item" href="${esc(n.target)}" target="_blank" rel="noopener noreferrer"><span class="notice-copy"><time datetime="${esc(n.date)}">${esc(n.date.replaceAll('-','/'))}</time><strong>${esc(n.title)}</strong></span>${icon('arrow','notice-arrow')}</a>`).join('');
  return `<section id="notice-panel" data-notice-layout="${preview==='two-lines'?'two-lines':'full'}" aria-label="お知らせ一覧">${rows||'<div class="notice-empty">新しいお知らせはありません</div>'}</section>`;
}
