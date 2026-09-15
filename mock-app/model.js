// タメルコ v2 モック：ドメインモデル
// 2026-09-15：poikatsu-spec（GitHub）に明記された数値・条件を優先して修正。
// 仕様書が「運用設定（値は spec に書かない）」としている値は【仮値】とコメントし、デモ設定で確認できるようにしている。
// 内部は整数 pt。1 円 = 100 pt、100 pt = 1 マネー（spec: dotmoney-exchange.md）
export const KEY='tameruko-v2-mock-v1';
export const TODAY='2026-09-15';
export const yen=pt=>(pt/100).toLocaleString('ja-JP',{maximumFractionDigits:2});
export const pt=n=>n.toLocaleString('ja-JP');

// ===== 案件（AF）=====
// spec: 案件は NACS が配信。定率/定額/SUR（段階）。install=true はインストール案件（解禁前のユーザーには一覧に出さない）
export const offers=[
 {id:'travel',name:'旅日和トラベル',category:'旅行',base:50000,art:'travel',logo:{bg:'#2E7D5B',fg:'#fff',text:'旅'},condition:'初めての宿泊予約・宿泊完了',time:'宿泊完了後、約30日',tag:'秋のおでかけ',description:'週末の小旅行も、年末の帰省も。宿泊予約でお小遣いをためよう。',cost:'無料'},
 {id:'shop',name:'くらしのマーケット',category:'買い物',base:10000,rate:1,art:'shop',logo:{bg:'#F4A53A',fg:'#fff',text:'暮'},condition:'対象商品の購入・受取完了',time:'商品受取後、約30日',tag:'お買い物',description:'いつもの日用品や、新生活の買い足しに。',cost:'購入額に応じて'},
 {id:'game',name:'ガーデンパズル',category:'ゲーム',base:80000,art:'game',install:true,sur:[{label:'レベル5到達',reward:8000},{label:'レベル10到達',reward:16000},{label:'レベル17到達',reward:56000}],logo:{bg:'#7CB342',fg:'#fff',text:'G'},condition:'初回インストール後30日以内にレベル17到達',time:'条件達成後、約7日',tag:'段階でためる',description:'レベル5・10・17の3段階（SUR）。マイ案件で次の条件を確認できます。',cost:'無料'},
 {id:'card',name:'サンプルライフカード',category:'金融',base:500000,art:'card',logo:{bg:'#3F51B5',fg:'#fff',text:'SL'},condition:'初回カード発行・利用条件達成',time:'条件達成後、約60日',tag:'はじめての方',description:'すでに利用した方は対象外です。詳細な獲得条件をご確認ください。',cost:'年会費無料'},
 {id:'news',name:'まいにちニュース',category:'アプリ',base:10000,art:'news',install:true,logo:{bg:'#E53935',fg:'#fff',text:'N'},condition:'初回インストール・起動',time:'起動確認後、約3日',tag:'かんたん',description:'インストールして起動するだけ。',cost:'無料'},
 {id:'video',name:'ショート動画Lite',category:'アプリ',base:32000,art:'video',install:true,logo:{bg:'#111',fg:'#fff',text:'♪'},condition:'初回インストール後7日間の利用',time:'条件達成後、約7日',tag:'人気',description:'7日間の利用で達成。毎日の起動がカギです。',cost:'無料'},
 {id:'pay',name:'サンプルペイ',category:'金融',base:80000,art:'pay',logo:{bg:'#D32F2F',fg:'#fff',text:'Pay'},condition:'新規口座開設・初回チャージ',time:'条件達成後、約30日',tag:'新規口座開設',description:'口座開設後、初回チャージで達成。',cost:'無料'},
 {id:'sec',name:'サンプル証券',category:'金融',base:300000,art:'sec',logo:{bg:'#BF360C',fg:'#fff',text:'証'},condition:'新規口座開設・入金',time:'条件達成後、約45日',tag:'新規口座開設',description:'はじめての証券口座に。',cost:'無料'}
];

// ===== アンケート =====
// spec: 種別は モニタ情報取得(monitor)/スクリーニング(screening)/本調査(main)。報酬額（円）× ユーザー還元率 → pt（四捨五入）
export const surveys=[
 {id:'s1',title:'毎日のお買い物について',type:'screening',label:'スクリーニング',minutes:1,rewardYen:30,questions:['日用品はどこで購入することが多いですか？','お買い物の頻度を教えてください。'],choices:[['スーパー','ドラッグストア','オンライン','その他'],['週に2回以上','週に1回','月に数回','ほとんど買わない']]},
 {id:'s2',title:'スマートフォンの利用に関する調査',type:'screening',label:'スクリーニング',minutes:2,rewardYen:50,questions:['1日にスマートフォンを使う時間は？','よく使う機能はどれですか？'],choices:[['1時間未満','1〜3時間','3〜5時間','5時間以上'],['SNS','動画','ゲーム','買い物']]},
 {id:'s3',title:'これからの買い物と暮らし',type:'main',label:'本調査',minutes:8,rewardYen:300,parent:'s1',questions:['買い物で一番大切にしていることは？','商品について知りたい情報は？','今後利用してみたい買い方は？'],choices:[['価格','品質','使いやすさ','環境への配慮'],['使った人の感想','詳しい仕様','作り手の想い','価格の比較'],['定期購入','まとめ買い','都度購入','まだ決めていない']]}
];

// ===== 運用枠（キャンペーン・おすすめ・通知・ポップアップ・テキストバナー・チャレンジ）=====
const slot=(id,name,destination,kind,placements,extra={})=>({id,name,destination,kind,placements,enabled:true,start:'2026-09-01',end:'2026-09-30',segment:'all',priority:50,title:name,text:'',visual:destination,rewardMode:'flat',reward:0,entryRequired:false,mission:false,notification:'',notificationDate:'2026-09-15',...extra});

export function initialState(){return{version:4,date:TODAY,persona:'regular',scenario:'normal',popupMode:'daily',stepLink:'linked',slots:[
 slot('autumn','秋のおでかけ応援','travel','campaign',['carousel','feed','popup'],{title:'秋のおでかけで、\nいつもよりおトクに。',text:'旅日和トラベル｜宿泊予約キャンペーン',reward:120000,priority:90,mission:true,entryRequired:true,notification:'秋のおでかけ応援がスタート。予約前のエントリーをお忘れなく。'}),
 slot('challenge','みんなでチャレンジ','game','challenge',['carousel','popup','challenge'],{title:'みんなで達成して、\nボーナスをもらおう。',text:'10,000人の達成で参加者全員に追加特典',priority:80,challengeGoal:10000,participants:8240,bonus:20000,mission:true}),
 slot('ch-pay','チャレンジ：サンプルペイ','pay','challenge',['challenge'],{title:'口座開設チャレンジ',text:'新規口座開設・初回チャージで参加',challengeGoal:5000,participants:4120,bonus:50000,end:'2026-09-20',priority:75}),
 slot('ch-sec','チャレンジ：サンプル証券','sec','challenge',['challenge'],{title:'証券口座チャレンジ',text:'目標達成済み。今から利用してもボーナス対象',challengeGoal:3000,participants:3260,bonus:100000,end:'2026-09-25',priority:74}),
 slot('ch-video','チャレンジ：ショート動画Lite','video','challenge',['challenge'],{title:'アプリ利用チャレンジ',text:'7日間の利用で参加',challengeGoal:20000,participants:6480,bonus:10000,end:'2026-09-17',priority:73}),
 slot('staff','スタッフのおすすめ','shop','recommend',['feed'],{title:'暮らしの買い足し、今がおトク',text:'日用品からインテリアまで',rewardMode:'rate',reward:3,priority:60}),
 slot('exchange','交換手数料0円','wallet','notice',['sub'],{title:'ためた分を、手数料0円で交換',text:'ドットマネーへの交換',priority:20,visual:'wallet'}),
 slot('finance','はじめてのカード特集','card','recommend',['feed'],{title:'はじめてのカードでおトク',text:'未利用の方限定',reward:500000,segment:'finance',priority:40}),
 slot('winter','冬の旅を早めに予約','travel','campaign',['carousel','popup'],{title:'冬の旅行も、おトクに。',text:'11月限定・旅の準備をはじめよう',start:'2026-11-01',end:'2026-11-30',reward:150000,priority:95,mission:true}),
 slot('pill-sec','本日最終：証券チャレンジ','sec','ticker',['pill'],{title:'本日最終！証券口座開設でボーナス+1,000円相当',to:'offer/sec',priority:95}),
 slot('pill-5','5のつく日','shop','ticker',['pill'],{title:'5のつく日はお買い物の還元UP',to:'offers/買い物',priority:90}),
 slot('pill-ch','チャレンジボーナス','game','ticker',['pill'],{title:'チャレンジボーナス開催中',to:'challenges',priority:85}),
 slot('pill-autumn','秋のおでかけ','travel','ticker',['pill'],{title:'秋のおでかけ応援 エントリー受付中',to:'offer/travel',priority:80})
 ],
 // ---- 設定値 ----
 // spec に明記: minAmount（最低交換ポイント 100pt）、unit（交換単位 100pt）、installUnlock（同日 S2S 通知 5 件で解禁）
 // 【仮値】（spec は運用設定として値を書かない）: videoLimit / videoReward / stepGoal / stepMax / stepRewardAd / stepRewardNoAd / missionReward / surveyRate
 limits:{minAmount:100,unit:100,installUnlock:5,
  videoLimit:3,videoReward:100,stepGoal:1000,stepMax:4000,stepRewardAd:300,stepRewardNoAd:100,
  missionReward:{launch:100,steps:100,video:100,survey:100},
  surveyRate:{monitor:100,screening:70,main:70}},
 user:{approved:124800,pending:18400,earned:224800,registered:'2026-08-01',member:true,sms:false,profile:false,installUnlocked:true,entries:{},
  // 成果（CV）ごとに 1 件。status: challenging(挑戦中・SUR) / judging(判定中) / approved(承認) / rejected(否認)
  cases:[{id:'cv-game',offerId:'game',name:'ガーデンパズル',status:'challenging',date:TODAY+' 09:12',reward:80000,rewardMode:'flat',base:80000,level:1,paidStages:0,challengeId:'challenge',challengeBonus:20000,bonusPaid:false,condition:'初回インストール後30日以内にレベル17到達'}],
  answered:[],daily:{},history:[],
  // 付与予定（準備中）。review: auto=ポイント自動判定 / manual=有人審査（案件）
  pendings:[{id:'p-initial',title:'アンケートで獲得',desc:'家計に関する調査',amount:18400,category:'SURVEY',review:'auto',date:TODAY}]},
 logs:[],metrics:{},surveyStarts:[],surveyCompletions:[]};}

// ===== 日次 =====
const blankDay=()=>({video:0,steps:1000,stepsClaimed:0,surveys:0,popupSeen:false,claimed:{}});
export const day=s=>({...blankDay(),...(s.user.daily[s.date]||{})});
export function daily(s){const d=s.user.daily[s.date]??=blankDay();for(const [k,v] of Object.entries(blankDay()))if(d[k]===undefined)d[k]=v;return d;}
export const adsAllowed=s=>s.persona!=='minor'; // spec network-ads 3.1: 成人（または未成年で admob_minor__enabled）のみ広告配信。モックでは persona で切替
export const isGuest=s=>s.persona==='guest';

// ===== 枠の表示判定 =====
export function matches(s,slot){const segment=slot.segment==='all'||slot.segment==='new'&&s.persona==='new'||slot.segment==='regular'&&s.persona!=='new'||slot.segment==='finance'&&s.persona!=='card';const offer=offers.find(o=>o.id===slot.destination);return slot.enabled&&slot.start<=s.date&&slot.end>=s.date&&segment&&!(s.persona==='card'&&offer?.category==='金融');}
export const visibleSlots=s=>s.slots.filter(x=>matches(s,x)).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
export function offerTerms(s,id){const o=offers.find(o=>o.id===id);const active=visibleSlots(s).find(x=>x.destination===id&&['campaign','recommend'].includes(x.kind));return {offer:o,slot:active,reward:active?(active.rewardMode==='multiplier'?Math.round(o.base*active.reward):active.reward):o.base,rewardMode:active?.rewardMode||(o.rate?'rate':'flat'),entryRequired:!!active?.entryRequired,challenge:challengeFor(s,id),sur:!!o.sur};}
// spec affiliate 3.2/3.3: 金融利用済みは金融を除外（モック独自）、インストール案件は解禁済みのユーザーにだけ一覧に出す（詳細の直接表示は妨げない）
export const visibleOffers=s=>offers.filter(o=>!(s.persona==='card'&&o.category==='金融')&&(!o.install||s.user.installUnlocked));
export const pillSlots=s=>visibleSlots(s).filter(x=>x.placements.includes('pill'));
export const popupSlots=s=>visibleSlots(s).filter(x=>x.placements.includes('popup'));
export function launchPopup(s){const mode=s.popupMode||'daily';if(mode==='off')return null;const [slot]=popupSlots(s);if(!slot)return null;if(mode==='daily'&&day(s).popupSeen)return null;return slot;}
export function markPopupSeen(s){daily(s).popupSeen=true;}
export const challengeSlots=s=>visibleSlots(s).filter(x=>x.kind==='challenge');
export const challengeFor=(s,id)=>challengeSlots(s).find(x=>x.destination===id);
export const challengeAchieved=c=>!!c&&c.participants>=c.challengeGoal;
export const daysLeft=(s,c)=>Math.max(0,Math.round((Date.parse(c.end)-Date.parse(s.date))/86400000));

// ===== アンケート =====
export const availableSurveys=s=>surveys.filter(x=>!s.user.answered.includes(x.id)&&(!x.parent||s.user.answered.includes(x.parent)));
// spec survey 3.2: ユーザー還元額（円）= 報酬額 × 還元率 ÷ 100、pt = 円 × 100 を四捨五入
export const surveyRate=(s,type)=>s.limits.surveyRate[type]??100;
export const surveyReward=(s,q)=>Math.round(q.rewardYen*surveyRate(s,q.type)/100*100);

// ===== ポイント口座（spec point-history）=====
// 合算ポイント = 保有（交換可能）+ 付与予定（準備中）。総獲得は確定した加算の累計
export const total=s=>s.user.approved+s.user.pending;
export function addHistory(s,title,amount,status='approved',category='OTHER',desc=''){s.user.history.unshift({id:crypto.randomUUID(),title,desc,amount,status,date:s.date,category});}
// 付与予定として登録（付与予定ポイント・合算が増える。保有・総獲得は変わらない）
export function schedule(s,title,amount,category,review='auto',desc=''){if(amount<=0)return null;const p={id:crypto.randomUUID(),title,desc,amount,category,review,date:s.date};s.user.pendings.push(p);s.user.pending+=amount;addHistory(s,title,amount,'pending',category,desc);return p;}
// 即時付与（運営付与・連続ログイン等。付与予定を経ない）
export function grant(s,title,amount,category='ADMIN',desc=''){s.user.approved+=amount;s.user.earned+=amount;addHistory(s,title,amount,'approved',category,desc);}
// 確定：付与予定 → 保有・総獲得へ。合算は変わらない
export function confirm(s,id){const i=s.user.pendings.findIndex(x=>x.id===id);if(i<0)return false;const [p]=s.user.pendings.splice(i,1);s.user.pending-=p.amount;s.user.approved+=p.amount;s.user.earned+=p.amount;const h=s.user.history.find(x=>x.title===p.title&&x.desc===p.desc&&x.amount===p.amount&&x.status==='pending');if(h)h.status='approved';return true;}
// 取り消し：付与予定と合算が減り、履歴から消える。通知しない
export function cancelPending(s,id){const i=s.user.pendings.findIndex(x=>x.id===id);if(i<0)return false;const [p]=s.user.pendings.splice(i,1);s.user.pending-=p.amount;const hi=s.user.history.findIndex(x=>x.title===p.title&&x.desc===p.desc&&x.amount===p.amount&&x.status==='pending');if(hi>=0)s.user.history.splice(hi,1);return true;}
// ポイント自動判定（歩数・動画・デイリーミッション・アンケート）。モックでは照合なしで全件確定
export function autoReview(s){const targets=s.user.pendings.filter(x=>x.review==='auto');targets.forEach(x=>confirm(s,x.id));audit(s,'ポイント自動判定を実行',`${targets.length}件`);return targets.length;}
// 有人審査（案件）。モックでは全件承認
export function manualReview(s){const targets=s.user.pendings.filter(x=>x.review==='manual');targets.forEach(x=>confirm(s,x.id));audit(s,'有人審査で承認',`${targets.length}件`);return targets.length;}
export function record(s,id,kind){const m=s.metrics[id]??={imp:0,tap:0,cv:0};m[kind]=(m[kind]||0)+1;}
export function audit(s,label,details){s.logs.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),actor:'デモ運用者',label,details});}

// ===== 交換（spec dotmoney-exchange）=====
// 条件: Ameba 連携済み・SMS 本人確認・口座有効・日次交換総額上限（サービス全体）。原資は保有ポイントのみ
export function exchangeConditions(s){const min=s.limits.minAmount;const approved=s.user.approved,sum=total(s);const member=!isGuest(s)&&s.user.member;
 // マイページの交換状態テキスト 3 状態（spec my-page 2.3）
 let text;if(member&&sum>=min&&approved<min)text={state:'preparing',label:'ポイント準備中です'};else if(sum>=min)text={state:'ready',label:`${pt(member?Math.floor(approved/s.limits.unit)*s.limits.unit:sum)}pt交換できます`};else text={state:'short',label:`あと${pt(min-sum)}ptで交換できます`};
 return{member,sms:s.user.sms,account:true,dailyCapOpen:s.scenario!=='cap',canExchange:member&&approved>=min,text};}

// ===== 案件：チャレンジと成果（spec affiliate 3.4〜3.6、jobs/affiliate-conversion）=====
export const caseFor=(s,offerId)=>[...s.user.cases].reverse().find(c=>c.offerId===offerId);
// チャレンジ可否（spec 3.4 の優先順）。モックには非対象端末・期間外の状態はデモ用の掲載終了のみ
export function challengeState(s,id){const o=offers.find(x=>x.id===id);if(!o)return 'notfound';const c=caseFor(s,id);if(o.sur&&c&&c.status==='challenging')return 'sur-challenging';return 'normal';}
// チャレンジ＝クリック URL を開く。タメルコはチャレンジを記録しない（spec 3.5）が、モックでは成果の発生を同時に再現して「判定中／挑戦中」の CV を作る
export function challenge(s,id){const t=offerTerms(s,id);if(challengeState(s,id)!=='normal')return false;if(t.entryRequired&&!s.user.entries[id])throw Error('先にエントリーしてください。');const c=t.challenge;const cv={id:crypto.randomUUID(),offerId:id,name:t.offer.name,status:t.sur?'challenging':'judging',date:s.date+' '+new Date().toTimeString().slice(0,5),reward:t.reward,rewardMode:t.rewardMode,base:t.offer.base,level:0,paidStages:0,entryRequired:t.entryRequired,condition:t.offer.condition,slotId:t.slot?.id,challengeId:c?.id,challengeBonus:c?.bonus||0,bonusPaid:false};s.user.cases.push(cv);if(c){c.participants++;record(s,c.id,'tap');}if(t.slot)record(s,t.slot.id,'tap');return cv;}
// 成果の承認（デモ）。承認 → 付与予定（有人審査）。SUR は段階ごとに独立
export function progressOffer(s,offerId){const c=caseFor(s,offerId);if(!c||c.status==='approved'||c.status==='rejected')return false;const o=offers.find(x=>x.id===offerId);
 if(o.sur){const stage=o.sur[c.paidStages];if(!stage)return false;c.paidStages++;c.level=c.paidStages;schedule(s,'案件を達成して獲得',stage.reward,'AFFILIATE','manual',`【${stage.label}】${o.name}`);if(c.paidStages>=o.sur.length){c.status='approved';c.date=s.date+' '+new Date().toTimeString().slice(0,5);if(c.slotId)record(s,c.slotId,'cv');}}
 else{const rate=c.rewardMode==='rate';const amount=rate?Math.round(10000*c.reward):c.reward;c.status='approved';c.date=s.date+' '+new Date().toTimeString().slice(0,5);schedule(s,rate?'お買い物をして獲得':'案件を達成して獲得',amount,rate?'AFFILIATE_RATE':'AFFILIATE','manual',o.name+(rate?'（購入額10,000円）':''));if(c.slotId)record(s,c.slotId,'cv');}
 audit(s,'デモ成果を承認',o.name);settleChallenges(s);return true;}
export function rejectOffer(s,offerId){const c=caseFor(s,offerId);if(!c||c.status==='approved'||c.status==='rejected')return false;c.status='rejected';c.date=s.date+' '+new Date().toTimeString().slice(0,5);audit(s,'デモ成果を否認',c.name);return true;}
// チャレンジボーナス（プロト独自）：承認済み・達成済みなら付与予定（有人審査）。否認は対象外
export function settleChallenges(s){let paid=0;for(const c of s.user.cases){if(!c.challengeId||c.status!=='approved'||c.bonusPaid)continue;const ch=s.slots.find(x=>x.id===c.challengeId);if(!challengeAchieved(ch))continue;c.bonusPaid=true;schedule(s,'チャレンジボーナス',c.challengeBonus,'AFFILIATE','manual',c.name);record(s,ch.id,'cv');paid++;}return paid;}
export function advanceChallenges(s,n){for(const c of challengeSlots(s))c.participants+=n;audit(s,'デモ：チャレンジ参加人数を更新',`+${n}`);return settleChallenges(s);}
export function achieveChallenges(s){for(const c of challengeSlots(s))c.participants=Math.max(c.participants,c.challengeGoal);audit(s,'デモ：チャレンジを達成にする','');return settleChallenges(s);}
export const startOffer=(s,id)=>!!challenge(s,id);

// ===== 歩いてためる（spec earn-by-steps）=====
export const stepMilestones=s=>Math.min(Math.floor(day(s).steps/s.limits.stepGoal),s.limits.stepMax/s.limits.stepGoal);
export const stepMaxCount=s=>s.limits.stepMax/s.limits.stepGoal;
// 獲得可能 = 達成済み数 + 1 番目で到達済み。1 回の獲得で 1 つ。上限で不可。未連携・利用不可は不可
export const stepsClaimable=s=>s.stepLink==='linked'&&day(s).stepsClaimed<stepMaxCount(s)&&stepMilestones(s)>day(s).stepsClaimed;
export function claimSteps(s,withAd=false){if(!stepsClaimable(s))return false;if(withAd&&!adsAllowed(s))return false;const d=daily(s);d.stepsClaimed++;const amount=withAd?s.limits.stepRewardAd:s.limits.stepRewardNoAd;schedule(s,'歩いてためるで獲得',amount,'STEP','auto',`${(d.stepsClaimed*s.limits.stepGoal).toLocaleString()}歩達成${withAd?'（動画あり）':''}`);return amount;}
export function addSteps(s,n){const d=daily(s);d.steps=Math.min(s.limits.stepMax+999,d.steps+n);return d.steps;}

// ===== 動画リワード（spec video-reward）=====
export const videoRemaining=s=>Math.max(0,s.limits.videoLimit-day(s).video);
export function claimVideo(s){if(!adsAllowed(s))return false;const d=daily(s);if(d.video>=s.limits.videoLimit)return false;d.video++;schedule(s,'動画を見て獲得',s.limits.videoReward,'REWARD_AD','auto',`${d.video}回目の視聴`);
 // spec video-reward 3.7: 同じ日に S2S 通知 5 件でインストール案件が解禁（モックでは達成回数で近似）
 if(d.video>=s.limits.installUnlock&&!s.user.installUnlocked){s.user.installUnlocked=true;audit(s,'インストール案件を解禁','動画視聴'+d.video+'回');}
 return true;}

// ===== デイリーミッション（spec daily-mission）=====
// タスク種別: APP_LAUNCH / STEP_MILESTONE / REWARD_AD（spec の 3 種）＋ SURVEY（プロト独自・新機能）
// 状態: 未達成(todo) → 達成済み(achieved) → 受け取り済み(claimed)。達成時点では付与しない。受け取り操作でのみ付与予定を登録
export function missionTasks(s){const d=day(s),ads=adsAllowed(s),avail=availableSurveys(s);const R=s.limits.missionReward;
 const st=(id,achieved)=>d.claimed[id]?'claimed':achieved?'achieved':'todo';
 const items=[
  {id:'launch',kind:'launch',title:'アプリを開こう',sub:'アプリを開いたらクリア',reward:R.launch,state:st('launch',true)},
  {id:'steps',kind:'steps',title:'歩いてためよう',sub:`${s.limits.stepGoal.toLocaleString()}歩ごとにポイントを獲得したらクリア`,reward:R.steps,state:st('steps',d.stepsClaimed>=1)},
  ...(ads?[{id:'video',kind:'video',title:'動画を見てためよう',sub:'動画広告を見てポイントを獲得したらクリア',reward:R.video,state:st('video',d.video>=1)}]:[]),
  {id:'survey',kind:'survey',title:'アンケートに答えよう',sub:avail.length?`${avail.length}件の調査が届いています`:'アンケートに回答したらクリア',reward:R.survey,state:st('survey',d.surveys>=1),to:avail[0]?`answer/${avail[0].id}`:'surveys',extra:true}
 ];
 const done=items.filter(x=>x.state!=='todo').length; // spec: 「達成済みまたは受け取り済みのタスク数」
 return {items,done,total:items.length,claimable:items.filter(x=>x.state==='achieved').length,complete:items.every(x=>x.state==='claimed')};}
export function claimMission(s,id){const t=missionTasks(s).items.find(x=>x.id===id);if(!t)return {error:'ERROR_TYPE_DAILY_MISSION_TASK_NOT_FOUND'};if(t.state==='claimed')return {error:'ERROR_TYPE_DAILY_MISSION_TASK_ALREADY_CLAIMED'};if(t.state!=='achieved')return {error:'ERROR_TYPE_DAILY_MISSION_TASK_NOT_COMPLETED'};daily(s).claimed[id]=true;schedule(s,'デイリーミッションで獲得',t.reward,'DAILY_MISSION','auto',t.title);return {amount:t.reward};}
export const claimLaunch=s=>!claimMission(s,'launch').error;

// 今日できるお仕事（プロト独自）：未受け取りのミッション・アンケート・期間限定案件と見込み額
export function todayTasks(s){const m=missionTasks(s);const avail=availableSurveys(s);const missions=visibleSlots(s).filter(x=>x.mission&&!caseFor(s,x.destination));
 const items=m.items.map(x=>({...x}));
 for(const sl of missions){const t=offerTerms(s,sl.destination);items.push({id:'af-'+sl.id,kind:'offer',title:t.offer.name,sub:sl.entryRequired?'期間限定・エントリーしてからチャレンジ':'期間限定・条件を確認してチャレンジ',reward:t.rewardMode==='rate'?0:t.reward,rate:t.rewardMode==='rate'?t.reward:0,state:'todo',to:`offer/${sl.destination}`,pr:true});}
 const remainingVideo=adsAllowed(s)?videoRemaining(s):0;const stepsLeft=s.stepLink==='linked'?Math.max(0,stepMaxCount(s)-day(s).stepsClaimed):0;
 const potential=m.items.filter(x=>x.state!=='claimed').reduce((a,x)=>a+x.reward,0)+avail.reduce((a,q)=>a+surveyReward(s,q),0)+remainingVideo*s.limits.videoReward+stepsLeft*s.limits.stepRewardNoAd+missions.reduce((a,sl)=>{const t=offerTerms(s,sl.destination);return a+(t.rewardMode==='rate'?0:t.reward);},0);
 return {items,done:m.done,total:m.total,claimable:m.claimable,complete:m.complete,count:items.filter(x=>x.state!=='claimed').length,potential};}

// ===== アンケート回答（spec survey 3.4：回答完了通知 → 付与予定（自動判定で常に確定））=====
export function completeSurvey(s,id){if(s.user.answered.includes(id))return false;const q=availableSurveys(s).find(x=>x.id===id);if(!q)throw Error('現在回答できないアンケートです。');const amount=surveyReward(s,q);s.user.answered.push(id);s.surveyCompletions.push({id,date:s.date});daily(s).surveys++;schedule(s,'アンケートで獲得',amount,'SURVEY','auto',q.title);return amount;}
