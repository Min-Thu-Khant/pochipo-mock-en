import {visibleSlots,visibleOffers,slotLink,offerTerms,featureById,featureIsPublished,featureOffers,pt} from './model.js';

// Mock service announcements are independent of advertising eligibility and campaign dates.
export const serviceNotices = [
  {id:'update-september',date:'2026-09-15',category:'アップデート',title:'アプリのアップデートについて',summary:'画面の表示と操作性を改善しました。',body:'ホーム画面の表示と、一部のボタンの操作性を改善しました。引き続きタメルコをよろしくお願いいたします。'},
  {id:'steps-recovered',date:'2026-09-14',category:'不具合・復旧',title:'歩数が反映されにくい不具合の修正について',summary:'一部の環境で歩数が反映されにくい問題を修正しました。',body:'一部の環境で歩数の表示が更新されにくい問題を修正しました。ご不便をおかけして申し訳ございません。歩数が反映されない場合は、歩数へのアクセス許可をご確認ください。'},
  {id:'maintenance-complete',date:'2026-09-12',category:'メンテナンス',title:'メンテナンス終了のお知らせ',summary:'メンテナンスが終了し、通常どおりご利用いただけます。',body:'サービスの安定性向上のためのメンテナンスが終了しました。ご協力いただきありがとうございました。'},
];
export const noticesFor = (state,items=serviceNotices) => items.filter(x=>x.date<=state.date).slice().sort((a,b)=>b.date.localeCompare(a.date));
export function campaignNotifications(state) {
  const eligible=new Set(visibleOffers(state).map(x=>x.id));
  return visibleSlots(state).filter(x=>(x.notification||['campaign','recommend'].includes(x.kind))&&(x.notificationDate||x.start)<=state.date).flatMap(x=>{
    const to=slotLink(x),[page,id]=to.split('/');
    if(page==='offer'&&!eligible.has(id))return [];
    if(page==='feature'){
      const feature=featureById(state,id);
      if(!feature||!featureIsPublished(state,feature)||!featureOffers(state,feature).length)return [];
    }
    if(!['offer','feature'].includes(page))return [];
    const terms=page==='offer'?offerTerms(state,id):null;
    const reward=terms?(terms.rewardMode==='rate'?`${terms.reward}%還元`:`${terms.sur?'最大 ':''}${pt(terms.reward)}pt`):'';
    return [{id:x.id,to,date:x.notificationDate||x.start,category:x.kind==='recommend'?'激アツAF案件':'キャンペーン',title:x.title||x.name,summary:x.notification||x.text,reward,end:x.end,priority:x.priority||0}];
  }).sort((a,b)=>b.date.localeCompare(a.date)||b.priority-a.priority);
}
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function notificationsMarkup(state,tab='campaigns') {
  const campaigns=tab!=='service',items=campaigns?campaignNotifications(state):noticesFor(state),active=campaigns?'campaigns':'service';
  const tabs=[['campaigns','キャンペーン'],['service','お知らせ']].map(([id,title])=>`<button type="button" role="tab" id="notice-tab-${id}" aria-controls="notice-panel" aria-selected="${active===id}" tabindex="${active===id?0:-1}" data-action="notification-tab" data-id="${id}">${title}</button>`).join('');
  const rows=items.map(x=>{
    const inside=`<span class="notice-meta"><span class="notice-tag ${campaigns?'promotion':''}">${esc(x.category)}</span><time datetime="${esc(x.date)}">${esc(x.date.replaceAll('-','/'))}</time></span><strong>${esc(x.title).replace(/\n/g,'<br>')}</strong>${campaigns&&x.reward?`<span class="notice-reward">${esc(x.reward)}</span>`:''}<p>${esc(x.summary)}</p>${campaigns?`<small>掲載期間：${esc(x.end.replaceAll('-','/'))}まで</small>`:''}<span class="notice-arrow" aria-hidden="true">›</span>`;
    return campaigns?`<a class="notice-item" href="#${esc(x.to)}" data-action="notification-link">${inside}</a>`:`<button type="button" class="notice-item" data-action="notification-detail" data-id="${esc(x.id)}">${inside}</button>`;
  }).join('');
  return `<div class="notice-tabs" role="tablist" aria-label="お知らせの種類">${tabs}</div><section id="notice-panel" role="tabpanel" aria-labelledby="notice-tab-${active}" tabindex="0"><p class="notice-lead">${campaigns?'アフィリエイト案件とキャンペーンのお知らせ':'運営からのお知らせ'}</p>${rows||`<div class="notice-empty">${campaigns?'開催中のキャンペーンはありません':'新しいお知らせはありません'}</div>`}</section>`;
}
export function noticeDetailMarkup(state,id) {
  const item=noticesFor(state).find(x=>x.id===id);
  if(!item)return '<p>このお知らせは現在表示できません。</p>';
  return `<article class="notice-detail"><span class="notice-meta"><span class="notice-tag">${esc(item.category)}</span><time datetime="${item.date}">${item.date.replaceAll('-','/')}</time></span><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></article><button class="btn secondary wide" data-action="notification-tab" data-id="service">お知らせ一覧に戻る</button>`;
}
