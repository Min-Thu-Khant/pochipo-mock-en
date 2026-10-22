import {DAILY_MISSION_CATEGORIES,MISSION_TYPES,missionCategoriesFor,normalizeDailyMission,newDailyMission} from '../mock-app/daily-mission-categories.js';
import {offersOf} from '../mock-app/model.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dailyMissionRow(raw,state){
 const m=normalizeDailyMission(raw);
 const bonus=['affiliate','steps','minigame'].includes(m.kind),limited=m.missionType==='limited';
 const specific=m.kind==='affiliate'&&m.offerMode==='specific';
 const destination=specific&&m.offerId?'offer/'+m.offerId:m.to;
 const url=new URL('../mock-app/',location.href);url.hash=destination;
 return `<div data-daily-id="${esc(m.id)}" style="border-top:1px solid #e2eae6;padding:18px 0;display:grid;gap:12px">
 <input name="enabled" type="hidden" value="${m.enabled?'1':'0'}">
 <label>ミッションの種類<select name="missionType">${MISSION_TYPES.map(([key,text])=>`<option value="${key}" ${m.missionType===key?'selected':''}>${text}</option>`).join('')}</select></label>
 <label>カテゴリー<select name="category">${missionCategoriesFor(m.missionType).map(([key,text])=>`<option value="${key}" ${m.kind===key?'selected':''}>${text}</option>`).join('')}</select></label>
 ${limited?`<div class="daily-mission-dates"><label>掲載開始日<input type="date" name="startDate" value="${esc(m.startDate)}" required></label><label>掲載終了日<input type="date" name="endDate" value="${esc(m.endDate)}" required></label></div>`:'<p class="tiny">毎日0時に進捗と受取状態を更新します。</p>'}
 <div class="daily-mission-dates"><label>停止開始日<input type="date" name="pauseStartDate" value="${esc(m.pauseStartDate||'')}"></label><label>停止終了日<input type="date" name="pauseEndDate" value="${esc(m.pauseEndDate||'')}"></label></div>
 <p class="tiny">任意設定。停止期間中は非表示となり、終了日の翌日から自動再開します。手動で停止中、または掲載期間外のミッションは再開しません。予約を解除する場合は両方の日付を空にしてください。</p>
 <label>タイトル<input name="title" value="${esc(m.title)}" required maxlength="80"></label>
 <label>説明<input name="sub" value="${esc(m.sub)}" maxlength="140"></label>
 ${m.kind==='affiliate'?`<label>達成条件<select name="offerMode"><option value="count" ${!specific?'selected':''}>任意の案件を指定件数利用する</option><option value="specific" ${specific?'selected':''}>指定した案件を利用する</option></select></label>${specific?`<label>対象案件<select name="offerId" required><option value="">案件を選択</option>${offersOf(state).filter(o=>o.active!==false||o.id===m.offerId).map(o=>`<option value="${esc(o.id)}" ${o.id===m.offerId?'selected':''}>${esc(o.name)}${o.active===false?'（停止中）':''}</option>`).join('')}</select></label>`:''}<p class="tiny">掲載期間内に対象案件が「判定中」になると達成します。同じ案件は期間内で1件として数え、報酬はミッションごとに一度だけ受け取れます。</p>`:''}
 ${specific?'<input type="hidden" name="targetCount" value="1">':`<label>${m.kind==='steps'?'達成歩数（歩）':m.kind==='affiliate'?'必要な案件数（件）':'必要な実施回数（回）'}<input name="targetCount" type="number" min="1" max="${m.kind==='steps'?100000:100}" step="1" value="${m.targetCount}" required></label>`}
 ${bonus?`<label>ミッション報酬（pt）<input name="reward" type="number" min="1" max="99999" step="1" value="${m.reward}" required></label><p class="tiny">案件・活動本来の報酬とは別に、ミッション達成後に受け取るポイントです。</p>`:'<p class="tiny">報酬は活動元の付与設定を使用します。ミッション経由の活動報酬は、完了後に一覧から受け取れます。</p>'}
 <label>遷移先ディープリンク<input name="to" value="${esc(url.href)}" readonly style="width:100%"></label>
 </div>`;
}
export function dailyMissionEditor(group,state){return `<div data-daily-group="${esc(group.id)}"><input type="hidden" name="group-name" value="共通ミッション">${MISSION_TYPES.map(([type,label])=>`<section class="daily-mission-admin-section"><h2>${label}</h2><p class="tiny">${type==='daily'?'動画・アンケート・歩数・ミニゲームを毎日のルーティンとして設定します。':'アフィリエイト・アンケートの掲載開始日と終了日を設定します。期間中の進捗を保持します。'} 各枠に有効な先頭5件を表示します。</p><div class="daily-group-missions" data-mission-type="${type}">${group.missions.filter(m=>normalizeDailyMission(m).missionType===type).map(m=>dailyMissionRow(m,state)).join('')}</div><button type="button" class="btn" data-action="daily-add-mission" data-mission-type="${type}">＋ ${type==='daily'?'デイリー':'期間限定'}ミッションを追加</button></section>`).join('')}</div>`;}
export function readDailyMissionRow(row){
 const value=name=>row.querySelector(`[name=${name}]`)?.value;
 const kind=value('category'),offerMode=value('offerMode'),offerId=value('offerId')||'';
 const to=kind==='affiliate'?(offerMode==='specific'?'offer/'+offerId:'offers'):({video:'videos',survey:'surveys',minigame:'home/minigames',steps:'home/steps'})[kind];
 return {id:row.dataset.dailyId,kind,missionType:value('missionType'),startDate:value('startDate')||'',endDate:value('endDate')||'',title:value('title')?.trim(),sub:value('sub')?.trim(),enabled:value('enabled')!=='0',targetCount:Number(value('targetCount')),to,
  pauseStartDate:value('pauseStartDate')||'',pauseEndDate:value('pauseEndDate')||'',...(kind==='affiliate'?{offerMode,offerId}:{}),...(['affiliate','steps','minigame'].includes(kind)?{reward:Number(value('reward'))}:{})};
}
export function addDailyMissionRow(group,state,missionType='daily'){
 const container=group.querySelector(`.daily-group-missions[data-mission-type="${missionType}"]`);
 container.insertAdjacentHTML('beforeend',dailyMissionRow(newDailyMission(missionType==='limited'?'affiliate':'video','mission-'+crypto.randomUUID(),{missionType,date:state.date}),state));
 container.querySelector('[data-daily-id]:last-child [name=category]').focus();
}
export function bindDailyMissionEditor(getState){
 document.addEventListener('change',e=>{
  const row=e.target.closest('[data-daily-id]');if(!row)return;
  if(e.target.name==='missionType'){
   const m=readDailyMissionRow(row),allowed=missionCategoriesFor(m.missionType);
   const kind=allowed.some(([key])=>key===m.kind)?m.kind:(m.missionType==='limited'?'affiliate':'video');
   const fresh={...newDailyMission(kind,m.id,{missionType:m.missionType,date:getState().date}),enabled:m.enabled,pauseStartDate:m.pauseStartDate,pauseEndDate:m.pauseEndDate,...(kind===m.kind?{title:m.title,sub:m.sub,targetCount:m.targetCount,...(m.reward?{reward:m.reward}:{}),offerMode:m.offerMode,offerId:m.offerId}:{})};
   if(row.closest('#daily-mission-detail-form')){row.outerHTML=dailyMissionRow(fresh,getState());return;}
   const container=row.closest('[data-daily-group]').querySelector(`.daily-group-missions[data-mission-type="${m.missionType}"]`);
   container.insertAdjacentHTML('beforeend',dailyMissionRow(fresh,getState()));row.remove();
  }else if(e.target.name==='category'){
   const m=readDailyMissionRow(row);
   row.outerHTML=dailyMissionRow({...newDailyMission(e.target.value,m.id,{missionType:m.missionType,date:getState().date}),enabled:m.enabled,startDate:m.startDate,endDate:m.endDate,pauseStartDate:m.pauseStartDate,pauseEndDate:m.pauseEndDate},getState());
  }else if(e.target.name==='offerMode'){
   const m=readDailyMissionRow(row);m.targetCount=m.offerMode==='specific'?1:m.targetCount;
   row.outerHTML=dailyMissionRow(m,getState());
  }else if(e.target.name==='offerId'){
   const url=new URL('../mock-app/',location.href);url.hash='offer/'+e.target.value;
   row.querySelector('[name=to]').value=url.href;
  }
 });
}
