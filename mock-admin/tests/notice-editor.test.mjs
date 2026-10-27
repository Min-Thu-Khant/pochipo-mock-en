import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../../mock-app/model.js';
import {saveAnnouncement,stopAnnouncement,deleteAnnouncement,announcementRecords,announcementStatus} from '../../mock-app/service-notices.js';
import {noticesFor,notificationsMarkup} from '../../mock-app/notifications.js';
const input={date:'2026-09-15',title:'運営からの案内',target:'https://example.com/new',status:'draft'};
test('入稿・編集・公開停止・再公開・削除がアプリ一覧と一致する',()=>{
 const s=initialState();s.date=input.date;
 const row=saveAnnouncement(s,input);assert.equal(announcementRecords(s).length,4);
 assert.ok(!noticesFor(s).some(n=>n.id===row.id));
 saveAnnouncement(s,{...row,status:'published',title:'変更後の案内'});
 assert.match(notificationsMarkup(s),/変更後の案内/);
 stopAnnouncement(s,row.id);assert.ok(!noticesFor(s).some(n=>n.id===row.id));
 assert.equal(announcementRecords(s).find(n=>n.id===row.id).title,'変更後の案内');
 saveAnnouncement(s,{...row,status:'published'});assert.ok(noticesFor(s).some(n=>n.id===row.id));
 deleteAnnouncement(s,row.id);assert.ok(!announcementRecords(s).some(n=>n.id===row.id));
});
test('既存のお知らせも停止・削除でき、再表示・再生成されない',()=>{
 const s=initialState();s.date=input.date;
 stopAnnouncement(s,'update-september');assert.ok(!noticesFor(s).some(n=>n.id==='update-september'));
 for(const n of [...announcementRecords(s)])deleteAnnouncement(s,n.id);
 assert.equal(announcementRecords(s).length,0);assert.match(notificationsMarkup(s),/新しいお知らせはありません/);
});
test('未来日・不正入力・削除された投稿の上書きを防ぐ',()=>{
 const s=initialState();s.date=input.date;
 const row=saveAnnouncement(s,{...input,date:'2026-09-16',status:'published'});
 assert.equal(announcementStatus(row,s.date),'予約中');assert.ok(!noticesFor(s).some(n=>n.id===row.id));
 s.date='2026-09-16';assert.ok(noticesFor(s).some(n=>n.id===row.id));
 for(const bad of [{date:'2026-02-30'},{title:' '},{target:'javascript:alert(1)'},{target:'https://'},{status:'unknown'}]){
  const before=structuredClone(s);assert.throws(()=>saveAnnouncement(s,{...input,...bad}));assert.deepEqual(s,before);
 }
 deleteAnnouncement(s,row.id);assert.throws(()=>saveAnnouncement(s,row),/削除されています/);
});
test('既存運営投稿を保持し、長文・HTML文字列は表示時にエスケープする',()=>{
 const s=initialState();s.date=input.date;s.operatorWorkflows={notices:[{id:'legacy',start:input.date,end:'2026-09-20',enabled:true,title:'以前の投稿',target:input.target}]};
 saveAnnouncement(s,{...input,status:'published',title:'<img onerror=alert(1)>'.repeat(40)});
 assert.ok(noticesFor(s).some(n=>n.id==='legacy'));
 const html=notificationsMarkup(s);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img/);
});
