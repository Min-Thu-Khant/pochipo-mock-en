import {readFileSync} from 'node:fs';
import {savingsPresentation,reportRewardRange} from '../savings-goal.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,availableSurveys,surveyRewardRange,offerTerms} from '../model.js';
import {reportValues,recommendationItems,recommendation,monthlyReportMarkup,surveyDetailMarkup,pointComparison,chart,reportGoalOptions,normalizeReportGoal} from '../monthly-report.js';
import {effectiveBalance} from '../point-ledger.js';
import {epcValue} from '../f03-display.js';

function bonusReportState(){
 const s=initialState();
 s.slots=s.slots.filter(x=>x.destination!=='card');
 const common={destination:'card',enabled:true,start:s.date,end:s.date,segment:'all',priority:100,placements:['challenge']};
 s.slots.push({...common,id:'report-normal',kind:'campaign',rewardMode:'flat',reward:300000},
  {...common,id:'report-bonus',kind:'challenge',bonus:200000,challengeGoal:1000,participants:100});
 return s;
}
test('未達成でも参加可能なボーナスを最大報酬へ加算し、表示額・範囲・EPCを揃える',()=>{
 const s=bonusReportState();
 reportValues(s); // Initialize existing mock account defaults before checking for reward mutations.
 const before=JSON.stringify(s),values=reportValues(s);
 assert.equal(values.candidates.find(o=>o.id==='card').reward,500000);
 assert.ok(!recommendationItems(values,300000).some(o=>o.id==='card'));
 assert.ok(recommendationItems(values,500000).some(o=>o.id==='card'));
 assert.ok(recommendationItems(values,1000000).some(o=>o.id==='card'));
 assert.match(recommendation(500000,'recommended',values),/最大 5,000円相当/);
 assert.equal(values.candidates.find(o=>o.id==='card').epc,90);
 assert.equal(JSON.stringify(s),before); // A maximum display never awards points.
 s.slots.find(x=>x.id==='report-bonus').bonus=200001;
 assert.ok(!recommendationItems(reportValues(s),500000).some(o=>o.id==='card'));
 assert.ok(recommendationItems(reportValues(s),1000000).some(o=>o.id==='card'));
});
test('終了・未開始・非公開・対象外のボーナスは加算せず、利用済み案件も出さない',()=>{
 for(const patch of [{enabled:false},{end:'2000-01-01'},{start:'2099-01-01'},{segment:'new'}]){
  const s=bonusReportState();
  Object.assign(s.slots.find(x=>x.id==='report-bonus'),patch);
  assert.equal(reportValues(s).candidates.find(o=>o.id==='card').reward,300000);
 }
 const s=bonusReportState();
 s.slots.find(x=>x.id==='report-bonus').participants=1000;
 assert.equal(reportValues(s).candidates.find(o=>o.id==='card').reward,500000);
 s.user.cases.push({offerId:'card'});
 assert.ok(!reportValues(s).candidates.some(o=>o.id==='card'));
});
test('アンケートも最低報酬ではなく最大報酬で同じ金額範囲を判定する',()=>{
 const values={surveyCandidates:[{id:'q',title:'調査',minReward:10000,reward:100000}]};
 assert.equal(recommendationItems(values,50000).length,0);
 assert.equal(recommendationItems(values,100000)[0].id,'q');
 assert.equal(recommendationItems(values,300000)[0].id,'q');
 assert.equal(recommendationItems(values,500000).length,0);
 assert.match(recommendation(100000,'recommended',values),/最大 1,000円相当/);
 const s=initialState();
 for(const q of availableSurveys(s))assert.equal(reportValues(s).surveyCandidates.find(x=>x.id===q.id).reward,surveyRewardRange(s,q).max);
});

test('範囲と料金・カテゴリで絞った後にEPC降順で10件を選び、先頭優先枠を作らない',()=>{
 const candidates=Array.from({length:12},(_,i)=>({id:String(i),category:'ゲーム',cost:'無料',reward:300000+i,epc:i}));
 candidates.push({id:'outside',category:'ゲーム',cost:'無料',reward:500001,epc:999},{id:'paid',category:'ゲーム',cost:'購入が必要',reward:400000,epc:888});
 const values={candidates,surveyCandidates:[{id:'survey',title:'調査',reward:400000,epc:0.5}]};
 const filters={costs:['free'],categories:['ゲーム','アンケート']};
 const items=recommendationItems(values,500000,'recommended',filters);
 assert.deepEqual(items.map(o=>o.id),['11','10','9','8','7','6','5','4','3','2']);
 const html=recommendation(500000,'recommended',values,filters);
 assert.deepEqual([...html.matchAll(/class="mr-plan-link" href="#offer\/([^"]+)"/g)].map(m=>m[1]),items.map(o=>o.id));
 assert.match(html,/start="6"/);
});
test('EPCの数値文字列・ゼロ・同値・未取得を既存ルールで並べる',()=>{
 const values={candidates:[
  {id:'2',epc:4},{id:'3',epc:'4'},{id:'1',epc:9},{id:'5',epc:0},
  {id:'10',epc:null},{id:'11',epc:''},{id:'12',epc:'unknown'},{id:'13',epc:undefined}
 ].map(o=>({...o,category:'ゲーム',reward:400000})),surveyCandidates:[{id:'travel',reward:400000}]};
 const items=recommendationItems(values,500000);
 assert.deepEqual(items.slice(0,4).map(o=>o.id),['1','3','2','5']);
 assert.deepEqual(items.filter(o=>o.kind==='offer'&&epcValue(o)===null).map(o=>o.id),['13','12','11','10']);
 assert.equal(epcValue(items.find(o=>o.kind==='survey')),null);
});
test('案件の明示EPCと既存のモックEPCをレポートの候補へ渡す',()=>{
 const s=initialState(),first=reportValues(s).candidates[0];
 const offer=s.nacs.offers.find(o=>o.id===first.id);
 offer.epc=123.45;
 assert.equal(reportValues(s).candidates.find(o=>o.id===first.id).epc,123.45);
 offer.epc=null;
 assert.equal(reportValues(s).candidates.find(o=>o.id===first.id).epc,null);
 const seeded=reportValues(initialState()).candidates.find(o=>o.id==='card');
 assert.equal(seeded.epc,90);
});

test('全6目標でひとつ前の金額から選択金額までを両端込みで絞り込む',()=>{
 const ranges=[[0,50000],[50000,100000],[100000,300000],[300000,500000],[500000,1000000],[1000000,2000000]];
 for(const [i,goal] of reportGoalOptions.entries()){
  const [lower,upper]=ranges[i];
  assert.deepEqual(reportRewardRange(goal),{lower,upper});
  const amounts=[lower-1,lower,lower+1,upper-1,upper,upper+1,NaN];
  const values={balance:99999999,candidates:amounts.map((reward,index)=>({id:String(index),category:'ゲーム',cost:'無料',reward})),surveyCandidates:[{id:'outside-survey',reward:upper+1}]};
  const items=recommendationItems(values,goal);
  assert.deepEqual(new Set(items.map(o=>o.reward)),new Set(amounts.filter(n=>Number.isFinite(n)&&n>0&&n>=lower&&n<=upper)));
  assert.ok(items.every(o=>o.kind==='offer'));
 }
});
test('金額範囲と料金・カテゴリをANDで適用し、範囲外から補充しない',()=>{
 const values={candidates:[
  ...Array.from({length:15},(_,i)=>({id:'outside'+i,category:'ゲーム',cost:'無料',reward:500001+i})),
  {id:'match',category:'ゲーム',cost:'無料',reward:300000},
  {id:'wrong-cost',category:'ゲーム',cost:'購入が必要',reward:400000},
  {id:'wrong-category',category:'アプリ',cost:'無料',reward:500000}
 ]};
 const filters={costs:['free'],categories:['ゲーム']};
 assert.deepEqual(recommendationItems(values,500000,'recommended',filters).map(o=>o.id),['match']);
 assert.equal(recommendationItems(values,2000000).length,0);
 assert.match(recommendation(2000000,'recommended',values),/現在、おすすめできる案件はありません/);
 // Returning to the previous goal uses its range again; balance never shifts the range.
 assert.deepEqual(recommendationItems(values,500000,'recommended',filters).map(o=>o.id),['match']);
});

test('追加目標は既存の順序を維持して20,000円相当を末尾に追加し、対象外の旧値は最寄りへ置き換える',()=>{
 assert.deepEqual(reportGoalOptions,[50000,100000,300000,500000,1000000,2000000]);
 assert.equal(normalizeReportGoal(10000),50000);
 assert.equal(normalizeReportGoal(2000000),2000000);
 assert.equal(normalizeReportGoal(undefined),50000);
 for(const goal of reportGoalOptions)assert.equal(normalizeReportGoal(goal),goal);
 const html=monthlyReportMarkup(initialState());
 assert.deepEqual([...html.matchAll(/data-report="goal" value="(\d+)"/g)].map(m=>Number(m[1])),reportGoalOptions);
});

test('追加目標の全6段階で袋が大きくなり、金額は実際の残高と追加目標を示す',()=>{
 const scales=reportGoalOptions.map(goal=>savingsPresentation(goal).scale);
 assert.ok(scales.every((scale,i)=>scale>0&&scale<=1&&(!i||scale>scales[i-1])));
 for(const balance of [0,34500,9876543]){
  for(const goal of reportGoalOptions){
   const p=pointComparison({balance},goal),html=chart({balance},goal);
   assert.deepEqual(p,{current:balance,additional:goal,target:balance+goal});
   assert.match(html,/mr-money-bag/);
   assert.doesNotMatch(html,/mr-bar|mr-growth-arrow|data-axis-max|mr-target-line/);
   assert.doesNotMatch(html,/増えるポイント|mr-savings-increase/);
   assert.ok(html.includes((balance+goal).toLocaleString('ja-JP')));
   assert.match(html,/頑張ったら<br>貯まるポイント/);
  }
 }
});
test('金額変更の演出は直前の袋サイズから動き、初期表示・フィルター操作ではコインを出さない',()=>{
 for(const goal of reportGoalOptions){
  const html=chart({balance:0},goal,{animate:true,fromGoal:100000});
  assert.match(html,/is-celebrating/);
  assert.ok(html.includes('--bag-from:'+savingsPresentation(100000).scale));
  assert.equal((html.match(/class="mr-falling-coin"/g)||[]).length,savingsPresentation(goal).coinCount);
  assert.doesNotMatch(chart({balance:0},goal),/is-celebrating|class="mr-falling-coin"/);
 }
});
test('動きを減らす設定では演出を停止し、コインの演出はループさせない',()=>{
 const css=readFileSync(new URL('../savings-goal.css',import.meta.url),'utf8');
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/animation:none!important/);
 assert.match(css,/\.mr-coin-rain\{display:none\}/);
 assert.doesNotMatch(css,/infinite/);
});

test('保存済みの旧目標も初回表示で置き換える',async()=>{
 for(const [saved,expected] of [[10000,50000],[2000000,2000000]]){
  const {monthlyReportMarkup:render}=await import(`../monthly-report.js?legacy-goal=${saved}`);
  const state=initialState();
  state.user.reportGoal=saved;
  assert.match(render(state),new RegExp(`data-report="goal" value="${expected}" checked`));
 }
});
import {emptyReportFilters,recommendationTraits,matchesReportFilters,reportCategories,recommendationCategory} from '../recommendation-filters.js';

test('EPCが高いアンケートも順序通りに含め、閉じたトグルで最大10件を表示',()=>{
 const values={candidates:Array.from({length:12},(_,i)=>({id:'offer'+i,name:'案件'+i,category:'ゲーム',reward:1000+i,epc:i})),surveyCandidates:[{id:'survey',title:'調査',reward:300,epc:20}]},items=recommendationItems(values,50000);
 assert.equal(items.length,10);
 assert.ok(items.slice(0,5).some(o=>o.kind==='survey'));
 assert.ok(items.slice(0,5).some(o=>o.kind==='offer'));
 assert.equal(new Set(items.map(o=>o.href)).size,10);
 const html=recommendation(10000,'recommended',values);
 const first=html.match(/<ol class="mr-plan-list">([\s\S]*?)<\/ol>/)[1];
 const rest=html.match(/<details class="mr-plan-more">([\s\S]*?)<\/details>/)[1];
 assert.equal((first.match(/<li>/g)||[]).length,5);
 assert.equal((rest.match(/<li>/g)||[]).length,5);
 assert.match(rest,/start="6"/);
 assert.doesNotMatch(html,/<details[^>]*\bopen/);
});

test('おすすめの金額とリンクは掲載案件・回答可能アンケートと一致する',()=>{
 const state=initialState(),values=reportValues(state);
 for(const item of recommendationItems(values,10000)){
  if(item.kind==='offer'){
   const terms=offerTerms(state,item.id);
   assert.equal(item.reward,terms.reward+(terms.challenge?.bonus||0));
   assert.equal(item.href,'#offer/'+encodeURIComponent(item.id));
  }else{
   const q=availableSurveys(state).find(q=>q.id===item.id);
   assert.ok(q);
   assert.deepEqual({min:item.minReward,max:item.reward},surveyRewardRange(state,q));
   assert.equal(item.href,'#answer/'+encodeURIComponent(item.id));
  }
 }
 state.user.cases.push({offerId:values.candidates[0].id});
 state.user.answered.push(values.surveyCandidates[0].id);
 const updated=reportValues(state);
 assert.ok(!updated.candidates.some(o=>o.id===values.candidates[0].id));
 assert.ok(!updated.surveyCandidates.some(o=>o.id===values.surveyCandidates[0].id));
});

test('選んだ貯め方で絞り込み、5件以下と空の結果にはトグルを出さない',()=>{
 const values=reportValues(initialState());
 const shopping=recommendationItems(values,10000,'shopping');
 assert.ok(shopping.length>0);
 assert.ok(shopping.every(o=>o.kind==='offer'&&o.category==='買い物'));
 const high=recommendationItems(values,10000,'high');
 assert.ok(high.every((o,i)=>i===0||(epcValue(high[i-1])??-Infinity)>=(epcValue(o)??-Infinity)));
 assert.doesNotMatch(recommendation(10000,'recommended',{candidates:values.candidates.slice(0,5)}),/<details/);
 const empty=recommendation(10000,'shopping',{});
 assert.match(empty,/現在、おすすめできる案件はありません/);
 assert.doesNotMatch(empty,/<details/);
});

test('アンケート詳細に報酬範囲と回答導線を表示し、回答済みは開始させない',()=>{
 const state=initialState();
 const html=surveyDetailMarkup(state,'s1');
 const r=surveyRewardRange(state,availableSurveys(state).find(q=>q.id==='s1'));
 assert.match(html,new RegExp(r.min.toLocaleString('ja-JP')+'〜'+r.max.toLocaleString('ja-JP')+' pt'));
 assert.match(html,/data-action="open-survey" data-id="s1"/);
 state.user.answered.push('s1');
 assert.doesNotMatch(surveyDetailMarkup(state,'s1'),/data-action="open-survey"/);
 assert.match(surveyDetailMarkup(state,'missing'),/現在回答できません/);
});

test('おすすめ原稿とレポートのJSON属性をHTMLとして解釈させない',()=>{
 const values={candidates:[{id:'test',category:'買い物',name:"<img src=x onerror=alert(1)> ' \" &",reward:10000}]};
 const html=recommendation(10000,'recommended',values);
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;img/);
 const state=initialState();
 const offer=state.nacs.offers.find(o=>reportValues(state).candidates.some(c=>c.id===o.id));
 offer.name="O'Reilly <sample>";
 const report=monthlyReportMarkup(state);
 const json=report.match(/data-values='([^']*)'/)[1]
  .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
 assert.ok(JSON.parse(json).candidates.some(o=>o.name===offer.name));
 assert.doesNotMatch(report,/data-example|report-detail/);
});

test('おすすめは最大報酬の円相当だけを表示し、範囲の下限やptは併記しない',()=>{
 const values={candidates:[{id:'offer',name:'案件',category:'ゲーム',reward:12345,epc:1}],
  surveyCandidates:[{id:'survey',title:'調査',minReward:30,reward:300}]};
 const html=recommendation(10000,'recommended',values);
 const rewards=[...html.matchAll(/<div class="mr-plan-reward"><b>(.*?)<\/b><\/div>/g)].map(m=>m[1]);
 assert.deepEqual(rewards,['最大 123.45円相当','最大 3円相当']);
 assert.ok(rewards.every(label=>!label.includes('pt')&&!label.includes('〜')));
 assert.match(html,/href="#offer\/offer"/);
 assert.match(html,/href="#answer\/survey"/);
});

test('おすすめの画像・タイトル・金額が1つの詳細リンク内にあり、個別リンクはない',()=>{
 const html=recommendation(10000,'recommended',reportValues(initialState()));
 const rows=[...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m=>m[1]);
 assert.equal(rows.length,recommendationItems(reportValues(initialState()),10000).length);
 assert.ok(rows.length>0);
 for(const row of rows){
  assert.match(row,/^<a class="mr-plan-link" href="#(?:offer|answer)\//);
  assert.ok(row.endsWith('</a>'));
  assert.equal((row.match(/<a /g)||[]).length,1);
  assert.match(row,/class="mr-plan-thumb"/);
  assert.match(row,/<h4>/);
  assert.match(row,/class="mr-plan-reward"/);
 }
 assert.doesNotMatch(html,/案件の詳細・条件を見る|class="mr-detail"/);
});

test('料金・カテゴリ内の複数選択はOR、料金とカテゴリの間はAND',()=>{
 const values={candidates:[
  {id:'free-game',category:'ゲーム',cost:'無料',reward:10000},
  {id:'trial-app',category:'アプリ',cost:'初回無料',reward:11000},
  {id:'paid-game',category:'ゲーム',cost:'購入が必要',reward:12000},
  {id:'free-app',category:'アプリ',cost:'無料',condition:'初回インストール・起動',reward:13000},
  {id:'paid-shop',category:'買い物',cost:'購入が必要',reward:14000}
 ],surveyCandidates:[{id:'short',minutes:3,reward:300},{id:'long',minutes:8,reward:600}]};
 const filters={costs:['free','trial'],categories:['アプリ','アンケート']};
 assert.deepEqual(new Set(recommendationItems(values,10000,'high',filters).map(o=>o.id)),new Set(['trial-app','free-app','short','long']));
 assert.equal(recommendationItems(values,10000,'shopping',filters).length,0);
 assert.deepEqual(recommendationItems(values,10000,'high',emptyReportFilters()),recommendationItems(values,10000,'high'));
});

test('無料年会費と完全無料を区別する',()=>{
 assert.equal(recommendationTraits({cost:'年会費無料',condition:'初回カード発行・利用条件達成'}).costType,'paid');
 assert.equal(recommendationTraits({cost:'無料',condition:'初めての宿泊予約・宿泊完了'}).costType,'paid');
 assert.equal(recommendationTraits({cost:'無料体験後は有料'}).costType,'trial');
 assert.equal(recommendationTraits({cost:'詳細参照',costType:'trial'}).costType,'trial');
 assert.equal(recommendationTraits({cost:'無料',condition:'新規口座開設・入金'}).costType,'');
 assert.equal(matchesReportFilters({cost:'確認中'},{...emptyReportFilters(),costs:['free']}),false);
});

test('最大10件に切り詰める前に絞り込み、利用済み案件・回答済みアンケートを除外する',()=>{
 const values={candidates:Array.from({length:24},(_,i)=>({id:String(i),name:'案件'+i,category:'ゲーム',reward:i+1,cost:i<12?'購入が必要':'無料'}))};
 const filters={...emptyReportFilters(),costs:['free']};
 assert.equal(recommendationItems(values,1,'recommended',filters).length,10);
 assert.ok(recommendationItems(values,1,'recommended',filters).every(o=>Number(o.id)>=12));
 const html=recommendation(1,'recommended',values,filters);
 assert.equal((html.match(/<li>/g)||[]).length,10);
 const state=initialState();state.user.answered.push('s1');state.user.cases.push({offerId:'news'});
 const items=recommendationItems(reportValues(state),10000,'recommended',{...filters});
 assert.ok(items.every(o=>o.id!=='s1'&&o.id!=='news'));
});

test('フィルターは選択状態を表し、空の結果からリセットできる',()=>{
 const values=reportValues(initialState()),filters={costs:['trial'],categories:['アンケート']};
 const html=recommendation(10000,'recommended',values,filters,true);
 assert.match(html,/aria-expanded="true" aria-controls="mr-filter-panel"/);
 assert.match(html,/2条件を選択中/);
 assert.match(html,/value="trial" checked/);
 assert.match(html,/選択した条件に合う案件はありません/);
 assert.match(html,/絞り込みをリセット/);
 assert.doesNotMatch(html,/<li>|もっと見る/);
 assert.match(recommendation(10000,'recommended',values),/id="mr-filter-panel" hidden/);
 assert.ok(reportCategories(values).includes('アンケート'));
 // Category labels and selected summaries are escaped as well as offer titles.
 assert.doesNotMatch(recommendation(1,'recommended',{candidates:[]},{costs:[],categories:['<img src=x>']}),/<img src=x/);
});

test('金融と買い物を細分類し、カテゴリの表示と絞り込みを一致させる',()=>{
 const values=reportValues(initialState());
 const expected={card:'クレジットカード',sec:'証券・投資',pay:'銀行・決済',cosme:'コスメ・美容',interior:'家具・インテリア',marche:'通販・日用品',travel:'旅行・宿泊'};
 for(const [id,category] of Object.entries(expected)){
  const offer=values.candidates.find(o=>o.id===id);
  assert.ok(offer,id);
  assert.equal(recommendationCategory(offer),category);
  const filters={costs:[],categories:[category]};
  const goal=reportGoalOptions.find(n=>n>=offer.reward);
  const items=recommendationItems(values,goal,'recommended',filters);
  assert.ok(items.some(o=>o.id===id));
  assert.ok(items.every(o=>recommendationCategory(o)===category));
  assert.match(recommendation(goal,'recommended',values,filters),new RegExp('mr-plan-tag">'+category));
 }
 const filters={costs:['paid'],categories:['コスメ・美容','家具・インテリア']};
 assert.deepEqual(new Set(recommendationItems(values,10000,'recommended',filters).map(o=>o.id)),new Set(['cosme','interior']));
 assert.equal(recommendationCategory({category:'金融',reportCategory:'保険'}),'保険');
 const html=recommendation(10000,'recommended',values,emptyReportFilters(),true);
 const panel=html.slice(html.indexOf('<div class="mr-filter-panel"'),html.indexOf('<div class="mr-results"'));
 assert.deepEqual([...panel.matchAll(/<legend>(.*?)<\/legend>/g)].map(m=>m[1]),['料金','案件カテゴリ']);
 assert.doesNotMatch(panel,/mr-filter-hint|取り組みやすさ|すぐできる|複数選択できます|<p/);
 assert.ok(!reportCategories(values).includes('金融'));
 assert.ok(!reportCategories(values).includes('買い物'));
});

test('袋の金額表示は当月獲得累計や準備中を加えず、保有ポイントと追加目標を比較する',()=>{
 const state=initialState(),balance=effectiveBalance(state);
 state.user.pending=999999;
 state.user.history.push({status:'approved',amount:123456789,date:state.date});
 const values=reportValues(state),before=JSON.stringify(state);
 assert.equal(values.balance,balance);
 assert.equal(pointComparison(values,10000).target,balance+10000);
 assert.equal(pointComparison(values,1000000).target,balance+1000000);
 chart(values,2000000,{animate:true,fromGoal:50000});
 assert.equal(JSON.stringify(state),before);
});
test('0ptと大きい目標の金額を維持し、旧グラフや貯め方選択を表示しない',()=>{
 assert.deepEqual(pointComparison({balance:0},10000),{current:0,additional:10000,target:10000});
 const html=chart({balance:34500},1000000);
 for(const text of ['34,500','1,034,500','10,345円相当','今のポイント','頑張ったら<br>貯まるポイント'])assert.ok(html.includes(text));
 assert.doesNotMatch(chart({balance:0},0),/NaN|Infinity/);
 const report=monthlyReportMarkup(initialState());
 assert.doesNotMatch(report,/mr-bar|mr-growth-arrow|どうやって貯めたい？|data-report="way"|report-preference/);
 assert.match(report,/今のポイントと目標/);
 assert.match(report,/あといくら貯めたい？/);
 assert.match(report,/あなたにぴったりの貯め方/);
 assert.match(report,/もっと絞る/);
});

test('配信なしの確認では一覧とレポートのアンケート候補が共に空になる',()=>{for(const patch of [{scenario:'empty'},{surveyPreview:'empty'}]){const s=Object.assign(initialState(),patch);assert.deepEqual(availableSurveys(s),[]);assert.deepEqual(reportValues(s).surveyCandidates,[]);assert.ok(recommendationItems(reportValues(s),10000).every(x=>x.kind!=='survey'));}});
