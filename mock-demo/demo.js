// プレゼン用デモ：管理画面（左）とアプリ（右）を 1 画面に並べ、管理画面の操作がアプリに反映される様子を見せる。
// 両方を同一オリジンの iframe として読み込み、localStorage（KEY）を共有する。シナリオボタンは管理画面と同じモデル関数で状態を変更する。
// ローカル（mock-demo/ 配下）は各モックの実 URL を iframe に読み込む。公開版（?mode=artifact でも再現）は about:blank に HTML を書き込み、同一オリジンで supporting files を読む
// Full deployments use the same HTML entry pages on local and hosted domains.
const LOCAL=new URLSearchParams(location.search).get('mode')!=='artifact';
// すべてのパスは「ページの URL」を基準に解決する（import は読み込み元ファイル基準になるため、URL に変換して渡す）
const BASE=new URL(location.pathname.includes('/mock-demo/')?'../':'./',document.baseURI);
const url=p=>new URL(p,BASE).href;
const fail=msg=>{const c=document.querySelector('#caption');if(c){c.innerHTML=`<b>読み込みに失敗しました</b><p class="before"><span>内容</span>${String(msg).replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[ch])}</p>`;}};
window.addEventListener('error',e=>fail(e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason?.message||e.reason));
let M;try{M=await import(url('mock-app/model.js'));}catch(err){fail('model.js: '+err.message);throw err;}
const {KEY,initialState,applyReservations,publishSlot,reservePointSetting,setMissionReward,setSurveyRate,achieveChallenges,saveScreenSetting,autoReview,manualReview,challenge,progressOffer,day,saveNacsOffer,removeNacsOffer,saveNacsList,nacsList,setListPinned,setNacsOfferActive,createConversion,approveConversion,setNotifyPaused,resendNotification,offersOf}=M;
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.version===9)return s;}catch{}const s=initialState();localStorage.setItem(KEY,JSON.stringify(s));return s;};
const save=s=>localStorage.setItem(KEY,JSON.stringify(s));

// ---- iframe の用意 ----
// ローカルは実 URL を読み込む。公開版は about:blank（親と同一オリジン）に HTML を書き込み、supporting files を相対パスで読む
function mount(frame,dir,entry,css,hash){if(LOCAL){frame.src=url(dir==='mock-admin'?'mock-admin/legacy.html':`${dir}/`)+`#${hash}`;return;}const doc=frame.contentDocument;doc.open();doc.write(`<!doctype html><html lang="en"><head><base href="${url(dir+'/')}"><script type="module" src="${url('mock-app/english.js')}"></script><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${url(`${dir}/${css}`)}"></head><body><div id="root"></div><dialog id="modal"></dialog><div id="toast" role="status" aria-live="polite"></div><script type="module" src="${url(`${dir}/${entry}`)}"></script></body></html>`);doc.close();setTimeout(()=>{try{frame.contentWindow.location.hash=hash;}catch{}},300);}
const adminFrame=$('#admin-frame'),nacsFrame=$('#nacs-frame'),appFrame=$('#app-frame');
const receiptDemo=new URLSearchParams(location.search).has('receipt');
mount(adminFrame,'mock-admin','admin.js','admin.css',receiptDemo?(new URLSearchParams(location.search).has('options')?'receipt-options':'receipts'):'dashboard');
mount(nacsFrame,'mock-nacs','nacs.js','nacs.css','dashboard');
mount(appFrame,'mock-app','app.js','styles.css',receiptDemo?'receipt':'home');
// 左ペインの切り替え（タメルコ管理画面 / NACS）
let pane='admin';const paneTitle={admin:'管理画面（運用者）',nacs:'NACS（案件配信サービス）'};
function showPane(p){pane=p;adminFrame.hidden=p!=='admin';nacsFrame.hidden=p!=='nacs';$('#pane-title').textContent=paneTitle[p];document.querySelectorAll('.seg button').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.pane===p));b.classList.toggle('nacs',b.dataset.pane==='nacs');});}
document.querySelector('.seg').addEventListener('click',e=>{const b=e.target.closest('[data-pane]');if(b)showPane(b.dataset.pane);});
const leftFrame=()=>pane==='nacs'?nacsFrame:adminFrame;
const setHash=(frame,hash)=>{try{if(frame.contentWindow.location.hash!=='#'+hash)frame.contentWindow.location.hash=hash;else frame.contentWindow.dispatchEvent(new Event('hashchange'));}catch{}};
const closeAppModal=()=>{try{const d=appFrame.contentDocument.querySelector('#modal');if(d?.open)d.close();}catch{}};

// ---- シナリオ ----
const scenarios=[
 {id:'banner',title:'最上部バナーを差し替える',admin:'banners',app:'home/daily',before:'管理画面「バナー広告」で、最上部バナー「秋のおでかけ特集」を停止します。',after:'アプリの最上部バナーが、優先度が次に高い「証券口座キャンペーン」に切り替わりました。配信対象外なら枠ごと消えます（トルツメ）。',
  run:s=>{const a=s.slots.find(x=>x.id==='top-autumn');a.enabled=!a.enabled;M.audit(s,`枠を${a.enabled?'再開':'停止'}：${a.name}`,'デモ');return a.enabled?'再開しました。元のバナーに戻ります。':'停止しました。';}},
 {id:'video',title:'動画リワードの単価を 2 倍に',admin:'points',app:'home/daily',before:'管理画面「付与設定」で、動画リワード 1 回のポイント（成人）を 100pt → 200pt に即時適用します。',after:'アプリの「動画を見てためる」の表示が「1 × 3」から「2 × 3」（円相当）に変わりました。付与も次回の視聴から新しい値です。',
  run:s=>{const cur=s.limits.videoReward;const v=cur===200?100:200;s.reservations=s.reservations.filter(r=>r.applied||r.key!=='videoReward');reservePointSetting(s,'videoReward','adult',v,'');return `${cur}pt → ${v}pt に変更しました。`;}},
 {id:'mission',title:'ミッション報酬を変更する',admin:'missions',app:'home/daily',before:'管理画面「デイリーミッション報酬」で、「アプリを開こう」の報酬を 100pt → 300pt にします。',after:'アプリのミッションカードの報酬表示が 3 円相当に変わりました。達成済みでも受け取り時点の設定で付与されます（spec）。',
  run:s=>{const t=s.missionDef.find(x=>x.id==='launch');const v=t.reward===300?100:300;setMissionReward(s,'launch',v);return `${t.title}：${v}pt に変更しました。`;}},
 {id:'hometabs',title:'ホームのカテゴリタブを絞る',admin:'top-menu',app:'home/daily',before:'管理画面「TOP画面上部のメニュー」で、画面コード home_tabs に新しい設定（5 タブ：デイリー・チャレンジ・ゲーム・買い物・チャット）を即時適用します。',after:'アプリのホーム上部のタブが 8 → 5 件になりました。表示名・アイコン・並び順も同じ設定で変えられます。',
  run:s=>{const cur=M.screenGroups(s,'home_tabs');const five=cur.length!==5;const base=initialState().screens.home_tabs.settings[0].groups;const groups=five?base.filter(g=>['daily','challenge','game','shopping','chat'].includes(g.category)).map((g,i)=>({...g,order:i+1})):base;saveScreenSetting(s,'home_tabs',{id:'demo-'+Date.now().toString(36),applyAt:s.date+'T00:00',memo:'プレゼン用',groups});return `${groups.length} タブの設定を適用しました。`;}},
 {id:'catad',title:'ゲームタブのバナーを停止・再開する',admin:'banners',app:'home/game',before:'管理画面「バナー広告」で、ゲームタブ上部のバナーの公開状態を切り替えます。画像の差し替えは同じ画面のアップロードから行えます。',after:'ゲームタブのバナー表示が切り替わりました。',
  run:s=>{const a=s.slots.find(x=>x.id==='ad-game');a.enabled=!a.enabled;M.audit(s,`バナーを${a.enabled?'再開':'停止'}：${a.name}`,'デモ');return a.enabled?'再開しました。':'停止しました。';}},
 {id:'survey',title:'アンケートの還元率を上げる',admin:'survey',app:'home/survey',before:'管理画面「アンケート還元率」で、スクリーニングの還元率を 70% → 100% にします。',after:'アプリのアンケートタブの表示ポイントが 21 円相当 → 30 円相当に変わりました（報酬額 30 円 × 100%）。付与は回答完了時点の率で計算されます。',
  run:s=>{const v=s.limits.surveyRate.screening===100?70:100;setSurveyRate(s,'screening',v);return `スクリーニング ${v}% に変更しました。`;}},
 {id:'challenge',title:'チャレンジボーナスを達成にする',admin:'challenges',app:'home/challenge',before:'参加人数が目標に達した状態を再現します（管理画面ではデモ操作、実際は NACS の成果集計）。',after:'アプリのチャレンジタブで全件が「達成！」になり、承認済みの案件にはボーナスが付与予定として登録されます。',
  run:s=>{const n=achieveChallenges(s);return `全チャレンジを達成にしました（ボーナス登録 ${n} 件）。`;}},
 {id:'ticker',title:'テキスト広告を 1 本追加する',admin:'text-ads',app:'offers',before:'管理画面「オトク内テキスト広告」で、検索窓下の広告文言とリンク先 feature/autumn-trip を設定します。',after:'アプリの「お得・おすすめ」の検索窓の下、テキストバナーの先頭に「【本日限定】秋のおでかけ特集はこちら」が並びました。',
  run:s=>{const id='demo-pill';if(s.slots.some(x=>x.id===id)){M.removeSlot(s,id);return 'テキストバナーを削除しました。';}publishSlot(s,{id,name:'デモ：テキストバナー',kind:'ticker',destination:'travel',placements:['pill'],enabled:true,start:s.date,end:s.date,segment:'all',priority:99,title:'【本日限定】秋のおでかけ特集はこちら',text:'',visual:'travel',rewardMode:'flat',reward:0,entryRequired:false,mission:false,notification:'',notificationDate:s.date,participants:0,to:'feature/autumn-trip'});return 'テキストバナーを追加しました。';}},
 {id:'nacs-offer',pane:'nacs',title:'NACS で新しい案件を配信する',admin:'offers',app:'offers/アプリ',before:'NACS「案件管理」で案件「ひだまり英会話」（広告主報酬 800 円 × 還元率 50%）を登録し、案件一覧コード LIST_APP に追加してピン留めします。',after:'アプリ「お得」のアプリカテゴリの先頭に新しい案件が出ました。タメルコ側の操作はありません（案件の実データは NACS が正）。もう一度押すと削除します。',
  run:s=>{const id='eikaiwa';if(offersOf(s).some(o=>o.id===id)){removeNacsOffer(s,id);return '案件を削除しました。アプリからも消えます。';}saveNacsOffer(s,{id,name:'ひだまり英会話',category:'アプリ',advertiserId:'adv-media',platforms:['ios','android'],install:false,rewardType:'flat',gross:800,payoutRate:50,condition:'無料体験レッスンの予約・受講',time:'受講完了後、約14日',description:'ひだまり英会話はモック用の架空サービスです。',cost:'無料',tag:'新着サービス',start:s.date,end:'2026-12-31',active:true,logo:{bg:'#F2A33A',fg:'#fff',text:'英'}});const l=nacsList(s,'LIST_APP');saveNacsList(s,{code:l.code,name:l.name,offerIds:[id,...l.offerIds.filter(x=>x!==id)]});setListPinned(s,l.code,id,true);return '登録しました（チャネル向け報酬 400 円相当）。';}},
 {id:'nacs-reward',pane:'nacs',title:'NACS で案件の報酬を変える',admin:'offers',app:'home/game',before:'NACS「案件管理」で「星ねこクエスト」の広告主報酬を 900 円 → 1,800 円にします（還元率 50% のまま）。',after:'アプリのゲームタブの案件カードの金額が 450 円相当 → 900 円相当に変わりました。報酬は NACS が計算済みの値で、タメルコは表示単位に換算するだけです。',
  run:s=>{const o=offersOf(s).find(x=>x.id==='starquest');const v=o.gross===1800?900:1800;saveNacsOffer(s,{...o,rewardType:'flat',gross:v});return `広告主報酬を ${v.toLocaleString()} 円にしました（チャネル向け ${v/2} 円相当）。`;}},
 {id:'nacs-stop',pane:'nacs',title:'NACS で案件を配信停止する',admin:'offers',app:'offer/travel',before:'NACS「案件管理」で「旅日和トラベル」を配信停止します。',after:'アプリの案件詳細が「お探しの案件が見つかりませんでした」になり、一覧・特集からも消えました（spec：配信終了は NOT_FOUND）。もう一度押すと再開します。',
  run:s=>{const o=offersOf(s).find(x=>x.id==='travel');setNacsOfferActive(s,'travel',!o.active);return o.active?'配信を再開しました。':'配信停止しました。';}},
 {id:'nacs-approve',pane:'nacs',title:'NACS が成果を承認 → 付与予定',admin:'conversions',app:'mypage',before:'NACS「成果管理」で「サンプルペイ」の成果を発生させ、承認します。承認通知がタメルコへ届きます。',after:'アプリのマイページの「準備中」が 800 円相当増えました（付与予定・有人審査待ち）。マイ案件では「承認」に移っています。',
  run:s=>{const cv=createConversion(s,'pay');approveConversion(s,cv.id);return `成果 ${cv.id.slice(0,8)} を承認し、通知を配信しました。`;}},
 {id:'nacs-dup',pane:'nacs',title:'同じ承認通知を再送しても増えない',admin:'notifications',app:'mypage',before:'NACS「チャネル通知」で、直前の承認通知をもう一度送ります（重複配信の再現）。',after:'アプリの準備中は増えません。同じ成果に対する付与予定は 1 回だけ登録されます（spec jobs/affiliate-conversion.md 4）。',
  run:s=>{const n=s.nacs.notifications.find(x=>x.type==='approved'&&!x.resendOf);if(!n)return '承認通知がまだありません。先に「成果を承認」を実行してください。';const r=resendNotification(s,n.id);return `再送しました。タメルコ側の結果：${r.result==='duplicate'?'重複（登録なし）':r.result}`;}},
 {id:'nacs-pause',pane:'nacs',title:'通知障害：承認なのに付与されない',admin:'notifications',app:'mycases',before:'NACS の通知を停止した状態で「サンプル証券」の成果を承認します。もう一度押すと通知を再開します。',after:'マイ案件では「承認」なのに、マイページの準備中は増えていません。再開すると未送信分が配信され、追いつきます（spec integrations/nacs.md 2）。',
  run:s=>{if(s.nacs.channel.notifyPaused){const n=setNotifyPaused(s,false);return `通知を再開し、未送信 ${n} 件を配信しました。付与予定が登録されました。`;}setNotifyPaused(s,true);const cv=createConversion(s,'sec');approveConversion(s,cv.id);return '通知を停止し、成果を承認しました。通知は未送信のままです。';}},
 {id:'review',title:'審査で付与予定を確定する',admin:'review',app:'mypage',before:'アプリ側で動画視聴などをすると「準備中」に付与予定が並びます。管理画面「審査」で自動判定・有人審査を実行します。',after:'アプリのマイページで「準備中」が減り、「交換可能」に移りました。合算ポイントは変わりません（spec point-history）。',
  run:s=>{const a=autoReview(s),m=manualReview(s);return `自動判定 ${a} 件・有人審査 ${m} 件を確定しました。`;}},
 {id:'reset',title:'デモデータを初期化',admin:'dashboard',app:'home/daily',before:'すべての状態を初期値に戻します。',after:'初期状態に戻りました。起動時ポップアップも次回表示されます。',
  run:()=>{const s=initialState();save(s);return '初期化しました。';},raw:true}
];
const list=$('#scenarios');
list.innerHTML=scenarios.map((sc,i)=>`<button class="sc ${sc.id==='reset'?'reset':''} ${sc.pane==='nacs'?'nacs':''}" data-id="${sc.id}"><span class="n">${sc.id==='reset'?'↺':i+1}</span><span>${esc(sc.title)}</span></button>`).join('');
const caption=$('#caption');
function show(title,before,after,result){caption.innerHTML=`<b>${esc(title)}</b><p class="before"><span>操作</span>${esc(before)}</p>${result?`<p class="result"><span>結果</span>${esc(result)}</p>`:''}<p class="after"><span>アプリで見る</span>${esc(after)}</p>`;caption.classList.add('on');}
list.addEventListener('click',e=>{const b=e.target.closest('.sc');if(!b)return;const sc=scenarios.find(x=>x.id===b.dataset.id);document.querySelectorAll('.sc').forEach(x=>x.classList.toggle('active',x===b));
 let result='';try{if(sc.raw){result=sc.run();}else{const s=load();applyReservations(s);result=sc.run(s);save(s);}}catch(err){result='エラー：'+err.message;}
 show(sc.title,sc.before,sc.after,result);
 // 両画面を該当箇所へ。storage イベントで各 iframe が再描画する
 showPane(sc.pane||'admin');setHash(leftFrame(),sc.admin);closeAppModal();setHash(appFrame,sc.app);
 if(sc.raw){try{adminFrame.contentWindow.location.reload();nacsFrame.contentWindow.location.reload();appFrame.contentWindow.location.reload();}catch{}}
 appFrame.parentElement.classList.remove('flash');void appFrame.offsetWidth;appFrame.parentElement.classList.add('flash');});
$('#toggle-guide').addEventListener('click',()=>document.body.classList.toggle('no-guide'));
show('使い方','左の管理画面（または NACS）を直接操作するか、下のシナリオボタンを押してください。オレンジの番号は NACS 側の操作です。','右のアプリが即時に更新されます。3 つとも同じデータ（ブラウザーの localStorage）を見ています。');
