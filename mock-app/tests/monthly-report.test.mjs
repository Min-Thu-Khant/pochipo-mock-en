import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,availableSurveys,surveyRewardRange,offerTerms} from '../model.js';
import {reportValues,recommendationItems,recommendation,monthlyReportMarkup,surveyDetailMarkup} from '../monthly-report.js';

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
   assert.equal(item.href,'#survey-detail/'+encodeURIComponent(item.id));
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
 assert.ok(high.every((o,i)=>i===0||high[i-1].reward>=o.reward));
 assert.doesNotMatch(recommendation(10000,'recommended',{candidates:values.candidates.slice(0,5)}),/<details/);
 const empty=recommendation(10000,'shopping',{});
 assert.match(empty,/現在、この貯め方でおすすめできる案件はありません/);
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
 assert.match(html,/href="#survey-detail\/survey"/);
});

test('おすすめの画像・タイトル・金額が1つの詳細リンク内にあり、個別リンクはない',()=>{
 const html=recommendation(10000,'recommended',reportValues(initialState()));
 const rows=[...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m=>m[1]);
 assert.equal(rows.length,10);
 for(const row of rows){
  assert.match(row,/^<a class="mr-plan-link" href="#(?:offer|survey-detail)\//);
  assert.ok(row.endsWith('</a>'));
  assert.equal((row.match(/<a /g)||[]).length,1);
  assert.match(row,/class="mr-plan-thumb"/);
  assert.match(row,/<h4>/);
  assert.match(row,/class="mr-plan-reward"/);
 }
 assert.doesNotMatch(html,/案件の詳細・条件を見る|class="mr-detail"/);
});
