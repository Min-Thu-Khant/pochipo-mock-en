import {esc,missionRow as baseMissionRow,missionProgress,bottomNav,surveyBanner,offerListItem,surveyCard} from '../components.js';
import {icon,diceIcon} from '../icons.js';
export {esc,icon,bottomNav,surveyBanner,offerListItem,surveyCard};
const names={coin:'ポイント',calendar:'記録',walk:'歩数',phone:'アプリ起動'};
export function jellyIcon(name,size=40,label=''){
 if(!names[name])throw new RangeError('登録済みのアイコン名を指定してください。');
 return `<img class="bj-icon" src="${new URL(`assets/${name}.png`,import.meta.url)}" width="${Number(size)}" height="${Number(size)}" alt="${esc(label)}" ${label?'':'aria-hidden="true"'}>`;
}
export const reward=(amount=10)=>`<span class="bj-reward">${jellyIcon('coin',28)}<b>${Number(amount).toLocaleString('ja-JP')}</b><small>pt</small></span>`;
export function action(label,act='notify',tone='leaf',extra=''){
 return `<button class="bj-button ${tone}" data-bj="${esc(act)}" ${extra}>${label}</button>`;
}
export function mission(x){
 const act=x.state==='claimed'?`<span class="bj-claimed">${icon('check')}受取済み</span>`:action(x.state==='achieved'?`${jellyIcon('coin',20)}受け取る`:'やってみる',x.state==='achieved'?'claim':'task',x.state==='achieved'?'sun':'quiet',`data-id="${esc(x.id)}"`);
 const img={launch:'phone',steps:'walk',browse:'calendar'}[x.kind];
 const html=baseMissionRow(x,act);
 return img?html.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/,jellyIcon(img,42)):html;
}
export function missionPanel(items,done=2,total=5){
 return `<section class="mission-card"><div class="mission-head"><h2>${jellyIcon('calendar',25)}デイリーミッション</h2></div><div class="mission-panel">${missionProgress(done,total)}<ul class="mission-list">${items.map(mission).join('')}</ul><a class="mission-foot" href="#missions"><span>今日できるお仕事 <b>5</b>件</span><span>すべて見る ${icon('arrow')}</span></a></div></section>`;
}
export function points(balance=240){return `<button class="balance-pill" data-bj="balance" aria-label="ポイントの内訳">${jellyIcon('coin',28)}<b data-balance>${balance.toLocaleString('ja-JP')}</b><small>pt</small></button>`;}
export function header(balance=240){return `<header class="app-header">${points(balance)}<span class="grow"></span><div class="header-actions"><button class="chinchiro-entry hot" data-bj="dice" aria-label="チンチロの見本">${diceIcon()}<span class="ch-meta"><small>残り</small><b>3</b></span></button><button class="icon-button" data-bj="notice" aria-label="お知らせ">${icon('bell')}</button></div></header>`;}
export function goal(balance=240,target=300){const rest=Math.max(0,target-balance);return `<div class="bj-goal"><span>目標：アイス券</span><b>${rest?`あと ${rest} pt`:'交換目標に到達！'}</b><div role="progressbar" aria-label="交換までの進捗" aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${Math.min(balance,target)}"><i style="width:${Math.min(100,balance/target*100)}%"></i></div></div>`;}
export function week(){return `<ol class="bj-week" aria-label="今週の達成記録">${['月','火','水','木','金','土','日'].map((x,i)=>`<li class="${i<3?'complete':i===3?'today':''}"><span>${x}</span><b>${i<3?'✓':i===3?'今日':'−'}</b><small>${i<3?'達成':i===3?'未達成':'これから'}</small></li>`).join('')}</ol>`;}
export function walking(value=2400,target=4000){return `<div class="bj-walk">${jellyIcon('walk',80)}<div><h3>今日の歩数</h3><b>${value.toLocaleString('ja-JP')} <small>歩</small></b><p>目標まであと ${(target-value).toLocaleString('ja-JP')} 歩</p></div></div><progress class="bj-progress" max="${target}" value="${value}" aria-label="歩数の進捗"></progress>`;}
export function celebration(amount=10,title='ミッション達成！'){return `<div class="bj-celebration">${jellyIcon('coin',100)}<span class="bj-tag">獲得できました</span><h2>${esc(title)}</h2><div class="bj-earned">+${Number(amount)} <small>pt</small></div><p>アプリ起動の報酬を受け取りました。</p>${action('続ける','close','leaf','autofocus')}</div>`;}
export const sampleTasks=[
 {id:'launch',kind:'launch',state:'achieved',title:'アプリを起動する',sub:'達成しました',reward:10},
 {id:'steps',kind:'steps',state:'todo',title:'4,000歩あるこう',sub:'いま 2,400歩 / あと 1,600歩',reward:10},
 {id:'video',kind:'video',state:'todo',title:'動画を見よう',sub:'視聴するとポイント獲得',reward:1},
 {id:'credit',kind:'credit',state:'todo',title:'クレカの案件をチェック',sub:'気になる案件を見つけよう',reward:1},
 {id:'browse',kind:'browse',state:'claimed',title:'今日の案件をチェック',sub:'今日もおつかれさま',reward:1}
];
