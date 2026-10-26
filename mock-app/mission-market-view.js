import {recommendOffers,homeRecommendSettings} from './home-recommend-settings.js';
// Local visual study: existing offers/rewards, with the application's standard tone.
export function missionMarketView({settings=homeRecommendSettings({}),offers,surveys,surveyTotal,surveyCount,terms,surveyAmount,image,esc,pt,missionCard,topBanner,progress,challengesMarkup}){
 const money=o=>{const t=terms(o);return t.rewardMode==='rate'?`${t.reward}%`:`${pt(t.reward)}<small>pt</small>`;};
 const rank=recommendOffers(offers,settings.pointUpOfferIds,offers.slice(0,8)).slice(0,8),popular=recommendOffers(offers,settings.popularOfferIds,offers.slice(0,6)).slice(0,6),more=recommendOffers(offers,settings.recommendedOfferIds,offers.slice(6,12)).slice(0,6);
 const daily=progress.items.filter(x=>x.missionType==='daily'),dailyDone=daily.filter(x=>!['todo','ended'].includes(x.state)).length;
 const heading=(title,to='offers')=>`<header class="market-heading"><h2>${title}</h2><a href="#${to}">もっと見る ›</a></header>`;
 const card=o=>`<a class="market-offer" href="#offer/${esc(o.id)}"><div class="market-pic">${image(o)}<em>PR</em></div><h3>${esc(o.name)}</h3><strong>${money(o)}</strong></a>`;
 const surveyCards=surveys.slice(0,3).map(q=>`<button class="market-survey" data-action="open-survey" data-id="${esc(q.id)}"><span><b>${esc(q.title)}</b><small>約${Number(q.minutes)||3}分</small></span><strong>${pt(surveyAmount(q))}<small>pt</small></strong><i>›</i></button>`).join('');
 const economies=[['mile','マイル','旅行'],['vpoint','Vポイント','bundle:三井住友'],['rakuten','楽天','bundle:楽天'],['paypay','PayPay','bundle:yahoo'],['dpoint','dポイント','bundle:dポイント'],['ponta','Ponta','bundle:Ponta']];
 const plane='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
 return `<div class="mission-market"><div class="market-survey-total"><span><svg class="market-mail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>アプリ限定の新着アンケートが届いています</span><strong>最大 <b>${pt(surveyTotal)}</b><small>pt</small></strong><a class="market-survey-confirm" href="#surveys/app">確認</a></div>
 ${topBanner||'<a class="market-original-banner" href="#feature/autumn-trip" aria-label="旅日和トラベルの特集"><img src="assets/banners/travel-wide.jpg" width="640" height="200" alt="旅日和トラベル 秋の休日、旅に出よう。"><em>PR</em></a>'}
 <section class="market-exchange" id="market-exchange"><div class="market-point-icons hscroll">${economies.filter(([id])=>settings.pointServices.includes(id)).map(([id,label,to])=>`<a class="market-economy" href="#offers/${encodeURIComponent(to)}" aria-label="${esc(label)}の関連案件"><span class="${id==='mile'?'market-mile':''}">${id==='mile'?plane:`<img src="assets/quick-links/${id}.png" alt="">`}</span></a>`).join('')}</div></section>
 <section class="market-rank" id="market-rank">${heading('期間限定ポイントアップ！')}<div class="market-rank-row hscroll">${rank.map((o,i)=>`<a href="#offer/${esc(o.id)}" class="market-rank-item">${(settings.calloutOfferIds===null?[0,3].includes(i):settings.calloutOfferIds.includes(o.id))?'<span class="market-offer-callout">最高還元</span>':''}<div class="market-rank-image">${image(o)}</div><b>${esc(o.name)}</b><strong>${money(o)}</strong></a>`).join('')}</div></section>
 <section class="market-todo-wrap market-mission-preview" id="market-todo">${missionCard}</section>
 <section class="market-popular" id="market-popular">${heading('人気案件')}<div class="market-offer-grid">${popular.map(card).join('')}</div></section>
 ${challengesMarkup?`<div class="market-challenges">${challengesMarkup}</div>`:''}
 <section class="market-surveys" id="market-survey">${heading('アンケート','surveys')}${surveyCards||'<a class="market-all" href="#surveys">アンケート一覧 ›</a>'}</section>

 ${more.length?`<section class="market-discover">${heading('おすすめ案件')}<div class="market-offer-grid">${more.map(card).join('')}</div></section>`:''}</div>`;
}
