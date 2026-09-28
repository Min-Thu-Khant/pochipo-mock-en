import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {iconCornerRadius,diceSvg,iconStrokeWidths} from '../design-system/icon-logic.js';
test('Figmaの中心線半径：90°で線幅の1.5倍、鋭角ほど小さくなる',()=>{
 assert.ok(Math.abs(iconCornerRadius(2,90)-3)<1e-10);
 assert.ok(Math.abs(iconCornerRadius(2.5,90)-3.75)<1e-10);
 assert.ok(iconCornerRadius(2,60)<iconCornerRadius(2,90));
 assert.ok(iconCornerRadius(2,120)>iconCornerRadius(2,90));
 for(const angle of [0,180,NaN])assert.throws(()=>iconCornerRadius(2,angle),RangeError);
 assert.throws(()=>iconCornerRadius(-1),RangeError);
});
test('全6面のRegular/Boldが同じルールで再生成できる。目の数と余白・背景透過を維持',async()=>{
 for(const weight of ['regular','bold'])for(let face=1;face<=6;face++){
  const svg=await readFile(new URL(`../assets/generated/dice-v2/${weight}-${face}.svg`,import.meta.url),'utf8');
  assert.equal(svg,diceSvg(face,weight));assert.equal((svg.match(/<circle /g)||[]).length,face);
  assert.match(svg,/viewBox="0 0 24 24" fill="none"/);
  assert.ok(svg.includes(`stroke-width="${iconStrokeWidths[weight].rectangle}"`));
  assert.ok(!svg.includes('#FFFFFF'));assert.ok(!svg.includes('filter='));
 }
 assert.throws(()=>diceSvg(7),RangeError);assert.throws(()=>diceSvg(5,'heavy'),RangeError);
});
