import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,visitHomeTab,ensureBrowseMission,visibleSlots,offerTerms,visibleOffers,challenge,challengeState,progressOffer,rejectOffer,completeSurvey,availableSurveys,surveyReward,claimVideo,claimSteps,addSteps,stepsClaimable,missionTasks,claimMission,todayTasks,day,total,autoReview,manualReview,exchangeConditions,launchPopup,markPopupSeen,popupSlots,settleChallenges,achieveChallenges,advanceChallenges,pillSlots,challengeSlots,caseFor} from '../model.js';
const fresh=()=>{const s=initialState();s.stepLink='linked';s.user.pendings=[];s.user.pending=0;return s;};

test('配信は期間両端を含み、期限外と停止枠を除く',()=>{const s=initialState();assert.ok(visibleSlots(s).some(x=>x.id==='autumn'));s.date='2026-10-01';assert.equal(visibleSlots(s).length,0);s.date='2026-11-01';assert.deepEqual(visibleSlots(s).map(x=>x.id),['winter']);s.slots.find(x=>x.id==='winter').enabled=false;assert.equal(visibleSlots(s).length,0);});
test('金融利用済みの利用者に金融を再表示しない',()=>{const s=initialState();s.persona='card';assert.ok(visibleSlots(s).every(x=>x.destination!=='card'));});

// ---- ポイント口座（spec point-history）----
test('付与予定は合算だけを増やし、確定で保有・総獲得へ移る',()=>{const s=fresh();const a=s.user.approved,e=s.user.earned;claimVideo(s);assert.equal(s.user.approved,a);assert.equal(s.user.pending,100);assert.equal(total(s),a+100);assert.equal(s.user.earned,e);assert.equal(autoReview(s),1);assert.equal(s.user.approved,a+100);assert.equal(s.user.pending,0);assert.equal(s.user.earned,e+100);});
test('案件の付与予定は有人審査でのみ確定する',()=>{const s=fresh();const a=s.user.approved;challenge(s,'pay');progressOffer(s,'pay');assert.equal(s.user.pending,80000);assert.equal(autoReview(s),0);assert.equal(s.user.approved,a);assert.equal(manualReview(s),1);assert.equal(s.user.approved,a+80000);});

// ---- 交換（spec dotmoney-exchange / my-page）----
test('最低交換 100pt。交換状態テキストは 3 状態',()=>{const s=fresh();assert.equal(s.limits.minAmount,100);s.user.approved=50;s.user.pending=0;assert.equal(exchangeConditions(s).text.state,'short');assert.equal(exchangeConditions(s).text.label,'あと50ptで交換できます');s.user.pending=100;assert.equal(exchangeConditions(s).text.state,'preparing');s.user.approved=250;assert.equal(exchangeConditions(s).text.label,'200pt交換できます');assert.ok(exchangeConditions(s).canExchange);s.persona='guest';assert.equal(exchangeConditions(s).canExchange,false);});

// ---- デイリーミッション（spec daily-mission）----
test('起動だけではミッションを出さず追加報酬も付与しない',()=>{const s=fresh();assert(!missionTasks(s).items.some(x=>x.id==='launch'));assert(claimMission(s,'launch').error);assert.equal(s.user.pending,0);});
test('動画完了の報酬だけが付与されミッション報酬は重複しない',()=>{const s=fresh();claimVideo(s);assert.equal(s.user.pending,100);assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'claimed');assert(claimMission(s,'video').error);assert.equal(s.user.pending,100);assert(!missionTasks(s).items.some(x=>x.id==='steps'));});
test('広告配信不可なら動画の全段階を分母から除外',()=>{const s=fresh();s.persona='minor';const t=missionTasks(s);assert(t.items.every(x=>x.kind!=='video'));assert.equal(t.total,t.items.length);assert.equal(claimVideo(s),false);});
test('動画ミッションの進捗は翌日にリセット',()=>{const s=fresh();claimVideo(s);assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'claimed');s.date='2026-09-16';assert.equal(missionTasks(s).items.find(x=>x.id==='video').state,'todo');});

// ---- 歩いてためる（spec earn-by-steps）----
test('歩数は 1 回の獲得で 1 マイルストーン、順番に、上限まで。動画あり・なしで額が異なる',()=>{const s=fresh();addSteps(s,2500);assert.ok(stepsClaimable(s));assert.equal(claimSteps(s,true),300);assert.equal(day(s).stepsClaimed,1);assert.ok(stepsClaimable(s));assert.equal(claimSteps(s,false),100);assert.equal(day(s).stepsClaimed,2);assert.ok(stepsClaimable(s));claimSteps(s);assert.equal(stepsClaimable(s),false);addSteps(s,5000);assert.ok(stepsClaimable(s));claimSteps(s);assert.equal(claimSteps(s),false);assert.equal(day(s).stepsClaimed,4);});
test('未連携・利用不可では獲得できない。配信不可なら動画ありは選べない',()=>{const s=fresh();s.stepLink='unlinked';assert.equal(stepsClaimable(s),false);s.stepLink='linked';s.persona='minor';assert.equal(claimSteps(s,true),false);assert.equal(claimSteps(s,false),100);});

// ---- 動画リワード（spec video-reward）----
test('動画の上限と日次リセット、同日 5 回でインストール案件の解禁',()=>{const s=fresh();s.limits.videoLimit=5;s.user.installUnlocked=false;assert.ok(visibleOffers(s).every(o=>!o.install));for(let i=0;i<5;i++)assert.ok(claimVideo(s));assert.equal(claimVideo(s),false);assert.ok(s.user.installUnlocked);assert.ok(visibleOffers(s).some(o=>o.install));s.date='2026-09-16';assert.equal(day(s).video,0);assert.ok(claimVideo(s));});

// ---- 案件（spec affiliate）----
test('エントリー制の案件は先にエントリー。チャレンジで成果（判定中）が 1 件できる',()=>{const s=fresh();assert.throws(()=>challenge(s,'travel'),/エントリー/);s.user.entries.travel={date:s.date};const cv=challenge(s,'travel');assert.equal(cv.status,'judging');assert.equal(cv.reward,120000);s.slots.find(x=>x.id==='autumn').reward=999999;assert.equal(caseFor(s,'travel').reward,120000);});
test('SUR は挑戦中は再チャレンジ不可。段階ごとに付与予定、全段階承認で承認',()=>{const s=fresh();assert.equal(challengeState(s,'game'),'sur-challenging');assert.equal(challenge(s,'game'),false);progressOffer(s,'game');assert.equal(s.user.pending,8000);assert.equal(caseFor(s,'game').status,'challenging');progressOffer(s,'game');progressOffer(s,'game');assert.equal(caseFor(s,'game').status,'approved');assert.equal(s.user.pending,80000);assert.equal(progressOffer(s,'game'),false);});
test('否認された成果は承認されず、非 SUR は再チャレンジできる',()=>{const s=fresh();challenge(s,'pay');assert.ok(rejectOffer(s,'pay'));assert.equal(caseFor(s,'pay').status,'rejected');assert.equal(challengeState(s,'pay'),'normal');assert.ok(challenge(s,'pay'));assert.equal(s.user.cases.filter(c=>c.offerId==='pay').length,2);});
test('倍率と定率を混同しない。チャレンジ枠は報酬を上書きしない',()=>{const s=initialState();const x=s.slots.find(x=>x.id==='autumn');x.rewardMode='multiplier';x.reward=2;assert.equal(offerTerms(s,'travel').reward,100000);assert.equal(offerTerms(s,'shop').rewardMode,'rate');assert.equal(offerTerms(s,'shop').reward,3);assert.equal(offerTerms(s,'game').reward,80000);assert.equal(offerTerms(s,'game').challenge?.id,'challenge');assert.equal(challengeSlots(s).length,4);assert.equal(pillSlots(s).length,4);});

// ---- アンケート（spec survey）----
test('報酬額（円）× 還元率 → pt を四捨五入。回答で付与予定、自動判定で確定',()=>{const s=fresh();const q=availableSurveys(s).find(x=>x.id==='s1');assert.equal(surveyReward(s,q),2100);s.limits.surveyRate.screening=33;assert.equal(surveyReward(s,{type:'screening',rewardYen:3}),99);s.limits.surveyRate.screening=70;assert.ok(availableSurveys(s).every(x=>x.id!=='s3'));assert.equal(completeSurvey(s,'s1'),2100);assert.equal(s.user.pending,2100);assert.ok(availableSurveys(s).some(x=>x.id==='s3'));assert.equal(completeSurvey(s,'s1'),false);autoReview(s);assert.equal(s.user.pending,0);});

// ---- プロト独自（チャレンジボーナス・ポップアップ・今日できるお仕事）----
test('チャレンジボーナスは達成と承認の後に付与予定（有人審査）として一度だけ登録',()=>{const s=fresh();challenge(s,'pay');progressOffer(s,'pay');assert.equal(s.user.pending,80000);assert.equal(advanceChallenges(s,500),0);assert.equal(achieveChallenges(s),1);assert.equal(s.user.pending,130000);assert.equal(settleChallenges(s),0);challenge(s,'sec');progressOffer(s,'sec');assert.ok(caseFor(s,'sec').bonusPaid);});
test('起動時ポップアップは候補から1枚を 1 日 1 回、モードで制御できる',()=>{const s=initialState();assert.ok(['autumn','challenge'].includes(launchPopup(s).id));assert.equal(launchPopup(s).slides,undefined);markPopupSeen(s);assert.equal(launchPopup(s),null);s.popupMode='always';assert.ok(['autumn','challenge'].includes(launchPopup(s).id));assert.equal(launchPopup(s).slides,undefined);s.popupMode='off';assert.equal(launchPopup(s),null);s.popupMode='daily';s.date='2026-10-05';assert.equal(popupSlots(s).length,0);});
test('今日できるお仕事に追加受取はなく案件導線を含む',()=>{const s=fresh();const t=todayTasks(s);assert.equal(t.claimable,0);assert(t.items.some(x=>x.kind==='offer'));assert(claimMission(s,'launch').error);});
test('動画1回から3回のミッションを段階別に完了する',()=>{const s=fresh();assert.equal(missionTasks(s).items.length,5);claimVideo(s);assert.equal(missionTasks(s).done,1);claimVideo(s);assert.equal(missionTasks(s).done,2);claimVideo(s);assert.equal(missionTasks(s).done,3);});

test('クレカタブ閲覧ではミッション報酬を発生させない',()=>{const s=fresh();visitHomeTab(s,'credit');assert(!missionTasks(s).items.some(x=>x.id==='credit-tab'));assert(claimMission(s,'credit-tab').error);assert.equal(s.user.pending,0);});
test('旧閲覧ミッションの保存データがあっても追加報酬なし',()=>{const s=fresh();ensureBrowseMission(s);ensureBrowseMission(s);assert.equal(s.missionDef.filter(m=>m.id==='credit-tab').length,1);assert(!missionTasks(s).items.some(x=>x.id==='credit-tab'));assert(claimMission(s,'credit-tab').error);});
