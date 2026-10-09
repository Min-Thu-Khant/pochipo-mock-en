import {affiliateSampleImage} from './affiliate-sample-image.js';
import {icon} from './design-system/app-theme/library-icons.js';
import {yen,visibleOffers,offerTerms,availableSurveys,surveyReward,surveyRewardRange} from './model.js';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>n.toLocaleString('ja-JP');
export function reportValues(state){
 const date=String(state.date).slice(0,10), month=date.slice(0,7);
 const [y,m,d]=date.split('-').map(Number);
 const days=new Date(y,m,0).getDate()-d+1;
 const entries=(state.user.history||[]).filter(h=>h.status==='approved'&&h.amount>0&&String(h.date).slice(0,7)===month&&String(h.date).slice(0,10)<=date);
 const daily=Array.from({length:d},(_,i)=>entries.filter(h=>Number(String(h.date).slice(8,10))<=i+1).reduce((sum,h)=>sum+h.amount,0));
 const candidates=visibleOffers(state).filter(o=>!(state.user.cases||[]).some(c=>c.offerId===o.id)).map(o=>{const t=offerTerms(state,o.id);return {id:o.id,name:o.name,category:o.category,image:o.creative?.[o.creative.source]?.image||'',condition:o.condition,time:o.time,cost:o.cost,reward:t.reward,mode:t.rewardMode,sur:t.sur};}).filter(o=>o.mode==='flat'&&o.reward>0&&!o.sur);
 const surveyCandidates=availableSurveys(state).map(q=>({id:q.id,title:q.title,minutes:q.minutes,reward:surveyReward(state,q),minReward:surveyRewardRange(state,q).min})).filter(q=>q.reward>0);
 return {surveyCandidates,candidates,daily,actual:entries.reduce((sum,h)=>sum+h.amount,0),days,month:m,day:d,card:8000,survey:5*10*days};
}
function chart(v,goal=10000){
 const last=v.day+v.days-1,pace=Math.round(v.actual/v.day*last),target=pace+goal;
 // Fit the selected target with readable, rounded tick intervals.
 const required=Math.max(target,pace,...v.daily,1)*1.1,raw=required/4;
 const magnitude=10**Math.floor(Math.log10(raw));
 const step=[1,2,2.5,5,10].map(n=>n*magnitude).find(n=>n>=raw),max=step*4;
 const x=d=>60+(d-1)/(last-1)*254,y=n=>215-n/max*165;
 return `<svg viewBox="0 28 330 218" role="img" aria-label="今月の累計実績${fmt(v.actual)}ポイント。追加目標${fmt(goal)}ポイント、目標合計${fmt(target)}ポイント。このままのペースの月末見込み${fmt(pace)}ポイント。破線は達成イメージです。"><g font-size="12" fill="var(--muted)">${[0,1,2,3,4].map(i=>{const n=step*i;return `<line x1="60" x2="314" y1="${y(n)}" y2="${y(n)}" stroke="var(--line)"/><text x="54" y="${y(n)+4}" text-anchor="end">${fmt(n)}</text>`}).join('')}<text x="60" y="240">${v.month}/1</text><text x="${x(v.day)}" y="240" text-anchor="middle">${v.month}/${v.day}</text><text x="314" y="240" text-anchor="end">${v.month}/${last}</text></g><polyline points="${v.daily.map((n,i)=>`${x(i+1)},${y(n)}`).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="3"/><path d="M${x(v.day)},${y(v.actual)} L314,${y(pace)}" fill="none" stroke="#858585" stroke-width="2.5" stroke-dasharray="3 5"/><circle cx="314" cy="${y(pace)}" r="4" fill="#858585"/><path d="M${x(v.day)},${y(v.actual)} L314,${y(target)}" fill="none" stroke="#c48b28" stroke-width="3" stroke-dasharray="5 5"/><circle cx="${x(v.day)}" cy="${y(v.actual)}" r="4" fill="var(--primary)"/><circle cx="314" cy="${y(target)}" r="4" fill="#c48b28"/><text x="308" y="${y(target)-10}" text-anchor="end" font-size="12" fill="#94631a" stroke="white" stroke-width="3" paint-order="stroke">${fmt(target)}pt</text><text x="308" y="${Math.abs(y(target)-y(pace))<26?y(pace)+16:y(pace)-10}" text-anchor="end" font-size="12" fill="#686868" stroke="white" stroke-width="3" paint-order="stroke">${fmt(pace)}pt</text><text x="${x(v.day)}" y="${y(v.actual)-12}" text-anchor="middle" font-size="12" fill="var(--ink)">${fmt(v.actual)}pt</text></svg>`;
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

const preferences={recommended:'おすすめの方法で貯めたい',high:'高還元の案件で貯めたい',short:'すきま時間に貯めたい',shopping:'いつものお買い物で貯めたい'};
let reportGoal=10000,reportPreference='recommended';
export function recommendationItems(values,goal,selected='recommended'){
 const offers=(values.candidates||[]).map(o=>({...o,kind:'offer',href:'#offer/'+encodeURIComponent(o.id)}));
 const surveys=(values.surveyCandidates||[]).map(q=>({...q,name:q.title,category:'アンケート',kind:'survey',href:'#survey-detail/'+encodeURIComponent(q.id)}));
 const eligible=[...offers,...surveys].filter(o=>selected==='shopping'?o.category==='買い物':selected==='short'?o.kind==='survey'||o.category==='アプリ':true);
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
export function recommendation(goal,selected='recommended',values={}){
 const list=recommendationItems(values,goal,selected);
 const row=o=>`<li><a class="mr-plan-link" href="${escapeHtml(o.href)}"><div class="mr-plan-thumb" aria-hidden="true">${recommendationArt(o)}</div><div class="mr-plan-copy"><h4>${escapeHtml(o.name)}</h4><span class="mr-plan-tag">${escapeHtml(o.category)}${o.kind==='offer'?' ・ PR':''}</span><div class="mr-plan-reward"><b>最大 ${yen(o.reward)}円相当</b></div></div></a></li>`;
 return `<div class="mr-plan-summary"><strong>あなたにぴったりの貯め方</strong><img class="mr-savings-art" src="assets/report/savings-coins.png" alt="" width="80" height="64"></div>${list.length?`<ol class="mr-plan-list">${list.slice(0,5).map(row).join('')}</ol>${list.length>5?`<details class="mr-plan-more"><summary><span class="mr-more-closed">もっと見る</span><span class="mr-more-open">閉じる</span></summary><ol class="mr-plan-list" start="6">${list.slice(5,10).map(row).join('')}</ol></details>`:''}`:'<p class="mr-plan-message">現在、この貯め方でおすすめできる案件はありません。</p>'}`;
}
export function surveyDetailMarkup(state,id){
 const q=availableSurveys(state).find(q=>q.id===id);
 if(!q)return '<main class="survey-detail-page"><h2>このアンケートは現在回答できません</h2><p>回答済み、または配信条件の対象外です。</p><a href="#surveys" class="mr-detail">回答できるアンケートを見る →</a></main>';
 const range=surveyRewardRange(state,q),reward={reward:range.max,minReward:range.min};
 return `<main class="survey-detail-page"><span class="mr-plan-tag">アンケート</span><h2>${escapeHtml(q.title)}</h2><p class="survey-detail-reward">${rewardLabel(reward,fmt)} pt</p><p class="mr-note">${rewardLabel(reward,yen)}円相当</p><dl><dt>所要時間</dt><dd>約${escapeHtml(q.minutes)}分</dd><dt>ポイント獲得条件</dt><dd>アンケートに回答し、最後まで送信を完了すること。</dd><dt>獲得ポイントについて</dt><dd>回答内容や調査の進行により、獲得できるポイントが異なります。</dd></dl><button type="button" class="btn primary wide" data-action="open-survey" data-id="${escapeHtml(q.id)}">回答する</button></main>`;
}
function goalMarkup(){return `<div class="mr-goal"><h3>追加で貯めたい金額をお選びください</h3><fieldset class="mr-goal-options"><legend class="mr-sr">追加で貯めたいポイント</legend>${[10000,50000,100000,300000,500000,1000000].map(n=>`<label><input type="radio" name="report-goal" data-report="goal" value="${n}" ${n===reportGoal?'checked':''}><span class="mr-amount">${yen(n)}円相当<small>+${fmt(n)} pt</small></span></label>`).join('')}</fieldset><h3 style="margin-top:24px">ご希望の貯め方をお選びください</h3><fieldset class="mr-goal-options mr-way-options"><legend class="mr-sr">貯め方</legend>${Object.entries(preferences).map(([id,label])=>`<label><input type="radio" name="report-preference" data-report="way" value="${id}" ${id===reportPreference?'checked':''}><span>${label}</span></label>`).join('')}</fieldset></div>`;}
export function monthlyReportMarkup(state){const v=reportValues(state);return `<section class="monthly-report" aria-labelledby="mr-title" data-values='${escapeHtml(JSON.stringify(v))}'><div class="mr-heading"><div><h2 id="mr-title">今月のポイント獲得レポート</h2></div></div><div class="mr-chart" aria-live="polite">${chart(v,reportGoal)}</div><div class="mr-legend"><span>━ 実績（累計）</span><span style="color:#858585">┄ このままのペース</span><span style="color:#94631a">┄ 選んだ目標</span></div>${goalMarkup()}<div class="mr-recommendation" aria-live="polite">${recommendation(reportGoal,reportPreference,v)}</div></section>`;}
if(typeof document!=='undefined') document.addEventListener('change',e=>{if(!e.target.matches('[data-report]'))return;const root=e.target.closest('.monthly-report'),values=JSON.parse(root.dataset.values),goal=Number(root.querySelector('[data-report="goal"]:checked').value),selected=root.querySelector('[data-report="way"]:checked').value;reportGoal=goal;reportPreference=selected;root.querySelector('.mr-chart').innerHTML=chart(values,goal);root.querySelector('.mr-recommendation').innerHTML=recommendation(goal,selected,values);});
