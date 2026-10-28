import test from 'node:test';
import assert from 'node:assert/strict';
import {createSavingsPouchAnimation,mountSavingsPouches,pouchTiers} from '../savings-pouch-animation.js';

// Deterministic animation clock and only the DOM surface consumed by this component.
function scene({level=0,from=0,animate=true,reduced=false,width=300}={}){
 class Element{
  constructor(){
   this.children=[];this.dataset={};this.isConnected=true;
   this.style=new Proxy({setProperty(k,v){this[k]=v;}},{set(o,k,v){o[k]=typeof v==='function'?v:String(v);return true;}});
  }
  append(child){this.children.push(child);}
  set innerHTML(v){this.children=[];}
 }
 let time=0,serial=0,requests=0;
 const frames=new Map(),motion={matches:reduced};
 const view={performance:{now:()=>time},matchMedia:()=>motion,
  requestAnimationFrame(fn){const id=++serial;requests++;frames.set(id,fn);return id;},
  cancelAnimationFrame(id){frames.delete(id);}
 };
 const stage=new Element();stage.dataset={pouchLevel:String(level),pouchFrom:String(from),pouchAnimate:String(animate)};
 stage.clientHeight=220;stage.clientWidth=width;
 stage.ownerDocument={defaultView:view,createElement:()=>new Element()};
 const selectors=['untied','tied','front','mouth','shadow','shine','rays','glow','twinkles','rain','overflow'];
 const elements=Object.fromEntries(selectors.map(s=>['.mr-pouch-'+s,new Element()]));
 stage.querySelector=selector=>{
  assert.ok(elements[selector],`selector must address a child, not the stage: ${selector}`);
  return elements[selector];
 };
 const bags=[new Element(),new Element()],rigs=[new Element(),new Element()];
 stage.querySelectorAll=s=>s==='.mr-pouch-bag'?bags:s==='.mr-pouch-rig'?rigs:[];
 const root={querySelectorAll:selector=>selector==='.mr-pouch-stage'?[stage]:[]};
 function advance(ms){const until=time+ms;while(frames.size&&time<until){time+=16;const batch=[...frames];frames.clear();for(const [,fn] of batch)fn(time);}}
 return {stage,elements,root,frames,motion,advance,get requests(){return requests;}};
}
function finishedScene(s,level){
 const get=name=>s.elements['.mr-pouch-'+name];
 assert.equal(get('tied').style.opacity,'0');
 for(const name of ['untied','front','mouth'])assert.equal(get(name).style.opacity,'1');
 assert.equal(get('mouth').children.length,pouchTiers[level].mouthCount);
 assert.equal(get('overflow').children.length,pouchTiers[level].overflowCount);
 for(const coin of [...get('mouth').children,...get('overflow').children]){
  assert.equal(coin.style.opacity,'1');assert.ok(coin.style.transform);assert.doesNotMatch(coin.style.transform,/NaN|Infinity/);
 }
 assert.equal(get('rain').children.length,0);
 assert.equal(s.frames.size,0,'final state must stop scheduling frames');
}

test('6段階すべてで袋を開いたまま、内側の積もったコインと外側の溢れたコインを残して終了する',()=>{
 for(let level=0;level<6;level++){
  const s=scene({level,from:5}),controller=createSavingsPouchAnimation(s.stage);
  assert.equal(s.elements['.mr-pouch-rain'].children.length,pouchTiers[level].coinCount);
  s.advance(700);
  assert.equal(s.elements['.mr-pouch-untied'].style.opacity,'1');
  s.advance(controller.duration-800);assert.equal(controller.finished,false);
  assert.equal(s.elements['.mr-pouch-untied'].style.opacity,'1','bag must not close before the ending');
  s.advance(200);assert.equal(controller.finished,true);finishedScene(s,level);
 }
});

test('初期表示と動きを減らす設定は、フレームを再生せず同じ最終状態を表示する',()=>{
 for(let level=0;level<6;level++)for(const options of [{animate:false},{reduced:true}]){
  const s=scene({level,...options}),controller=createSavingsPouchAnimation(s.stage);
  assert.equal(controller.finished,true);assert.equal(s.requests,0);finishedScene(s,level);
 }
});

test('演出中に動きを減らす設定へ変わった場合も、開いた最終状態へ切り替える',()=>{
 const s=scene({level:5}),controller=createSavingsPouchAnimation(s.stage);
 s.advance(250);s.motion.matches=true;s.advance(16);
 assert.equal(controller.finished,true);finishedScene(s,5);
});

test('連続選択は前の演出を停止し、再マウントやフィルター操作で同じ演出を始め直さない',()=>{
 const old=scene({level:5});mountSavingsPouches(old.root);old.advance(200);
 const requests=old.requests;mountSavingsPouches(old.root);assert.equal(old.requests,requests);
 old.stage.isConnected=false;
 const latest=scene({level:1,from:5});mountSavingsPouches(latest.root);
 assert.equal(old.frames.size,0,'old frame must be cancelled immediately');
 latest.advance(6000);finishedScene(latest,1);
 const settledRequests=latest.requests;mountSavingsPouches(latest.root);assert.equal(latest.requests,settledRequests);
 latest.stage.isConnected=false;mountSavingsPouches({querySelectorAll:()=>[]});
});

test('画面を離れた場合は演出を止め、狭い表示幅でも外側のコインを枠内に収める',()=>{
 const detached=scene({level:5});createSavingsPouchAnimation(detached.stage);
 detached.stage.isConnected=false;detached.advance(16);assert.equal(detached.frames.size,0);
 for(const width of [224,248,300,356]){
  const s=scene({level:5,width}),controller=createSavingsPouchAnimation(s.stage);s.advance(controller.duration+32);
  for(const coin of s.elements['.mr-pouch-overflow'].children){
   const x=Number(coin.style.transform.match(/translate\(([-\d.]+)px/)[1]);
   assert.ok(Math.abs(x)+18<=width/2-1);
  }
 }
});
