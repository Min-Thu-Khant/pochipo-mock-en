import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {initialState,schedule,confirm,grant,receiveConversion,claimSteps,claimVideo,claimMission,beginMissionActivity} from '../model.js';
import {ensureOverlayAds,nextInterstitial,setAdDelivery} from '../overlay-ads.js';
import {recordWorkReward,reportRewardSnapshot,queueReportReturnAd,finishWorkAd,workAdProgress} from '../work-ad-triggers.js';
import {adDeliveryForm} from '../../mock-admin/overlay-settings.js';
const fresh=(n=3)=>{const s=initialState();ensureOverlayAds(s);setAdDelivery(s,'interstitial',{enabled:true,rewardEvery:n});return s;};
const reward=s=>schedule(s,'歩いてためるで獲得',100,'STEP');
const show=s=>{const r=nextInterstitial(s);if(r)finishWorkAd(s,r.ticket.id);return r;};
test('準備中への新規獲得n回ごとに表示し、タブ移動や再描画だけでは発火しない',()=>{
 const s=fresh();for(let i=0;i<10;i++)assert.equal(nextInterstitial(s),null);
 for(let i=1;i<=6;i++){reward(s);const r=show(s);assert.equal(!!r,i%3===0);if(r)assert.equal(r.ticket.kind,'reward');assert.equal(nextInterstitial(s),null);}
 assert.equal(s.user.workAdProgress.total,6);
});
test('獲得回数に達する前でも、獲得後のレポート戻るで独立して表示する',()=>{
 const s=fresh(3);reward(s);assert.equal(nextInterstitial(s),null);
 assert.equal(queueReportReturnAd(s,reportRewardSnapshot(s)),true);assert.equal(show(s).ticket.kind,'report-return');
 assert.equal(queueReportReturnAd(s,reportRewardSnapshot(s)),false);assert.equal(nextInterstitial(s),null);
 reward(s);reward(s);assert.equal(show(s).ticket.kind,'reward');
 assert.ok(queueReportReturnAd(s,reportRewardSnapshot(s)));assert.equal(show(s).ticket.kind,'report-return');
});
test('新規獲得のないレポート閲覧や、閲覧前の獲得を見ていない場合は表示しない',()=>{
 const s=fresh(10);assert.equal(queueReportReturnAd(s,0),false);
 const before=reportRewardSnapshot(s);reward(s);assert.equal(queueReportReturnAd(s,before),false);
 assert.equal(queueReportReturnAd(s,999),false);assert.equal(nextInterstitial(s),null);
});
test('同じ準備中報酬の確定・再送は二重に数えない。既存準備中の確定も対象外',()=>{
 const s=fresh(2);confirm(s,'p-initial');assert.equal(reportRewardSnapshot(s),0);
 const p=reward(s);assert.equal(reportRewardSnapshot(s),1);assert.equal(recordWorkReward(s,p),false);
 confirm(s,p.id);confirm(s,p.id);assert.equal(reportRewardSnapshot(s),1);assert.equal(nextInterstitial(s),null);
 const cv={type:'approved',cvId:'one',amount:200,desc:'案件'};receiveConversion(s,cv);receiveConversion(s,cv);assert.equal(reportRewardSnapshot(s),2);
});
test('即時付与のお仕事も最初の獲得時だけ数え、運営付与・ログイン・交換は対象外',()=>{
 const s=fresh(1);grant(s,'アンケート',100,'SURVEY','','survey:1');grant(s,'アンケート',100,'SURVEY','','survey:1');assert.equal(reportRewardSnapshot(s),1);assert.ok(show(s));
 for(const category of ['ADMIN','LOGIN_BONUS','REFERRAL','EXCHANGE','EXPIRE'])grant(s,'対象外',100,category);
 schedule(s,'対象外',100,'ADMIN');schedule(s,'0ポイント',0,'STEP');assert.equal(reportRewardSnapshot(s),1);assert.equal(nextInterstitial(s),null);
});
test('歩数・動画の未完了や受取前は数えず、受取成功だけを数える',()=>{
 const s=fresh(1);s.stepLink='linked';s.user.daily[s.date]={steps:0};assert.equal(claimSteps(s,false),false);assert.equal(reportRewardSnapshot(s),0);
 s.user.daily[s.date].steps=1000;assert.ok(claimSteps(s,false));assert.equal(reportRewardSnapshot(s),1);
 const journey=beginMissionActivity(s,'video');assert.ok(claimVideo(s,{mission:journey}));assert.equal(reportRewardSnapshot(s),1);
 assert.ok(claimMission(s,'video').amount);assert.equal(reportRewardSnapshot(s),2);assert.ok(claimMission(s,'video').error);assert.equal(reportRewardSnapshot(s),2);
});
test('再読み込み・日付変更で獲得回数を失わず、ユーザー別に保持する',()=>{
 let s=fresh();reward(s);reward(s);s=JSON.parse(JSON.stringify(s));s.date='2026-09-16';reward(s);assert.ok(show(s));
 const u=s.user;s.user={};assert.equal(reportRewardSnapshot(s),0);assert.equal(nextInterstitial(s),null);s.user=u;assert.equal(reportRewardSnapshot(s),3);
});
test('ほかのダイアログ中は保留し、表示成功後にだけ消化する',()=>{
 const s=fresh(1);reward(s);assert.equal(nextInterstitial(s,{blocked:true}),null);assert.equal(s.user.workAdProgress.queue.length,1);
 const first=nextInterstitial(s);assert.equal(nextInterstitial(s).ticket.id,first.ticket.id);finishWorkAd(s,first.ticket.id);assert.equal(nextInterstitial(s),null);
});
test('配信候補なし・期間外・停止はその表示機会をスキップし、後のタブ移動で出さない',()=>{
 for(const kind of ['none','expired','stopped','offer']){const s=fresh(1),ad=s.slots.find(x=>x.id==='demo-interstitial-cafe');
  if(kind==='none')s.slots=[];if(kind==='expired')ad.end='2000-01-01';if(kind==='stopped')ad.enabled=false;if(kind==='offer')s.nacs.offers.find(x=>x.id==='cafe-game').active=false;
  reward(s);assert.equal(nextInterstitial(s),null);assert.equal(s.user.workAdProgress.queue.length,0);
 }
});
test('停止中に古い広告をため込まず、設定変更は次の獲得から適用する',()=>{
 const s=fresh(3);reward(s);setAdDelivery(s,'interstitial',{enabled:true,rewardEvery:2});assert.equal(nextInterstitial(s),null);reward(s);assert.ok(nextInterstitial(s));
 setAdDelivery(s,'interstitial',{enabled:false,rewardEvery:2});assert.equal(s.user.workAdProgress.queue.length,0);reward(s);reward(s);queueReportReturnAd(s,reportRewardSnapshot(s));
 setAdDelivery(s,'interstitial',{enabled:true,rewardEvery:2});assert.equal(nextInterstitial(s),null);
});
test('管理画面に獲得回数を表示し、旧タブ回数・クールダウン・起動中上限を表示しない',()=>{
 const html=adDeliveryForm(fresh(),'interstitial');assert.match(html,/name="rewardEvery"/);assert.match(html,/実績レポート/);assert.doesNotMatch(html,/タブ切り替え|cooldownSeconds|maxPerSession|name="every"/);
});
test('アプリの表示処理はモーダル中に保留し、解除後に表示して一度だけ消化する',()=>{
 const src=readFileSync(new URL('../app.js',import.meta.url),'utf8');const start=src.indexOf('function tryWorkInterstitial('),end=src.indexOf("\nmodal.addEventListener('close',requestWorkInterstitial);",start);
 const s=fresh(1);reward(s);let shown=0,saved=0;
 const c=vm.createContext({state:s,isBannerPreview:false,launchAdPending:false,modal:{open:true},permissionFlow:{active:false},videoBusy:false,accountUI:{isScreen:()=>false},route:()=>['home'],adsAllowed:()=>true,viewState:'normal',document:{visibilityState:'visible'},nextInterstitial,finishWorkAd,showInterstitial:()=>{shown++;c.modal.open=true;return true;},save:()=>{saved++;}});
 vm.runInContext(src.slice(start,end),c);c.tryWorkInterstitial();assert.equal(shown,0);c.modal.open=false;c.tryWorkInterstitial();assert.equal(shown,1);assert.equal(saved,1);c.modal.open=false;c.tryWorkInterstitial();assert.equal(shown,1);
 assert.doesNotMatch(src,/newAdSession|previousAdRoute/);
 assert.match(src,/case'page-back':if\(route\(\)\[0\]==='points'&&!route\(\)\[1\]/);
});
