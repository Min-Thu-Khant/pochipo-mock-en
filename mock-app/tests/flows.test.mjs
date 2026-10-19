import {campaignFixture} from './campaign-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,visitHomeTab,ensureBrowseMission,visibleSlots,offerTerms,visibleOffers,challenge,challengeState,progressOffer,rejectOffer,completeSurvey,availableSurveys,surveyReward,claimVideo,claimSteps,addSteps,stepsClaimable,missionTasks,claimMission,todayTasks,day,total,autoReview,manualReview,exchangeConditions,launchPopup,markPopupSeen,popupSlots,settleChallenges,achieveChallenges,advanceChallenges,pillSlots,challengeSlots,caseFor} from '../model.js';
const fresh=()=>{const s=initialState();s.stepLink='linked';s.user.pendings=[];s.user.pending=0;return s;};

test('配信は期間両端を含み、期限外と停止枠を除く',()=>{const s=initialState();campaignFixture(s);campaignFixture(s,{id:'test-future',start:'2026-11-01',end:'2026-11-30'});assert.ok(visibleSlots(s).some(x=>x.id==='test-campaign'));s.date='2026-10-01';assert.equal(visibleSlots(s).length,0);s.date='2026-11-01';assert.deepEqual(visibleSlots(s).map(x=>x.id),['test-future']);s.slots.find(x=>x.id==='test-future').enabled=false;assert.equal(visibleSlots(s).length,0);});
test('金融利用済みの利用者に金融を再表示しない',()=>{const s=initialState();s.persona='card';assert.ok(visibleSlots(s).every(x=>x.destination!=='card'));});

// ---- ポイント口座（spec point-history）----
test('付与予定は合算だけを増やし、確定で保有・総獲得へ移る',()=>{const s=fresh();const a=s.user.approved,e=s.user.earned;claimVideo(s);assert.equal(s.user.approved,a);assert.equal(s.user.pending,100);assert.equal(total(s),a+100);assert.equal(s.user.earned,e);assert.equal(autoReview(s),1);assert.equal(s.user.approved,a+100);assert.equal(s.user.pending,0);assert.equal(s.user.earned,e+100);});
test('案件の付与予定は有人審査でのみ確定する',()=>{const s=fresh();const a=s.user.approved;challenge(s,'pay');progressOffer(s,'pay');assert.equal(s.user.pending,80000);assert.equal(autoReview(s),0);assert.equal(s.user.approved,a);assert.equal(manualReview(s),1);assert.equal(s.user.approved,a+80000);});

// ---- 交換（spec dotmoney-exchange / my-page）----
test('最低交換 100pt。交換状態テキストは 3 状態',()=>{const s=fresh();assert.equal(s.limits.minAmount,100);s.user.approved=50;s.user.pending=0;assert.equal(exchangeConditions(s).text.state,'short');assert.equal(exchangeConditions(s).text.label,'あと50ptで交換できます');s.user.pending=100;assert.equal(exchangeConditions(s).text.state,'preparing');s.user.approved=250;assert.equal(exchangeConditions(s).text.label,'250pt交換できます');assert.ok(exchangeConditions(s).canExchange);s.persona='guest';assert.equal(exchangeConditions(s).canExchange,false);});

// ---- デイリーミッション（spec daily-mission）----
test('起動だけではミッションを出さず追加報酬も付与しない',()=>{const s=fresh();assert(!missionTasks(s).items.some(x=>x.id==='launch'));assert(claimMission(s,'launch').error);assert.equal(s.user.pending,0);});
test('動画完了の報酬だけが付与されミッション報酬は重複しない',()=>{const s=fresh();claimVideo(s);assert.equal(s.user.pending,100);assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'claimed');assert(claimMission(s,'video').error);assert.equal(s.user.pending,100);assert(!missionTasks(s).items.some(x=>x.id==='steps'));});
test('未成年は同意前は動画対象外、同意後はAdMob動画を利用できる',()=>{const s=fresh();s.persona='minor';const t=missionTasks(s);assert(t.items.every(x=>x.kind!=='video'));assert.equal(t.total,t.items.length);assert.equal(claimVideo(s),false);s.demographics={birthDate:'2012-04-01',gender:'female',required:true,confirmedAt:'2026-09-29T00:00:00.000Z',parentalConsentAt:'2026-09-29T00:00:00.000Z'};assert.equal(claimVideo(s),true);assert.equal(s.user.pending,50);});
test('動画ミッションの進捗は翌日にリセット',()=>{const s=fresh();claimVideo(s);assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'claimed');s.date='2026-09-16';assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'todo');});

// ---- 歩いてためる（spec earn-by-steps）----
test('歩数は 1 回の獲得で 1 マイルストーン、順番に、上限まで。動画あり・なしで額が異なる',()=>{const s=fresh();addSteps(s,2500);assert.ok(stepsClaimable(s));assert.equal(claimSteps(s,true),300);assert.equal(day(s).stepsClaimed,1);assert.ok(stepsClaimable(s));assert.equal(claimSteps(s,false),100);assert.equal(day(s).stepsClaimed,2);assert.ok(stepsClaimable(s));claimSteps(s);assert.equal(stepsClaimable(s),false);addSteps(s,10000);assert.ok(stepsClaimable(s));for(let i=3;i<10;i++)assert.equal(claimSteps(s),100);assert.equal(claimSteps(s),false);assert.equal(day(s).stepsClaimed,10);});
test('未連携・利用不可では獲得できない。配信不可なら動画ありは選べない',()=>{const s=fresh();s.stepLink='unlinked';assert.equal(stepsClaimable(s),false);s.stepLink='linked';s.persona='minor';assert.equal(claimSteps(s,true),false);assert.equal(claimSteps(s,false),100);});

// ---- 動画リワード（spec video-reward）----
test('動画の上限と日次リセット、同日 5 回でインストール案件の解禁',()=>{const s=fresh();s.limits.videoLimit=5;s.user.installUnlocked=false;assert.ok(visibleOffers(s).every(o=>!o.install));for(let i=0;i<5;i++)assert.ok(claimVideo(s));assert.equal(claimVideo(s),false);assert.ok(s.user.installUnlocked);assert.ok(visibleOffers(s).some(o=>o.install));s.date='2026-09-16';assert.equal(day(s).video,0);assert.ok(claimVideo(s));});

// ---- 案件（spec affiliate）----
test('旧エントリー必須フラグが残っていても、事前エントリーなしで定額案件に参加できる',()=>{const s=fresh(),slot=campaignFixture(s,{entryRequired:true});assert.equal(s.user.entries.travel,undefined);const cv=challenge(s,'travel');assert.equal(cv.status,'judging');assert.equal(cv.reward,120000);slot.reward=999999;assert.equal(caseFor(s,'travel').reward,120000);});
test('SUR は挑戦中は再チャレンジ不可。段階ごとに付与予定、全段階承認で承認',()=>{const s=fresh();assert.equal(challengeState(s,'game'),'sur-challenging');assert.equal(challenge(s,'game'),false);progressOffer(s,'game');assert.equal(s.user.pending,8000);assert.equal(caseFor(s,'game').status,'challenging');progressOffer(s,'game');progressOffer(s,'game');assert.equal(caseFor(s,'game').status,'approved');assert.equal(s.user.pending,80000);assert.equal(progressOffer(s,'game'),false);assert.equal(challengeState(s,'game'),'sur-completed');const cases=s.user.cases.length,clicks=s.nacs.clicks.length;assert.equal(challenge(s,'game'),false);assert.equal(s.user.cases.length,cases);assert.equal(s.nacs.clicks.length,clicks);});
test('否認された成果は承認されず、非 SUR は再チャレンジできる',()=>{const s=fresh();challenge(s,'pay');assert.ok(rejectOffer(s,'pay'));assert.equal(caseFor(s,'pay').status,'rejected');assert.equal(challengeState(s,'pay'),'normal');assert.ok(challenge(s,'pay'));assert.equal(s.user.cases.filter(c=>c.offerId==='pay').length,2);});
test('倍率と定率を混同しない。チャレンジ枠は報酬を上書きしない',()=>{const s=initialState();const x=campaignFixture(s);x.rewardMode='multiplier';x.reward=2;assert.equal(offerTerms(s,'travel').reward,100000);assert.equal(offerTerms(s,'shop').rewardMode,'rate');assert.equal(offerTerms(s,'shop').reward,3);assert.equal(offerTerms(s,'game').reward,80000);assert.equal(offerTerms(s,'game').challenge,undefined);assert.equal(offerTerms(s,'marche').challenge?.id,'challenge');assert.equal(challengeSlots(s).length,4);assert.equal(pillSlots(s).length,3);});

// ---- アンケート（spec survey）----
test('報酬額（円）× 還元率 → pt を四捨五入。回答完了で即時確定し、再通知では加算しない',()=>{const s=fresh();const q=availableSurveys(s).find(x=>x.id==='s1');assert.equal(surveyReward(s,q),2100);s.limits.surveyRate.screening=33;assert.equal(surveyReward(s,{type:'screening',rewardYen:3}),99);s.limits.surveyRate.screening=70;assert.ok(availableSurveys(s).every(x=>x.id!=='s3'));const balance=s.user.approved;assert.equal(completeSurvey(s,'s1'),2100);assert.equal(s.user.pending,0);assert.equal(s.user.approved,balance+2100);assert.ok(availableSurveys(s).some(x=>x.id==='s3'));assert.equal(completeSurvey(s,'s1'),false);assert.equal(s.user.approved,balance+2100);autoReview(s);assert.equal(s.user.pending,0);});

// ---- プロト独自（チャレンジボーナス・ポップアップ・今日できるお仕事）----
test('チャレンジボーナスは達成と承認の後に付与予定（有人審査）として一度だけ登録',()=>{const s=fresh();challenge(s,'pay');progressOffer(s,'pay');assert.equal(s.user.pending,80000);assert.equal(advanceChallenges(s,500),0);assert.equal(achieveChallenges(s),1);assert.equal(s.user.pending,130000);assert.equal(settleChallenges(s),0);challenge(s,'sec');progressOffer(s,'sec');assert.ok(caseFor(s,'sec').bonusPaid);});
test('起動時ポップアップは候補から1枚を 1 日 1 回、モードで制御できる',()=>{const s=initialState();assert.equal(launchPopup(s).id,'challenge');assert.equal(launchPopup(s).slides,undefined);markPopupSeen(s);assert.equal(launchPopup(s),null);s.popupMode='always';assert.equal(launchPopup(s).id,'challenge');assert.equal(launchPopup(s).slides,undefined);s.popupMode='off';assert.equal(launchPopup(s),null);s.popupMode='daily';s.date='2026-10-05';assert.equal(popupSlots(s).length,0);});
test('今日できるお仕事に追加受取はなく案件導線を含む',()=>{const s=fresh();const t=todayTasks(s);assert.equal(t.claimable,0);assert(t.items.some(x=>x.kind==='offer'));assert(claimMission(s,'launch').error);});
test('動画1回から3回のミッションを段階別に完了する',()=>{const s=fresh();assert.equal(missionTasks(s).items.length,5);claimVideo(s);assert.equal(missionTasks(s).done,1);claimVideo(s);assert.equal(missionTasks(s).done,2);claimVideo(s);assert.equal(missionTasks(s).done,3);});

test('クレカタブ閲覧ではミッション報酬を発生させない',()=>{const s=fresh();visitHomeTab(s,'credit');assert(!missionTasks(s).items.some(x=>x.id==='credit-tab'));assert(claimMission(s,'credit-tab').error);assert.equal(s.user.pending,0);});
test('旧閲覧ミッションの保存データがあっても追加報酬なし',()=>{const s=fresh();ensureBrowseMission(s);ensureBrowseMission(s);assert.equal(s.missionDef.filter(m=>m.id==='credit-tab').length,1);assert(!missionTasks(s).items.some(x=>x.id==='credit-tab'));assert(claimMission(s,'credit-tab').error);});

test('マイページの交換案内はゲスト・会員とも交換可能額だけを表示する',()=>{
 for(const persona of ['guest','regular']){
  const s=fresh();s.persona=persona;s.user.member=persona!=='guest';s.user.approved=5600;s.user.pending=500;
  assert.equal(exchangeConditions(s).text.label,'5,600pt交換できます');
  s.user.pending=21000;assert.equal(exchangeConditions(s).text.label,'5,600pt交換できます');
  s.user.approved=5700;assert.equal(exchangeConditions(s).text.label,'5,700pt交換できます');
  s.user.approved=0;assert.equal(exchangeConditions(s).text.state,'preparing');
 }
});

test('非SURは判定中・承認・否認でも再利用でき、SURの完了表示に巻き込まれない',()=>{
 for(const status of ['judging','approved','rejected']){
  const s=fresh();const cv=challenge(s,'pay');cv.status=status;
  assert.equal(challengeState(s,'pay'),'normal',status);
  assert.ok(challenge(s,'pay'),status);
 }
});
test('SUR一部承認は挑戦中のまま。全承認後も非対象端末・期間外の優先順位は維持する',()=>{
 const s=fresh();progressOffer(s,'game');assert.equal(challengeState(s,'game'),'sur-challenging');
 progressOffer(s,'game');progressOffer(s,'game');assert.equal(challengeState(s,'game'),'sur-completed');
 const o=s.nacs.offers.find(x=>x.id==='game');o.platforms=['android'];assert.equal(challengeState(s,'game'),'unsupported');
 s.os='android';o.end='2026-01-01';assert.equal(challengeState(s,'game'),'inactive');
});

test('否認後のSURは再チャレンジでき、以前の一部達成数が残ってもボタンをロックしない',()=>{
 const s=fresh();progressOffer(s,'game');assert.equal(caseFor(s,'game').paidStages,1);
 assert.equal(rejectOffer(s,'game'),true);assert.equal(challengeState(s,'game'),'normal');
 const oldId=caseFor(s,'game').id;const retry=challenge(s,'game');
 assert.ok(retry);assert.notEqual(retry.id,oldId);assert.equal(retry.status,'challenging');assert.equal(retry.paidStages,0);
});
