import {chevron} from '../../chevron.js';
import {escapeHtml as esc} from './components.js';
import {icon} from './library-icons.js?v=chevron-unified';
import {pointSymbol,pointAmount} from '../../point-symbol.js';
export {icon, esc};
export const reward = (amount=2100, suffix='pt') => `<span class="ds-reward">${pointSymbol()}<b>${esc(amount.toLocaleString('ja-JP'))}</b><small>${esc(suffix||'pt')}</small></span>`;
// Compact activity rewards omit the unit. Balances/details retain it; sentences spell it out.
export const activityReward = amount => reward(amount,'');
export const achievedChallengeProgress=()=>'<div class="ds-challenge-complete-meter" role="progressbar" aria-label="チャレンジ達成率" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><span>100%</span></div>';
export const achievedChallengeBonus=amount=>`<div class="ch-foot ds-challenge-complete-bonus"><span class="ch-bonus-label">チャレンジ達成！</span><span class="ch-bonus-value">ボーナス+${pointSymbol()}<b>${esc(amount.toLocaleString('ja-JP'))}</b><small>pt</small></span></div>`;
export function surveyItem({id,title,minutes,min,max,done=false,attrs=''}={}){
  const low=esc(min.toLocaleString('ja-JP')),high=esc(max.toLocaleString('ja-JP'));
  return `<article class="ds-survey-row" data-survey-card="${esc(id)}" aria-labelledby="survey-title-${esc(id)}"><div class="ds-survey-copy"><h3 id="survey-title-${esc(id)}">${esc(title)}</h3><span class="ds-survey-range" aria-label="${low}から${high}ポイント">${pointSymbol()}<span>${low}~${high}</span><small class="ds-point-unit">pt</small></span></div><div class="ds-survey-end"><span class="ds-survey-time">約${esc(minutes)}分</span>${action(done?'回答済み':'回答する',{variant:'ds-survey-answer',size:'small',disabled:done,attrs})}</div></article>`;
}
export function action(label,{variant='primary',size='medium',disabled=false,ico='',attrs=''}={}){
  return `<button type="button" class="ds-button ${esc(variant)} ${esc(size)}" ${disabled?'disabled':''} ${attrs}>${ico?icon(ico):''}<span class="ds-action-label">${esc(label)}</span></button>`;
}
export function missionBadge(name='walk',state='todo'){
  return `<span class="ds-mission-badge ${esc(state)}" aria-hidden="true">${icon(name)}</span>`;
}
export function missionActionLabel(){return '<span class="ds-action-label">やってみる</span>'+chevron('right','mission-action-chevron');}
export function missionAction(state='todo',attrs=''){
  if(state==='ended')return action('また明日',{variant:'mission-claimed mission-ended',size:'small',disabled:true,attrs});
  const done=state==='claimed';
  return done?action('受け取り済',{variant:'mission-claimed',size:'small',disabled:true,ico:'check',attrs}):state==='achieved'?action('受け取る',{variant:'mission-achieved',size:'small',ico:'gift',attrs}):`<button type="button" class="ds-button mission-${esc(state)} small" ${attrs}>${missionActionLabel()}</button>`;
}
export function missionRow({name='歩いてためよう',description='1,000歩歩いてポイントを獲得したらクリア',ico='walk',state='todo',amount=100,attrs=''}={}){
  return `<div class="ds-mission-row ${esc(state)}">${missionBadge(ico,state)}<div class="ds-mission-copy"><b>${esc(name)}</b></div><div class="ds-mission-end">${activityReward(amount)}${missionAction(state,attrs)}</div></div>`;
}
export function progress(value=2,max=5){return `<div class="ds-progress"><span>今日の進捗</span><progress aria-label="今日の進捗" value="${value}" max="${max}"></progress><span>${value}/${max}</span></div>`;}
export function offerCard({name='暮らしのショッピング',amount=3200,ico='cart',rank=0}={}){
  return `<button type="button" class="ds-offer" data-demo="案件詳細"><span class="ds-offer-art">${icon(ico)}${rank?`<span class="ds-rank">${rank}</span>`:''}<small>PR</small></span>${reward(amount)}<b>${esc(name)}</b></button>`;
}
// PG-P09: only source-provided stage results drive completion; viewing never grants rewards.
export function surProgressCard({id,stages=[],completed=0}={}){
  if(!stages.length)return '';
  const done=Math.max(0,Math.min(stages.length,Number.isFinite(completed)?Math.floor(completed):0));
  const total=stages.reduce((sum,stage)=>sum+stage.reward,0),all=done===stages.length;
  const listId='sur-stages-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'-');
  const rows=stages.map((stage,i)=>`<li class="ds-sur-stage ${i<done?'is-complete':''}" ${i>=3?'hidden':''}><span class="ds-sur-stage-state" aria-label="${i<done?'達成済み':'未達成'}">${i<done?icon('check'):''}</span><span class="ds-sur-stage-label">${esc(stage.label)}</span><span class="ds-sur-stage-reward">+${esc(stage.reward.toLocaleString('ja-JP'))}<small>pt</small></span></li>`).join('');
  return `<section class="section sur-card ds-sur-progress ${all?'is-complete':''}" aria-label="達成進捗カード"><div class="ds-sur-total"><span class="ds-sur-total-state" aria-hidden="true">${icon('trophy')}</span><span class="ds-sur-total-label">${all?'すべての条件を達成！':'すべての条件を達成で'}</span>${pointAmount(total)}</div><div class="ds-sur-list-head"><h2>達成リスト</h2><span>達成済み <b>${done}</b> / <b>${stages.length}</b></span></div><ul class="ds-sur-stages" id="${esc(listId)}">${rows}</ul>${stages.length>3?`<div class="ds-sur-footer"><button type="button" class="ds-sur-toggle" data-action="sur-progress-toggle" aria-expanded="false" aria-controls="${esc(listId)}"><span class="ds-sur-expand">すべて表示</span><span class="ds-sur-collapse">折りたたむ</span>${chevron('down','ds-sur-toggle-chevron')}</button></div>`:''}</section>`;
}
export function toggleSurProgress(button){
  const card=button.closest('.ds-sur-progress');if(!card)return;
  const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));card.classList.toggle('expanded',expanded);
  card.querySelectorAll('.ds-sur-stage').forEach((row,i)=>{if(i>=3)row.hidden=!expanded;});
}
export const errorExamples=[
 ['取得エラー','データの取得に失敗しました','通信環境の良い場所で再度お試しください。','再試行','info'],
 ['アップデート','新しいバージョンがあります','アプリをアップデートしてご利用ください。','アップデートする','phone'],
 ['メンテナンス','現在メンテナンス中です','メンテナンスの詳細はお知らせをご確認ください。','お知らせを確認','settings'],
 ['利用停止','アカウントの利用を停止しています','ご不明な点はお問い合わせください。','お問い合わせ','user'],
 ['規約同意','利用規約をご確認ください','最新の利用規約を確認し、同意のうえご利用ください。','規約を確認する','list'],
 ['セッション切れ','セッションが切れました','再度ログインしてください。','ログインする','user'],
 ['削除済み','削除されたアカウントです','このアカウントでは利用できません。','閉じる','user']
];
export function errorCard(d){return `<div class="ds-error"><span class="ds-error-icon">${icon(d[4])}</span><h3>${esc(d[1])}</h3><p>${esc(d[2])}</p>${action(d[3],{variant:'secondary',attrs:`data-demo="${esc(d[0])}"`})}</div>`;}

// PG-P11: same card in the application and the design component library.
export function challengeBonusCard({id='',href='#',name='',image='',countdown='',normalReward='',joined=false,achieved=false,participants=0,goal=1,bonus=0}={}){
 const percent=Math.min(100,Math.round(participants/Math.max(1,goal)*100));
 return `<a class="ch-card ds-challenge-card ${achieved?'achieved':''}" href="${esc(href)}" data-slot="${esc(id)}"><div class="ch-top">${image}${joined?'<span class="ch-joined">参加中</span>':''}</div>${countdown}<h3>${esc(name)}</h3><div class="ch-normal"><span>通常</span>${normalReward}</div><div class="ds-challenge-progress">${achieved?achievedChallengeProgress():`<div class="ch-meter" role="progressbar" aria-label="チャレンジ参加人数" aria-valuemin="0" aria-valuemax="${esc(goal)}" aria-valuenow="${esc(participants)}"><i style="width:${percent}%"></i></div><small class="ch-count">${participants.toLocaleString('ja-JP')} / ${goal.toLocaleString('ja-JP')}人</small>`}</div><div class="ch-foot ${achieved?'ds-challenge-complete-bonus':''}" aria-label="達成ボーナス"><span class="ch-bonus-label">${achieved?'チャレンジ達成！':'チャレンジ達成で'}</span><span class="ch-bonus-value">+${pointAmount(bonus)}</span></div></a>`;
}
export function challengeMoreLink(href='#offers-list/challenge'){
 return `<a class="btn ds-button secondary wide challenge-more-action" href="${esc(href)}"><span>すべてのチャレンジを見る</span>${chevron('right')}</a>`;
}

export function challengeCardImage(index=0,src='assets/challenge-reference.png'){
 const colors=['#e8eee0','#eee6f5','#fff0dc','#e3eff2'];
 return `<svg class="challenge-sample-image" viewBox="0 0 281 281" role="img" aria-label="Challenge bonus demo banner"><rect width="281" height="281" rx="20" fill="${colors[Math.max(0,index)%4]}"/><circle cx="140" cy="110" r="65" fill="white" opacity=".6"/><path d="M95 101h90v63H95zM87 88h106v24H87z" fill="#eeb17a"/><path d="M139 88v76M118 88c-38-28-2-43 21 0 23-43 59-28 21 0" fill="none" stroke="#fff6dd" stroke-width="9"/><text x="140" y="211" font-family="Arial,sans-serif" text-anchor="middle" font-size="18" font-weight="700" fill="#435d50">CHALLENGE BONUS</text><text x="140" y="239" font-family="Arial,sans-serif" text-anchor="middle" font-size="14" fill="#435d50">Together, earn more</text></svg>`;
}
