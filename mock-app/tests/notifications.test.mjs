import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {campaignNotifications,noticesFor,notificationsMarkup,noticeDetailMarkup} from '../notifications.js';

test('キャンペーンと運営情報を独立した2タブに表示する',()=>{
  const state=initialState(),campaigns=campaignNotifications(state);
  assert(campaigns.some(x=>x.category==='激アツAF案件'));
  assert(campaigns.some(x=>x.category==='キャンペーン'));
  const promo=notificationsMarkup(state),service=notificationsMarkup(state,'service');
  assert.match(promo,/role="tablist"/);assert.match(promo,/aria-selected="true"[^>]*data-id="campaigns"/);
  assert(!promo.includes('アプリのアップデートについて'));
  assert(service.includes('アプリのアップデートについて'));
  assert(!service.includes('激アツAF案件'));
  assert.match(noticeDetailMarkup(state,'update-september'),/お知らせ一覧に戻る/);
});
test('期限切れ・未来・停止・対象外案件をキャンペーンから除く',()=>{
  const s=initialState();s.persona='card';
  assert(!campaignNotifications(s).some(x=>x.to==='offer/card'));
  s.slots.find(x=>x.id==='autumn').enabled=false;
  assert(!campaignNotifications(s).some(x=>x.id==='autumn'));
  s.slots.find(x=>x.id==='staff').notificationDate='2026-10-01';
  assert(!campaignNotifications(s).some(x=>x.id==='staff'));
  s.date='2027-01-01';assert.deepEqual(campaignNotifications(s),[]);
  assert(noticesFor(s).length>0);
});
test('運営情報は公開日順に表示し、未来の詳細も出さない',()=>{
  const s=initialState();s.date='2026-09-14';
  assert(!noticesFor(s).some(x=>x.id==='update-september'));
  assert.match(noticeDetailMarkup(s,'update-september'),/現在表示できません/);
  const items=noticesFor(s);assert(items.every((x,i)=>!i||items[i-1].date>=x.date));
  s.date='2020-01-01';assert.match(notificationsMarkup(s,'service'),/新しいお知らせはありません/);
});
test('投稿本文はHTMLとして実行せず、案件や特集へのアプリ内リンクを保つ',()=>{
  const s=initialState(),slot=s.slots.find(x=>x.id==='autumn');slot.title='<img src=x onerror=alert(1)>';
  const html=notificationsMarkup(s);assert(html.includes('&lt;img'));assert(!html.includes('<img src=x'));
  assert(html.includes('href="#offer/travel"'));
  slot.to='feature/autumn-trip';assert(campaignNotifications(s).some(x=>x.to==='feature/autumn-trip'));
  slot.to='https://example.com';assert(!campaignNotifications(s).some(x=>x.id==='autumn'));
});
