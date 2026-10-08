import test from 'node:test';
import assert from 'node:assert/strict';
import {rewardCountAt,rewardRing,startRewardMotion} from '../reward-motion.js';
import {dialogMarkup} from '../dialogs.js';

test('獲得分だけ増加し、桁が変わっても最終ポイントが一致する',()=>{
 for(const [before,after] of [[9900,10100],[0,100],[5600,5700]]){
  const values=Array.from({length:101},(_,i)=>rewardCountAt(before,after,i/100));
  assert.equal(values[0],before);assert.equal(values.at(-1),after);
  assert(values.every((v,i)=>Number.isInteger(v)&&v>=before&&v<=after&&(!i||v>=values[i-1])));
 }
 assert.equal(rewardCountAt(100,200,2),200);assert.equal(rewardCountAt(100,200,-1),100);
});
test('獲得ダイアログにはPと描画する円があり、別位置の残高バッジはない',()=>{
 const markup=dialogMarkup('earned',{amount:200,balance:10100});
 assert.match(markup,/reward-ring-line/);assert.match(rewardRing(),/<span>P<\/span>/);
 assert(!markup.includes('fd-balance'));assert.match(markup,/<strong>200<\/strong>/);
});
function environment(t,{reduced=false}={}){
 const previous=Object.fromEntries(['document','window','getComputedStyle','requestAnimationFrame','cancelAnimationFrame'].map(k=>[k,globalThis[k]]));
 t.after(()=>{for(const [k,v] of Object.entries(previous))if(v===undefined)delete globalThis[k];else globalThis[k]=v;});
 const node=()=>({style:{setProperty(k,v){this[k]=v;}},removeAttribute(){},setAttribute(){},classList:{add(){}},querySelectorAll:()=>[],getBoundingClientRect:()=>({left:45,top:78,width:140,height:36,bottom:114})});
 const number=node(),copyNumber=node(),overlay=node(),source=node();
 let cancelled=0,glowCancelled=false;const frames=new Map(),listeners=new Set();
 source.isConnected=true;source.querySelectorAll=()=>[number];source.querySelector=()=>number;source.cloneNode=()=>overlay;
 overlay.querySelectorAll=()=>[copyNumber];overlay.querySelector=()=>copyNumber;overlay.remove=()=>{overlay.isConnected=false;};overlay.animate=()=>({cancel(){glowCancelled=true;}});
 const dialog={open:true,append(n){n.isConnected=true;}};
 globalThis.document={querySelector:()=>source};
 globalThis.window={innerHeight:800,matchMedia:()=>({matches:reduced}),addEventListener:(name)=>listeners.add(name),removeEventListener:name=>listeners.delete(name)};
 globalThis.getComputedStyle=()=>Object.assign(['color'],{getPropertyValue:()=> '#454545'});
 let next=0;globalThis.requestAnimationFrame=callback=>{frames.set(++next,callback);return next;};globalThis.cancelAnimationFrame=id=>{cancelled++;frames.delete(id);};
 const tick=time=>{const callbacks=[...frames.values()];frames.clear();callbacks.forEach(fn=>fn(time));};
 return {source,overlay,number:copyNumber,dialog,frames,listeners,tick,get cancelled(){return cancelled;},get glowCancelled(){return glowCancelled;}};
}
test('ヘッダーの実位置と幅を使い、途中で閉じると演出を破棄する',t=>{
 const e=environment(t);const stop=startRewardMotion(e.dialog,{amount:200,balance:10100});
 assert.equal(e.number.textContent,'9,900');assert.equal(e.overlay.style.top,'78px');assert.equal(e.overlay.style.left,'45px');assert.equal(e.overlay.style.width,'140px');
 e.tick(0);e.tick(450);assert.notEqual(e.number.textContent,'9,900');
 e.dialog.open=false;e.tick(460);assert.equal(e.overlay.isConnected,false);assert.equal(e.frames.size,0);assert.equal(e.listeners.size,0);assert(e.glowCancelled);stop();
});
test('終了時は正確な残高、動きを減らす設定では最初から最終値',t=>{
 const e=environment(t);const stop=startRewardMotion(e.dialog,{amount:100,balance:5700});e.tick(0);e.tick(900);assert.equal(e.number.textContent,'5,700');assert.equal(e.frames.size,0);stop();
});
test('動きを減らす場合はカウントアップを行わない',t=>{
 const e=environment(t,{reduced:true});const stop=startRewardMotion(e.dialog,{amount:100,balance:5700});assert.equal(e.number.textContent,'5,700');assert.equal(e.frames.size,0);stop();
});
test('円相当の桁幅プレビューでも獲得分だけ円換算し、実残高を変更しない',t=>{
 const e=environment(t);
 e.number.dataset={headerUnit:'yen',headerPreviewPoints:'10000000'};
 const reward={amount:150,balance:6350};
 const stop=startRewardMotion(e.dialog,reward);
 assert.equal(e.number.textContent,'99,998.5');
 e.tick(0);e.tick(900);
 assert.equal(e.number.textContent,'100,000');
 assert.deepEqual(reward,{amount:150,balance:6350});
 stop();
});
