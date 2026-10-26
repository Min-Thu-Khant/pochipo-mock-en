import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {dicePreviewMarkup,DICE_ROLL_MS} from '../design-system/app-theme/dice-preview.js';
import {DICE_ROLL_MS as appDuration} from '../chinchiro-art.js';

test('部品集のサイコロも本体と同じ2個・2秒で表示する',()=>{
 assert.equal(DICE_ROLL_MS,appDuration);assert.equal(DICE_ROLL_MS,2000);
 const moving=dicePreviewMarkup(true),settled=dicePreviewMarkup();
 assert.equal((moving.match(/class="bowl-die /g)||[]).length,2);
 assert.equal((settled.match(/class="dice-result-die"/g)||[]).length,2);
 assert.match(moving,/data-game="dice"/);assert.match(moving,/tossing/);
 assert.match(settled,/Pゾロの表示例/);assert.doesNotMatch(settled,/tossing/);
});

test('見本の再生完了で2個の静止結果へ切り替え、動きを減らす設定では投げない',()=>{
 const source=readFileSync(new URL('../design-system/app-theme/library.js',import.meta.url),'utf8');
 const start=source.indexOf("document.addEventListener('click',e=>{\n const button=e.target.closest('[data-ch-motion]')");
 const end=source.indexOf("\n\ndocument.addEventListener",start);
 assert(start>=0&&end>start);
 for(const reduced of [false,true]){
  let handler,finish,delay;const button={disabled:false},preview={innerHTML:''};
  const c={dicePreviewMarkup,DICE_ROLL_MS,document:{addEventListener:(_,fn)=>handler=fn,querySelector:()=>preview},window:{matchMedia:()=>({matches:reduced})},setTimeout:(fn,ms)=>{finish=fn;delay=ms;}};
  vm.createContext(c);vm.runInContext(source.slice(start,end),c);
  const event={target:{closest:()=>button}};handler(event);
  assert.equal(button.disabled,true);assert.equal(delay,reduced?60:2000);
  assert.equal(preview.innerHTML.includes('tossing'),!reduced);
  handler(event);finish();assert.equal(button.disabled,false);
  assert.match(preview.innerHTML,/Pゾロの表示例/);assert.doesNotMatch(preview.innerHTML,/tossing/);
 }
});
