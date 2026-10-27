import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {referralCallout} from '../referral-callout.js';
import {isHomeCategoryRoute,usesHomeLayout,homeCategoryTabsMarkup,homeFrameMarkup} from '../home-shell.js';

const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const functionLine=name=>app.split('\n').find(line=>line.startsWith(`function ${name}(`));
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tabs=[['daily','デイリー',{label:'デイリー'}],['steps','歩く',{label:'歩く'}],['survey','アンケート',{label:'アンケート'}]];

function shell(){
 const c={current:['home','daily'],now:1000,goalHintHome:false,goalHintUntil:0,
  route:()=>c.current,Date:{now:()=>c.now},isHomeCategoryRoute,usesHomeLayout,homeCategoryTabsMarkup,homeFrameMarkup,
  HT:()=>tabs,badgeFlags:{tabs:{survey:true}},esc,attentionDot:show=>show?'<i class="attention-dot"></i>':'',
  poigigIcon:name=>`<i data-icon="${name}"></i>`,icon:()=>'',button:text=>`<button>${text}</button>`,
  state:{scenario:'normal'},sidePopOpen:false,sideTabConfig:(_,key)=>({image:`${key}.png`,label:'おすすめ',link:'#offer/sample'}),chevron:()=>'',
  navigation:{},miniGamesEntry:()=> 'home/minigames/dice',referralCallout,
  displaySurveys:()=>[],surveySourceSection:()=>'',empty:()=>'<p>アンケートがありません</p>',bannerCarousel:()=>'',bannersAt:()=>[],
 };
 vm.createContext(c);
 vm.runInContext(['syncHomeGoalHint','beginnerMark','headerGoalEntry','headerActions','homeCategoryKey','homeFrame','homeCategoryTabs','surveyCategoryTabs','surveyFrame','sidePop','nav','surveyList'].map(functionLine).join('\n'),c);
 c.header=()=>c.headerActions();
 const start=app.indexOf('function stateScreen('),end=app.indexOf('\nfunction inspector()',start);
 vm.runInContext(app.slice(start,end),c);
 return c;
}

test('ホームの全カテゴリとアンケート入口で共通のミッション表記・選択状態を使う',()=>{
 for(const selected of ['daily','steps','survey']){
  const html=homeCategoryTabsMarkup(tabs,{selected,panelId:'panel',flags:{survey:true},attentionDot:show=>show?'<i class="attention-dot"></i>':'',icon:()=>'',esc});
  assert.match(html,/aria-label="ミッション"/);assert.match(html,/home-tab-label">ミッション</);
  assert.doesNotMatch(html,/デイリー/);
  assert.match(html,new RegExp(`id="tab-${selected}"[^>]*aria-selected="true" tabindex="0"`));
  assert.equal((html.match(/aria-selected="true"/g)||[]).length,1);
  assert.equal((html.match(/aria-controls="panel"/g)||[]).length,tabs.length);
 }
});

test('ホーム経由のアンケートでは初心者マーク・目標吹き出し・おすすめを保ち、下部ホームを選択する',()=>{
 const c=shell();
 for(const current of [['home','daily'],['home','steps'],['surveys','home'],['home','survey']]){
  c.current=current;c.syncHomeGoalHint();
  assert.match(c.headerActions(),/beginner-mark/);assert.match(c.headerActions(),/goal-hint/);
  assert.match(c.sidePop(),/src="home.png"/);
  assert.match(c.nav(),/href="#home"[^>]*aria-current="page"/);
 }
 c.current=['surveys','home'];const html=c.surveyList();
 assert.match(html,/home-tab-label">ミッション</);assert.match(html,/id="tab-survey"[^>]*aria-selected="true"/);
 assert.match(html,/id="survey-panel" role="tabpanel" aria-labelledby="tab-survey"/);
});

test('下部の簡単はホームカテゴリを表示せず、ホーム用の装飾を混ぜない',()=>{
 const c=shell();c.current=['surveys'];c.syncHomeGoalHint();
 const html=c.surveyList();
 assert.doesNotMatch(html,/home-tabs|beginner-mark|goal-hint/);assert.equal(c.sidePop(),'');
 assert.match(c.nav(),/href="#surveys"[^>]*aria-current="page"/);
 for(const current of [['surveys'],['survey-detail','s1'],['answer','s1'],['home','minigames','dice']])assert.equal(isHomeCategoryRoute(current),false);
});

test('ホーム内でアンケートへ切り替えても吹き出しの5秒をリセットせず、期限後は再表示しない',()=>{
 const c=shell();c.syncHomeGoalHint();assert.equal(c.goalHintUntil,6000);
 c.now=2000;c.current=['surveys','home'];c.syncHomeGoalHint();
 assert.equal(c.goalHintUntil,6000);assert.match(c.headerActions(),/--hint-elapsed:1000ms/);
 c.now=7000;c.syncHomeGoalHint();assert.doesNotMatch(c.headerActions(),/class="goal-hint"/);
 assert.match(c.headerActions(),/beginner-mark/);
 c.current=['surveys'];c.syncHomeGoalHint();c.current=['surveys','home'];c.syncHomeGoalHint();
 assert.equal(c.goalHintUntil,12000);assert.match(c.headerActions(),/class="goal-hint"/);
});

test('アンケートの読み込み中・取得失敗・0件でも入口に応じた共通ヘッダーとカテゴリを維持する',()=>{
 const c=shell();
 for(const viewState of ['loading','error','empty'])for(const current of [['surveys','home'],['surveys']]){
  c.viewState=viewState;c.current=current;c.syncHomeGoalHint();
  const html=c.stateScreen('surveys'),home=current[1]==='home';
  assert.equal(html.includes('beginner-mark'),home);
  assert.equal(html.includes('home-tabs'),home);
  if(home)assert.match(html,/home-tab-label">ミッション</);
 }
});


test('ホームの状態切替でもヘッダー・カテゴリ・下部ホームを維持する',()=>{
 const c=shell();
 for(const current of [['home','daily'],['home','steps']])for(const viewState of ['loading','error','empty']){
  c.current=current;c.viewState=viewState;c.syncHomeGoalHint();
  const html=c.stateScreen('home');
  assert.match(html,/beginner-mark/);assert.match(html,/home-tabs/);
  assert.match(html,new RegExp('id="tab-'+current[1]+'"[^>]*aria-selected="true"'));
  assert.match(html,/class="home home-panel state-page"/);
  assert.match(html,/href="#home"[^>]*aria-current="page"/);
  assert.equal(html.includes('aria-busy="true"'),viewState==='loading');
 }
});

test('おすすめの位置は本文クラスではなく外枠のホーム判定を使う',()=>{
 for(const parts of [['home','daily'],['surveys','home'],['home','minigames','dice']])assert.equal(usesHomeLayout(parts),true);
 for(const parts of [['surveys'],['offers']])assert.equal(usesHomeLayout(parts),false);
 const css=readFileSync(new URL('../ui-refinements.css',import.meta.url),'utf8');
 assert.match(css,/\.phone-viewport\.home-layout \.side-pop \{bottom:196px\}/);
 assert.doesNotMatch(css,/\.phone-viewport:has\(\.home\) \.side-pop/);
});
