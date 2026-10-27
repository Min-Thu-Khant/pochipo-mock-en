// Shared announcement data for the app and its operations screen.
export const defaultServiceNotices = [
  {id:'update-september',date:'2026-09-15',title:'アプリのアップデートについて',target:'https://example.com/notices/update-september',status:'published'},
  {id:'steps-recovered',date:'2026-09-14',title:'歩数が反映されにくい不具合の修正について',target:'https://example.com/notices/steps-recovered',status:'published'},
  {id:'maintenance-complete',date:'2026-09-12',title:'メンテナンス終了のお知らせ',target:'https://example.com/notices/maintenance-complete',status:'published'},
];
export function validArticleURL(target){
  if(typeof target!=='string'||/\s/.test(target))return false;
  try{const u=new URL(target);return ['https:','http:'].includes(u.protocol)&&Boolean(u.hostname)&&!u.username&&!u.password;}catch{return false;}
}
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function announcementRecords(state){
  if(Array.isArray(state.serviceAnnouncements))return state.serviceAnnouncements;
  return [...defaultServiceNotices.map(n=>({...n})),...(state.operatorWorkflows?.notices||[]).filter(n=>!defaultServiceNotices.some(d=>d.id===n.id)).map(n=>({...n,date:n.start,status:n.enabled?'published':'stopped'}))];
}
export function announcementStatus(n,date){return n.status==='published'?(n.date>date?'予約中':n.end&&n.end<date?'掲載終了':'公開中'):n.status==='stopped'?'公開停止':'下書き';}
export function saveAnnouncement(state,input){
  const row={id:input.id,date:String(input.date||''),title:String(input.title||'').trim(),target:String(input.target||'').trim(),status:input.status};
  if(!validDate(row.date))throw Error('正しい日付を入力してください。');
  if(!row.title)throw Error('タイトルを入力してください。');
  if(!validArticleURL(row.target))throw Error('外部記事URLは有効なhttps://またはhttp://のURLを入力してください。');
  if(!['draft','published','stopped'].includes(row.status))throw Error('公開状態を選択してください。');
  const rows=announcementRecords(state).map(n=>({...n}));
  const index=rows.findIndex(n=>n.id===row.id);
  if(row.id&&index<0)throw Error('このお知らせは削除されています。一覧から確認してください。');
  if(index>=0)rows[index]={...rows[index],...row};else rows.push({...row,id:crypto.randomUUID()});
  state.serviceAnnouncements=rows;
  return index>=0?rows[index]:rows.at(-1);
}
export function stopAnnouncement(state,id){
  const rows=announcementRecords(state).map(n=>({...n})),row=rows.find(n=>n.id===id);
  if(!row)throw Error('お知らせが見つかりません。');
  row.status='stopped';state.serviceAnnouncements=rows;return row;
}
export function deleteAnnouncement(state,id){
  const rows=announcementRecords(state);
  if(!rows.some(n=>n.id===id))throw Error('お知らせが見つかりません。');
  state.serviceAnnouncements=rows.filter(n=>n.id!==id);
}
