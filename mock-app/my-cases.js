const asset=name=>`assets/mycases/${name}`;
const ad=()=>`<aside class="mycases-ad" aria-label="広告枠"><img src="${asset('mrec.png')}" width="300" height="250" alt="レクタングル広告枠"></aside>`;
const illustration=(name)=>`<img class="mycases-illustration" src="${asset(name)}" width="174" height="174" alt="">`;
const emptyMarkup=()=>`<section class="mycases-message">${illustration('empty.png')}<h2>まだ案件はないようです</h2><p>マイ案件では、あなたがチャレンジした案件の達成進捗を確認することができます。</p></section>`;

export function myCasesStateMarkup(view,{button}){
 if(view==='loading')return `<main class="mycases-page" aria-busy="true"><span class="sr-only" role="status">案件を読み込み中</span><div class="mycases-list" aria-hidden="true">${Array.from({length:6},()=>'<div class="mycases-row mycases-skeleton"><i class="skeleton mycases-thumb"></i><div class="mycases-info"><i class="skeleton"></i><i class="skeleton"></i><i class="skeleton"></i></div></div>').join('')}</div></main>`;
 if(view==='error')return `<main class="mycases-page"><section class="mycases-message mycases-full-message" role="alert">${illustration('error.svg')}<h2>データの取得に失敗しました</h2><p>通信環境の良い場所で再読み込みをお試しください。</p>${button(`<img src="${asset('refresh.svg')}" alt="">再読み込み`,'restore-view','btn primary')}</section></main>`;
 if(view==='ended')return `<main class="mycases-page"><section class="mycases-message mycases-full-message">${illustration('missing.svg')}<h2>案件が見つかりません</h2><p>この案件は掲載期間が終了しているか、URLが正しくありません。</p></section></main>`;
 return `<main class="mycases-page">${emptyMarkup()}${ad()}</main>`;
}

export function myCasesMarkup(state,{caseTab,offers,esc,pt,logo,button}){
 const cases=state.user.cases.filter(c=>c.status===caseTab).slice().reverse();
 if(!cases.length)return myCasesStateMarkup('empty',{button});
 const help=caseTab==='approved'?'':`<div class="mycases-help"><p>案件進捗や結果についてお困りの方はヘルプをご確認ください</p>${button(`ヘルプを確認<img src="${asset('openblank.svg')}" alt="">`,'case-support','btn secondary small')}</div>`;
 const rows=cases.map(c=>{
  const o=offers.find(o=>o.id===c.offerId);
  const dates={challenging:'挑戦日',judging:'判定日',approved:'承認日',rejected:'否認日'};
  const image=o?logo(o,'mycases-logo'):'<span class="mycases-logo mycases-no-image" aria-hidden="true">画像なし</span>';
  const reward=c.status==='rejected'?'':`<p class="mycases-points">${c.rewardMode==='rate'?`${pt(c.reward)}<small>%</small>`:`+${pt(c.reward)}<small>pt</small>`}</p>`;
  return `<a class="mycases-row" href="#offer/${encodeURIComponent(c.offerId)}"><span class="mycases-thumb">${image}</span><div class="mycases-info"><div class="mycases-title"><h2 title="${esc(c.name)}">${esc(c.name)}</h2>${c.status==='challenging'?'':`<p title="${esc(c.condition||'')}">${esc(c.condition||'')}</p>`}</div>${reward}${o?.sur?`<ul class="mycases-stages">${o.sur.map((st,i)=>`<li><span>${(c.paidStages||0)>i?'達成済み':'未達成'}：${esc(st.label)}</span><b>${pt(st.reward)}pt</b></li>`).join('')}</ul>`:''}<p class="mycases-date">${dates[c.status]} <time>${esc(String(c.date||'').replaceAll('-','/'))}</time></p></div></a>`;
 }).join('');
 return `<main class="mycases-page">${help}<div class="mycases-list">${rows}</div>${ad()}</main>`;
}
