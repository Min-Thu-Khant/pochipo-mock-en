import {dailyMissionGroups,saveDailyMissions} from '../mock-app/model.js';
import {DAILY_MISSION_CATEGORIES,normalizeDailyMission,newDailyMission,missionIsPaused} from '../mock-app/daily-mission-categories.js';
import {dailyMissionRow,dailyMissionRule} from './daily-mission-editor.js';
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=s=>dailyMissionGroups(s)[0].missions;
export function dailyMissionStatus(m,date){return m.enabled===false?['off','停止中']:m.missionType==='limited'&&m.startDate>date?['warn','配信予定']:m.missionType==='limited'&&m.endDate<date?['off','期間終了']:missionIsPaused(m,date)?['off','期間停止中']:['on','配信中'];}
export function dailyMissionList(state){
 const missions=rows(state).map(normalizeDailyMission);
 return `<section class="panel daily-mission-list"><div class="toolbar"><h2>登録済みミッション　${missions.length}件</h2><a class="btn primary" href="#missions/new">＋ 新規登録</a></div><p class="tiny">デイリー・期間限定の各区分に、配信中のミッションを表示順の先頭から最大5件表示します。</p><div class="tbl"><table><thead><tr><th>ミッション名</th><th>種類・カテゴリー</th><th>達成条件・報酬</th><th>掲載期間</th><th>停止期間</th><th>状態</th><th>操作</th></tr></thead><tbody>${missions.map(m=>{const [kind,status]=dailyMissionStatus(m,state.date),rule=dailyMissionRule(m,state);return `<tr><td><a href="#missions/edit/${encodeURIComponent(m.id)}">${esc(m.title)}</a></td><td>${m.missionType==='limited'?'期間限定':'毎日繰り返す'}<br>${DAILY_MISSION_CATEGORIES.find(([k])=>k===m.kind)?.[1]||''}</td><td class="daily-mission-summary">${esc(rule.condition)}<small>${esc(rule.reward)}</small></td><td>${m.missionType==='limited'?`${esc(m.startDate)}〜${esc(m.endDate)}`:'毎日'}</td><td>${m.pauseStartDate&&m.pauseEndDate?`${esc(m.pauseStartDate)}〜${esc(m.pauseEndDate)}`:'—'}</td><td><span class="badge ${kind}">${status}</span></td><td><div class="toolbar"><a class="btn sm" href="#missions/edit/${encodeURIComponent(m.id)}">編集</a><button type="button" class="btn sm" data-action="daily-toggle" data-id="${esc(m.id)}">${m.enabled?'停止':'配信再開'}</button><button type="button" class="btn sm" data-action="daily-order-up" data-id="${esc(m.id)}" aria-label="${esc(m.title)}を上へ">↑</button><button type="button" class="btn sm" data-action="daily-order-down" data-id="${esc(m.id)}" aria-label="${esc(m.title)}を下へ">↓</button></div></td></tr>`;}).join('')||'<tr><td colspan="7">ミッションはありません。</td></tr>'}</tbody></table></div></section>`;
}
export function dailyMissionDetail(state,id){
 const creating=!id,m=creating?newDailyMission('video','mission-'+crypto.randomUUID(),{date:state.date}):rows(state).find(m=>m.id===id);
 if(!m)return '<section class="panel"><p>ミッションが見つかりません。</p><a href="#missions">一覧へ戻る</a></section>';
 return `<section class="panel daily-admin"><a href="#missions">← 一覧へ戻る</a><h2>${creating?'ミッション新規登録':esc(normalizeDailyMission(m).title)+'の編集'}</h2><form id="daily-mission-detail-form" data-new="${creating?'1':'0'}">${dailyMissionRow(m,state)}<div class="actions"><button class="btn primary" type="submit">${creating?'登録する':'変更を保存'}</button><a class="btn" href="#missions">キャンセル</a>${creating?'':`<button class="btn" type="button" data-action="daily-delete" data-id="${esc(m.id)}">このミッションを削除</button>`}<span class="err" role="alert"></span></div></form></section>`;
}
export function saveDailyMissionDetail(state,mission,creating=false){
 const current=rows(state);const index=current.findIndex(m=>m.id===mission.id);
 if(creating&&index!==-1)throw Error('同じミッションIDが登録されています。');
 if(!creating&&index===-1)throw Error('ミッションが見つかりません。');
 const next=current.map(m=>m.id===mission.id?{...m,...mission,enabled:m.enabled!==false}:m);
 if(creating)next.push(mission);
 return saveDailyMissions(state,next);
}
export function updateDailyMissionList(state,id,action){
 const next=rows(state).map(m=>({...m})),index=next.findIndex(m=>m.id===id);
 if(index<0)throw Error('ミッションが見つかりません。');
 if(action==='toggle')next[index].enabled=next[index].enabled===false;
 else if(action==='delete')next.splice(index,1);
 else {const other=index+(action==='up'?-1:1);if(other<0||other>=next.length)return false;[next[index],next[other]]=[next[other],next[index]];}
 saveDailyMissions(state,next);return true;
}
