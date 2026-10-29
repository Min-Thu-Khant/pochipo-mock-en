import test from 'node:test';
import assert from 'node:assert/strict';
import {createHomeTabScroll,homeTabScrollTarget} from '../home-tab-scroll.js';

function fixture({position=0,reduced=false}={}){
 let sequence=0;const frames=new Map(),events={};
 const nav={scrollLeft:position,clientWidth:320,scrollWidth:500,
  getBoundingClientRect:()=>({left:0,right:320}),
  addEventListener:(name,fn)=>events[name]=fn,
  querySelectorAll:()=>[visible,partial,hidden]};
 const button=(key,x)=>({dataset:{value:key},closest:()=>nav,
  getBoundingClientRect:()=>({left:x-nav.scrollLeft,right:x+56-nav.scrollLeft}),
  querySelector:()=>({getBoundingClientRect:()=>({left:x+8-nav.scrollLeft,right:x+40-nav.scrollLeft})})});
 const visible=button('steps',100),partial=button('survey',284),hidden=button('new',400);
 const root={querySelector:()=>nav};
 const scroll=createHomeTabScroll({requestFrame:fn=>{frames.set(++sequence,fn);return sequence;},cancelFrame:id=>frames.delete(id),reducedMotion:()=>reduced});
 const step=time=>{const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn(time));};
 return {nav,root,scroll,visible,partial,hidden,events,step,frames};
}

test('全体が見えるタブの選択と再描画では、ユーザーのスクロール位置を保持する',()=>{
 const f=fixture({position:44});f.scroll.remember(f.root);f.scroll.restore(f.root);
 f.scroll.select(f.visible);f.scroll.remember(f.root);f.nav.scrollLeft=0;f.scroll.restore(f.root);
 assert.equal(f.nav.scrollLeft,44);assert.equal(f.frames.size,0);
 f.nav.scrollLeft=81;f.events.scroll();f.scroll.remember(f.root);f.nav.scrollLeft=0;f.scroll.restore(f.root);
 assert.equal(f.nav.scrollLeft,81);assert.equal(f.frames.size,0);
});

test('一部見切れたアイコンを選んだ場合だけ、約700msで必要な距離を移動する',()=>{
 const f=fixture();f.scroll.restore(f.root);f.scroll.select(f.partial);
 // The route renders a new tab row before the animation's first frame.
 f.scroll.remember(f.root);f.scroll.restore(f.root);
 f.step(0);assert.equal(f.nav.scrollLeft,0);
 f.step(350);assert.equal(f.nav.scrollLeft,14);
 f.step(700);assert.equal(f.nav.scrollLeft,28);assert.equal(f.frames.size,0);
 f.scroll.remember(f.root);f.nav.scrollLeft=0;f.scroll.restore(f.root);
 assert.equal(f.nav.scrollLeft,28);assert.equal(f.frames.size,0);
});

test('フォーカスでブラウザが先にスクロールしても、押す前の見切れ方を基準にゆっくり移動する',()=>{
 const f=fixture();f.scroll.restore(f.root);
 f.events.pointerdown({target:{closest:()=>f.partial}});
 f.nav.scrollLeft=28;f.scroll.select(f.partial);
 assert.equal(f.nav.scrollLeft,0);f.step(0);f.step(350);assert.equal(f.nav.scrollLeft,14);
});

test('ユーザーが手動操作を始めたら自動移動を止め、その位置を保持する',()=>{
 const f=fixture();f.scroll.restore(f.root);f.scroll.select(f.partial);f.step(0);f.step(350);
 f.events.wheel();f.nav.scrollLeft=71;f.events.scroll();f.step(700);
 f.scroll.remember(f.root);f.nav.scrollLeft=0;f.scroll.restore(f.root);
 assert.equal(f.nav.scrollLeft,71);assert.equal(f.frames.size,0);
});

test('自動移動中に全体が見える別のタブを選ぶと、その位置で止まる',()=>{
 const f=fixture();f.scroll.restore(f.root);f.scroll.select(f.partial);f.step(0);f.step(350);
 f.scroll.select(f.visible);f.step(700);
 assert.equal(f.nav.scrollLeft,14);assert.equal(f.frames.size,0);
});

test('完全に画面外のアイコンや、動きを減らす設定で不要なアニメーションを開始しない',()=>{
 const f=fixture();f.scroll.restore(f.root);f.scroll.select(f.hidden);assert.equal(f.frames.size,0);
 const r=fixture({reduced:true});r.scroll.restore(r.root);r.scroll.select(r.partial);
 assert.equal(r.nav.scrollLeft,28);assert.equal(r.frames.size,0);
});

test('左端で見切れている場合も最小限の移動で全体を表示する',()=>{
 assert.equal(homeTabScrollTarget(40,{left:0,right:320},{left:-12,right:20},{left:-20,right:36}),12);
});
