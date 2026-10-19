const asset=name=>`assets/mycases/${name}`;
const illustration=(name)=>`<img class="mycases-illustration" src="${asset(name)}" width="120" height="120" alt="">`;
const emptyMarkup=(tab='challenging')=>{const copy={challenging:['挑戦中の案件はありません','気になる案件にチャレンジすると、ここで進捗を確認できます。'],judging:['判定中の案件はありません','条件達成後、ポイント付与の判定状況をここで確認できます。'],approved:['承認された案件はありません','承認された案件と獲得ポイントをここで確認できます。'],rejected:['否認された案件はありません','否認された案件がある場合は、ここに表示されます。']};const [title,description]=copy[tab]||copy.challenging;return `<section class="mycases-message">${illustration(`${tab}.svg`)}<h2>${title}</h2><p>${description}</p></section>`;};

const helpMarkup=(tab,button)=>tab==='approved'?'':`<div class="mycases-help"><p>案件進捗や結果についてお困りの方はヘルプをご確認ください</p>${button(`ヘルプを確認<span class="mycases-help-icon" aria-hidden="true"><img src="${asset('openblank.svg')}" width="9" height="9" alt=""></span>`,'case-support','btn secondary small ds-explanation-action')}</div>`;
const statusDates={challenging:'挑戦日',judging:'判定日',approved:'承認日',rejected:'否認日'};
const statusDate=value=>String(value||'').replace(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2}).*$/,(_,y,m,d,h,min)=>`${y}/${m.padStart(2,'0')}/${d.padStart(2,'0')} ${h.padStart(2,'0')}:${min}`);

export function myCasesStateMarkup(view,{button,caseTab='challenging'}){
 if(view==='loading')return `<main class="mycases-page" aria-busy="true"><span class="sr-only" role="status">案件を読み込み中</span><div class="mycases-list" aria-hidden="true">${Array.from({length:6},()=>'<div class="mycases-row mycases-skeleton"><div class="mycases-info"><i class="skeleton"></i><i class="skeleton"></i><i class="skeleton"></i></div></div>').join('')}</div></main>`;
 if(view==='error')return `<main class="mycases-page"><section class="mycases-message mycases-full-message" role="alert">${illustration('error-cat-matched.png')}<h2>データの取得に失敗しました</h2><p>通信環境の良い場所で再読み込みをお試しください。</p>${button(`<img src="${asset('refresh.svg')}" alt="">再読み込み`,'restore-view','btn primary')}</section></main>`;
 if(view==='ended')return `<main class="mycases-page"><section class="mycases-message mycases-full-message">${illustration('missing-cat-matched.png')}<h2>案件が見つかりません</h2><p>この案件は掲載期間が終了しているか、URLが正しくありません。</p></section></main>`;
 return `<main class="mycases-page">${helpMarkup(caseTab,button)}${emptyMarkup(caseTab)}</main>`;
}

export function myCasesMarkup(state,{caseTab,esc,pt,button}){
 const cases=state.user.cases.filter(c=>c.status===caseTab);
 if(!cases.length)return myCasesStateMarkup('empty',{button,caseTab});
 const rows=cases.map(c=>{
  const reward=c.status==='rejected'?'':`<p class="mycases-points">${c.rewardMode==='rate'?`${pt(c.reward)}<small>%</small>`:`+${pt(c.reward)}<small>pt</small>`}</p>`;
  return `<a class="mycases-row${c.status==='challenging'?' is-challenging':''}" href="#offer/${encodeURIComponent(c.offerId)}"><div class="mycases-info"><div class="mycases-title"><h2 title="${esc(c.name)}">${esc(c.name)}</h2><p title="${esc(c.condition||'')}">${esc(c.condition||'')}</p></div>${reward}<p class="mycases-date">${statusDates[c.status]} <time>${esc(statusDate(c.date))}</time></p></div></a>`;
 }).join('');
 return `<main class="mycases-page">${helpMarkup(caseTab,button)}<div class="mycases-list">${rows}</div></main>`;
}
