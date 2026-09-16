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
// 2026-09-16：案件の実データは NACS モック（state.nacs.offers）が持つ。この配列は初期データ（シード）。実行時は offersOf(s) を使う
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

export function initialState(){return{version:9,date:TODAY,os:'ios',showNoLoss:true,nacs:initialNacs(),consumedConversions:[],persona:'regular',scenario:'normal',popupMode:'daily',stepLink:'linked',slots:[
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
 // カテゴリ広告（架空サービスの広告バナー。PR #1 でコード固定だったものを運用枠へ）。tab=表示するタブ／ページ、position=上部・下部
 slot('ad-game','カテゴリ広告：星ねこクエスト','starquest','ad',['category'],{tab:'game',position:'top',brand:'星ねこクエスト',eyebrow:'STAR CAT QUEST',title:'星を集めて、\n冒険に出かけよう。',text:'はじめての星めぐりキャンペーン',icon:'game',stamp:'PLAY',art:'★',to:'offer/starquest',priority:70}),
 slot('ad-game-bottom','カテゴリ広告：こもれびカフェ物語','cafe-game','ad',['category'],{tab:'game',position:'bottom',brand:'こもれびカフェ物語',eyebrow:'KOMOREBI CAFÉ / OPENING',title:'小さなカフェの、\n大きな夢。',text:'今日からあなたも、カフェのオーナー。',icon:'game',stamp:'OPEN',art:'CAFÉ',to:'offer/cafe-game',priority:70}),
 slot('ad-shopping','カテゴリ広告：モリノマルシェ','marche','ad',['category'],{tab:'shopping',position:'top',brand:'モリノマルシェ',eyebrow:'MORINO MARCHÉ',title:'暮らしに、\n小さなごほうびを。',text:'お気に入りが見つかる秋のマルシェ',icon:'cart',stamp:'AUTUMN',art:'森',to:'offer/marche',priority:70}),
 slot('ad-shopping-bottom','カテゴリ広告：LUMI コスメ','cosme','ad',['category'],{tab:'shopping',position:'bottom',brand:'LUMI コスメ',eyebrow:'LUMI / AUTUMN COLLECTION',title:'いつもの私に、\nひとさじの彩り。',text:'はじめてのコスメセットをチェック。',icon:'spark',stamp:'NEW',art:'LUMI',to:'offer/cosme',priority:70}),
 slot('ad-credit','カテゴリ広告：LUNAカード','luna-card','ad',['category'],{tab:'credit',position:'top',brand:'LUNAカード',eyebrow:'LUNA CARD',title:'わたしの毎日に、\n新しい1枚。',text:'カード発行＆利用キャンペーン',icon:'wallet',stamp:'NEW',art:'LUNA',to:'offer/luna-card',priority:70}),
 slot('ad-credit-bottom','カテゴリ広告：リーフカード','leaf-card','ad',['category'],{tab:'credit',position:'bottom',brand:'リーフカード',eyebrow:'LEAF CARD / NEW LIFE',title:'毎日の買い物に、\n緑の1枚。',text:'年会費無料のリーフカードをチェック。',icon:'wallet',stamp:'LEAF',art:'LEAF',to:'offer/leaf-card',priority:70}),
 slot('ad-steps','カテゴリ広告：WALK DAYS','travel','ad',['category'],{tab:'steps',position:'top',brand:'WALK DAYS',eyebrow:'歩いて、街を再発見。',title:'次の休日は、\nちょっと遠くまで。',text:'旅日和トラベルで見つける、おさんぽ旅',icon:'walk',stamp:'GO OUT',art:'旅',to:'offer/travel',priority:70}),
 slot('ad-high','カテゴリ広告：トリップカード','trip-card','ad',['category'],{tab:'high',position:'top',brand:'トリップカード',eyebrow:'TRIP CARD / SPECIAL',title:'次の旅を、\nもっと楽しみに。',text:'旅好きのためのカード発行キャンペーン',icon:'plane',stamp:'PICK UP',art:'TRIP',to:'offer/trip-card',priority:70}),
 slot('ad-quick','カテゴリ広告：モリノマルシェ（すぐできる）','marche','ad',['category'],{tab:'quick',position:'top',brand:'モリノマルシェ',eyebrow:'今日のおトク、見つけよう。',title:'気になったら、\n今すぐチェック。',text:'毎日の買い物をはじめる、最初の一歩',icon:'bag',stamp:'CHECK',art:'森',to:'offer/marche',priority:70}),
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
  missionDailyCap:1000,exchangeDailyCap:50000000,
  compareFeeRate:10}, // 【新規提案・仮値】「手数料10%の場合」の試算に使う比較率。自社の事実（手数料 0 円・1pt=1円）が主張の主軸で、比較額は試算例として明記する
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
 // 案件画面設定（spec admin/affiliate-screen）：画面コード → 適用中の設定（グループ階層）。listCode=NACS の案件一覧コード（任意。なければナビ用＝全案件）。category はモックのカテゴリ／タブキー
 screens:{
  tametoku_quick:{memo:'ためトクのクイックアクセス',settings:[{id:'tq-1',applyAt:'2026-09-01T00:00',memo:'初期構成',groups:[{id:'g-shop',name:'買い物',category:'買い物',listCode:'LIST_SHOPPING',icon:'cart',unit:'jpy',order:1,tags:true},{id:'g-travel',name:'旅行',category:'旅行',listCode:'LIST_TRAVEL',icon:'plane',unit:'jpy',order:2,tags:true},{id:'g-game',name:'ゲーム',category:'ゲーム',listCode:'LIST_GAME',icon:'game',unit:'jpy',order:3,tags:true},{id:'g-app',name:'アプリ',category:'アプリ',listCode:'LIST_APP',icon:'phone',unit:'jpy',order:4,tags:true},{id:'g-fin',name:'金融',category:'金融',listCode:'LIST_FINANCE',icon:'yen',unit:'jpy',order:5,tags:true}]}]},
  home_tabs:{memo:'ホーム上部のカテゴリタブ（新規。PR #1 の 8 タブ。絞り込み＝タブのキー。並び替え・表示名・アイコン・表示／非表示を入稿）',settings:[{id:'ht-1',applyAt:'2026-09-01T00:00',memo:'初期構成（8 タブ）',groups:[{id:'ht-daily',name:'デイリー\nミッション',category:'daily',icon:'calendar',unit:'jpy',order:1,tags:true},{id:'ht-steps',name:'歩数',category:'steps',icon:'walk',unit:'jpy',order:2,tags:true},{id:'ht-challenge',name:'チャレンジ\nボーナス',category:'challenge',icon:'spark',unit:'jpy',order:3,tags:true},{id:'ht-game',name:'ゲーム',category:'game',icon:'game',unit:'jpy',order:4,tags:true},{id:'ht-shopping',name:'買い物',category:'shopping',icon:'cart',unit:'jpy',order:5,tags:true},{id:'ht-survey',name:'アンケート',category:'survey',icon:'survey',unit:'jpy',order:6,tags:true},{id:'ht-chat',name:'チャット',category:'chat',icon:'chat',unit:'jpy',order:7,tags:true},{id:'ht-credit',name:'クレカ',category:'credit',icon:'wallet',unit:'jpy',order:8,tags:true}]}]},
  home:{memo:'ホームの案件カルーセル',settings:[{id:'h-1',applyAt:'2026-09-01T00:00',memo:'初期構成',groups:[{id:'g-home-1',name:'あなたにオススメ',category:'すべて',icon:'',unit:'jpy',order:1,tags:true},{id:'g-home-2',name:'高額でためる',category:'金融',listCode:'LIST_FINANCE',icon:'',unit:'jpy',order:2,tags:true},{id:'g-home-3',name:'アプリでためる',category:'アプリ',listCode:'LIST_APP',icon:'',unit:'jpy',order:3,tags:true}]}]}
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
export function applyReservations(s){let n=0;for(const r of s.reservations){if(r.applied||r.applyAt.slice(0,10)>s.date)continue;const target=r.age==='minor'?s.limitsMinor:s.limits;target[r.key]=r.value;r.applied=true;r.appliedAt=s.date;n++;}return n;}
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
export function matches(s,slot){const segment=slot.segment==='all'||slot.segment==='new'&&s.persona==='new'||slot.segment==='regular'&&s.persona!=='new'||slot.segment==='finance'&&s.persona!=='card';const offer=offersOf(s).find(o=>o.id===slot.destination);return slot.enabled&&slot.start<=s.date&&slot.end>=s.date&&segment&&!(s.persona==='card'&&offer?.category==='金融');}
export const visibleSlots=s=>s.slots.filter(x=>matches(s,x)).sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
export function offerTerms(s,id){const o=offersOf(s).find(o=>o.id===id);const active=visibleSlots(s).find(x=>x.destination===id&&['campaign','recommend'].includes(x.kind));return {offer:o,slot:active,reward:active?(active.rewardMode==='multiplier'?Math.round(o.base*active.reward):active.reward):(o.rate??o.base),rewardMode:active?.rewardMode||(o.rate?'rate':'flat'),entryRequired:!!active?.entryRequired,challenge:challengeFor(s,id),sur:!!o.sur};}
// spec affiliate 3.2/3.3: 金融利用済みは金融を除外（モック独自）、インストール案件は解禁済みのユーザーにだけ一覧に出す（詳細の直接表示は妨げない）
export const visibleOffers=s=>offersOf(s).filter(o=>nacsListed(s,o)&&!(s.persona==='card'&&o.category==='金融')&&(!o.install||s.user.installUnlocked));
// 案件グループの案件（spec 3.3）：案件一覧コードがあればそのコードの案件を NACS の掲出順で。なければ（ナビ用）全案件。モック互換：listCode がなく category が案件カテゴリなら絞り込む
export function groupOffers(s,g){const vis=visibleOffers(s);if(g?.listCode){const l=nacsList(s,g.listCode);if(!l)return [];return l.offerIds.map(id=>vis.find(o=>o.id===id)).filter(Boolean);}if(g?.category&&OFFER_CATEGORIES.includes(g.category))return vis.filter(o=>o.category===g.category);return vis;}
export const pillSlots=s=>visibleSlots(s).filter(x=>x.placements.includes('pill'));
export const topBanner=s=>visibleSlots(s).find(x=>x.placements.includes('top'))||null;
// カテゴリ広告：タブ（またはページ）と位置ごとに、優先度が最も高い 1 枚
export const categoryAd=(s,tab,position='top')=>visibleSlots(s).find(x=>x.placements.includes('category')&&x.tab===tab&&(x.position||'top')===position)||null;
// ホームのカテゴリタブ：案件画面設定 home_tabs。key はタブの種類（daily/steps/challenge/game/shopping/survey/chat/credit）
export const HOME_TAB_KEYS=['daily','steps','challenge','game','shopping','survey','chat','credit'];
export const homeTabsFor=s=>{const g=screenGroups(s,'home_tabs').filter(x=>HOME_TAB_KEYS.includes(x.category));return g.length?g.map(x=>({key:x.category,label:x.name,icon:x.icon})):HOME_TAB_KEYS.map(k=>({key:k,label:k,icon:'gift'}));}; // 1 配置 1 枚（spec braze-banner 3.1）
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

// 目減りゼロの表示（新規提案）：手数料 0 円・1pt=1円 の自社事実と、「手数料 n% の場合」の試算額
export const noLossRate=s=>s.limits.compareFeeRate??10;
export const noLossView=(s,amount)=>{const rate=noLossRate(s);const compare=Math.floor(amount/100*(100-rate)/100)*100;/* 試算額は円単位に切り捨て（pt→円→pt） */return {rate,net:amount,compare,loss:amount-compare,on:s.showNoLoss!==false};};
// ===== 交換（spec dotmoney-exchange）=====
// 条件: Ameba 連携済み・SMS 本人確認・口座有効・日次交換総額上限（サービス全体）。原資は保有ポイントのみ
export function exchangeConditions(s){const min=L(s).minAmount;const approved=s.user.approved,sum=total(s);const member=!isGuest(s)&&s.user.member;
 // マイページの交換状態テキスト 3 状態（spec my-page 2.3）
 let text;if(member&&sum>=min&&approved<min)text={state:'preparing',label:'ポイント準備中です'};else if(sum>=min)text={state:'ready',label:`${pt(member?Math.floor(approved/L(s).unit)*L(s).unit:sum)}pt交換できます`};else text={state:'short',label:`あと${pt(min-sum)}ptで交換できます`};
 return{member,sms:s.user.sms,account:true,dailyCapOpen:s.scenario!=='cap'&&s.exchangeUsedToday<L(s).exchangeDailyCap,canExchange:member&&approved>=min,text};}

// ===== 案件：チャレンジと成果（spec affiliate 3.4〜3.6、jobs/affiliate-conversion）=====
export const caseFor=(s,offerId)=>[...s.user.cases].reverse().find(c=>c.offerId===offerId);
// チャレンジ可否（spec 3.4 の優先順）。モックには非対象端末・期間外の状態はデモ用の掲載終了のみ
export function challengeState(s,id){const o=offersOf(s).find(x=>x.id===id);if(!o||!o.active)return 'notfound';if(o.platforms&&!o.platforms.includes(s.os||'ios'))return 'unsupported';if(o.start>s.date||o.end<s.date)return 'inactive';const c=caseFor(s,id);if(o.sur&&c&&c.status==='challenging')return 'sur-challenging';return 'normal';}
// チャレンジ＝クリック URL を開く。タメルコはチャレンジを記録しない（spec 3.5）が、モックでは成果の発生を同時に再現して「判定中／挑戦中」の CV を作る
export function challenge(s,id){const t=offerTerms(s,id);if(challengeState(s,id)!=='normal')return false;if(t.entryRequired&&!s.user.entries[id])throw Error('先にエントリーしてください。');const c=t.challenge;const cv={id:crypto.randomUUID(),offerId:id,name:t.offer.name,status:t.sur?'challenging':'judging',date:s.date+' '+new Date().toTimeString().slice(0,5),reward:t.reward,rewardMode:t.rewardMode,base:t.offer.base,level:0,paidStages:0,entryRequired:t.entryRequired,condition:t.offer.condition,slotId:t.slot?.id,challengeId:c?.id,challengeBonus:c?.bonus||0,bonusPaid:false};s.user.cases.push(cv);recordClick(s,id);nacsAudit(s,'成果が発生（アプリのチャレンジ）',`${t.offer.name}／cv ${cv.id.slice(0,8)}`);if(c){c.participants++;record(s,c.id,'tap');}if(t.slot)record(s,t.slot.id,'tap');return cv;}
// ===== NACS 側：成果（CV）の承認・否認と、チャネル（タメルコ）への通知 =====
// spec integrations/nacs.md 3：成果の状態は NACS が正。タメルコが消費するのは「承認」通知だけ。jobs/affiliate-conversion.md：同じ成果（SUR は段階ごと）に付与予定は 1 回
const stampNow=s=>s.date+' '+new Date().toTimeString().slice(0,5);
export const conversionById=(s,cvId)=>s.user.cases.find(c=>c.id===cvId);
// NACS 側で成果を発生させる（アプリのクリックなしに再現。orderAmount=定率案件の注文金額（円））
export function createConversion(s,offerId,orderAmount=10000){const o=offersOf(s).find(x=>x.id===offerId);if(!o)throw Error('案件が見つかりません。');const t=offerTerms(s,offerId);const cv={id:crypto.randomUUID(),offerId,name:o.name,status:o.sur?'challenging':'judging',date:stampNow(s),reward:t.reward,rewardMode:t.rewardMode,base:o.base,level:0,paidStages:0,entryRequired:false,condition:o.condition,slotId:t.slot?.id,challengeId:t.challenge?.id,challengeBonus:t.challenge?.bonus||0,bonusPaid:false,orderAmount};s.user.cases.push(cv);nacsAudit(s,'成果が発生（NACS 側で登録）',`${o.name}／cv ${cv.id.slice(0,8)}`);return cv;}
// 承認：非 SUR は成果全体、SUR は次の 1 段階。承認イベントを通知キューに入れ、通知停止中でなければ即時配信
export function approveConversion(s,cvId,orderAmount){const c=conversionById(s,cvId);if(!c||c.status==='approved'||c.status==='rejected')return false;const o=offersOf(s).find(x=>x.id===c.offerId);if(!o)return false;let amount,stage=null,desc;
 if(o.sur){const st=o.sur[c.paidStages];if(!st)return false;stage=c.paidStages;c.paidStages++;c.level=c.paidStages;amount=st.reward;desc=`【${st.label}】${o.name}`;if(c.paidStages>=o.sur.length){c.status='approved';c.date=stampNow(s);if(c.slotId)record(s,c.slotId,'cv');}}
 else{const rate=c.rewardMode==='rate';const order=orderAmount??c.orderAmount??10000;c.orderAmount=order;amount=rate?Math.round(order*c.reward):c.reward;desc=o.name+(rate?`（購入額${order.toLocaleString()}円）`:'');c.status='approved';c.date=stampNow(s);if(c.slotId)record(s,c.slotId,'cv');}
 const n={id:crypto.randomUUID(),type:'approved',cvId:c.id,offerId:o.id,offerName:o.name,stage,rewardMode:c.rewardMode==='rate'?'rate':'flat',amount,desc,orderAmount:c.orderAmount||null,at:stampNow(s),status:'queued',result:''};s.nacs.notifications.unshift(n);nacsAudit(s,`成果を承認${stage!==null?`（段階 ${stage+1}）`:''}`,`${o.name}／cv ${c.id.slice(0,8)}`);if(!s.nacs.channel.notifyPaused)deliverNotifications(s);return true;}
export function rejectConversion(s,cvId){const c=conversionById(s,cvId);if(!c||c.status==='approved'||c.status==='rejected')return false;c.status='rejected';c.date=stampNow(s);const n={id:crypto.randomUUID(),type:'rejected',cvId:c.id,offerId:c.offerId,offerName:c.name,stage:null,rewardMode:c.rewardMode,amount:0,desc:c.name,orderAmount:null,at:stampNow(s),status:'queued',result:''};s.nacs.notifications.unshift(n);nacsAudit(s,'成果を否認',`${c.name}／cv ${c.id.slice(0,8)}`);if(!s.nacs.channel.notifyPaused)deliverNotifications(s);return true;}
// 通知の配信：キュー内の通知をタメルコ側の受け取り処理へ渡す
export function deliverNotifications(s){let n=0;for(const x of s.nacs.notifications.slice().reverse()){if(x.status!=='queued')continue;x.status='delivered';x.deliveredAt=stampNow(s);x.result=receiveConversion(s,x);n++;}return n;}
export function setNotifyPaused(s,paused){s.nacs.channel.notifyPaused=!!paused;nacsAudit(s,paused?'チャネル通知を停止':'チャネル通知を再開','タメルコ');return paused?0:deliverNotifications(s);}
// 同じ通知を再送（重複配信の再現）
export function resendNotification(s,id){const src=s.nacs.notifications.find(x=>x.id===id);if(!src)return null;const n={...src,id:crypto.randomUUID(),status:'queued',result:'',resendOf:src.id,at:stampNow(s)};s.nacs.notifications.unshift(n);nacsAudit(s,'通知を再送',`cv ${src.cvId.slice(0,8)}`);if(!s.nacs.channel.notifyPaused)deliverNotifications(s);return n;}
// ===== タメルコ側：成果通知の受け取り（spec jobs/affiliate-conversion）=====
// 承認だけを消費。0 円以下は登録しない。同じ成果（SUR は段階ごと）は 1 回だけ登録
export function receiveConversion(s,n){if(n.type!=='approved')return 'ignored';const key=`${n.cvId}:${n.stage??'-'}`;s.consumedConversions??=[];if(s.consumedConversions.includes(key))return 'duplicate';if(!(n.amount>0))return 'zero';s.consumedConversions.push(key);schedule(s,n.rewardMode==='rate'?'お買い物をして獲得':'案件を達成して獲得',n.amount,n.rewardMode==='rate'?'AFFILIATE_RATE':'AFFILIATE','manual',n.desc);audit(s,'成果通知を受け取り、付与予定を登録',`${n.desc}／${n.amount}pt／cv ${n.cvId.slice(0,8)}`);settleChallenges(s);return 'registered';}
// 互換：案件 ID を指定して最新の未確定成果を承認／否認（管理画面の「NACS 再現」ボタン・デモ・テスト）
export function progressOffer(s,offerId){const c=caseFor(s,offerId);if(!c)return false;return approveConversion(s,c.id);}
export function rejectOffer(s,offerId){const c=caseFor(s,offerId);if(!c)return false;return rejectConversion(s,c.id);}
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
export function validateSlot(v){if(!v.name?.trim()||!v.title?.trim())return '管理名と表示タイトルを入力してください。';if(!/^\d{4}-\d{2}-\d{2}$/.test(v.start)||!/^\d{4}-\d{2}-\d{2}$/.test(v.end)||v.start>v.end)return '表示終了日は開始日以降にしてください。';if(!v.placements?.length)return '表示位置を1つ以上選んでください。';if(!Number.isFinite(v.reward)||v.reward<0||v.rewardMode==='rate'&&v.reward>100||v.rewardMode==='multiplier'&&v.reward<=0)return '報酬・倍率・還元率の値を確認してください。';if(!Number.isFinite(v.priority)||v.priority<0||v.priority>100)return '優先度は0〜100で入力してください。';if(v.kind==='challenge'&&(!(v.challengeGoal>0)||!(v.bonus>0)||v.participants<0))return 'チャレンジの目標人数・ボーナス・参加人数を確認してください。';if((v.placements.includes('pill')||v.placements.includes('top'))&&!v.to)return 'テキストバナー・最上部バナーにはリンク先（ディープリンク）を入力してください。';if(v.placements.includes('category')&&(!v.tab||!v.to))return 'カテゴリ広告には表示タブとリンク先を入力してください。';return '';}
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

// ===== NACS（案件配信サービス）モック：案件・案件一覧コード・広告主・クリック =====
// spec integrations/nacs.md：タメルコは案件の実データを持たず NACS から取得する。報酬はマージン計算済み（チャネル向けの値）で返る。案件 ID・掲出順・対応 OS・有効期間は NACS 側の属性
export const OFFER_CATEGORIES=['買い物','旅行','ゲーム','アプリ','金融'];
export const PLATFORMS={ios:'iOS',android:'Android',web:'Web'};
const artOf={'買い物':'shop','旅行':'travel','ゲーム':'game','アプリ':'news','金融':'card'};
const SEED_ADVERTISERS=[
 {id:'adv-tabi',name:'旅日和トラベル株式会社',asp:'ASP アルファ',offerIds:['travel']},{id:'adv-kurashi',name:'くらしのマーケット',asp:'ASP アルファ',offerIds:['shop','marche']},{id:'adv-garden',name:'ガーデンゲームズ',asp:'ASP ベータ',offerIds:['game','ocean-game']},{id:'adv-sample-fin',name:'サンプルフィナンシャル',asp:'ASP ガンマ',offerIds:['card','pay','sec']},{id:'adv-media',name:'まいにちメディア',asp:'ASP ベータ',offerIds:['news','video']},{id:'adv-starcat',name:'スターキャット',asp:'ASP ベータ',offerIds:['starquest','cafe-game']},{id:'adv-lumi',name:'LUMI ホールディングス',asp:'ASP アルファ',offerIds:['cosme','interior']},{id:'adv-cards',name:'ネオカード',asp:'ASP ガンマ',offerIds:['luna-card','leaf-card','trip-card']}];
const SEED_LISTS=[
 {code:'LIST_SHOPPING',name:'買い物（探す・カテゴリ）',offerIds:['shop','marche','cosme','interior']},{code:'LIST_TRAVEL',name:'旅行',offerIds:['travel']},{code:'LIST_GAME',name:'ゲーム',offerIds:['game','starquest','cafe-game','ocean-game']},{code:'LIST_APP',name:'アプリ',offerIds:['news','video']},{code:'LIST_FINANCE',name:'金融・クレカ',offerIds:['card','luna-card','leaf-card','trip-card','pay','sec']},{code:'LIST_HOME_PICKUP',name:'ホーム ピックアップ',offerIds:['travel','starquest','sec','shop']}];
// 初期データ：シードの案件に NACS 側の属性を付ける。チャネル向け報酬 = 広告主報酬（円）× 還元率 ÷ 100 → pt（1 円 = 100 pt）。シードは還元率 50% で逆算
export function initialNacs(){const adv=id=>SEED_ADVERTISERS.find(a=>a.offerIds.includes(id))?.id||'adv-kurashi';
 const list=offers.map(o=>{const x={...o,logo:{...o.logo},advertiserId:adv(o.id),platforms:o.install?['ios','android']:['ios','android','web'],active:true,start:'2026-08-01',end:'2026-12-31',payoutRate:50,clickUrl:`https://track.nacs.example/c/${o.id}`,updatedAt:'2026-08-01'};
  if(o.rate){x.grossRate=o.rate*2;delete x.gross;}else if(o.sur){x.sur=o.sur.map(st=>({...st,gross:st.reward/50}));x.gross=x.sur.reduce((a,st)=>a+st.gross,0);}else{x.gross=o.base/50;}return x;});
 return{channel:{id:'tameruko',name:'タメルコ',notifyPaused:false},advertisers:SEED_ADVERTISERS.map(({id,name,asp})=>({id,name,asp})),offers:list,lists:SEED_LISTS.map(l=>({...l,offerIds:[...l.offerIds]})),clicks:[],notifications:[],logs:[]};}
export const offersOf=s=>s.nacs?.offers||offers;
export const nacsList=(s,code)=>(s.nacs?.lists||[]).find(l=>l.code===code)||null;
export const nacsAdvertiser=(s,id)=>(s.nacs?.advertisers||[]).find(a=>a.id===id)||null;
// 一覧に出る条件（spec 3.3）：配信中・有効期間内・リクエスト元 OS に対応
export const nacsListed=(s,o)=>o.active!==false&&(!o.start||o.start<=s.date)&&(!o.end||o.end>=s.date)&&(!o.platforms||o.platforms.includes(s.os||'ios'));
export function nacsAudit(s,label,details){if(!s.nacs)return;s.nacs.logs.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),actor:'NACS 運用者',label,details});}
// チャネル向け報酬の計算（マージン計算済みの値として返す）
export const payoutPt=(gross,rate)=>Math.round(gross*rate/100)*100;
export function computeReward(v){const o={...v};if(o.rewardType==='rate'){o.rate=Math.round(o.grossRate*o.payoutRate/100*10)/10;delete o.sur;delete o.gross;o.base=0;}
 else if(o.rewardType==='sur'){o.sur=(o.sur||[]).map(st=>({label:st.label,gross:st.gross,reward:payoutPt(st.gross,o.payoutRate)}));o.gross=o.sur.reduce((a,st)=>a+st.gross,0);o.base=o.sur.reduce((a,st)=>a+st.reward,0);delete o.rate;}
 else{o.base=payoutPt(o.gross,o.payoutRate);delete o.rate;delete o.sur;}delete o.rewardType;return o;}
export const rewardTypeOf=o=>o.rate?'rate':o.sur?'sur':'flat';
export function validateNacsOffer(s,v){if(!/^[a-z0-9-]{2,40}$/.test(v.id||''))return '案件 ID は英小文字・数字・ハイフン（2〜40 文字）で入力してください。';if(!v.name?.trim())return '案件名を入力してください。';if(!OFFER_CATEGORIES.includes(v.category))return 'カテゴリが不正です。';if(!nacsAdvertiser(s,v.advertiserId))return '広告主を選んでください。';if(!v.platforms?.length)return '対応 OS を 1 つ以上選んでください。';if(!Number.isFinite(v.payoutRate)||v.payoutRate<0||v.payoutRate>100)return 'チャネル還元率は 0〜100 で入力してください。';
 if(v.rewardType==='rate'){if(!(v.grossRate>0)||v.grossRate>100)return '広告主報酬率は 0 より大きく 100 以下で入力してください。';}else if(v.rewardType==='sur'){if(!v.sur?.length)return 'SUR は段階を 1 つ以上入力してください。';if(v.sur.some(st=>!st.label?.trim()||!(st.gross>0)))return 'SUR の各段階に条件と広告主報酬（円）を入力してください。';}else if(!(v.gross>0))return '広告主報酬（円）を入力してください。';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(v.start||'')||!/^\d{4}-\d{2}-\d{2}$/.test(v.end||'')||v.start>v.end)return '有効期間の終了日は開始日以降にしてください。';if(!v.condition?.trim())return '成果条件を入力してください。';return '';}
export function saveNacsOffer(s,v){const err=validateNacsOffer(s,v);if(err)throw Error(err);const o=computeReward(v);o.art=o.art||artOf[o.category]||'shop';o.logo=o.logo||{bg:'#455A64',fg:'#fff',text:o.name.slice(0,1)};o.time=o.time||'条件達成後、約30日';o.description=o.description||`${o.name}の案件です。掲載条件・報酬はデモ用です。`;o.cost=o.cost||'無料';o.tag=o.tag||'新着サービス';o.clickUrl=o.clickUrl||`https://track.nacs.example/c/${o.id}`;o.updatedAt=s.date;o.active=o.active!==false;
 const list=s.nacs.offers;const i=list.findIndex(x=>x.id===o.id);const before=i>=0?JSON.stringify(list[i]):'新規';if(i>=0)list[i]=o;else list.push(o);nacsAudit(s,`案件を${i>=0?'更新':'登録'}：${o.name}`,`${before} → ${JSON.stringify(o)}`);return o;}
export function setNacsOfferActive(s,id,active){const o=s.nacs.offers.find(x=>x.id===id);if(!o)throw Error('案件が見つかりません。');o.active=!!active;o.updatedAt=s.date;nacsAudit(s,`案件を${active?'配信再開':'配信停止'}：${o.name}`,'');return o;}
export function removeNacsOffer(s,id){const i=s.nacs.offers.findIndex(x=>x.id===id);if(i<0)return false;const [o]=s.nacs.offers.splice(i,1);for(const l of s.nacs.lists)l.offerIds=l.offerIds.filter(x=>x!==id);nacsAudit(s,`案件を削除：${o.name}`,JSON.stringify(o));return true;}
export function saveNacsList(s,v){if(!/^[A-Z0-9_]{3,40}$/.test(v.code||''))throw Error('案件一覧コードは英大文字・数字・アンダースコア（3〜40 文字）で入力してください。');if(!v.name?.trim())throw Error('一覧の名称を入力してください。');const ids=[...new Set(v.offerIds||[])];if(ids.some(id=>!s.nacs.offers.some(o=>o.id===id)))throw Error('存在しない案件が含まれています。');const l=s.nacs.lists.find(x=>x.code===v.code);if(l){l.name=v.name.trim();l.offerIds=ids;}else s.nacs.lists.push({code:v.code,name:v.name.trim(),offerIds:ids});nacsAudit(s,`案件一覧コードを${l?'更新':'作成'}：${v.code}`,ids.join(','));return nacsList(s,v.code);}
export function removeNacsList(s,code){const i=s.nacs.lists.findIndex(x=>x.code===code);if(i<0)return false;s.nacs.lists.splice(i,1);nacsAudit(s,`案件一覧コードを削除：${code}`,'');return true;}
export function moveInList(s,code,offerId,dir){const l=nacsList(s,code);if(!l)return false;const i=l.offerIds.indexOf(offerId);const j=i+dir;if(i<0||j<0||j>=l.offerIds.length)return false;[l.offerIds[i],l.offerIds[j]]=[l.offerIds[j],l.offerIds[i]];nacsAudit(s,`掲出順を変更：${code}`,l.offerIds.join(','));return true;}
export function saveAdvertiser(s,v){if(!v.name?.trim())throw Error('広告主名を入力してください。');const id=v.id||'adv-'+Date.now().toString(36);const a=s.nacs.advertisers.find(x=>x.id===id);if(a){a.name=v.name.trim();a.asp=v.asp?.trim()||'';}else s.nacs.advertisers.push({id,name:v.name.trim(),asp:v.asp?.trim()||''});nacsAudit(s,`広告主を${a?'更新':'登録'}：${v.name}`,'');return nacsAdvertiser(s,id);}
export function removeAdvertiser(s,id){if(s.nacs.offers.some(o=>o.advertiserId===id))throw Error('この広告主の案件があるため削除できません。');const i=s.nacs.advertisers.findIndex(x=>x.id===id);if(i<0)return false;const [a]=s.nacs.advertisers.splice(i,1);nacsAudit(s,`広告主を削除：${a.name}`,'');return true;}
// クリック計測（spec 3.5：確定操作ごとに署名付き URL を発行。前後 30 秒有効）
export function recordClick(s,offerId){if(!s.nacs)return null;const o=offersOf(s).find(x=>x.id===offerId);const now=new Date();const c={id:crypto.randomUUID(),offerId,offerName:o?.name||offerId,at:s.date+' '+now.toTimeString().slice(0,8),url:`${o?.clickUrl||'https://track.nacs.example/c/'+offerId}?ch=tameruko&u=demo&ts=${Math.floor(now/1000)}&sig=${Math.random().toString(36).slice(2,10)}`,validFor:'前後 30 秒',os:s.os||'ios'};s.nacs.clicks.unshift(c);if(s.nacs.clicks.length>50)s.nacs.clicks.length=50;return c;}
// タメルコの案件グループから参照されている案件一覧コード
export function listUsage(s,code){const out=[];for(const [screen,scr] of Object.entries(s.screens||{}))for(const st of scr.settings)for(const g of st.groups)if(g.listCode===code)out.push(`${screen}／${g.name.replace(/\n/g,'')}`);return [...new Set(out)];}
