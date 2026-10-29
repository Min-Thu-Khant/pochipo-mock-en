import {announcementRecords,announcementStatus,saveAnnouncement,stopAnnouncement,deleteAnnouncement} from '../mock-app/service-notices.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const controllers=new WeakMap();
export function noticeManagement(state){
 const id=decodeURIComponent(location.hash.split('/')[1]||'');
 const rows=announcementRecords(state).slice().sort((a,b)=>b.date.localeCompare(a.date));
 if(id){
  const row=id==='new'?{date:state.date,title:'',target:'',status:'draft'}:rows.find(n=>n.id===id);
  if(!row)return '<section class="panel"><h2>お知らせが見つかりません</h2><a href="#notices">一覧に戻る</a></section>';
  return `<section class="panel notice-editor"><div class="toolbar"><h2>${id==='new'?'お知らせの新規作成':'お知らせの編集'}</h2><span class="grow"></span><a class="btn" href="#notices">一覧に戻る</a></div><form id="notice-form" data-notice-id="${esc(row.id||'')}"><div class="notice-error" role="alert" hidden></div><div class="notice-fields"><label>日付<input name="date" type="date" value="${esc(row.date)}" required></label><label>公開状態<select name="status" aria-label="公開状態">${[['draft','下書き'],['published','公開'],['stopped','公開停止']].map(([v,t])=>`<option value="${v}" ${row.status===v?'selected':''}>${t}</option>`).join('')}</select></label><label class="notice-full">タイトル<textarea name="title" rows="3" required>${esc(row.title)}</textarea></label><label class="notice-full">外部記事URL<input name="target" type="url" value="${esc(row.target)}" placeholder="https://" required></label></div><p class="desc">記事本文はサービスLP等で管理します。公開に設定すると、指定日からお知らせ一覧に表示されます。</p><div class="toolbar"><button class="btn" type="button" data-notice-action="preview">プレビュー</button><a class="btn" href="#notices">キャンセル</a><span class="grow"></span><button class="btn primary" type="submit">保存</button></div><section class="notice-preview" aria-label="アプリ表示プレビュー" hidden><h3>アプリ表示プレビュー</h3><div data-notice-preview></div><a data-notice-article target="_blank" rel="noopener noreferrer">外部記事を確認 ↗</a></section></form></section>`;
 }
 return `<section class="panel"><div class="toolbar"><h2>運営お知らせ一覧</h2><span class="grow"></span><a class="btn" href="../mock-app/#notifications" target="_blank">アプリで確認 ↗</a><a class="btn primary" href="#notices/new">新規作成</a></div><div class="tbl"><table><thead><tr><th>日付</th><th>タイトル・外部記事URL</th><th>公開状態</th><th>操作</th></tr></thead><tbody>${rows.map(n=>`<tr><td class="notice-date">${esc(n.date)}</td><td class="notice-title"><strong>${esc(n.title)}</strong><a href="${esc(/^https?:\/\//.test(n.target)?n.target:'#')}" target="_blank" rel="noopener noreferrer">${esc(n.target)}</a></td><td><span class="badge ${announcementStatus(n,state.date)==='公開中'?'on':'off'}">${announcementStatus(n,state.date)}</span></td><td><div class="notice-actions"><a class="btn sm" href="#notices/${encodeURIComponent(n.id)}">編集</a>${n.status==='published'?`<button class="btn sm" data-notice-action="stop" data-notice-id="${esc(n.id)}">公開停止</button>`:''}<button class="btn sm danger" data-notice-action="delete" data-notice-id="${esc(n.id)}">削除</button></div></td></tr>`).join('')||'<tr><td colspan="4">お知らせはありません。新規作成から登録できます。</td></tr>'}</tbody></table></div></section>`;
}
export function bindNoticeManagement(root,ctx){
 controllers.get(root)?.abort();const controller=new AbortController();controllers.set(root,controller);const options={signal:controller.signal};
 const read=f=>({id:f.dataset.noticeId||undefined,...Object.fromEntries(new FormData(f))});
 const fail=(err,f)=>{if(f){const box=f.querySelector('.notice-error');box.hidden=false;box.textContent=err.message;}ctx.toast(err.message);};
 root.addEventListener('submit',e=>{
  const f=e.target;if(f.id!=='notice-form')return;e.preventDefault();e.stopPropagation();
  try{ctx.load();const state=ctx.getState(),row=saveAnnouncement(state,read(f));ctx.audit(state,'運営お知らせを保存',row.title);ctx.save();location.hash='notices';ctx.toast('お知らせを保存しました。');}catch(err){fail(err,f);}
 },options);
 root.addEventListener('click',e=>{
  const button=e.target.closest('[data-notice-action]');if(!button)return;
  const action=button.dataset.noticeAction,id=button.dataset.noticeId;
  try{
   if(action==='preview'){
    const f=button.closest('form');if(!f.reportValidity())return;const sample={serviceAnnouncements:[]};const row=saveAnnouncement(sample,{...read(f),id:undefined});
    const preview=f.querySelector('.notice-preview');preview.hidden=false;
    preview.querySelector('[data-notice-preview]').innerHTML=`<time>${esc(row.date.replaceAll('-','/'))}</time><strong>${esc(row.title)}</strong><span aria-hidden="true">›</span>`;
    const a=preview.querySelector('[data-notice-article]');a.href=row.target;return;
   }
   if(action==='delete'&&!window.confirm('このお知らせを削除します。元に戻せません。公開停止は内容を残したまま掲載を止められます。'))return;
   ctx.load();const state=ctx.getState();const title=announcementRecords(state).find(n=>n.id===id)?.title||'';
   if(action==='stop')stopAnnouncement(state,id);else if(action==='delete')deleteAnnouncement(state,id);else return;
   ctx.audit(state,action==='stop'?'運営お知らせを公開停止':'運営お知らせを削除',title);ctx.save();ctx.render();ctx.toast(action==='stop'?'公開を停止しました。':'お知らせを削除しました。');
  }catch(err){fail(err,button.closest('form'));}
 },options);
}
