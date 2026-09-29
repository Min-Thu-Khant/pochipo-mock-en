import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {initialState,total,schedule,autoReview,addSteps,claimSteps,day,createConversion,progressOffer} from '../model.js';
import {initialReceipt} from '../receipt-model.js';
import {ATTENTION_KEY,initialAttention,readAttention,observePoints,attentionInventory,attentionFlags,markCategoryRead,markPillRead,markCasesRead,acknowledgeAttention} from '../attention.js';

const setup=()=>{const state=initialState(),receipt=initialReceipt(),attention=initialAttention(state);return {state,receipt,attention,inventory:()=>attentionInventory(state,receipt),flags:()=>attentionFlags(state,attention,attentionInventory(state,receipt))};};
test('ポイント増加を保持し、減少だけでは点灯せず、履歴確認で消灯する',()=>{
  const c=setup();assert.equal(c.flags().points,false);
  schedule(c.state,'テスト',100,'OTHER','auto');observePoints(c.state,c.attention);assert.equal(c.flags().points,true);
  c.state.user.approved-=300;observePoints(c.state,c.attention);assert.equal(c.flags().points,true);
  acknowledgeAttention(c.state,c.attention,c.inventory(),{page:'points'});assert.equal(c.flags().points,false);
  c.state.user.approved-=200;observePoints(c.state,c.attention);assert.equal(c.flags().points,false);
  schedule(c.state,'テスト2',50,'OTHER','auto');observePoints(c.state,c.attention);assert.equal(c.flags().points,true);
});
test('準備中から交換可能への確定で同じポイントを再通知しない',()=>{
  const c=setup();const before=total(c.state);autoReview(c.state);observePoints(c.state,c.attention);
  assert.equal(total(c.state),before);assert.equal(c.flags().points,false);
});
test('カテゴリは初回未読・確認で既読・ID追加で再点灯。並び替えでは点灯しない',()=>{
  const c=setup(),inv={categories:{game:['a','b']},pills:[]};
  assert(attentionFlags(c.state,c.attention,inv).tabs.game);
  markCategoryRead(c.attention,inv,'game');assert(!attentionFlags(c.state,c.attention,inv).tabs.game);
  inv.categories.game.reverse();assert(!attentionFlags(c.state,c.attention,inv).tabs.game);
  inv.categories.game.push('c');assert(attentionFlags(c.state,c.attention,inv).tabs.game);
});
test('歩数は閲覧だけでは消えず、受取完了・未許諾では消える',()=>{
  const c=setup();assert(!c.flags().tabs.steps);c.state.stepLink='linked';addSteps(c.state,2000);
  acknowledgeAttention(c.state,c.attention,c.inventory(),{page:'home',tab:'steps'});assert(c.flags().tabs.steps);
  while(claimSteps(c.state,false)){}assert(!c.flags().tabs.steps);
  c.state.date='2026-09-16';assert(c.flags().tabs.steps);c.state.stepLink='denied';assert(!c.flags().tabs.steps);
});
test('ミニゲーは残回数・停止・会員状態に従い、翌日に再点灯する',()=>{
  const c=setup();assert(c.flags().tabs.minigames);
  acknowledgeAttention(c.state,c.attention,c.inventory(),{page:'home',tab:'minigames'});assert(c.flags().tabs.minigames);
  c.state.user.daily[c.state.date]={...day(c.state),chinchiro:3};assert(!c.flags().tabs.minigames);
  c.state.date='2026-09-16';assert(c.flags().tabs.minigames);
  c.state.chinchiro.enabled=false;assert(!c.flags().tabs.minigames);
  c.state.chinchiro.enabled=true;c.state.persona='guest';assert(!c.flags().tabs.minigames);
});
test('レシートは掲載中だけを対象とし、追加掲載で新着になる',()=>{
  const c=setup();markCategoryRead(c.attention,c.inventory(),'receipt');assert(!c.flags().tabs.receipt);
  c.receipt.listing.find(x=>x.id==='juice').enabled=true;assert(c.flags().tabs.receipt);
  c.state.date='2027-01-01';assert(!c.flags().tabs.receipt);
});
test('テキストバナーは個別に既読。内容や掲載期間の更新で再点灯する',()=>{
  const c=setup(),p={id:'test-pill',start:'2026-09-01',end:'2026-09-30',title:'5のつく日',to:'offer/travel'},inv={categories:{},pills:[p,{...p,id:'other'}]};
  markPillRead(c.attention,inv,'test-pill');const f=attentionFlags(c.state,c.attention,inv);assert(!f.pills['test-pill']);assert(f.pills.other);
  p.title='新しいお得情報';assert(attentionFlags(c.state,c.attention,inv).pills['test-pill']);
});
test('マイ案件は初期案件を既読にし、更新されたステータスを確認するまで残す',()=>{
  const c=setup();assert(!c.flags().cases);
  const cv=createConversion(c.state,'travel');assert(c.flags().cases);
  markCasesRead(c.state,c.attention,'judging');assert(!c.flags().cases);
  progressOffer(c.state,cv.offerId);assert(c.flags().caseStatuses.approved);
  acknowledgeAttention(c.state,c.attention,c.inventory(),{page:'mycases',caseTab:'challenging'});assert(c.flags().cases);
  markCasesRead(c.state,c.attention,'approved');assert(!c.flags().cases);
});
test('SURの段階進捗とボーナス付与更新も検出する',()=>{
  const c=setup();progressOffer(c.state,'game');assert(c.flags().caseStatuses.challenging);
  assert.deepEqual(Object.keys(c.flags().caseStatuses),['challenging','judging','approved','rejected']);
  markCasesRead(c.state,c.attention,'judging');assert(c.flags().cases);
  markCasesRead(c.state,c.attention,'challenging');assert(!c.flags().cases);
  c.state.user.cases[0].bonusPaid=true;assert(c.flags().cases);
});
test('既読を再読込しても維持し、別のアプリ設定保存に依存しない',()=>{
  const c=setup();markCategoryRead(c.attention,c.inventory(),'shopping');
  const stored=JSON.stringify(c.attention),storage={getItem:key=>key===ATTENTION_KEY?stored:null};
  const restored=readAttention(c.state,storage);assert(!attentionFlags(c.state,restored,c.inventory()).tabs.shopping);
  assert.deepEqual(readAttention(c.state,{getItem:()=>'{broken'}),initialAttention(c.state));
});
test('未解禁・停止案件と配信なしアンケートを新着に数えない',()=>{
  const c=setup();c.state.user.installUnlocked=false;
  const ids=c.inventory().categories.game.map(x=>JSON.parse(x)[0]);assert(!ids.includes('game'));
  c.state.scenario='empty';assert.deepEqual(c.inventory().categories.survey,[]);
  c.state.nacs.offers.forEach(o=>o.active=false);assert.deepEqual(c.inventory().categories.credit,[]);assert.deepEqual(c.inventory().categories.challenge,[]);
});

test('実画面の既読処理は読み込み中・エラー・裏タブ・ダイアログ表示中では実行しない',()=>{
  const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const source=app.slice(app.indexOf('function persistAttention()'),app.indexOf('function render(){'));
  for(const condition of [{viewState:'loading'},{viewState:'error'},{visibility:'hidden'},{modalOpen:true},{scenario:'error'},{}]){
    const c=setup(),values=new Map();
    const sandbox={state:c.state,readAttention,observePoints,attentionInventory,attentionFlags,acknowledgeAttention,ATTENTION_KEY,
      localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)},
      readReceipt:()=>c.receipt,route:()=>['home','shopping'],HT:()=>[['shopping']],caseTab:'challenging',
      modal:{open:condition.modalOpen||false},document:{visibilityState:condition.visibility||'visible'},viewState:condition.viewState||'normal',isBannerPreview:false,
      attention:null,attentionItems:null,badgeFlags:null};
    if(condition.scenario)c.state.scenario=condition.scenario;
    vm.createContext(sandbox);vm.runInContext(source,sandbox);sandbox.updateAttentionForView();
    assert.equal(sandbox.badgeFlags.tabs.shopping,Object.keys(condition).length>0,JSON.stringify(condition));
  }
});
