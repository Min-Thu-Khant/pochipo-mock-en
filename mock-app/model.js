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
 {id:'sec',name:'サンプル証券',category:'金融',base:300000,art:'sec',logo:{bg:'#BF360C',fg:'#fff',text:'証'},condition:'新規口座開設・入金',time:'条件達成後、約45日',tag:'新規口座開設',description:'はじめての証券口座に。',cost:'無料'},
 {"id": "starquest", "name": "星ねこクエスト", "category": "ゲーム", "base": 45000, "art": "game", "logo": {"bg": "#7664de", "fg": "#fff", "text": "星"}, "condition": "初回会員登録・ステージ3クリア", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "星ねこクエストはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "無料"},
 {"id": "cafe-game", "name": "こもれびカフェ物語", "category": "ゲーム", "base": 60000, "art": "game", "logo": {"bg": "#d38a52", "fg": "#fff", "text": "茶"}, "condition": "初回会員登録・カフェをレベル10にする", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "こもれびカフェ物語はモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "無料"},
 {"id": "ocean-game", "name": "オーシャンタイル", "category": "ゲーム", "base": 30000, "art": "game", "logo": {"bg": "#289ec4", "fg": "#fff", "text": "海"}, "condition": "初回会員登録・パズルを20面クリア", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "オーシャンタイルはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "無料"},
 {"id": "marche", "name": "モリノマルシェ", "category": "買い物", "base": 12000, "art": "shop", "logo": {"bg": "#df7756", "fg": "#fff", "text": "森"}, "condition": "初回3,000円以上の商品購入・受取完了", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "モリノマルシェはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "購入が必要"},
 {"id": "cosme", "name": "LUMI コスメ", "category": "買い物", "base": 18000, "art": "shop", "logo": {"bg": "#ce70a0", "fg": "#fff", "text": "Lu"}, "condition": "初回コスメセット購入・受取完了", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "LUMI コスメはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "購入が必要"},
 {"id": "interior", "name": "NEST インテリア", "category": "買い物", "base": 25000, "art": "shop", "logo": {"bg": "#988063", "fg": "#fff", "text": "N"}, "condition": "初回5,000円以上の商品購入・受取完了", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "NEST インテリアはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "購入が必要"},
 {"id": "luna-card", "name": "LUNAカード", "category": "金融", "base": 650000, "art": "card", "logo": {"bg": "#6757ba", "fg": "#fff", "text": "L"}, "condition": "初回カード発行・翌月末までに1万円利用", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "LUNAカードはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "年会費無料", "creditCard": true},
 {"id": "leaf-card", "name": "リーフカード", "category": "金融", "base": 400000, "art": "card", "logo": {"bg": "#319b83", "fg": "#fff", "text": "葉"}, "condition": "初回カード発行・初回ショッピング利用", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "リーフカードはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "年会費無料", "creditCard": true},
 {"id": "trip-card", "name": "トリップカード", "category": "金融", "base": 800000, "art": "card", "logo": {"bg": "#267ead", "fg": "#fff", "text": "T"}, "condition": "初回カード発行・翌月末までに3万円利用", "time": "条件達成後、約30日", "tag": "新着サービス", "description": "トリップカードはモック用の架空サービスです。掲載条件・報酬もデモ用です。", "cost": "年会費あり", "creditCard": true}
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

export function initialState(){return{version:7,date:TODAY,persona:'regular',scenario:'normal',popupMode:'daily',stepLink:'linked',slots:[
 // ホーム最上部バナー（spec: Braze home_first 320×100 相当）。タップでディープリンク（特集ページ）へ
 slot('top-autumn','最上部バナー：秋のおでかけ特集','travel','banner',['top'],{title:'秋のおでかけ特集',text:'旅行・お買い物の案件をまとめてチェック',to:'feature/autumn-trip',priority:90}),
 slot('top-sec','最上部バナー：証券口座キャンペーン','sec','banner',['top'],{title:'サンプル証券 口座開設で最大3,000円相当',text:'今だけチャレンジボーナス対象',to:'feature/sec-campaign',priority:60}),
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
  surveyRate:{monitor:100,screening:70,main:70},
  missionDailyCap:1000,exchangeDailyCap:50000000},
 // 未成年向けの付与設定（spec point-master: 成人・未成年で別値。広告配信がないため動画の値は参考）
 limitsMinor:{videoLimit:1,videoReward:50,stepRewardAd:150,stepRewardNoAd:100},
 // 付与設定の予約（spec point-master 3: 適用日時を指定して予約。適用日時以降の達成に新しい値）
 reservations:[],
 // デイリーミッション定義（spec daily-mission 3.2: 3 種固定・文言はサーバー。SURVEY はプロト独自の追加種別）
 missionDef:[
  {id:'credit-tab',type:'OPEN_CREDIT_TAB',title:'クレカタブを開こう',sub:'クレカタブをチェックしたらクリア',reward:100,enabled:true,extra:true},
  {id:'launch',type:'APP_LAUNCH',title:'アプリを開こう',sub:'アプリを開いたらクリア',reward:100,enabled:true},
  {id:'steps',type:'STEP_MILESTONE',title:'歩いてためよう',sub:'1,000歩ごとにポイントを獲得したらクリア',reward:100,enabled:true},
  {id:'video',type:'REWARD_AD',title:'動画を見てためよう',sub:'動画広告を見てポイントを獲得したらクリア',reward:100,enabled:true},
  {id:'survey',type:'SURVEY',title:'アンケートに答えよう',sub:'アンケートに回答したらクリア',reward:100,enabled:true,extra:true}],
 // 案件画面設定（spec admin/affiliate-screen）：画面コード → 適用中の設定（グループ階層）。モックでは案件のカテゴリで絞り込む
 screens:{
  tametoku_quick:{memo:'ためトクのクイックアクセス',settings:[{id:'tq-1',applyAt:'2026-09-01T00:00',memo:'初期構成',groups:[{id:'g-shop',name:'買い物',category:'買い物',icon:'cart',unit:'jpy',order:1,tags:true},{id:'g-travel',name:'旅行',category:'旅行',icon:'plane',unit:'jpy',order:2,tags:true},{id:'g-game',name:'ゲーム',category:'ゲーム',icon:'game',unit:'jpy',order:3,tags:true},{id:'g-app',name:'アプリ',category:'アプリ',icon:'phone',unit:'jpy',order:4,tags:true},{id:'g-fin',name:'金融',category:'金融',icon:'yen',unit:'jpy',order:5,tags:true}]}]},
  home_quick:{memo:'ホームのカテゴリタイルメニュー（新規）',settings:[{id:'hq-1',applyAt:'2026-09-01T00:00',memo:'初期構成',groups:[{id:'hq-shop',name:'買い物',category:'買い物',icon:'cart',unit:'jpy',order:1,tags:true},{id:'hq-travel',name:'旅行',category:'旅行',icon:'plane',unit:'jpy',order:2,tags:true},{id:'hq-game',name:'ゲーム',category:'ゲーム',icon:'game',unit:'jpy',order:3,tags:true},{id:'hq-app',name:'アプリ',category:'アプリ',icon:'phone',unit:'jpy',order:4,tags:true},{id:'hq-fin',name:'金融',category:'金融',icon:'yen',unit:'jpy',order:5,tags:true},{id:'hq-ch',name:'チャレンジ',category:'challenges',icon:'spark',unit:'jpy',order:6,tags:true},{id:'hq-survey',name:'アンケート',category:'surveys',icon:'survey',unit:'jpy',order:7,tags:true},{id:'hq-all',name:'すべて',category:'すべて',icon:'gift',unit:'jpy',order:8,tags:true}]}]},
  home:{memo:'ホームの案件カルーセル',settings:[{id:'h-1',applyAt:'2026-09-01T00:00',memo:'初期構成',groups:[{id:'g-home-1',name:'あなたにオススメ',category:'すべて',icon:'',unit:'jpy',order:1,tags:true},{id:'g-home-2',name:'高額でためる',category:'金融',icon:'',unit:'jpy',order:2,tags:true},{id:'g-home-3',name:'アプリでためる',category:'アプリ',icon:'',unit:'jpy',order:3,tags:true}]}]}
 },
 // 特集ページ（ディープリンク feature/<id> の遷移先）。案件を集約（collection）または 1 案件を特集（single）
 features:[
  {id:'autumn-trip',title:'秋のおでかけ特集',lead:'旅行・お買い物でためる案件をまとめました。期間限定UPの案件はいまがチャンス。',kind:'collection',offerIds:['travel','shop','card'],note:'掲載期間 2026/09/01〜09/30'},
  {id:'sec-campaign',title:'サンプル証券 口座開設キャンペーン',lead:'はじめての証券口座に。チャレンジボーナスの目標達成済みで、今チャレンジしてもボーナス対象です。',kind:'single',offerIds:['sec'],note:'掲載期間 2026/09/01〜09/25'}],
 // 日次交換総額（サービス全体）の当日利用量（spec dotmoney-exchange: 上限は運用設定）
 exchangeUsedToday:12000000,
 user:{approved:124800,pending:18400,earned:224800,registered:'2026-08-01',member:true,sms:false,profile:false,installUnlocked:true,entries:{},
  // 成果（CV）ごとに 1 件。status: challenging(挑戦中・SUR) / judging(判定中) / approved(承認) / rejected(否認)
  cases:[{id:'cv-game',offerId:'game',name:'ガーデンパズル',status:'challenging',date:TODAY+' 09:12',reward:80000,rewardMode:'flat',base:80000,level:1,paidStages:0,challengeId:'challenge',challengeBonus:20000,bonusPaid:false,condition:'初回インストール後30日以内にレベル17到達'}],
  answered:[],daily:{},history:[],
  // 付与予定（準備中）。review: auto=ポイント自動判定 / manual=有人審査（案件）
  pendings:[{id:'p-initial',title:'アンケートで獲得',desc:'家計に関する調査',amount:18400,category:'SURVEY',review:'auto',date:TODAY}]},
 logs:[],metrics:{},surveyStarts:[],surveyCompletions:[]};}
// 有効な設定値：未成年は limitsMinor で上書き（spec network-ads 3.2 / point-master）
export const L=s=>s.persona==='minor'?{...s.limits,...s.limitsMinor}:s.limits;
// 予約の適用（適用日時が現在（確認日）以前のものを順に反映）
export function ensureBrowseMission(s){if(!s.missionDef.some(m=>m.id==='credit-tab'))s.missionDef.push({id:'credit-tab',type:'OPEN_CREDIT_TAB',title:'クレカタブを開こう',sub:'クレカタブをチェックしたらクリア',reward:100,enabled:true,extra:true});}
export function visitHomeTab(s,key){if(key==='credit')daily(s).creditTabVisited=true;}
export function applyReservations(s){ensureBrowseMission(s);let n=0;for(const r of s.reservations){if(r.applied||r.applyAt.slice(0,10)>s.date)continue;const target=r.age==='minor'?s.limitsMinor:s.limits;target[r.key]=r.value;r.applied=true;r.appliedAt=s.date;n++;}return n;}
// 案件画面設定：画面コードの適用中の設定（適用開始日時が現在以前で最新）
export function activeScreenSetting(s,code){const scr=s.screens?.[code];if(!scr)return null;const now=s.date+'T23:59';return scr.settings.filter(x=>x.applyAt<=now).sort((a,b)=>b.applyAt.localeCompare(a.applyAt))[0]||null;}
export const screenGroups=(s,code)=>(activeScreenSetting(s,code)?.groups||[]).slice().sort((a,b)=>a.order-b.order);

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
export const topBanner=s=>visibleSlots(s).find(x=>x.placements.includes('top'))||null; // 1 配置 1 枚（spec braze-banner 3.1）
export const slotLink=x=>x.to||('offer/'+x.destination);
export const featureById=(s,id)=>(s.features||[]).find(f=>f.id===id)||null;
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
export const surveyRate=(s,type)=>L(s).surveyRate[type]??100;
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
export function exchangeConditions(s){const min=L(s).minAmount;const approved=s.user.approved,sum=total(s);const member=!isGuest(s)&&s.user.member;
 // マイページの交換状態テキスト 3 状態（spec my-page 2.3）
 let text;if(member&&sum>=min&&approved<min)text={state:'preparing',label:'ポイント準備中です'};else if(sum>=min)text={state:'ready',label:`${pt(member?Math.floor(approved/L(s).unit)*L(s).unit:sum)}pt交換できます`};else text={state:'short',label:`あと${pt(min-sum)}ptで交換できます`};
 return{member,sms:s.user.sms,account:true,dailyCapOpen:s.scenario!=='cap'&&s.exchangeUsedToday<L(s).exchangeDailyCap,canExchange:member&&approved>=min,text};}

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
export const stepMilestones=s=>Math.min(Math.floor(day(s).steps/L(s).stepGoal),L(s).stepMax/L(s).stepGoal);
export const stepMaxCount=s=>L(s).stepMax/L(s).stepGoal;
// 獲得可能 = 達成済み数 + 1 番目で到達済み。1 回の獲得で 1 つ。上限で不可。未連携・利用不可は不可
export const stepsClaimable=s=>s.stepLink==='linked'&&day(s).stepsClaimed<stepMaxCount(s)&&stepMilestones(s)>day(s).stepsClaimed;
export function claimSteps(s,withAd=false){if(!stepsClaimable(s))return false;if(withAd&&!adsAllowed(s))return false;const d=daily(s);d.stepsClaimed++;const amount=withAd?L(s).stepRewardAd:L(s).stepRewardNoAd;schedule(s,'歩いてためるで獲得',amount,'STEP','auto',`${(d.stepsClaimed*L(s).stepGoal).toLocaleString()}歩達成${withAd?'（動画あり）':''}`);return amount;}
export function addSteps(s,n){const d=daily(s);d.steps=Math.min(L(s).stepMax+999,d.steps+n);return d.steps;}

// ===== 動画リワード（spec video-reward）=====
export const videoRemaining=s=>Math.max(0,L(s).videoLimit-day(s).video);
export function claimVideo(s){if(!adsAllowed(s))return false;const d=daily(s);if(d.video>=L(s).videoLimit)return false;d.video++;schedule(s,'動画を見て獲得',L(s).videoReward,'REWARD_AD','auto',`${d.video}回目の視聴`);
 // spec video-reward 3.7: 同じ日に S2S 通知 5 件でインストール案件が解禁（モックでは達成回数で近似）
 if(d.video>=L(s).installUnlock&&!s.user.installUnlocked){s.user.installUnlocked=true;audit(s,'インストール案件を解禁','動画視聴'+d.video+'回');}
 return true;}

// ===== デイリーミッション（spec daily-mission）=====
// タスク種別: APP_LAUNCH / STEP_MILESTONE / REWARD_AD（spec の 3 種）＋ SURVEY（プロト独自・新機能）
// 状態: 未達成(todo) → 達成済み(achieved) → 受け取り済み(claimed)。達成時点では付与しない。受け取り操作でのみ付与予定を登録
export function missionTasks(s){const d=day(s),ads=adsAllowed(s),avail=availableSurveys(s);
 const st=(id,achieved)=>d.claimed[id]?'claimed':achieved?'achieved':'todo';
 const achieved={APP_LAUNCH:true,STEP_MILESTONE:d.stepsClaimed>=1,REWARD_AD:d.video>=1,SURVEY:d.surveys>=1,OPEN_CREDIT_TAB:!!d.creditTabVisited};
 const kindOf={APP_LAUNCH:'launch',STEP_MILESTONE:'steps',REWARD_AD:'video',SURVEY:'survey',OPEN_CREDIT_TAB:'credit'};
 const items=s.missionDef.filter(m=>m.enabled&&!(m.type==='REWARD_AD'&&!ads)).map(m=>({id:m.id,kind:kindOf[m.type],type:m.type,title:m.title,sub:m.type==='SURVEY'&&avail.length?`${avail.length}件の調査が届いています`:m.sub,reward:m.reward,state:st(m.id,achieved[m.type]),to:m.type==='OPEN_CREDIT_TAB'?'home/credit':m.type==='SURVEY'?(avail[0]?`answer/${avail[0].id}`:'surveys'):undefined,extra:!!m.extra}));
 const done=items.filter(x=>x.state!=='todo').length; // spec: 「達成済みまたは受け取り済みのタスク数」
 return {items,done,total:items.length,claimable:items.filter(x=>x.state==='achieved').length,complete:items.length>0&&items.every(x=>x.state==='claimed')};}
export function claimMission(s,id){const t=missionTasks(s).items.find(x=>x.id===id);if(!t)return {error:'ERROR_TYPE_DAILY_MISSION_TASK_NOT_FOUND'};if(t.state==='claimed')return {error:'ERROR_TYPE_DAILY_MISSION_TASK_ALREADY_CLAIMED'};if(t.state!=='achieved')return {error:'ERROR_TYPE_DAILY_MISSION_TASK_NOT_COMPLETED'};daily(s).claimed[id]=true;schedule(s,'デイリーミッションで獲得',t.reward,'DAILY_MISSION','auto',t.title);return {amount:t.reward};}
export const claimLaunch=s=>!claimMission(s,'launch').error;

// 今日できるお仕事（プロト独自）：未受け取りのミッション・アンケート・期間限定案件と見込み額
export function todayTasks(s){const m=missionTasks(s);const avail=availableSurveys(s);const missions=visibleSlots(s).filter(x=>x.mission&&!caseFor(s,x.destination));
 const items=m.items.map(x=>({...x}));
 for(const sl of missions){const t=offerTerms(s,sl.destination);items.push({id:'af-'+sl.id,kind:'offer',title:t.offer.name,sub:sl.entryRequired?'期間限定・エントリーしてからチャレンジ':'期間限定・条件を確認してチャレンジ',reward:t.rewardMode==='rate'?0:t.reward,rate:t.rewardMode==='rate'?t.reward:0,state:'todo',to:`offer/${sl.destination}`,pr:true});}
 const remainingVideo=adsAllowed(s)?videoRemaining(s):0;const stepsLeft=s.stepLink==='linked'?Math.max(0,stepMaxCount(s)-day(s).stepsClaimed):0;
 const potential=m.items.filter(x=>x.state!=='claimed').reduce((a,x)=>a+x.reward,0)+avail.reduce((a,q)=>a+surveyReward(s,q),0)+remainingVideo*L(s).videoReward+stepsLeft*L(s).stepRewardNoAd+missions.reduce((a,sl)=>{const t=offerTerms(s,sl.destination);return a+(t.rewardMode==='rate'?0:t.reward);},0);
 return {items,done:m.done,total:m.total,claimable:m.claimable,complete:m.complete,count:items.filter(x=>x.state!=='claimed').length,potential};}

// ===== アンケート回答（spec survey 3.4：回答完了通知 → 付与予定（自動判定で常に確定））=====
export function completeSurvey(s,id){if(s.user.answered.includes(id))return false;const q=availableSurveys(s).find(x=>x.id===id);if(!q)throw Error('現在回答できないアンケートです。');const amount=surveyReward(s,q);s.user.answered.push(id);s.surveyCompletions.push({id,date:s.date});daily(s).surveys++;schedule(s,'アンケートで獲得',amount,'SURVEY','auto',q.title);return amount;}

// ===== 管理画面（mock-admin）向けの操作 =====
// 運用枠の妥当性検査（tameruko-boost の validateSlot を継承）
export function validateSlot(v){if(!v.name?.trim()||!v.title?.trim())return '管理名と表示タイトルを入力してください。';if(!/^\d{4}-\d{2}-\d{2}$/.test(v.start)||!/^\d{4}-\d{2}-\d{2}$/.test(v.end)||v.start>v.end)return '表示終了日は開始日以降にしてください。';if(!v.placements?.length)return '表示位置を1つ以上選んでください。';if(!Number.isFinite(v.reward)||v.reward<0||v.rewardMode==='rate'&&v.reward>100||v.rewardMode==='multiplier'&&v.reward<=0)return '報酬・倍率・還元率の値を確認してください。';if(!Number.isFinite(v.priority)||v.priority<0||v.priority>100)return '優先度は0〜100で入力してください。';if(v.kind==='challenge'&&(!(v.challengeGoal>0)||!(v.bonus>0)||v.participants<0))return 'チャレンジの目標人数・ボーナス・参加人数を確認してください。';if((v.placements.includes('pill')||v.placements.includes('top'))&&!v.to)return 'テキストバナー・最上部バナーにはリンク先（ディープリンク）を入力してください。';return '';}
export function publishSlot(s,v){const error=validateSlot(v);if(error)throw Error(error);const old=s.slots.find(x=>x.id===v.id);const before=old?JSON.stringify(old):'新規';if(old)s.slots[s.slots.indexOf(old)]=v;else s.slots.push(v);audit(s,`${old?'枠を更新':'枠を追加'}：${v.name}`,`${before} → ${JSON.stringify(v)}`);return v;}
export function removeSlot(s,id){const i=s.slots.findIndex(x=>x.id===id);if(i<0)return false;const [x]=s.slots.splice(i,1);audit(s,`枠を削除：${x.name}`,JSON.stringify(x));return true;}
// 付与設定の予約（spec point-master: 同じ設定・年齢区分に未適用の予約は 1 件まで。日次の最大獲得が上限を超える設定は拒否）
export const POINT_KEYS={videoReward:{label:'動画リワード：1回のポイント',unit:'pt',min:0,max:99999},videoLimit:{label:'動画リワード：1日の達成可能回数',unit:'回',min:0,max:999},stepRewardAd:{label:'歩数達成・動画あり：1回のポイント',unit:'pt',min:0,max:99999},stepRewardNoAd:{label:'歩数達成・動画なし：1回のポイント',unit:'pt',min:0,max:99999},stepGoal:{label:'歩数：マイルストーン間隔（新規）',unit:'歩',min:100,max:100000},stepMax:{label:'歩数：目標歩数（間隔×上限数）（新規）',unit:'歩',min:100,max:1000000}};
export function reservePointSetting(s,key,age,value,applyAt){if(!POINT_KEYS[key])throw Error('設定の種類が不正です。');const k=POINT_KEYS[key];if(!Number.isInteger(value)||value<k.min||value>k.max)throw Error(`値は ${k.min}〜${k.max} の整数で入力してください。`);if(age==='minor'&&['stepGoal','stepMax'].includes(key))throw Error('マイルストーン設定は全ユーザー共通です。');if(s.reservations.some(r=>!r.applied&&r.key===key&&r.age===age))throw Error('同じ設定・年齢区分に未適用の予約があります。先に削除してください。');const now=s.date+'T00:00';if(applyAt&&applyAt<now)throw Error('過去の日時は指定できません。');const r={id:crypto.randomUUID(),key,age,value,applyAt:applyAt||now,applied:false,createdAt:s.date};s.reservations.push(r);audit(s,`付与設定を予約：${k.label}（${age==='minor'?'未成年':'成人'}）`,`${value}${k.unit} @ ${r.applyAt}`);applyReservations(s);return r;}
export function deleteReservation(s,id){const i=s.reservations.findIndex(r=>r.id===id&&!r.applied);if(i<0)throw Error('適用済みの値は削除できません。');const [r]=s.reservations.splice(i,1);audit(s,'付与設定の予約を削除',JSON.stringify(r));return true;}
// デイリーミッションタスク報酬（spec admin/daily-mission-task-reward: 1〜99,999、同じ定義内の合計が 1 日上限を超えると拒否。即時反映）
export function setMissionReward(s,id,reward){const t=s.missionDef.find(x=>x.id===id);if(!t)throw Error('タスクが見つかりません。');if(!Number.isInteger(reward)||reward<1||reward>99999)throw Error('報酬は 1〜99,999 pt の整数で入力してください。');const sum=s.missionDef.filter(x=>x.enabled&&x.id!==id).reduce((a,x)=>a+x.reward,0)+reward;if(sum>s.limits.missionDailyCap)throw Error(`ミッション報酬の合計（${sum}pt）が 1 日あたり上限（${s.limits.missionDailyCap}pt）を超えます。`);const before=t.reward;t.reward=reward;t.updatedAt=s.date;audit(s,`ミッション報酬を変更：${t.title}`,`${before} → ${reward}pt`);return t;}
export function setMissionEnabled(s,id,enabled){const t=s.missionDef.find(x=>x.id===id);if(!t)throw Error('タスクが見つかりません。');t.enabled=enabled;t.updatedAt=s.date;audit(s,`ミッションタスクを${enabled?'有効化':'無効化'}（新規）：${t.title}`,'');return t;}
// アンケートのユーザー還元率（spec admin/survey-redemption-rate: 種別ごと、適用開始日時つき。モックでは即時）
export function setSurveyRate(s,type,rate){if(!(type in s.limits.surveyRate))throw Error('種別が不正です。');if(!Number.isInteger(rate)||rate<0||rate>100)throw Error('還元率は 0〜100 の整数で入力してください。');const before=s.limits.surveyRate[type];s.limits.surveyRate[type]=rate;audit(s,`アンケート還元率を変更：${type}`,`${before}% → ${rate}%`);return rate;}
// 日次交換総額上限（spec admin/dotmoney-exchange-cap）
export function setExchangeCap(s,cap){if(!Number.isInteger(cap)||cap<0)throw Error('上限は 0 以上の整数（pt）で入力してください。');const before=s.limits.exchangeDailyCap;s.limits.exchangeDailyCap=cap;audit(s,'日次交換総額上限を変更',`${before} → ${cap}pt`);return cap;}
// 案件画面設定（spec admin/affiliate-screen: 予約は画面ごと最大 3 件）
export function saveScreenSetting(s,code,setting){const scr=s.screens[code]??={memo:'',settings:[]};if(!setting.applyAt)throw Error('適用開始日時を入力してください。');if(!setting.groups?.length)throw Error('グループを 1 件以上入力してください。');if(setting.groups.some(g=>!g.name?.trim()))throw Error('グループの表示名は必須です。');const now=s.date+'T23:59';const upcoming=scr.settings.filter(x=>x.applyAt>now&&x.id!==setting.id).length;if(setting.applyAt>now&&upcoming>=3)throw Error('予約中の設定はその画面につき最大 3 件です。');const i=scr.settings.findIndex(x=>x.id===setting.id);if(i>=0)scr.settings[i]=setting;else scr.settings.push(setting);audit(s,`案件画面設定を${i>=0?'更新':'作成'}：${code}`,`適用 ${setting.applyAt}・${setting.groups.length}グループ`);return setting;}
export function deleteScreenSetting(s,code,id){const scr=s.screens[code];if(!scr)return false;const i=scr.settings.findIndex(x=>x.id===id);if(i<0)return false;const [x]=scr.settings.splice(i,1);audit(s,`案件画面設定を削除：${code}`,JSON.stringify(x));return true;}
// 審査（spec admin/point-grant-review：手動で確定・取り消し）
export function reviewPending(s,id,approve){const p=s.user.pendings.find(x=>x.id===id);if(!p)return false;const ok=approve?confirm(s,id):cancelPending(s,id);audit(s,`付与予定を${approve?'承認':'却下'}`,`${p.title}／${p.desc}／${p.amount}pt`);return ok;}
// 特集ページの管理（新規）
export function saveFeature(s,f){if(!f.id||!/^[a-z0-9-]+$/.test(f.id))throw Error('特集 ID は英小文字・数字・ハイフンで入力してください。');if(!f.title?.trim())throw Error('タイトルを入力してください。');if(!f.offerIds?.length)throw Error('案件を 1 件以上選んでください。');if(f.kind==='single'&&f.offerIds.length!==1)throw Error('1 案件の特集は案件を 1 件だけ選びます。');s.features??=[];const i=s.features.findIndex(x=>x.id===f.id);if(i>=0)s.features[i]=f;else s.features.push(f);audit(s,`特集を${i>=0?'更新':'作成'}：${f.title}`,`feature/${f.id}・${f.offerIds.join(',')}`);return f;}
export function removeFeature(s,id){const i=(s.features||[]).findIndex(x=>x.id===id);if(i<0)return false;const [f]=s.features.splice(i,1);audit(s,`特集を削除：${f.title}`,'');return true;}
