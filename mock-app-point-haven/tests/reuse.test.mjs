import test from 'node:test';
import assert from 'node:assert/strict';
import {bindReuse,reuseHome,reusePage,deliverReuseQuotes} from '../reuse.js';
test('photo reward interruption, completion, duplicate prevention and quote delivery',()=>{
const listeners={};let tick;let credited=0;const state={reuseItems:[{id:'one',name:'Camera',category:'Camera'},{id:'two',name:'PC',category:'PC'}]};
global.document={addEventListener:(name,fn)=>listeners[name]=fn};global.window={addEventListener:()=>{}};global.setInterval=fn=>(tick=fn,1);global.clearInterval=()=>{};
bindReuse({state:()=>state,save:()=>{},render:()=>{},credit:n=>credited+=n});
const click=(action,id)=>listeners.click({target:{closest:()=>({dataset:{reuse:action,id}})}});
click('watch','one');click('stop');assert.equal(credited,0);assert.equal(state.reuseItems[0].rewarded,undefined);
click('watch','one');for(let n=0;n<15;n++)tick();assert.equal(credited,100);assert.equal(state.reuseItems[0].rewarded,true);
click('watch','one');assert.equal(credited,100);click('watch','two');assert.equal(state.reuseItems[1].ineligible,true);assert.equal(credited,100);
assert.match(reusePage('one'),/100ptを受け取りました/);deliverReuseQuotes();assert.equal(state.reuseItems[0].quote,2480);assert.match(reusePage('one'),/2,480円/);assert.match(reuseHome(),/査定が届きました/);
});
