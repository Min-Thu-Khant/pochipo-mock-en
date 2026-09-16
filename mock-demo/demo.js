// プレゼン用デモ：管理画面（左）とアプリ（右）を 1 画面に並べ、管理画面の操作がアプリに反映される様子を見せる。
// 両方を同一オリジンの iframe として読み込み、localStorage（KEY）を共有する。シナリオボタンは管理画面と同じモデル関数で状態を変更する。
// ローカル（mock-demo/ 配下）は各モックの実 URL を iframe に読み込む。公開版（?mode=artifact でも再現）は about:blank に HTML を書き込み、同一オリジンで supporting files を読む
const LOCAL=(location.hostname==='localhost'||location.hostname==='127.0.0.1')&&!location.search.includes('mode=artifact');
// すべてのパスは「ページの URL」を基準に解決する（import は読み込み元ファイル基準になるため、URL に変換して渡す）
const BASE=new URL(location.pathname.includes('/mock-demo/')?'../':'./',document.baseURI);
const url=p=>new URL(p,BASE).href;
const fail=msg=>{const c=document.querySelector('#caption');if(c){c.innerHTML=`<b>読み込みに失敗しました</b><p class="before"><span>内容</span>${String(msg).replace(/[&<>]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[ch])}</p>`;}};
window.addEventListener('error',e=>fail(e.message));window.addEventListener('unhandledrejection',e=>fail(e.reason?.message||e.reason));
let M;try{M=await import(url('mock-app/model.js'));}catch(err){fail('model.js: '+err.message);throw err;}
const {KEY,initialState,applyReservations,publishSlot,reservePointSetting,setMissionReward,setSurveyRate,achieveChallenges,saveScreenSetting,autoReview,manualReview,challenge,progressOffer,day}=M;
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.version===7)return s;}catch{}const s=initialState();localStorage.setItem(KEY,JSON.stringify(s));return s;};
const save=s=>localStorage.setItem(KEY,JSON.stringify(s));

// ---- iframe の用意 ----
// ローカルは実 URL を読み込む。公開版は about:blank（親と同一オリジン）に HTML を書き込み、supporting files を相対パスで読む
function mount(frame,dir,entry,css,hash){if(LOCAL){frame.src=url(`${dir}/`)+`#${hash}`;return;}const doc=frame.contentDocument;doc.open();doc.write(`<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="${url(`${dir}/${css}`)}"></head><body><div id="root"></div><dialog id="modal"></dialog><div id="toast" role="status" aria-live="polite"></div><script type="module" src="${url(`${dir}/${entry}`)}"></script></body></html>`);doc.close();setTimeout(()=>{try{frame.contentWindow.location.hash=hash;}catch{}},300);}
const adminFrame=$('#admin-frame'),appFrame=$('#app-frame');
mount(adminFrame,'mock-admin','admin.js','admin.css','dashboard');
mount(appFrame,'mock-app','app.js','styles.css','home');
const setHash=(frame,hash)=>{try{if(frame.contentWindow.location.hash!=='#'+hash)frame.contentWindow.location.hash=hash;else frame.contentWindow.dispatchEvent(new Event('hashchange'));}catch{}};
const closeAppModal=()=>{try{const d=appFrame.contentDocument.querySelector('#modal');if(d?.open)d.close();}catch{}};

// ---- シナリオ ----
const scenarios=[
 {id:'banner',title:'最上部バナーを差し替える',admin:'slots',app:'home',before:'管理画面「運用枠」で、最上部バナー「秋のおでかけ特集」を停止します。',after:'アプリの最上部バナーが、優先度が次に高い「証券口座キャンペーン」に切り替わりました。配信対象外なら枠ごと消えます（トルツメ）。',
  run:s=>{const a=s.slots.find(x=>x.id==='top-autumn');a.enabled=!a.enabled;M.audit(s,`枠を${a.enabled?'再開':'停止'}：${a.name}`,'デモ');return a.enabled?'再開しました。元のバナーに戻ります。':'停止しました。';}},
 {id:'video',title:'動画リワードの単価を 2 倍に',admin:'points',app:'home',before:'管理画面「付与設定」で、動画リワード 1 回のポイント（成人）を 100pt → 200pt に即時適用します。',after:'アプリの「動画を見てためる」の表示が「1 × 3」から「2 × 3」（円相当）に変わりました。付与も次回の視聴から新しい値です。',
  run:s=>{const cur=s.limits.videoReward;const v=cur===200?100:200;s.reservations=s.reservations.filter(r=>r.applied||r.key!=='videoReward');reservePointSetting(s,'videoReward','adult',v,'');return `${cur}pt → ${v}pt に変更しました。`;}},
 {id:'mission',title:'ミッション報酬を変更する',admin:'missions',app:'home',before:'管理画面「デイリーミッション報酬」で、「アプリを開こう」の報酬を 100pt → 300pt にします。',after:'アプリのミッションカードの報酬表示が 3 円相当に変わりました。達成済みでも受け取り時点の設定で付与されます（spec）。',
  run:s=>{const t=s.missionDef.find(x=>x.id==='launch');const v=t.reward===300?100:300;setMissionReward(s,'launch',v);return `${t.title}：${v}pt に変更しました。`;}},
 {id:'tiles',title:'ホームのタイルメニューを差し替える',admin:'screens',app:'home',before:'管理画面「案件画面設定」で、画面コード home_quick に新しい設定（4 タイル）を即時適用します。',after:'アプリのタイルメニューが 4 件（買い物・旅行・チャレンジ・アンケート）になりました。適用開始日時を未来にすれば予約になります。',
  run:s=>{const cur=M.screenGroups(s,'home_quick');const four=cur.length!==4;const groups=four?[{id:'d1',name:'買い物',category:'買い物',icon:'cart',unit:'jpy',order:1,tags:true},{id:'d2',name:'旅行',category:'旅行',icon:'plane',unit:'jpy',order:2,tags:true},{id:'d3',name:'チャレンジ',category:'challenges',icon:'spark',unit:'jpy',order:3,tags:true},{id:'d4',name:'アンケート',category:'surveys',icon:'survey',unit:'jpy',order:4,tags:true}]:initialState().screens.home_quick.settings[0].groups;saveScreenSetting(s,'home_quick',{id:'demo-'+Date.now().toString(36),applyAt:s.date+'T00:00',memo:'プレゼン用',groups});return `${groups.length} タイルの設定を適用しました。`;}},
 {id:'survey',title:'アンケートの還元率を上げる',admin:'survey',app:'surveys',before:'管理画面「アンケート還元率」で、スクリーニングの還元率を 70% → 100% にします。',after:'アプリのアンケート一覧の表示ポイントが 21 円相当 → 30 円相当に変わりました（報酬額 30 円 × 100%）。付与は回答完了時点の率で計算されます。',
  run:s=>{const v=s.limits.surveyRate.screening===100?70:100;setSurveyRate(s,'screening',v);return `スクリーニング ${v}% に変更しました。`;}},
 {id:'challenge',title:'チャレンジボーナスを達成にする',admin:'metrics',app:'challenges',before:'参加人数が目標に達した状態を再現します（管理画面ではデモ操作、実際は NACS の成果集計）。',after:'アプリのチャレンジ一覧で全件が「達成！」になり、承認済みの案件にはボーナスが付与予定として登録されます。',
  run:s=>{const n=achieveChallenges(s);return `全チャレンジを達成にしました（ボーナス登録 ${n} 件）。`;}},
 {id:'ticker',title:'テキストバナーを 1 本追加する',admin:'slots',app:'offers',before:'管理画面「運用枠」で、種別「テキストバナー」・表示位置「ためトク テキストバナー」・リンク先 feature/autumn-trip の枠を追加します。',after:'アプリのためトクの検索窓の下、テキストバナーの先頭に「【本日限定】秋のおでかけ特集はこちら」が並びました。',
  run:s=>{const id='demo-pill';if(s.slots.some(x=>x.id===id)){M.removeSlot(s,id);return 'テキストバナーを削除しました。';}publishSlot(s,{id,name:'デモ：テキストバナー',kind:'ticker',destination:'travel',placements:['pill'],enabled:true,start:s.date,end:s.date,segment:'all',priority:99,title:'【本日限定】秋のおでかけ特集はこちら',text:'',visual:'travel',rewardMode:'flat',reward:0,entryRequired:false,mission:false,notification:'',notificationDate:s.date,participants:0,to:'feature/autumn-trip'});return 'テキストバナーを追加しました。';}},
 {id:'review',title:'審査で付与予定を確定する',admin:'review',app:'mypage',before:'アプリ側で動画視聴などをすると「準備中」に付与予定が並びます。管理画面「審査」で自動判定・有人審査を実行します。',after:'アプリのマイページで「準備中」が減り、「交換可能」に移りました。合算ポイントは変わりません（spec point-history）。',
  run:s=>{const a=autoReview(s),m=manualReview(s);return `自動判定 ${a} 件・有人審査 ${m} 件を確定しました。`;}},
 {id:'reset',title:'デモデータを初期化',admin:'dashboard',app:'home',before:'すべての状態を初期値に戻します。',after:'初期状態に戻りました。起動時ポップアップも次回表示されます。',
  run:()=>{const s=initialState();save(s);return '初期化しました。';},raw:true}
];
const list=$('#scenarios');
list.innerHTML=scenarios.map((sc,i)=>`<button class="sc ${sc.id==='reset'?'reset':''}" data-id="${sc.id}"><span class="n">${sc.id==='reset'?'↺':i+1}</span><span>${esc(sc.title)}</span></button>`).join('');
const caption=$('#caption');
function show(title,before,after,result){caption.innerHTML=`<b>${esc(title)}</b><p class="before"><span>操作</span>${esc(before)}</p>${result?`<p class="result"><span>結果</span>${esc(result)}</p>`:''}<p class="after"><span>アプリで見る</span>${esc(after)}</p>`;caption.classList.add('on');}
list.addEventListener('click',e=>{const b=e.target.closest('.sc');if(!b)return;const sc=scenarios.find(x=>x.id===b.dataset.id);document.querySelectorAll('.sc').forEach(x=>x.classList.toggle('active',x===b));
 let result='';try{if(sc.raw){result=sc.run();}else{const s=load();applyReservations(s);result=sc.run(s);save(s);}}catch(err){result='エラー：'+err.message;}
 show(sc.title,sc.before,sc.after,result);
 // 両画面を該当箇所へ。storage イベントで各 iframe が再描画する
 setHash(adminFrame,sc.admin);closeAppModal();setHash(appFrame,sc.app);
 if(sc.raw){try{adminFrame.contentWindow.location.reload();appFrame.contentWindow.location.reload();}catch{}}
 appFrame.parentElement.classList.remove('flash');void appFrame.offsetWidth;appFrame.parentElement.classList.add('flash');});
$('#toggle-guide').addEventListener('click',()=>document.body.classList.toggle('no-guide'));
show('使い方','左の管理画面を直接操作するか、下のシナリオボタンを押してください。','右のアプリが即時に更新されます。両方とも同じデータ（ブラウザーの localStorage）を見ています。');
