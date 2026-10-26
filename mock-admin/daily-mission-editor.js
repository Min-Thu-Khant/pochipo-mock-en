import {DAILY_MISSION_CATEGORIES,MISSION_TYPES,missionCategoriesFor,normalizeDailyMission,newDailyMission} from '../mock-app/daily-mission-categories.js';
import {offersOf} from '../mock-app/model.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function dailyMissionRule(raw,state){
 const m=normalizeDailyMission(raw),stage=m.activitySlot||1;
 return ({
  video:{condition:'動画を1回視聴完了する',reward:`${state.limits.videoReward}pt（活動報酬）`,receipt:'ミッション一覧の「受け取る」から受け取る',destination:'動画の再生'},
  survey:{condition:'任意の1件の回答完了通知を受信する',reward:'当日初回に取得した回答可能案件の最大報酬を表示',receipt:'回答完了通知で自動的に「受け取り済」へ更新。実際に回答した案件の報酬を付与する',destination:'アンケート一覧'},
  steps:{condition:`${(stage*1000).toLocaleString('ja-JP')}歩の段階に到達する（1,000歩ごと・最大10,000歩）`,reward:`1段階 ${state.limits.stepRewardAd}pt（活動報酬）`,receipt:'歩数画面で対象段階の動画を視聴して受け取り、結果を反映する',destination:'歩数画面'},
  minigame:{condition:'対象のミニゲームで当選する。ハズレでも残り回数があれば再挑戦できる',reward:'ゲームの最大当選報酬を「pt（最大）」で表示',receipt:'当選時は「受け取り済」。実際の報酬はゲーム内で動画を視聴して受け取る。すべてハズレなど、受け取れずに終了した場合は「また明日」。ミッションの追加付与なし',destination:'ミニゲーム一覧'},
  affiliate:{condition:m.offerMode==='specific'?'指定案件が掲載期間内に「判定中」になる':`掲載期間内に異なる${m.targetCount}件の案件が「判定中」になる`,reward:`${m.reward}pt（追加ミッション報酬）`,receipt:'ミッション一覧の「受け取る」から一度だけ受け取る',destination:m.offerMode==='specific'?'対象案件の詳細':'案件一覧'}
 })[m.kind];
}
export function dailyMissionRow(raw,state){
 const m=normalizeDailyMission(raw);
 const bonus=m.kind==='affiliate',limited=m.missionType==='limited';
 const specific=m.kind==='affiliate'&&m.offerMode==='specific';
 const destination=specific&&m.offerId?'offer/'+m.offerId:({video:'videos',survey:'surveys',minigame:'home/minigames',steps:'home/steps',affiliate:'offers'})[m.kind];
 const rule=dailyMissionRule(m,state);
 const url=new URL('../mock-app/',location.href);url.hash=destination;
 return `<div data-daily-id="${esc(m.id)}" class="daily-mission-fields">
 <input name="enabled" type="hidden" value="${m.enabled?'1':'0'}">
 <input name="activitySlot" type="hidden" value="${esc(m.activitySlot||'')}"><input name="gameId" type="hidden" value="${esc(m.gameId||'')}">
 <h3>基本設定</h3>
 <label>ミッションの種類<select name="missionType">${MISSION_TYPES.map(([key,text])=>`<option value="${key}" ${m.missionType===key?'selected':''}>${text}</option>`).join('')}</select></label>
 <label>カテゴリー<select name="category">${missionCategoriesFor(m.missionType).map(([key,text])=>`<option value="${key}" ${m.kind===key?'selected':''}>${text}</option>`).join('')}</select></label>
 <h3>掲載・停止期間</h3>
 ${limited?`<div class="daily-mission-dates"><label>掲載開始日<input type="date" name="startDate" value="${esc(m.startDate)}" required></label><label>掲載終了日<input type="date" name="endDate" value="${esc(m.endDate)}" required></label></div>`:'<p class="tiny">日本時間0時に進捗と受取状態を更新します。</p>'}
 <div class="daily-mission-dates"><label>停止開始日<input type="date" name="pauseStartDate" value="${esc(m.pauseStartDate||'')}"></label><label>停止終了日<input type="date" name="pauseEndDate" value="${esc(m.pauseEndDate||'')}"></label></div>
 <p class="tiny">任意設定。停止期間中は非表示となり、終了日の翌日から自動再開します。手動で停止中、または掲載期間外のミッションは再開しません。予約を解除する場合は両方の日付を空にしてください。</p>
 <h3>アプリでの表示</h3>
 <label>タイトル<input name="title" value="${esc(m.title)}" required maxlength="80"></label>
 <label>説明<input name="sub" value="${esc(m.sub)}" maxlength="140"></label>
 ${m.kind==='affiliate'?`<label>達成条件<select name="offerMode"><option value="count" ${!specific?'selected':''}>任意の案件を指定件数利用する</option><option value="specific" ${specific?'selected':''}>指定した案件を利用する</option></select></label>${specific?`<label>対象案件<select name="offerId" required><option value="">案件を選択</option>${offersOf(state).filter(o=>o.active!==false||o.id===m.offerId).map(o=>`<option value="${esc(o.id)}" ${o.id===m.offerId?'selected':''}>${esc(o.name)}${o.active===false?'（停止中）':''}</option>`).join('')}</select></label>`:''}<p class="tiny">掲載期間内に対象案件が「判定中」になると達成します。同じ案件は期間内で1件として数え、報酬はミッションごとに一度だけ受け取れます。</p>`:''}
 ${m.kind==='affiliate'&&!specific?`<label>必要な異なる案件数（件）<input name="targetCount" type="number" min="1" max="100" step="1" value="${m.targetCount}" required></label>`:`<input type="hidden" name="targetCount" value="${m.kind==='steps'?(m.activitySlot||1)*1000:1}">`}
 <h3>達成条件・報酬</h3>
 <dl class="daily-mission-rules"><dt>達成条件</dt><dd>${esc(rule.condition)}</dd><dt>報酬</dt><dd>${esc(rule.reward)}</dd><dt>受取方法</dt><dd>${esc(rule.receipt)}</dd></dl>
 ${bonus?`<label>追加ミッション報酬（pt）<input name="reward" type="number" min="1" max="99999" step="1" value="${m.reward}" required></label><p class="tiny">案件本来の報酬とは別に付与します。達成時の金額を受取まで保持します。</p>`:'<p class="tiny">活動本来の報酬を反映します。ミッション側の追加ボーナスはありません。</p>'}
 <h3>遷移先</h3><div class="daily-mission-destination"><span>${esc(rule.destination)}</span><a href="${esc(url.href)}" target="_blank" rel="noopener">画面を確認 ↗</a></div>
 <input type="hidden" name="to" value="${esc(url.href)}">

 </div>`;
}
export function dailyMissionEditor(group,state){return `<div data-daily-group="${esc(group.id)}"><input type="hidden" name="group-name" value="共通ミッション">${MISSION_TYPES.map(([type,label])=>`<section class="daily-mission-admin-section"><h2>${label}</h2><p class="tiny">${type==='daily'?'動画・アンケート・歩数・ミニゲームを毎日のルーティンとして設定します。':'アフィリエイト・アンケートの掲載開始日と終了日を設定します。期間中の進捗を保持します。'} 各枠に有効な先頭5件を表示します。</p><div class="daily-group-missions" data-mission-type="${type}">${group.missions.filter(m=>normalizeDailyMission(m).missionType===type).map(m=>dailyMissionRow(m,state)).join('')}</div><button type="button" class="btn" data-action="daily-add-mission" data-mission-type="${type}">＋ ${type==='daily'?'デイリー':'期間限定'}ミッションを追加</button></section>`).join('')}</div>`;}
export function readDailyMissionRow(row){
 const value=name=>row.querySelector(`[name=${name}]`)?.value;
 const kind=value('category'),offerMode=value('offerMode'),offerId=value('offerId')||'';
 const to=kind==='affiliate'?(offerMode==='specific'?'offer/'+offerId:'offers'):({video:'videos',survey:'surveys',minigame:'home/minigames',steps:'home/steps'})[kind];
 return {id:row.dataset.dailyId,kind,missionType:value('missionType'),startDate:value('startDate')||'',endDate:value('endDate')||'',title:value('title')?.trim(),sub:value('sub')?.trim(),enabled:value('enabled')!=='0',targetCount:kind==='affiliate'?Number(value('targetCount')):kind==='steps'?Number(value('activitySlot')||1)*1000:1,to,
  ...(value('activitySlot')?{activitySlot:Number(value('activitySlot'))}:{}),...(value('gameId')?{gameId:value('gameId')}:{}),
  pauseStartDate:value('pauseStartDate')||'',pauseEndDate:value('pauseEndDate')||'',...(kind==='affiliate'?{offerMode,offerId}:{}),...(kind==='affiliate'?{reward:Number(value('reward'))}:{})};
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
   const fresh={...newDailyMission(kind,m.id,{missionType:m.missionType,date:getState().date}),enabled:m.enabled,pauseStartDate:m.pauseStartDate,pauseEndDate:m.pauseEndDate,...(kind===m.kind?{title:m.title,sub:m.sub,targetCount:m.targetCount,...(m.reward?{reward:m.reward}:{}),offerMode:m.offerMode,offerId:m.offerId,activitySlot:m.activitySlot,gameId:m.gameId}:{})};
   if(row.closest('#daily-mission-detail-form')){row.outerHTML=dailyMissionRow(fresh,getState());return;}
   const container=row.closest('[data-daily-group]').querySelector(`.daily-group-missions[data-mission-type="${m.missionType}"]`);
   container.insertAdjacentHTML('beforeend',dailyMissionRow(fresh,getState()));row.remove();
  }else if(e.target.name==='category'){
   const m=readDailyMissionRow(row);
   row.outerHTML=dailyMissionRow({...newDailyMission(e.target.value,m.id,{missionType:m.missionType,date:getState().date}),enabled:m.enabled,startDate:m.startDate,endDate:m.endDate,pauseStartDate:m.pauseStartDate,pauseEndDate:m.pauseEndDate},getState());
  }else if(e.target.name==='offerMode'){
   const m=readDailyMissionRow(row);m.targetCount=m.offerMode==='specific'?1:m.targetCount;
   row.outerHTML=dailyMissionRow(m,getState());
  }else if(['targetCount','reward'].includes(e.target.name)&&row.querySelector('[name=category]').value==='affiliate'){
   row.outerHTML=dailyMissionRow(readDailyMissionRow(row),getState());
  }else if(e.target.name==='offerId'){
   row.outerHTML=dailyMissionRow(readDailyMissionRow(row),getState());
  }
 });
}
