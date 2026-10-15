import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,availableSurveys,surveyRewardRange,offerTerms} from '../model.js';
import {reportValues,recommendationItems,recommendation,monthlyReportMarkup,surveyDetailMarkup,pointComparison,chart} from '../monthly-report.js';
import {effectiveBalance} from '../point-ledger.js';
import {emptyReportFilters,recommendationTraits,matchesReportFilters,reportCategories,recommendationCategory} from '../recommendation-filters.js';

test('おすすめは最初の5件にアンケートを含め、閉じたトグルで最大10件を表示',()=>{
 const values=reportValues(initialState()),items=recommendationItems(values,10000);
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
   assert.equal(item.reward,offerTerms(state,item.id).reward);
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

test('選んだため方で絞り込み、5件以下と空の結果にはトグルを出さない',()=>{
 const values=reportValues(initialState());
 const shopping=recommendationItems(values,10000,'shopping');
 assert.ok(shopping.length>0);
 assert.ok(shopping.every(o=>o.kind==='offer'&&o.category==='買い物'));
 const high=recommendationItems(values,10000,'high');
 assert.ok(high.every((o,i)=>i===0||high[i-1].reward>=o.reward));
 assert.doesNotMatch(recommendation(10000,'recommended',{candidates:values.candidates.slice(0,5)}),/<details/);
 const empty=recommendation(10000,'shopping',{});
 assert.match(empty,/現在、このため方でおすすめできる案件はありません/);
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
 const values={candidates:[{id:'offer',name:'案件',category:'ゲーム',reward:123450}],
  surveyCandidates:[{id:'survey',title:'調査',minReward:30,reward:300}]};
 const html=recommendation(10000,'recommended',values);
 const rewards=[...html.matchAll(/<div class="mr-plan-reward"><b>(.*?)<\/b><\/div>/g)].map(m=>m[1]);
 assert.deepEqual(rewards,['最大 1,234.5円相当','最大 3円相当']);
 assert.ok(rewards.every(label=>!label.includes('pt')&&!label.includes('〜')));
 assert.match(html,/href="#offer\/offer"/);
 assert.match(html,/href="#answer\/survey"/);
});

test('おすすめの画像・タイトル・金額が1つの詳細リンク内にあり、個別リンクはない',()=>{
 const html=recommendation(10000,'recommended',reportValues(initialState()));
 const rows=[...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m=>m[1]);
 assert.equal(rows.length,10);
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
  const items=recommendationItems(values,10000,'recommended',filters);
  assert.ok(items.some(o=>o.id===id));
  assert.ok(items.every(o=>recommendationCategory(o)===category));
  assert.match(recommendation(10000,'recommended',values,filters),new RegExp('mr-plan-tag">'+category));
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

test('比較グラフは当月獲得累計や準備中を加えず、保有ポイントと追加目標を比較する',()=>{
 const state=initialState(),balance=effectiveBalance(state);
 state.user.pending=999999;
 state.user.history.push({status:'approved',amount:123456789,date:state.date});
 const values=reportValues(state);
 assert.equal(values.balance,balance);
 const before=JSON.stringify(state);
 assert.equal(pointComparison(values,10000).target,balance+10000);
 assert.equal(pointComparison(values,1000000).target,balance+1000000);
 assert.equal(JSON.stringify(state),before);
 const p=pointComparison({balance:30000},10000);
 assert.equal(p.currentHeight,75);
 assert.equal(p.targetHeight,100);
 assert.equal(p.additional,10000);
});

test('棒グラフは0pt・大きい追加目標を同じ基準線で示し、旧折れ線の凡例を出さない',()=>{
 assert.deepEqual(pointComparison({balance:0},10000),{current:0,additional:10000,target:10000,currentHeight:0,targetHeight:100});
 const html=chart({balance:34500},1000000);
 assert.match(html,/34,500/);
 assert.match(html,/1,034,500/);
 assert.match(html,/10,345円相当/);
 assert.match(html,/今のポイント/);
 assert.match(html,/頑張ったら<br>貯まるポイント/);
 assert.equal((html.match(/class="mr-bar mr-bar-/g)||[]).length,2);
 assert.doesNotMatch(html,/NaN|Infinity|polyline/);
 const report=monthlyReportMarkup(initialState());
 assert.doesNotMatch(report,/このままのペース|mr-legend|今月のポイント獲得レポート/);
 assert.match(report,/今のポイントと目標/);
});

test('増える部分だけを色分けし、矢印とpt・円相当の差分を示す',()=>{
 const html=chart({balance:30000},10000);
 assert.match(html,/mr-bar-increase" style="height:25%"/);
 assert.match(html,/mr-bar-base" style="height:75%"/);
 assert.match(html,/mr-growth-arrow/);
 assert.match(html,/＋10,000 pt/);assert.match(html,/＋100円相当/);
 const empty=chart({balance:0},0);
 assert.doesNotMatch(empty,/NaN|Infinity|mr-growth-arrow/);
 assert.match(chart({balance:0},10000),/mr-bar-increase" style="height:100%"/);
 const report=monthlyReportMarkup(initialState());
 assert.match(report,/あといくらためたい？/);assert.match(report,/どうやってためたい？/);
 assert.match(report,/おすすめの方法で<br>ためたい/);assert.match(report,/もっと絞る/);
});

test('配信なしの確認では一覧とレポートのアンケート候補が共に空になる',()=>{for(const patch of [{scenario:'empty'},{surveyPreview:'empty'}]){const s=Object.assign(initialState(),patch);assert.deepEqual(availableSurveys(s),[]);assert.deepEqual(reportValues(s).surveyCandidates,[]);assert.ok(recommendationItems(reportValues(s),10000).every(x=>x.kind!=='survey'));}});
