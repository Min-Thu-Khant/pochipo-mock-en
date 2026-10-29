// Shared company artwork and SALE badge for Home and Offers.
export const companyIconCallout=item=>String(item.callout??(item.sale?'SALE':'')).trim();
export function companyIconVisual(item,esc){
 const logo=item.image?`<img src="${esc(item.image)}" alt="">`:item.id==='mile'?'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>':`<b>${esc(item.label.slice(0,1))}</b>`;
 return `${companyIconCallout(item)?`<em class="market-point-callout" title="${esc(companyIconCallout(item))}">${esc(companyIconCallout(item))}</em>`:''}<span class="offer-quick-link-logo">${logo}</span>`;
}
