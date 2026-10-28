import {categoryQuickLinks} from './model.js';
import {companyIconVisual,companyIconCallout} from './company-icon.js';
import {homePointLinkTarget} from './home-recommend-settings.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const economyAttributes={rakuten:'楽天',paypay:'yahoo',vpoint:'三井住友',dpoint:'dポイント',ponta:'Ponta'};
// モックの架空案件に割り当てる確認用属性。実際の提携関係を示すものではない。
const sampleAttributes={travel:['楽天'],shop:['楽天'],sec:['楽天'],pay:['yahoo'],marche:['yahoo'],card:['三井住友'],'luna-card':['三井住友'],news:['dポイント'],video:['dポイント'],interior:['Ponta'],cosme:['Ponta']};
export function economyOffers(offers,attribute){return offers.filter(o=>(o.bundleTags??o.bundleAttributes??sampleAttributes[o.id]??[]).includes(attribute));}

function isExternal(href){return /^https?:\/\//i.test(href);}

export function categoryQuickLinksMarkup(state,key){
 if(key!=='offers')return '';
 const items=categoryQuickLinks(state,key);
 return `<nav class="offer-quick-links offer-quick-links-${esc(key)}" aria-label="${esc(key==='offers'?'おすすめ':key==='high'?'ガポガポ':'すぐできる')}のクイックリンク">${items.map(item=>{
  const href=homePointLinkTarget(item),external=isExternal(href);
  return `<a class="offer-quick-link market-economy" href="${esc(href)}" aria-label="${esc(item.label)}${companyIconCallout(item)?'・'+esc(companyIconCallout(item)):''}${external?'（外部サイト）':''}"${external?' target="_blank" rel="noopener noreferrer"':''}>${companyIconVisual(item,esc)}</a>`;
 }).join('')}</nav>`;
}
