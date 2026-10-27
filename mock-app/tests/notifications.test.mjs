import {campaignFixture} from './campaign-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {noticesFor,notificationsMarkup} from '../notifications.js';
const noticeState=()=>{const s=initialState();s.date='2026-09-15';return s;};

test('サービスのお知らせだけを日付とタイトルで表示し、広告・プッシュを自動掲載しない',()=>{
  const s=noticeState();
  campaignFixture(s,{title:'広告のタイトル',notification:'激アツAF案件'});
  s.operationSettings={pushes:[{id:'promo',date:s.date,title:'配信済みの広告通知',status:'delivered',target:'https://example.com/promo'}]};
  const html=notificationsMarkup(s);
  assert.match(html,/アプリのアップデートについて/);
  assert.doesNotMatch(html,/激アツAF案件|広告のタイトル|配信済みの広告通知|キャンペーン・運営からのお知らせ|アップデート<\/span>|notice-tag|notice-lead|<p>|<small>|role="tab|notification-detail|#offer\//);
  const rows=[...html.matchAll(/<a class="notice-item"[^>]*>(.*?)<\/a>/g)];
  assert.equal(rows.length,3);
  for(const row of rows){
    assert.match(row[1],/^<span class="notice-copy"><time datetime="[^"]+">[^<]+<\/time><strong>[^<]+<\/strong><\/span><svg /);
    assert.match(row[1],/class="icon ui-chevron notice-arrow"/);
    assert.match(row[1],/aria-hidden="true" focusable="false"/);
  }
  const dates=[...html.matchAll(/<time datetime="([^"]+)"/g)].map(x=>x[1]);
  assert.deepEqual(dates,['2026-09-15','2026-09-14','2026-09-12']);
});
test('公開中の運営投稿を表示し、未来・終了・停止した投稿は表示しない',()=>{
  const s=noticeState(),base={title:'運営投稿',start:'2026-09-15',end:'2026-09-20',enabled:true,target:'https://example.com/article'};
  s.operatorWorkflows={notices:[{...base,id:'published'},{...base,id:'future',start:'2026-09-16'},{...base,id:'expired',end:'2026-09-14'},{...base,id:'disabled',enabled:false}]};
  assert.deepEqual(noticesFor(s).filter(n=>n.title==='運営投稿').map(n=>n.id),['published']);
  s.date='2020-01-01';assert.match(notificationsMarkup(s),/新しいお知らせはありません/);
});
test('タイトルから外部記事を別タブで開き、アプリ内詳細へは遷移しない',()=>{
  const html=notificationsMarkup(noticeState());
  const links=[...html.matchAll(/<a class="notice-item" href="([^"]+)" target="_blank" rel="noopener noreferrer">/g)];
  assert.equal(links.length,3);
  assert.equal(links[0][1],'https://example.com/notices/update-september');
  assert.doesNotMatch(html,/data-action|href="#notifications/);
});
test('投稿タイトルとURLをエスケープし、外部記事URLのない投稿は掲載しない',()=>{
  const s=noticeState(),base={start:s.date,end:s.date,enabled:true,title:'<img src=x onerror=alert(1)>',body:'一覧に表示しない本文'};
  s.operatorWorkflows={notices:[{...base,id:'safe',target:'https://example.com/?a=1&b="quoted"'},{...base,id:'script',title:'危険なリンク',target:'javascript:alert(1)'},{...base,id:'missing',title:'URLなし'},{...base,id:'internal',title:'アプリ内リンク',target:'offer/travel'},{...base,id:'broken',title:'不正なURL',target:'https://'}]};
  const html=notificationsMarkup(s);
  assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html,/href="https:\/\/example.com\/\?a=1&amp;b=&quot;quoted&quot;"/);
  assert.doesNotMatch(html,/<img|一覧に表示しない本文|危険なリンク|URLなし|アプリ内リンク|不正なURL/);
});

test('長文比較は同じ全文と遷移先を使い、2行制限は比較用だけに適用する',()=>{
  const s=noticeState(),before=structuredClone(s);
  const standard=notificationsMarkup(s),full=notificationsMarkup(s,{preview:'full'}),two=notificationsMarkup(s,{preview:'two-lines'});
  assert.match(standard,/data-notice-layout="full"/);
  assert.match(full,/data-notice-layout="full"/);
  assert.match(two,/data-notice-layout="two-lines"/);
  assert.equal(full.replace('data-notice-layout="full"','data-notice-layout="two-lines"'),two);
  assert.match(full,/一部の端末で発生していた表示崩れの修正に関するご案内/);
  assert.doesNotMatch(standard,/一部の端末で発生していた表示崩れの修正に関するご案内/);
  assert.deepEqual(s,before);
});
