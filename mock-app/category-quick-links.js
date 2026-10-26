import {categoryQuickLinks} from './model.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const economyAttributes={rakuten:'楽天',paypay:'yahoo',vpoint:'三井住友',dpoint:'dポイント',ponta:'Ponta'};
// モックの架空案件に割り当てる確認用属性。実際の提携関係を示すものではない。
const sampleAttributes={travel:['楽天'],shop:['楽天'],sec:['楽天'],pay:['yahoo'],marche:['yahoo'],card:['三井住友'],'luna-card':['三井住友'],news:['dポイント'],video:['dポイント'],interior:['Ponta'],cosme:['Ponta']};
export function economyOffers(offers,attribute){return offers.filter(o=>(o.bundleTags??o.bundleAttributes??sampleAttributes[o.id]??[]).includes(attribute));}
function linkTarget(item){if(item.destinationType==='offer-detail')return '#offer/'+encodeURIComponent(item.destination);if(item.destinationType==='custom-url')return /^(https?:\/\/|#[a-z])/i.test(item.destination||'')?item.destination:'#offers';const attribute=item.bundleAttribute||(!['offers','high','quick'].includes(item.destination)?item.destination:'')||economyAttributes[item.id]||item.label;return '#offers/'+encodeURIComponent('bundle:'+attribute);}

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
