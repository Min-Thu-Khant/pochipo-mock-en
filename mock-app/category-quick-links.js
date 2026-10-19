import {categoryQuickLinks} from './model.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function linkTarget(item){
 if(item.destinationType==='affiliate-list')return `#${String(item.destination||'offers').replace(/^#/,'')}`;
 if(item.destinationType==='offer-detail')return `#offer/${encodeURIComponent(String(item.destination||''))}`;
 return String(item.destination||'#offers');
}

function isExternal(href){return /^https?:\/\//i.test(href);}

export function categoryQuickLinksMarkup(state,key){
 if(key!=='offers')return '';
 const items=categoryQuickLinks(state,key);
 return `<nav class="offer-quick-links offer-quick-links-${esc(key)}" aria-label="${esc(key==='offers'?'おすすめ':key==='high'?'ガポガポ':'すぐできる')}のクイックリンク">${items.map(item=>{
  const href=linkTarget(item),external=isExternal(href);
  const visual=item.image?`<img src="${esc(item.image)}" alt="">`:`<span class="offer-quick-link-text ${esc(item.logoClass||'')}">${esc(item.logoText||item.label.slice(0,1))}</span>`;
  return `<a class="offer-quick-link" href="${esc(href)}" aria-label="${esc(item.label)}${external?'（外部サイト）':''}"${external?' target="_blank" rel="noopener noreferrer"':''}><span class="offer-quick-link-logo">${visual}</span></a>`;
 }).join('')}</nav>`;
}
