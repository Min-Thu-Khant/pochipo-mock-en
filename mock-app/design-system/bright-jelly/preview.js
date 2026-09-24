// Isolated presentation demo: no save(), network requests or localStorage writes.
import {initialState,homeTabsFor} from '../../model.js';
import {header,bottomNav,missionPanel,mission,goal,walking,sampleTasks,icon,jellyIcon,action,offerListItem,surveyCard,surveyBanner,esc,reward} from './components.js';
import {notify,openDialog,initDialog,commonAction,flyCoins,reduced} from './interactions.js';
const root=document.querySelector('#preview-root');
const tabs=homeTabsFor(initialState());
let balance=240,tasks=structuredClone(sampleTasks);
const offer={id:'demo',name:'暮らしの買い物サービス',tag:'商品購入',logo:{bg:'#EAF7FF',fg:'#075174',text:'暮'}};
const q={id:'demo',title:'毎日のお買い物について',type:'screening',label:'事前アンケート',minutes:1};
function missionHome(){const active=tasks.filter(t=>t.state!=='claimed'),done=tasks.filter(t=>t.state==='claimed');let html=missionPanel(active,done.length,tasks.length);return html.replace('<a class="mission-foot"',`<details class="mission-more"><summary>${icon('down')}クリア済みのミッション <b>${done.length}</b></summary><ul class="mission-list">${done.map(mission).join('')}</ul></details><a class="mission-foot"`);}
function daily(){return `<a class="top-banner bj-feature" href="#feature"><div><span class="bj-feature-label">今月の特集</span><b>秋のおでかけ特集</b><small>旅行・お買い物でポイントをためよう</small></div>${jellyIcon('coin',64)}</a><div id="missions-preview">${missionHome()}</div><a class="bj-middle" href="#offers">${jellyIcon('phone',44)}<div><b>気軽にはじめる、お得な案件</b><small>条件をチェックして参加しよう</small></div>${icon('arrow')}</a><section class="section"><div class="section-head"><h2>動画でためる</h2>${reward(1)}</div><div class="video-sample"><span>動画を見てポイントゲット</span>${action('見てみる','video','quiet')}</div></section>${surveyBanner()}`;}
function tabContent(key){if(key==='daily')return daily();if(key==='steps')return `<section class="section">${walking()}<p class="section-sub" style="margin-top:16px">4,000歩でミッション達成。残り1,600歩です。</p></section>`;if(key==='survey')return `<section class="section"><h2>アンケートでためる</h2>${surveyCard(q,10)}</section>`;return `<section class="section"><h2>${esc(tabs.find(t=>t.key===key)?.label.replace(/\n/g,'')||'おすすめ')}</h2>${offerListItem(offer,{reward:100,rewardMode:'flat'})}<p class="section-sub" style="margin-top:16px">案件カードの見た目を確認するためのサンプルです。</p></section>`;}
function home(key='daily'){if(!tabs.some(t=>t.key===key))key='daily';return `<nav class="home-tabs" role="tablist" aria-label="ホームのカテゴリ" style="grid-template-columns:repeat(${tabs.length},minmax(0,1fr))">${tabs.map(t=>`<button role="tab" id="tab-${esc(t.key)}" aria-controls="home-panel" aria-selected="${key===t.key}" tabindex="${key===t.key?0:-1}" data-tab="${esc(t.key)}"><span class="home-tab-icon">${t.icon==='calendar'?jellyIcon('calendar',30):t.icon==='walk'?jellyIcon('walk',30):icon(t.icon||'gift')}</span><span class="home-tab-label">${esc(t.label).replace(/\n/g,'<br>')}</span></button>`).join('')}</nav><main class="home home-panel" id="home-panel" role="tabpanel" aria-labelledby="tab-${key}" tabindex="0">${tabContent(key)}</main>`;}
function pageContent(page,key){switch(page){
 case 'home':return home(key);
 case 'offers':return `<main><h1 class="preview-section-title">お得</h1><div class="bj-plain-tabs"><a href="#offers">おすすめ</a><a href="#feature">特集</a></div><section class="section">${offerListItem(offer,{reward:100,rewardMode:'flat'})}</section></main>`;
 case 'surveys':return `<main><h1 class="preview-section-title">簡単</h1><section class="section"><h2>アンケートでためる</h2>${surveyCard(q,10)}</section></main>`;
 case 'mypage':return `<main><h1 class="preview-section-title">マイページ</h1><section class="section"><h2>ポイント</h2><div class="goal-dialog">${goal(balance)}</div><p style="margin-top:16px">交換や履歴は、現在のモックの構成に従います。</p>${action('ポイントの内訳','balance','quiet')}</section></main>`;
 case 'missions':return `<main><h1 class="preview-section-title">今日できること</h1><div id="missions-preview">${missionHome()}</div></main>`;
 case 'feature':return `<main class="bj-detail"><a href="#home" class="text-link">← ホーム</a><h2>秋のおでかけ特集</h2><p>旅行・お買い物で、いつものおでかけをお得に。</p>${offerListItem(offer,{reward:100,rewardMode:'flat'})}</main>`;
 default:return `<main class="bj-detail"><a href="#${page==='answer'?'surveys':'offers'}" class="text-link">← 戻る</a><h2>${page==='answer'?'アンケート':'案件詳細'}</h2><p>この試作では、共通カードからの遷移と戻る操作まで確認できます。回答・案件参加の処理は接続していません。</p></main>`;
 }}
function render(){const [page='home',key]=location.hash.slice(1).split('/');root.innerHTML=`<div class="phone-status"><span>9:41</span><span>ぽちぽ（仮）</span><span aria-hidden="true">▮▮▮ ▰</span></div><div class="phone-body"><div class="phone-scroll">${header(balance)}${pageContent(page||'home',key)}</div>${bottomNav(['offers','surveys','mypage'].includes(page)?page:'home')}</div>`;}
initDialog();render();window.addEventListener('hashchange',render);
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===parent&&e.data?.type==='bj-motion')document.body.dataset.reduced=String(!!e.data.reduced);});
document.addEventListener('keydown',e=>{const tab=e.target.closest('[data-tab]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const idx=tabs.findIndex(t=>t.key===tab.dataset.tab);const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(idx+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;location.hash=`home/${tabs[next].key}`;requestAnimationFrame(()=>document.querySelector(`#tab-${tabs[next].key}`)?.focus());});
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-tab]');if(tab){location.hash='home/'+tab.dataset.tab;return;}
 const el=e.target.closest('[data-bj]');if(!el)return;if(commonAction(el))return;
 const act=el.dataset.bj;
 if(act==='claim'){
  const task=tasks.find(t=>t.id===el.dataset.id);if(!task||task.state!=='achieved')return;
  task.state='claimed';balance+=task.reward;el.disabled=true;
  const target=document.querySelector('.balance-pill');flyCoins(el,target);target.querySelector('[data-balance]').textContent=balance;
  if(!reduced()){target.classList.remove('bj-pulse');void target.offsetWidth;target.classList.add('bj-pulse');}
  document.querySelector('#missions-preview').innerHTML=missionHome();notify(`アプリ起動で +${task.reward}pt。残高は${balance}ptになりました`);
  document.querySelector('.balance-pill').focus({preventScroll:true});
 }else if(act==='balance')openDialog('ポイントの内訳',`<p>交換可能なポイント</p>${reward(balance)}<div class="goal-dialog">${goal(balance)}</div><p class="kit-small">この画面の数値は検討用サンプルです。</p>`);
 else if(act==='task'){const task=tasks.find(t=>t.id===el.dataset.id);if(task?.kind==='steps')location.hash='home/steps';else openDialog('ミッションの見本','<p>該当の案件や動画を開く入口です。報酬額・条件・判定処理は現行仕様を引き継ぎます。</p>');}
 else if(act==='video')openDialog('動画でためる','<p>動画視聴の入口です。このデザイン試作では動画配信・ポイント付与には接続していません。</p>');
 else if(act==='reset'){balance=240;tasks=structuredClone(sampleTasks);if(location.hash!=='#home')location.hash='home';else render();notify('見本を最初の状態に戻しました');}
});
