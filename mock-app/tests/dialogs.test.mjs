import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as model from '../model.js';
import {dialogDefinitions,dialogMarkup,adErrorFor,walkPermissionDialog} from '../dialogs.js';

test('14種類のFigmaダイアログの原本素材がすべてローカルに存在する',()=>{
  assert.equal(Object.keys(dialogDefinitions).length,14);
  for(const id of Object.keys(dialogDefinitions)){
    const html=dialogMarkup(id);
    assert(!html.includes('https://www.figma.com/api/'));
    for(const [,src] of html.matchAll(/src="([^"]+)"/g))assert(statSync(new URL('../'+src,import.meta.url)).size>0,src);
    assert.match(html,/id="fd-title"/);
  }
});
test('通常操作は設定金額を使い、広告不可なら広告ボタンを出さない',()=>{
  const html=dialogMarkup('step-select',{adReward:300,noAdReward:100,ads:false});
  assert(!html.includes('data-action="step-ad"'));
  assert.match(html,/そのままもらうと 100pt/);
  assert.match(dialogMarkup('earned',{amount:18400,balance:25900}),/18,400/);
});
test('確認用ダイアログから報酬・権限・日付を変更する操作を呼べない',()=>{
  for(const id of Object.keys(dialogDefinitions)){
    const actions=[...dialogMarkup(id,{preview:true}).matchAll(/data-action="([^"]+)"/g)].map(m=>m[1]);
    assert(actions.every(a=>['close','dialog-preview-action'].includes(a)),id);
  }
});

// Execute the actual app action handlers against the real model with a small modal/timer adapter.
// This checks state transitions, not browser layout or native dialog focus behavior.
const app=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const play=app.slice(app.indexOf('async function playAd('),app.indexOf('// ===== 操作'));
const actions=app.slice(app.indexOf('async function handleAction('),app.indexOf("document.addEventListener('change',",app.indexOf('async function handleAction(')));
function harness({failure='none',online=true,wait=()=>Promise.resolve()}={}){
  const s=model.initialState();s.stepLink='linked';s.popupMode='off';s.scenario='normal';
  const shown=[];
  const c={...model,dialogDefinitions,dialogMarkup,adErrorFor,walkPermissionDialog,state:s,adFailure:failure,dialogRetry:null,shown,
    document:{querySelectorAll:()=>[]},modal:{open:false,dataset:{}},navigator:{onLine:online},crypto:webcrypto,wait,chinchiroBusy:false,
    save(){},render(){},toast(){},updated(){},icon(){return '';},button(){return '';},esc:String,
    close(){c.modal.open=false;c.modal.dataset.videoToken='';},
    showModal(title){c.modal.open=true;c.modal.dataset.videoToken='';shown.push({title});},
    showFigmaDialog(id,options={}){c.modal.open=true;c.modal.dataset.videoToken='';c.dialogRetry=options.retry||null;shown.push({id,options});},
    earnedDialog(amount){shown.push({id:'earned',amount});},
  };
  vm.createContext(c);vm.runInContext(play+'\n'+actions,c);return c;
}
test('8種類の広告エラーでポイントは増えず、再試行後だけ1回分が付く',async()=>{
  for(const failure of Object.keys(dialogDefinitions).filter(id=>id.startsWith('ad-')||id==='reward-failed')){
    const c=harness({failure}),before=model.total(c.state);
    await c.handleAction('video');
    assert.equal(model.total(c.state),before,failure);
    assert.equal(c.shown.at(-1).id,failure);
    assert.equal(model.day(c.state).video,0);
    if(dialogDefinitions[failure].retry){
      await c.handleAction('dialog-retry');
      assert.equal(model.total(c.state),before+model.L(c.state).videoReward,failure);
      assert.equal(model.day(c.state).video,1);
      assert.equal(c.shown.at(-1).id,'earned');
    }
  }
});
test('視聴途中の中断・ダイアログ差し替え・日付変更では報酬を付けない',async()=>{
  for(const cancel of [c=>c.close(),c=>c.showModal('別のダイアログ'),c=>{c.state.date='2026-09-16';}]){
    let finish;const c=harness({wait:()=>new Promise(resolve=>{finish=resolve;})});
    const before=model.total(c.state),pending=c.handleAction('video');
    cancel(c);finish();await pending;assert.equal(model.total(c.state),before);
  }
});
test('オフラインでは広告を開始せず、通信回復後に元の操作を再試行する',async()=>{
  const c=harness({online:false}),before=model.total(c.state);
  await c.handleAction('video');assert.equal(c.shown.at(-1).id,'ad-network');assert.equal(model.total(c.state),before);
  c.navigator.onLine=true;await c.handleAction('dialog-retry');
  assert.equal(model.total(c.state),before+model.L(c.state).videoReward);
});
test('歩数広告の失敗後も受取可能数を保持し、再試行で元の報酬を付ける',async()=>{
  const c=harness({failure:'reward-failed'});model.addSteps(c.state,1000);
  const before=model.total(c.state),claimed=model.day(c.state).stepsClaimed;
  await c.handleAction('step-ad');assert.equal(model.total(c.state),before);assert.equal(model.day(c.state).stepsClaimed,claimed);
  await c.handleAction('dialog-retry');assert.equal(model.total(c.state),before+model.L(c.state).stepRewardAd);assert.equal(model.day(c.state).stepsClaimed,claimed+1);
});

test('初期状態は未許諾。OSと拒否状態に応じて案内し、許可済みには表示しない',()=>{
  const state=model.initialState();assert.equal(state.stepLink,'unlinked');
  assert.equal(walkPermissionDialog(state),'health-ios');
  state.os='android';assert.equal(walkPermissionDialog(state),'health-android');
  state.stepLink='denied';assert.equal(walkPermissionDialog(state),'health-android-settings');
  for(const status of ['linked','unavailable']){state.stepLink=status;assert.equal(walkPermissionDialog(state),null);}
});
test('未許諾の受取操作は案内へ。拒否・キャンセルでは付与せず、許可後だけ受取可能',async()=>{
  const c=harness();c.state.stepLink='unlinked';const before=model.total(c.state);
  await c.handleAction('step-select');assert.equal(c.shown.at(-1).id,'health-ios');
  await c.handleAction('close');assert.equal(c.state.stepLink,'unlinked');
  await c.handleAction('walk-link-deny');assert.equal(c.state.stepLink,'denied');assert.equal(model.stepsClaimable(c.state),false);
  assert.equal(model.total(c.state),before);
  await c.handleAction('walk-link-ok');assert.equal(c.state.stepLink,'linked');assert.equal(walkPermissionDialog(c.state),null);
  assert.equal(model.total(c.state),before);
});
test('歩数画面への入場だけでは許諾案内を表示しない',()=>{
  const code=app.slice(app.indexOf('function maybeShowWalkPermission()'),app.indexOf('function positionFigmaDialog()'));
  const c=harness();c.state.stepLink='unlinked';c.route=()=>['home','steps'];c.isBannerPreview=false;c.viewState='normal';
  vm.runInContext(code,c);assert.equal(c.maybeShowWalkPermission(),false);
  assert.equal(c.maybeShowWalkPermission(),false);
  c.close();c.state.stepLink='linked';assert.equal(c.maybeShowWalkPermission(),false);
  c.state.stepLink='unlinked';c.route=()=>['home'];assert.equal(c.maybeShowWalkPermission(),false);
});
