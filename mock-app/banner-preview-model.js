const names={daily:'デイリー',steps:'歩く',challenge:'チャレボ',game:'ゲーム',shopping:'買い物',credit:'カード',survey:'アンケート',offers:'おすすめ',high:'高還元',quick:'すぐできる'};
export function bannerPreviewTarget(placement,tab,position='top',homeTabs=[]){
 if(placement==='pill')return {route:'offers',label:'お得 → おすすめ → 検索窓下',description:'入力中のテキスト広告を検索窓の下に表示します。保存・公開はしません。'};
 if(placement==='popup')return {route:'home',label:'起動時ポップアップ',description:'アプリ起動時、画面中央に重なる広告です。'};
 if(placement==='interstitial')return {route:'home',label:'画面間広告',description:'プレビューではポイント獲得や実績レポートから戻る操作を待たずに表示します。'};
 if(placement==='daily-middle')return homeTabs.includes('daily')?{route:'home/daily',label:'ホーム → デイリーミッション → 中部（320×50）',description:'デイリーミッション一覧の下に表示します。'}:{error:'現在の上タブ構成にデイリーミッションがありません。'};
 if(placement==='top')return homeTabs.includes('daily')?{route:'home/daily',label:'ホーム → デイリーミッション → 最上部',description:'上タブのすぐ下、デイリーミッションの上に表示します。'}:{error:'現在の上タブ構成にデイリーミッションがありません。TOP画面上部のメニューに追加すると表示できます。'};
 if(placement==='category'){
  // 保存済み設定のキーは維持し、表示名だけ実際の位置に合わせる。
  if(tab==='survey'&&position==='bottom')return {route:'surveys',label:'アンケート一覧 → 上部（320×100）',description:'おすすめアンケート・回答できるアンケートのセクションより上に表示します。'};
  if(tab==='receipt'&&position==='top')return {route:'home/receipt',label:'ホーム → レシート → 上部',description:'レシート案件一覧の上に表示します。'};
  const supported=(['game','shopping','credit','steps'].includes(tab)&&['top','bottom'].includes(position))||(['challenge','offers','high','quick'].includes(tab)&&position==='top');
  if(!supported)return {error:tab?`${names[tab]||tab}の${position==='bottom'?'下部':'上部'}には、現在のアプリにカテゴリ広告枠がありません。`:'カテゴリ広告のタブを選んでください。'};
  const offers=['offers','high','quick'].includes(tab);
  if(!offers&&!homeTabs.includes(tab))return {error:`現在の上タブ構成に「${names[tab]}」がありません。TOP画面上部のメニューに追加すると表示できます。`};
  return {route:offers?tab:'home/'+tab,label:`${offers?'お得':'ホーム'} → ${names[tab]} → ${position==='bottom'?'下部':'上部'}`,description:tab==='steps'?(position==='top'?'歩数コンテンツの上に表示します。':'歩数コンテンツの下に300×300の画像を表示します。'):position==='bottom'?'おすすめ案件一覧の下に表示します。':tab==='offers'?'検索窓・企業リンクより上に表示します。':'案件一覧の上に表示します。'};
 }
 return {error:({carousel:'ホーム特集枠',feed:'おすすめ枠',sub:'サブ枠'})[placement]?'この配信先は旧構成の項目です。現在のアプリには対応する画像バナー枠がなく、選択しても表示されません。':'プレビューする配信先を選んでください。'};
}
