import {chevron} from '../../chevron.js';
import {escapeHtml as esc} from './components.js';
import {icon} from './library-icons.js?v=chevron-unified';
import {pointSymbol} from '../../point-symbol.js';
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
