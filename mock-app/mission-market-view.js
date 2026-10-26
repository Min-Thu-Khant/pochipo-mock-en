import {recommendBundleOffers,homeBubbleText,homePointLinkTarget,homeRecommendSettings,recommendSectionStatus} from './home-recommend-settings.js';
// Local visual study: existing offers/rewards, with the application's standard tone.
export function missionMarketView({settings=homeRecommendSettings({}),date,offers,surveys,surveyTotal,surveyCount,terms,surveyAmount,image,esc,pt,missionCard,topBanner,progress,challengesMarkup}){
 const money=o=>{const t=terms(o);return t.rewardMode==='rate'?`${t.reward}%`:`${pt(t.reward)}<small>pt</small>`;};
 const rank=recommendBundleOffers(offers,settings,'pointUp').slice(0,8),popular=recommendBundleOffers(offers,settings,'popular').slice(0,6),more=recommendBundleOffers(offers,settings,'recommended').slice(0,6);
 const title=key=>settings.sections.find(row=>row.key===key)?.title||'';
 const daily=progress.items.filter(x=>x.missionType==='daily'),dailyDone=daily.filter(x=>!['todo','ended'].includes(x.state)).length;
 const heading=(title,to='offers')=>`<header class="market-heading"><h2>${esc(title)}</h2><a href="#${to}">もっと見る ›</a></header>`;
 const bubble=(key,index)=>{const text=homeBubbleText(settings,key,index);return text?`<span class="market-offer-callout">${esc(text)}</span>`:'';};
 const card=(o,index,key)=>`<a class="market-offer" href="#offer/${esc(o.id)}">${bubble(key,index)}<div class="market-pic">${image(o)}<em>PR</em></div><h3>${esc(o.name)}</h3><strong>${money(o)}</strong></a>`;
 const surveyCards=surveys.slice(0,3).map(q=>`<button class="market-survey" data-action="open-survey" data-id="${esc(q.id)}"><span><b>${esc(q.title)}</b><small>約${Number(q.minutes)||3}分</small></span><strong>${pt(surveyAmount(q))}<small>pt</small></strong><i>›</i></button>`).join('');

 const plane='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
 let challengeIndex=0;
 const challengeCards=challengesMarkup?.replace(/(<a\b[^>]*class="[^"]*compact-challenge-card[^"]*"[^>]*>)/g,match=>match+bubble('challenges',challengeIndex++))||'';
 const blocks={
  notice: `<div class="market-survey-total"><span><svg class="market-mail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>${esc(title('notice'))}</span><strong>最大 <b>${pt(surveyTotal)}</b><small>pt</small></strong><a class="market-survey-confirm" href="#surveys/app">確認</a></div>`,
  banner: `${topBanner||'<a class="market-original-banner" href="#feature/autumn-trip" aria-label="旅日和トラベルの特集"><img src="assets/banners/travel-wide.jpg" width="640" height="200" alt="旅日和トラベル 秋の休日、旅に出よう。"><em>PR</em></a>'}`,
  points: `<section class="market-exchange" id="market-exchange"><div class="market-point-icons hscroll">${settings.pointLinks.filter(item=>item.enabled).map(item=>{const href=homePointLinkTarget(item),external=/^https?:\/\//i.test(href);return `<a class="market-economy" href="${esc(href)}" aria-label="${esc(item.label)}の関連案件"${external?' target="_blank" rel="noopener noreferrer"':''}><span>${item.image?`<img src="${esc(item.image)}" alt="">`:item.id==='mile'?plane:`<b>${esc(item.label.slice(0,1))}</b>`}</span></a>`;}).join('')}</div></section>`,
  pointUp: `<section class="market-rank" id="market-rank">${heading(title('pointUp'))}<div class="market-rank-row hscroll">${rank.map((o,i)=>`<a href="#offer/${esc(o.id)}" class="market-rank-item">${bubble('pointUp',i)}<div class="market-rank-image">${image(o)}</div><b>${esc(o.name)}</b><strong>${money(o)}</strong></a>`).join('')}</div></section>`,
  missions: `<section class="market-todo-wrap market-mission-preview" id="market-todo">${missionCard.replace(/(<h2>[\s\S]*?)デイリーミッション(<\/h2>)/,(_,before,after)=>before+esc(title('missions'))+after)}</section>`,
  popular: `<section class="market-popular" id="market-popular">${heading(title('popular'))}<div class="market-offer-grid">${popular.map((o,i)=>card(o,i,'popular')).join('')}</div></section>`,
  challenges: `${challengeCards?`<div class="market-challenges">${challengeCards.replace('<h2>チャレンジボーナス</h2>',()=>'<h2>'+esc(title('challenges'))+'</h2>')}</div>`:''}`,
  surveys: `<section class="market-surveys" id="market-survey">${heading(title('surveys'),'surveys')}${surveyCards||'<a class="market-all" href="#surveys">アンケート一覧 ›</a>'}</section>`,
  recommended: `${more.length?`<section class="market-discover">${heading(title('recommended'))}<div class="market-offer-grid">${more.map((o,i)=>card(o,i,'recommended')).join('')}</div></section>`:''}`
 };
 if(!settings.pointLinks.some(item=>item.enabled))blocks.points='';
 for(const [key,list] of [['pointUp',rank],['popular',popular],['recommended',more]])if(!list.length)blocks[key]='';
 return `<div class="mission-market">${settings.sections.slice().sort((a,b)=>a.order-b.order).filter(row=>recommendSectionStatus(row,date)==='公開中').map(row=>blocks[row.key]).join('')}</div>`;
}
