import test from 'node:test';import assert from 'node:assert/strict';import {pointHistoryData} from '../points-history.js';
test('準備中を二重計上せず、月別獲得に交換・返還・準備中を含めない',()=>{
 const p={id:'pending',date:'2026-09-29',title:'準備',desc:'説明',amount:10};const s={date:'2026-09-29',user:{history:[{...p,status:'pending'},{date:'2026-09-01',title:'アンケート',amount:100,status:'approved'},{date:'2026-09-02',title:'交換',amount:-50,status:'approved'},{date:'2026-09-03',title:'交換失敗',desc:'返還',amount:50,status:'approved'}],pendings:[p]}};const d=pointHistoryData(s);assert.equal(d.pending.length,1);assert.equal(d.months.at(-1).amount,100);assert.equal(d.settled.length,3);
});
test('年をまたぐ直近12か月と、0件の月を表示する',()=>{const d=pointHistoryData({date:'2026-02-01',user:{history:[],pendings:[]}});assert.deepEqual(d.months.map(m=>m.key),['2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01','2026-02']);assert.ok(d.months.every(m=>m.amount===0));});
