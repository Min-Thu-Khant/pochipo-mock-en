/** Shared presentation components used by the app and the component catalog.
 * HTML-valued arguments (text/body/actionHTML/attrs) accept trusted templates only.
 * Escape user/admin strings with esc(). State transitions belong in app.js/model.js.
 * See AI-GUIDE.md for usage and team rules.
 */
import {icon,coin,diceIcon} from './icons.js';
import {pt,yen} from '../model.js';

export const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const money=(v,cls='',label='pt')=>`<span class="money ${cls}">${label==='円相当'?'':coin()}<b>${label==='円相当'?yen(v):pt(v)}</b>${label?`<small>${label}</small>`:''}</span>`;

export const rate=(pct,cls='')=>`<span class="money ${cls}">${icon('chart')}<b>${Number(pct).toFixed(1)}%</b><small>還元</small></span>`; // spec: 定率は小数第 1 位

export const button=(text,action,cls='btn',attrs='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;

export const link=(text,to,cls='')=>`<a class="${cls}" href="#${to}">${text}</a>`;

export const sectionHead=(title,to,label='すべて見る',sub='')=>`<div class="section-head"><div>${sub?`<span class="section-sub">${sub}</span>`:''}<h2>${title}</h2></div>${to?link(`${label}${icon('arrow')}`,to,'more-link'):''}</div>`;

export const empty=(title,sub,ico='survey')=>`<div class="empty">${icon(ico)}<h3>${title}</h3><p>${sub}</p></div>`;

export const kindIcon={browse:'bag',launch:'phone',steps:'walk',video:'play',survey:'survey',offer:'gift',credit:'wallet'};

export function bottomNav(active="home"){return `<nav class="bottom-nav" aria-label="メインナビゲーション">${[['home','home','ホーム'],['offers','search','お得'],['surveys','spark','簡単'],['mypage','user','マイページ']].map(([to,ico,label])=>`<a href="#${to}" class="${active===to?'active':''}" ${active===to?'aria-current="page"':''}>${icon(ico)}<span>${label}</span></a>`).join('')}</nav>`;}

export function chinchiroEntry(st){if(!st.visible)return '';const hot=st.remaining>0;return button(`${diceIcon()}<span class="ch-meta"><small>${hot?'残り':'本日'}</small><b>${hot?st.remaining:'終了'}</b></span>`,'chinchiro',`chinchiro-entry${hot?' hot':' done'}`,`aria-label="チンチロ。今日は残り${st.remaining}回回せます"`);}

export const missionRow=(x,actionHTML)=>`<li class="${x.state}"><span class="m-icon ${x.kind} ${x.state!=='todo'?'lit':''}">${icon(kindIcon[x.kind])}</span><div class="m-text"><b>${esc(x.title)}${x.pr?'<em class="pr">PR</em>':''}${x.extra?'<em class="pr new">新</em>':''}</b><small>${esc(x.sub)}</small></div><div class="m-right"><span class="m-reward ${x.state==='claimed'?'dim':''}">${x.rate?`${icon('chart')}${x.rate.toFixed(1)}%`:`${coin()}${pt(x.reward)}<small>pt</small>`}</span>${actionHTML}</div></li>`;

export function missionProgress(done,total){const t={done,total};return `<div class="mission-progress"><span>今日の進捗</span><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${t.total}" aria-valuenow="${t.done}"><i style="width:${t.total?t.done/t.total*100:0}%"></i></div><b>${t.done}/${t.total} 完了</b></div>`;}

export const surveyBanner=()=>link(`<span class="survey-cta-icon">${icon('survey')}</span><span><small>簡単タブへ</small><b>アンケート回答で<br>ポイントゲット</b></span>${icon('arrow')}`,'surveys','survey-cta');

export const dialogContent=(title,body)=>`<div class="modal-header"><h2>${title}</h2>${button(icon('close'),'close','icon-button','aria-label="閉じる"')}</div><div class="modal-body">${body}</div>`;

export const logo=(o,cls='')=>`<span class="logo ${cls}" style="background:${o.logo.bg};color:${o.logo.fg}" aria-hidden="true">${o.logo.text}</span>`;

export const rewardText=(t,cls='')=>(t.rewardMode==='rate'?rate(t.reward,cls):money(t.reward,cls))+(t.sur?'<small class="max">(最大)</small>':''); // spec: SUR は「(最大)」

export function offerListItem(o,t){return link(`${logo(o,'row-logo')}<div class="row-main"><h3>${esc(o.name)}</h3><span class="chip-tag">${esc(o.tag)}</span></div><div class="row-right"><small>${t.slot?'期間限定':t.sur?'すべて達成で':'最大'}</small>${rewardText(t,'m-row')}</div>`,`offer/${o.id}`,'offer-row');}

export function offerGridItem(o,t){return link(`<div class="tile-logo">${logo(o)}${t.slot&&t.rewardMode==='flat'&&t.reward>o.base?'<span class="badge-up">期間限定UP</span>':''}</div><span class="tile-name">${esc(o.name)}</span>${rewardText(t,'m-tile')}`,`offer/${o.id}`,'offer-tile');}

export const surveyCard=(q,reward)=>`<a class="survey-card ${q.type}" href="#answer/${q.id}"><span class="tag ${q.type==='main'?'warm':''}">${q.label}</span><h3>${esc(q.title)}</h3><div class="survey-meta"><span>${icon('clock')}${q.minutes}分</span><span class="pill outline">回答する ${icon('arrow')}</span></div><div class="survey-foot">${money(reward,'m-survey')}${q.parent?'<small>事前調査にご協力いただいた方へ</small>':''}</div></a>`;
