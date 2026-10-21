import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,launchPopup,markPopupSeen} from '../model.js';
import {setAdDelivery} from '../overlay-ads.js';
import {popupWindow,popupNow} from '../popup-frequency.js';
import {adDeliveryForm} from '../../mock-admin/overlay-settings.js';
const at=(time,date='2026-09-15')=>Date.parse(`${date}T${time}+09:00`);
const setup=(interval=3,unit='hour',count=1)=>{const s=initialState();setAdDelivery(s,'popup',{interval,unit,count});return s;};
test('3時間ごとの固定枠で1回。閉じた後・再読み込み後も同じ枠では表示しない',()=>{
 let s=setup();assert.ok(launchPopup(s,at('02:59:59')));markPopupSeen(s,at('02:59:59'));
 s=JSON.parse(JSON.stringify(s));assert.equal(launchPopup(s,at('02:59:59')),null);
 for(const t of ['03:00:00','06:00:00','09:00:00','12:00:00','15:00:00','18:00:00','21:00:00']){assert.ok(launchPopup(s,at(t)));markPopupSeen(s,at(t));assert.equal(launchPopup(s,at(t)),null);}
 assert.ok(launchPopup(s,at('00:00:00','2026-09-16')));
});
test('回数はバナー共通。2回に設定しても1起動1枚・未使用分は繰り越さない',()=>{
 const s=setup(3,'hour',2);s.slots.push({...s.slots.find(x=>x.id==='challenge'),id:'second'});
 for(let i=0;i<2;i++){assert.ok(launchPopup(s,at('06:30:00')));markPopupSeen(s,at('06:30:00'));}
 assert.equal(launchPopup(s,at('06:31:00')),null);assert.ok(launchPopup(s,at('09:00:00')));
});
test('分の境界・端数枠・複数日を日本時間で判定する',()=>{
 const s=setup(15,'minute');markPopupSeen(s,at('08:14:59'));assert.equal(launchPopup(s,at('08:14:59')),null);assert.ok(launchPopup(s,at('08:15:00')));
 setAdDelivery(s,'popup',{interval:5,unit:'hour',count:1});assert.deepEqual(popupWindow(s,at('23:59:59')),{start:at('20:00:00'),end:at('00:00:00','2026-09-16')});
 setAdDelivery(s,'popup',{interval:2,unit:'day',count:2});assert.deepEqual(popupWindow(s,at('22:00:00','2026-09-16')),{start:at('00:00:00'),end:at('00:00:00','2026-09-17')});
 assert.equal(popupNow(s,Date.parse('2026-01-01T18:00:00Z')),at('03:00:00'));
 s.popupTestTime='09:30';assert.equal(popupNow(s),at('09:30:00'));
});
test('設定保存で実績を消さず、回数変更と停止解除を適用する',()=>{
 const s=setup();markPopupSeen(s,at('06:00:00'));setAdDelivery(s,'popup',{interval:3,unit:'hour',count:1});assert.equal(launchPopup(s,at('06:30:00')),null);
 setAdDelivery(s,'popup',{interval:3,unit:'hour',count:2});assert.ok(launchPopup(s,at('06:30:00')));markPopupSeen(s,at('06:30:00'));assert.equal(launchPopup(s,at('06:30:01')),null);
 s.slots.forEach(x=>x.enabled=false);const before=s.user.popupImpressions.length;assert.equal(launchPopup(s,at('09:00:00')),null);assert.equal(s.user.popupImpressions.length,before);
 s.popupMode='off';setAdDelivery(s,'popup',{interval:3,unit:'hour',count:1});assert.equal(s.popupMode,undefined);
});
test('不正な設定は保存しない・管理画面は数値と日時間分と回数',()=>{
 const s=setup(),before=JSON.stringify(s.popupFrequency);
 for(const input of [{interval:0},{interval:1.5},{interval:25},{unit:'week'},{count:0},{count:1.1},{count:Infinity}]){assert.throws(()=>setAdDelivery(s,'popup',{interval:3,unit:'hour',count:1,...input}));assert.equal(JSON.stringify(s.popupFrequency),before);}
 const html=adDeliveryForm(s,'popup');for(const name of ['interval','unit','count'])assert.match(html,new RegExp(`name="${name}"`));assert.doesNotMatch(html,/name="mode"|>表示しない<|>起動ごとに表示<|日本時間の固定時間帯ごとに|回数はバナー別ではなく/);assert.match(html,/value="hour" selected/);
});
