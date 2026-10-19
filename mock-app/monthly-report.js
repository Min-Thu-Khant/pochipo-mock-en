import {effectiveBalance} from './point-ledger.js';
import {affiliateSampleImage} from './affiliate-sample-image.js';
import {icon} from './design-system/app-theme/library-icons.js?v=chevron-unified';
import {emptyReportFilters,reportCostOptions,reportFilterCount,reportCategories,recommendationCategory,matchesReportFilters} from './recommendation-filters.js';
import {yen,visibleOffers,offerTerms,availableSurveys,surveyReward,surveyRewardRange} from './model.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('ja-JP');
export function reportValues(state){
 const date=String(state.date).slice(0,10), month=date.slice(0,7);
 const [y,m,d]=date.split('-').map(Number);
 const days=new Date(y,m,0).getDate()-d+1;
 const entries=(state.user.history||[]).filter(h=>h.status==='approved'&&h.amount>0&&String(h.date).slice(0,7)===month&&String(h.date).slice(0,10)<=date);
 const daily=Array.from({length:d},(_,i)=>entries.filter(h=>Number(String(h.date).slice(8,10))<=i+1).reduce((sum,h)=>sum+h.amount,0));
 const candidates=visibleOffers(state).filter(o=>!(state.user.cases||[]).some(c=>c.offerId===o.id)).map(o=>{const t=offerTerms(state,o.id);return {id:o.id,name:o.name,category:o.category,image:o.creative?.[o.creative.source]?.image||'',condition:o.condition,time:o.time,cost:o.cost,costType:o.costType,reportCategory:o.reportCategory,creditCard:o.creditCard,art:o.art,reward:t.reward,mode:t.rewardMode,sur:t.sur};}).filter(o=>o.mode==='flat'&&o.reward>0&&!o.sur);
 const surveyCandidates=availableSurveys(state).map(q=>({id:q.id,title:q.title,minutes:q.minutes,reward:surveyReward(state,q),minReward:surveyRewardRange(state,q).min})).filter(q=>q.reward>0);
 return {balance:effectiveBalance(state),surveyCandidates,candidates,daily,actual:entries.reduce((sum,h)=>sum+h.amount,0),days,month:m,day:d,card:8000,survey:5*10*days};
}
export function pointComparison(v,goal=10000){
 const current=Math.max(0,Number(v.balance)||0),additional=Math.max(0,Number(goal)||0);
 const target=current+additional,scale=Math.max(target,1);
 return {current,additional,target,currentHeight:current/scale*100,targetHeight:target/scale*100};
}
export function chart(v,goal=10000){
 const p=pointComparison(v,goal);
 const column=(value,height,label,kind)=>`<div class="mr-bar-column"><div class="mr-bar-value"><strong>${fmt(value)}<small>pt</small></strong><span>${yen(value)}円相当</span></div><div class="mr-bar-plot" aria-hidden="true"><div class="mr-bar mr-bar-${kind}" style="height:${height}%">${kind==='target'?`<span class="mr-bar-increase" style="height:${p.target?p.additional/p.target*100:0}%"></span><span class="mr-bar-base" style="height:${p.currentHeight}%"></span>`:''}</div></div><div class="mr-bar-label">${label}</div></div>`;
 const arrow=p.additional?`<svg class="mr-growth-arrow" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="mr-growth-tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs><path d="M42 ${Math.max(36,160*(1-p.currentHeight/100)-6)} L57 10" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#mr-growth-tip)"/></svg>`:'';
 return `<div class="mr-bar-chart" role="img" aria-label="今のポイント${fmt(p.current)}ポイント。選んだ追加目標${fmt(p.additional)}ポイントを達成すると、合計${fmt(p.target)}ポイント。薄ピンクの部分は今のポイント。濃いピンクの部分が増える${fmt(p.additional)}ポイント、${yen(p.additional)}円相当です。"><div class="mr-bar-columns" aria-hidden="true">${column(p.current,p.currentHeight,'今のポイント','current')}${column(p.target,p.targetHeight,'頑張ったら<br>貯まるポイント','target')}${arrow}</div></div><p class="mr-bar-goal"><span class="mr-growth-swatch" aria-hidden="true"></span>増えるポイント <strong>＋${fmt(p.additional)} pt</strong><span>（＋${yen(p.additional)}円相当）</span></p>`;
}
export function goalPlan(goal,candidates=[]){
 const sorted=[...candidates].sort((a,b)=>a.reward-b.reward);
 const singles=sorted.filter(o=>o.reward>=goal).slice(0,3);
 if(singles.length)return {singles,combo:[]};
 const combo=[];let sum=0;for(const o of sorted.reverse()){combo.push(o);sum+=o.reward;if(sum>=goal)break;}
 return {singles:[],combo};
}
function surveyPanel(goal,values){
 const surveys=values.surveyCandidates||[];
 const average=surveys.length?Math.round(surveys.reduce((n,q)=>n+q.reward,0)/surveys.length):0;
 const perDay=average*5,days=perDay?Math.ceil(goal/perDay):0;
 return `<div class="mr-survey-panel"><span class="mr-plan-tag">すきま時間でコツコツ</span><h4>アンケートを1日5件回答</h4>${average?`<p>毎日続けると、追加目標まで</p><strong>約${fmt(days)}日<small>で達成の目安</small></strong>`:'<p>1日5件を目安に、コツコツ貯めよう。</p><p class="mr-note">現在回答できるアンケートがないため、達成日数は未表示です。</p>'}<a href="#surveys">アンケートに回答する →</a></div>`;
}

const preferences={recommended:'おすすめの方法で<br>貯めたい',high:'高還元の案件で貯めたい',short:'すきま時間に貯めたい',shopping:'いつものお買い物で貯めたい'};
let reportGoal=10000,reportPreference='recommended';
let reportFilters=emptyReportFilters(),reportFiltersOpen=false;
export function recommendationItems(values,goal,selected='recommended',filters=emptyReportFilters()){
 const offers=(values.candidates||[]).map(o=>({...o,kind:'offer',href:'#offer/'+encodeURIComponent(o.id)}));
 const surveys=(values.surveyCandidates||[]).map(q=>({...q,name:q.title,category:'アンケート',kind:'survey',href:'#answer/'+encodeURIComponent(q.id)}));
 const eligible=[...offers,...surveys].filter(o=>matchesReportFilters(o,filters)).filter(o=>selected==='shopping'?o.category==='買い物':selected==='short'?o.kind==='survey'||o.category==='アプリ':true);
 const ranked=eligible.sort((a,b)=>selected==='high'?b.reward-a.reward:Math.abs(a.reward-goal)-Math.abs(b.reward-goal));
 if(selected!=='recommended')return ranked.slice(0,10);
 // Include different categories and an available survey among the first five.
 const seen=new Set(),featured=[];
 for(const o of ranked.filter(o=>o.kind==='offer')){
  if(!seen.has(o.category)&&featured.length<4){seen.add(o.category);featured.push(o);}
 }
 const survey=ranked.find(o=>o.kind==='survey');
 if(survey)featured.push(survey);
 return [...featured,...ranked.filter(o=>!featured.includes(o))].slice(0,10);
}
const rewardLabel=(o,format)=>o.minReward!=null&&o.minReward!==o.reward?format(o.minReward)+'〜'+format(o.reward):format(o.reward);
function recommendationArt(o){
 if(o.kind==='survey')return '<span class="mr-survey-art">'+icon('survey')+'</span>';
 const src=String(o.image||'');
 // Only use supported image sources; all attributes are escaped.
 if(/^(https?:\/\/|data:image\/(?:png|jpeg|webp|gif);base64,|\.?\.?\/|assets\/)/i.test(src)){
  return `<img src="${escapeHtml(src)}" alt="" loading="lazy" width="80" height="80">`;
 }
 return affiliateSampleImage(o);
}
function recommendationResults(goal,selected,values,filters){
 const list=recommendationItems(values,goal,selected,filters);
 const row=o=>`<li><a class="mr-plan-link" href="${escapeHtml(o.href)}"><div class="mr-plan-thumb" aria-hidden="true">${recommendationArt(o)}</div><div class="mr-plan-copy"><h4>${escapeHtml(o.name)}</h4><span class="mr-plan-tag">${escapeHtml(recommendationCategory(o))}${o.kind==='offer'?' ・ PR':''}</span><div class="mr-plan-reward"><b>最大 ${yen(o.reward)}円相当</b></div></div></a></li>`;
 return `${list.length?`<ol class="mr-plan-list">${list.slice(0,5).map(row).join('')}</ol>${list.length>5?`<details class="mr-plan-more"><summary><span class="mr-more-closed">もっと見る</span><span class="mr-more-open">閉じる</span></summary><ol class="mr-plan-list" start="6">${list.slice(5,10).map(row).join('')}</ol></details>`:''}`:reportFilterCount(filters)?'<div class="mr-plan-message"><p>選択した条件に合う案件はありません。</p><p>絞り込み条件や、上の「貯め方」を変更してみてください。</p><button type="button" class="mr-filter-reset" data-report-filter-action="reset">絞り込みをリセット</button></div>':'<p class="mr-plan-message">現在、この貯め方でおすすめできる案件はありません。</p>'}`;
}
function filterStatus(filters){
 const labels=[...filters.costs.map(c=>reportCostOptions[c]),...filters.categories];
 return labels.length?labels.join('・'):'すべての料金・カテゴリ';
}
function filterPanel(values,filters,open){
 const option=(group,value,label,checked)=>`<label class="mr-filter-option"><input type="checkbox" data-report-filter="${group}" value="${escapeHtml(value)}" ${checked?'checked':''}><span>${escapeHtml(label)}</span></label>`;
 return `<div class="mr-filter-panel" id="mr-filter-panel" ${open?'':'hidden'}><fieldset><legend>料金</legend><div class="mr-filter-options">${Object.entries(reportCostOptions).map(([value,label])=>option('costs',value,label,filters.costs.includes(value))).join('')}</div></fieldset><fieldset><legend>案件カテゴリ</legend><div class="mr-filter-options">${reportCategories(values,filters).map(value=>option('categories',value,value,filters.categories.includes(value))).join('')}</div></fieldset><div class="mr-filter-actions"><button type="button" class="mr-filter-reset" data-report-filter-action="reset">リセット</button><button type="button" class="mr-filter-done" data-report-filter-action="close">一覧を見る</button></div></div>`;
}
export function recommendation(goal,selected='recommended',values={},filters=emptyReportFilters(),open=false){
 const count=reportFilterCount(filters);
 return `<div class="mr-plan-summary"><strong>あなたにぴったりの貯め方</strong><img class="mr-savings-art" src="assets/report/savings-coins.png" alt="" width="80" height="64"><div class="mr-filter-toolbar"><p class="mr-filter-status mr-sr" role="status">${escapeHtml(filterStatus(filters))}</p><button type="button" class="mr-filter-toggle" data-report-filter-action="toggle" aria-label="おすすめ案件を絞り込む${count?'、'+count+'条件を選択中':''}" aria-expanded="${open}" aria-controls="mr-filter-panel">${icon('settings')}<span aria-hidden="true">もっと絞る</span><span class="mr-filter-badge" aria-hidden="true" ${count?'':'hidden'}>${count}</span></button></div></div>${filterPanel(values,filters,open)}<div class="mr-results" aria-live="polite">${recommendationResults(goal,selected,values,filters)}</div>`;
}
export function surveyDetailMarkup(state,id){
 const q=availableSurveys(state).find(q=>q.id===id);
 if(!q)return '<main class="survey-detail-page"><h2>このアンケートは現在回答できません</h2><p>回答済み、または配信条件の対象外です。</p><a href="#surveys" class="mr-detail">回答できるアンケートを見る →</a></main>';
 const range=surveyRewardRange(state,q),reward={reward:range.max,minReward:range.min};
 return `<main class="survey-detail-page"><span class="mr-plan-tag">アンケート</span><h2>${escapeHtml(q.title)}</h2><p class="survey-detail-reward">${rewardLabel(reward,fmt)} pt</p><p class="mr-note">${rewardLabel(reward,yen)}円相当</p><dl><dt>所要時間</dt><dd>約${escapeHtml(q.minutes)}分</dd><dt>ポイント獲得条件</dt><dd>アンケートに回答し、最後まで送信を完了すること。</dd><dt>獲得ポイントについて</dt><dd>回答内容や調査の進行により、獲得できるポイントが異なります。</dd></dl><button type="button" class="btn primary wide" data-action="open-survey" data-id="${escapeHtml(q.id)}">回答する</button></main>`;
}
function goalMarkup(){return `<div class="mr-goal" id="report-goal" tabindex="-1"><h3>あといくら貯めたい？</h3><fieldset class="mr-goal-options"><legend class="mr-sr">追加で貯めたいポイント</legend>${[10000,50000,100000,300000,500000,1000000].map(n=>`<label><input type="radio" name="report-goal" data-report="goal" value="${n}" ${n===reportGoal?'checked':''}><span class="mr-amount">${yen(n)}円相当<small>+${fmt(n)} pt</small></span></label>`).join('')}</fieldset><h3 style="margin-top:24px">どうやって貯めたい？</h3><fieldset class="mr-goal-options mr-way-options"><legend class="mr-sr">貯め方</legend>${Object.entries(preferences).map(([id,label])=>`<label><input type="radio" name="report-preference" data-report="way" value="${id}" ${id===reportPreference?'checked':''}><span>${label}</span></label>`).join('')}</fieldset></div>`;}
export function monthlyReportMarkup(state){const v=reportValues(state);return `<section class="monthly-report" aria-labelledby="mr-title" data-values='${escapeHtml(JSON.stringify(v))}'><div class="mr-heading"><div><h2 id="mr-title">今のポイントと目標</h2></div></div><div class="mr-chart" aria-live="polite">${chart(v,reportGoal)}</div>${goalMarkup()}<div class="mr-recommendation">${recommendation(reportGoal,reportPreference,v,reportFilters,reportFiltersOpen)}</div></section>`;}
function refreshReportResults(root){
 const values=JSON.parse(root.dataset.values),count=reportFilterCount(reportFilters);
 root.querySelector('.mr-results').innerHTML=recommendationResults(reportGoal,reportPreference,values,reportFilters);
 root.querySelector('.mr-filter-status').textContent=filterStatus(reportFilters);
 const toggle=root.querySelector('.mr-filter-toggle'),badge=toggle.querySelector('.mr-filter-badge');
 toggle.setAttribute('aria-label','おすすめ案件を絞り込む'+(count?'、'+count+'条件を選択中':''));
 badge.textContent=count;badge.hidden=!count;
}
function setFilterPanelOpen(root,open){
 reportFiltersOpen=open;
 root.querySelector('.mr-filter-panel').hidden=!open;
 root.querySelector('.mr-filter-toggle').setAttribute('aria-expanded',String(open));
}
if(typeof document!=='undefined'){
 document.addEventListener('change',e=>{
  const root=e.target.closest('.monthly-report');
  if(!root)return;
  if(e.target.matches('[data-report-filter]')){
   reportFilters={
    costs:[...root.querySelectorAll('[data-report-filter="costs"]:checked')].map(input=>input.value),
    categories:[...root.querySelectorAll('[data-report-filter="categories"]:checked')].map(input=>input.value)
   };
   refreshReportResults(root);
   return;
  }
  if(!e.target.matches('[data-report]'))return;
  const values=JSON.parse(root.dataset.values);
  reportGoal=Number(root.querySelector('[data-report="goal"]:checked').value);
  reportPreference=root.querySelector('[data-report="way"]:checked').value;
  root.querySelector('.mr-chart').innerHTML=chart(values,reportGoal);
  root.querySelector('.mr-recommendation').innerHTML=recommendation(reportGoal,reportPreference,values,reportFilters,reportFiltersOpen);
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-report-filter-action]'),root=button?.closest('.monthly-report');
  if(!root)return;
  const action=button.dataset.reportFilterAction;
  if(action==='reset'){
   reportFilters=emptyReportFilters();
   root.querySelectorAll('[data-report-filter]').forEach(input=>{input.checked=false;});
   const fromResults=!!button.closest('.mr-results');
   refreshReportResults(root);
   if(fromResults)root.querySelector('.mr-filter-toggle').focus();
  }else{
   setFilterPanelOpen(root,action==='toggle'?!reportFiltersOpen:false);
   if(action==='close')root.querySelector('.mr-filter-toggle').focus();
  }
 });
 document.addEventListener('keydown',e=>{
  const root=e.target.closest('.monthly-report');
  if(e.key==='Escape'&&root&&reportFiltersOpen){
   setFilterPanelOpen(root,false);
   root.querySelector('.mr-filter-toggle').focus();
   e.preventDefault();
  }
 });
}
