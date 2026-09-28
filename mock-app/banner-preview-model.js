const names={daily:'デイリーミッション',steps:'歩数',challenge:'チャレンジボーナス',game:'ゲーム',shopping:'買い物',credit:'クレカ',survey:'アンケート',chat:'チャット',high:'ガポガポ',quick:'すぐできる'};
export function bannerPreviewTarget(placement,tab,position='top',homeTabs=[]){
 if(placement==='popup')return {route:'home',label:'起動時ポップアップ',description:'アプリ起動時、画面中央に重なる広告です。'};
 if(placement==='daily-middle')return homeTabs.includes('daily')?{route:'home/daily',label:'ホーム → デイリーミッション → 中部（320×50）',description:'ミッション一覧の下、動画を見てためるの上に表示します。'}:{error:'現在の上タブ構成にデイリーミッションがありません。'};
 if(placement==='top')return homeTabs.includes('daily')?{route:'home/daily',label:'ホーム → デイリーミッション → 最上部',description:'上タブのすぐ下、デイリーミッションの上に表示します。'}:{error:'現在の上タブ構成にデイリーミッションがありません。TOP画面上部のメニューに追加すると表示できます。'};
 if(placement==='category'){
  if(tab==='survey'&&position==='bottom')return {route:'surveys',label:'アンケート一覧 → 下部（320×100）',description:'アンケート一覧の下に横スクロールで表示します。'};
  const supported=['game','shopping','credit'].includes(tab)||['steps','challenge','high','quick'].includes(tab)&&position==='top';
  if(!supported)return {error:tab?`${names[tab]||tab}の${position==='bottom'?'下部':'上部'}には、現在のアプリにカテゴリ広告枠がありません。`:'カテゴリ広告のタブを選んでください。'};
  if(!['high','quick'].includes(tab)&&!homeTabs.includes(tab))return {error:`現在の上タブ構成に「${names[tab]}」がありません。TOP画面上部のメニューに追加すると表示できます。`};
  return {route:['high','quick'].includes(tab)?tab:'home/'+tab,label:`${['high','quick'].includes(tab)?'お得':'ホーム'} → ${names[tab]} → ${position==='bottom'?'下部':'上部'}`,description:tab==='steps'?'歩数表示の下に表示します。':position==='bottom'?'おすすめ案件一覧の下に表示します。':'案件一覧の上に表示します。'};
 }
 return {error:({carousel:'ホーム特集枠',feed:'おすすめ枠',sub:'サブ枠'})[placement]?'この配信先は旧構成の項目です。現在のアプリには対応する画像バナー枠がなく、選択しても表示されません。':'プレビューする配信先を選んでください。'};
}
