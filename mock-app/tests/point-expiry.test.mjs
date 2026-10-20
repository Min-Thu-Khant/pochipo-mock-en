import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,applyReservations,schedule,confirm,total} from '../model.js';
import {creditPoints,consumePoints,expirePoints,effectiveBalance,expiryDate,nextExpiry} from '../point-ledger.js';
import {pointHistoryData,pointsHistoryMarkup} from '../points-history.js';
import {mypageMarkup} from '../mypage.js';

const fresh=()=>{const s=initialState();s.date='2026-01-15';Object.assign(s.user,{approved:0,earned:0,pending:0,pendings:[],history:[]});delete s.user.pointAccount;return s;};
test('マイページと実績レポートの失効予定が、当月・翌月以降・消費・失効後も一致する',()=>{
 const s=fresh(),ui={pt:String,esc:String,icon:()=>'',coin:()=>'',button:()=>'',link:()=>'',header:()=>'',nav:()=>'',conditions:{text:{state:'ready',label:''}}};
 const label=html=>html.match(/<p class="mypage-expiry">(.*?)<\/p>/)[1];
 const compare=expected=>{
  const report=label(pointsHistoryMarkup(s,ui));
  assert.equal(report,expected);
  for(const guest of [true,false])assert.equal(label(mypageMarkup(s,{...ui,guest,total:effectiveBalance(s)})),report);
 };
 compare('今月末の失効予定：0pt');
 creditPoints(s,{requestId:'a',title:'通常',amount:3500});
 compare('今月末の失効予定：0pt');
 s.date='2026-06-15';compare('今月末の失効予定：2026-06-30・3500pt');
 consumePoints(s,{requestId:'use',amount:1000});compare('今月末の失効予定：2026-06-30・2500pt');
 s.date='2026-07-01';applyReservations(s);compare('今月末の失効予定：0pt');
});
test('実績レポートは今月末の失効予定だけを表示し、翌月以降や該当なしは0pt',()=>{
 const s=fresh(),ui={pt:String,esc:String,icon:()=>'',button:()=>'',link:()=>'',header:()=>'',nav:()=>''};
 const label=()=>pointsHistoryMarkup(s,ui).match(/<p class="mypage-expiry">(.*?)<\/p>/)[1];
 assert.equal(label(),'今月末の失効予定：0pt');
 creditPoints(s,{requestId:'a',title:'獲得',amount:1000});
 assert.equal(label(),'今月末の失効予定：0pt');
 s.date='2026-06-01';assert.equal(label(),'今月末の失効予定：2026-06-30・1000pt');
 consumePoints(s,{requestId:'use',amount:300});
 s.date='2026-06-30';assert.equal(label(),'今月末の失効予定：2026-06-30・700pt');
 s.date='2026-07-01';applyReservations(s);assert.equal(label(),'今月末の失効予定：0pt');
});
test('通常・運営付与は5か月後、連続ログインボーナスは1か月後の月末',()=>{
 assert.equal(expiryDate('2026-01-01','VIDEO'),'2026-06-30');
 assert.equal(expiryDate('2026-01-30','VIDEO'),'2026-06-30');
 assert.equal(expiryDate('2026-01-31','VIDEO'),'2026-06-30');
 assert.equal(expiryDate('2026-09-15','ADMIN'),'2027-02-28');
 assert.equal(expiryDate('2028-01-31','LOGIN_BONUS'),'2028-02-29');
 const s=fresh();creditPoints(s,{requestId:'login',title:'連続ログインボーナス',amount:100,category:'LOGIN_BONUS'});
 assert.equal(s.user.history[0].expires,'2026-02-28');
});
test('付与予定ではなく確定した日から有効期限を計算する',()=>{
 const s=fresh(),p=schedule(s,'案件',500,'OFFER');assert.equal(s.user.pointAccount,undefined);
 s.date='2026-02-15';confirm(s,p.id);
 assert.equal(s.user.history[0].expires,'2026-07-31');assert.equal(s.user.earned,500);
});
test('失効日当日は使え、翌日に未消費分だけ失効し、準備中と累計は維持する',()=>{
 const s=fresh();creditPoints(s,{requestId:'a',title:'獲得',amount:1000});
 schedule(s,'準備中',200,'OFFER');s.date='2026-06-30';applyReservations(s);
 assert.equal(effectiveBalance(s),1000);assert.equal(total(s),1200);assert.equal(s.user.history.filter(h=>h.category==='EXPIRE').length,0);
 consumePoints(s,{requestId:'exchange',amount:300});
 s.date='2026-07-01';applyReservations(s);
 assert.equal(s.user.approved,0);assert.equal(effectiveBalance(s),0);assert.equal(total(s),200);assert.equal(s.user.earned,1000);
 assert.equal(s.user.history.find(h=>h.category==='EXPIRE').amount,-700);
 assert.equal(nextExpiry(s),null);
});
test('月初を飛ばして半年後に進めても失効履歴が実際の失効日の翌日で残る',()=>{
 const s=fresh();creditPoints(s,{requestId:'a',title:'獲得',amount:1000});
 s.date='2026-07-15';applyReservations(s);
 assert.equal(s.user.approved,0);assert.equal(s.user.earned,1000);
 const row=s.user.history.find(h=>h.category==='EXPIRE');
 assert.equal(row.date,'2026-07-01');assert.equal(row.amount,-1000);
 applyReservations(s);const restored=JSON.parse(JSON.stringify(s));applyReservations(restored);
 assert.equal(restored.user.history.filter(h=>h.category==='EXPIRE').length,1);
 assert.equal(restored.user.approved,0);
 const data=pointHistoryData(restored);assert.equal(data.settled[0].category,'EXPIRE');
 assert.equal(data.months.find(m=>m.key==='2026-01').amount,1000);
 assert.equal(data.months.find(m=>m.key==='2026-07').amount,0);
});
test('獲得順ではなく失効日が近い順に交換し、全額消費済みは失効履歴を作らない',()=>{
 const s=fresh();creditPoints(s,{requestId:'normal',title:'通常',amount:1000,category:'VIDEO'});
 s.date='2026-02-15';creditPoints(s,{requestId:'login',title:'連続ログイン',amount:100,category:'LOGIN_BONUS'});
 consumePoints(s,{requestId:'exchange',amount:150});
 assert.equal(s.user.pointAccount.lots.find(l=>l.id==='login').remaining,0);
 assert.equal(s.user.pointAccount.lots.find(l=>l.id==='normal').remaining,950);
 s.date='2026-04-15';assert.equal(expirePoints(s).amount,0);assert.ok(!s.user.history.some(h=>h.category==='EXPIRE'));
 s.date='2026-07-15';applyReservations(s);assert.equal(s.user.history.find(h=>h.category==='EXPIRE').amount,-950);
 assert.equal(s.user.earned,1100);
});
test('複数月を飛ばしても履歴は失効・獲得・交換を日付順に表示する',()=>{
 const s=fresh();creditPoints(s,{requestId:'normal',title:'通常',amount:1000});
 s.date='2026-02-15';creditPoints(s,{requestId:'login',title:'連続ログイン',amount:100,category:'LOGIN_BONUS'});
 s.date='2026-07-20';applyReservations(s);
 assert.deepEqual(pointHistoryData(s).settled.map(h=>h.date),['2026-07-01','2026-04-01','2026-02-15','2026-01-15']);
 const ui={pt:String,esc:String,icon:()=>'',button:()=>'',link:()=>'',header:()=>'',nav:()=>''};
 const html=pointsHistoryMarkup(s,ui);
 assert.match(html,/獲得・交換・失効履歴/);assert.match(html,/有効期限による失効/);assert.match(html,/2026\.07\.01/);
 assert.match(html,/-1000/);
});
