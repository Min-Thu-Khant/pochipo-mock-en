import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createNavigation} from '../navigation.js';

const navSource=readFileSync(new URL('../app.js',import.meta.url),'utf8').split('\n').find(line=>line.startsWith('function nav(){'));
function browser(start='home'){
 let index=0,serial=0,entries=[{href:`http://localhost/mock-app/#${start}`,state:null}];
 const win={crypto:{randomUUID:()=>String(++serial)},location:{get href(){return entries[index].href;},get hash(){return new URL(this.href).hash;}},history:{
  get state(){return entries[index].state;},
  replaceState(state,_,href){entries[index]={state:structuredClone(state),href:new URL(href,entries[index].href).href};},
  back(){if(index>0)index--;}
 }};
 let navigation=createNavigation(win);
 return {
  get navigation(){return navigation;},
  go(hash){navigation.capture({scroll:42});entries=entries.slice(0,index+1);entries.push({href:new URL('#'+hash,win.location.href).href,state:null});index++;navigation.arrive({scroll:42});},
  back(){navigation.back();navigation.arrive({scroll:0});},
  forward(){if(index<entries.length-1)index++;navigation.arrive({scroll:0});},
  reload(){navigation=createNavigation(win);},
  active(){
   const markup=runInNewContext('('+navSource+')()',{
    route:()=>win.location.hash.slice(1).split('/'),navigation,state:{},
    miniGamesEntry:()=> 'home/minigames/dice',poigigIcon:()=>'',referralCallout:()=>''
   });
   assert.equal((markup.match(/aria-current="page"/g)||[]).length,1);
   return markup.match(/<a href="#([^"]+)" class="[^"]*active" aria-current="page"/)[1];
  }
 };
}

test('ホームの各入口から履歴を開くとホームが選択され、再読み込み・戻る・進むでも維持する',()=>{
 for(const entry of ['home','home/daily','home/steps','surveys/home']){
  const b=browser(entry);b.go('points');assert.equal(b.active(),'home');
  b.reload();assert.equal(b.active(),'home');
  b.back();b.forward();assert.equal(b.active(),'home');
 }
});

test('マイページ経由の履歴と直接開いた履歴はマイページ、目標への直接リンクはホームを選択する',()=>{
 const b=browser('mypage');b.go('points');assert.equal(b.active(),'mypage');
 assert.equal(browser('points').active(),'mypage');
 assert.equal(browser('points/goal').active(),'home');
});

test('ホーム経由の履歴を閉じてマイページから開き直すと、古い入口を引き継がない',()=>{
 const b=browser('home');b.go('points');assert.equal(b.active(),'home');
 b.go('mypage');b.go('points');assert.equal(b.active(),'mypage');
 b.back();b.back();assert.equal(b.active(),'home');
});
