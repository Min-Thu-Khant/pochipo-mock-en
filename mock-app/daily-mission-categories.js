import {gameStatus,gameHeld} from './mini-games-model.js';
export const DAILY_MISSION_CATEGORIES=[['video','動画'],['survey','アンケート'],['minigame','ミニゲーム'],['steps','歩数'],['affiliate','アフィリエイト']];
export const MISSION_TYPES=[['daily','毎日繰り返すミッション'],['limited','期間限定ミッション']];
export const missionCategoriesFor=type=>DAILY_MISSION_CATEGORIES.filter(([kind])=>type==='limited'?['affiliate','survey'].includes(kind):kind!=='affiliate');
const defaults={
 video:{title:'動画を見る',sub:'動画の視聴完了で達成',to:'videos',targetCount:1},
 survey:{title:'アンケートに回答する',sub:'回答完了で達成',to:'surveys',targetCount:1},
 minigame:{title:'ミニゲームで遊ぶ',sub:'当選したら受け取り済。すべてハズレで終了したらまた明日',to:'home/minigames',targetCount:1,reward:100},
 steps:{title:'1,000歩あるく',sub:'1,000歩ごとの段階に到達し、歩く画面で動画を見て受け取る',to:'home/steps',targetCount:1000,reward:100},
 affiliate:{title:'アフィリエイト案件を利用する',sub:'対象案件が判定中になると受け取り可能',to:'offers',targetCount:1,reward:100,offerMode:'count',offerId:''},
};
export const missionCategory=m=>m.kind||(/^(video)(-|$)/.test(m.id)?'video':'survey');
export function normalizeDailyMission(m){
 const kind=missionCategory(m),base=defaults[kind];
 if(!base)throw Error('ミッションのカテゴリーを選択してください。');
 const targetCount=['video','survey','minigame'].includes(kind)?1:kind==='steps'?Math.min(10000,Math.max(1000,Math.ceil((m.targetCount||1000)/1000)*1000)):m.targetCount??base.targetCount;
 const title=m.title??base.title;
 return {...base,...m,title,kind,missionType:m.missionType||(kind==='affiliate'?'limited':'daily'),startDate:m.startDate||'',endDate:m.endDate||'',targetCount,enabled:m.enabled!==false};
}
export function newDailyMission(kind,id,{missionType=kind==='affiliate'?'limited':'daily',date=''}={}){return normalizeDailyMission({id,kind,missionType,...(missionType==='limited'?{startDate:date,endDate:date}:{})});}
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export const missionIsPaused=(m,date)=>validDate(m.pauseStartDate)&&validDate(m.pauseEndDate)&&m.pauseStartDate<=date&&date<=m.pauseEndDate;
export const missionIsVisible=(m,date)=>m.enabled!==false&&!missionIsPaused(m,date)&&(m.missionType!=='limited'||validDate(m.startDate)&&validDate(m.endDate)&&m.startDate<=date&&date<=m.endDate);
export function missionActivityCount(s,m,key){
 if(m.missionType!=='limited')return s.user.daily[s.date]?.[key]||0;
 return Object.entries(s.user.daily).filter(([date])=>m.startDate<=date&&date<=m.endDate&&date<=s.date).reduce((sum,[,d])=>sum+(d[key]||0),0);
}
export function missionActivityRewards(s,m){
 return Object.entries(s.user.daily).filter(([date])=>m.missionType==='limited'?m.startDate<=date&&date<=m.endDate&&date<=s.date:date===s.date).flatMap(([,d])=>d.missionRewards||[]);
}
export function validateDailyMissions(rows,offers){
 if(!Array.isArray(rows)||new Set(rows.map(m=>m.id)).size!==rows.length)throw Error('ミッションIDが重複しています。');
 return rows.map(row=>{
  const m=normalizeDailyMission(row);
  if(!MISSION_TYPES.some(([key])=>key===m.missionType)||!missionCategoriesFor(m.missionType).some(([key])=>key===m.kind))throw Error('ミッションの種類に対応するカテゴリーを選択してください。');
  if(m.missionType==='limited'&&(!validDate(m.startDate)||!validDate(m.endDate)||m.startDate>m.endDate))throw Error('掲載開始日・終了日を正しく入力してください。');
  if((m.pauseStartDate||m.pauseEndDate)&&(!validDate(m.pauseStartDate)||!validDate(m.pauseEndDate)||m.pauseStartDate>m.pauseEndDate))throw Error('停止開始日・停止終了日を両方、正しい順序で入力してください。');
  if(!/^[a-zA-Z0-9-]+$/.test(m.id)||!m.title?.trim()||m.title.length>80||String(m.sub||'').length>140)throw Error('タイトルは1〜80文字、説明は140文字以内で入力してください。');
  if(!Number.isInteger(m.targetCount)||m.targetCount<1||m.targetCount>(m.kind==='steps'?100000:100))throw Error('達成条件は範囲内の正の整数で入力してください。');
  if(m.kind==='affiliate'&&(!Number.isInteger(m.reward)||m.reward<1||m.reward>99999))throw Error('ミッション報酬は1〜99,999ptの整数で入力してください。');
  if(m.kind==='affiliate'){
   if(!['specific','count'].includes(m.offerMode))throw Error('アフィリエイトの達成条件を選択してください。');
   if(m.offerMode==='specific'){
    const offer=offers.find(o=>o.id===m.offerId);
    if(!offer||m.enabled&&offer.active===false)throw Error('有効な対象案件を選択してください。');
    m.to='offer/'+m.offerId;m.targetCount=1;
   }else{m.offerId='';m.to='offers';}
  }
  return {...m,title:m.title.trim(),sub:String(m.sub||'').trim()};
 });
}
// An event survives subsequent approval/rejection; the same conversion is recorded once.
export function recordAffiliateJudging(s,cv){
 if(cv?.status!=='judging')return;
 const date=String(cv.judgingAt||cv.date||s.date).slice(0,10);
 if(date>s.date)return;
 s.user.affiliateJudgingEvents??=[];
 if(!s.user.affiliateJudgingEvents.some(e=>e.id===cv.id))s.user.affiliateJudgingEvents.push({id:cv.id,offerId:cv.offerId,date});
 if(date===s.date){const d=s.user.daily[s.date]??={};d.affiliateJudging??=[];if(!d.affiliateJudging.some(e=>e.id===cv.id))d.affiliateJudging.push({id:cv.id,offerId:cv.offerId});}
}
export function categoryMissionTask(s,m){
 const d=s.user.daily[s.date]??={};
 let progress=0;
 if(m.kind==='steps'){
  const stage=m.activityIndex||1,target=stage*1000;
  const reached=s.stepLink==='linked'&&(d.steps||0)>=target,claimed=(d.stepsClaimed||0)>=stage;
  return {...m,title:m.title==='1,000歩あるく'?`${target.toLocaleString()}歩あるく`:m.title,targetCount:target,progress:d.steps||0,sourceActivity:true,reward:m.activityReward??s.limits.stepRewardAd,state:claimed?'claimed':reached?'ready':'todo'};
 }
 if(m.kind==='minigame'){
  const gameId=m.gameId||m.to?.split('/')[2]||'dice';
  const events=(d.missionGameResults||[]).filter(e=>e.gameId===gameId);
  const held=gameHeld(s,gameId),status=gameStatus(s,gameId);
  // A win completes the mission; the game still owns the actual reward claim.
  // An unclaimed result replaced by another draw is not a received reward.
  const won=events.find(e=>e.amount>0&&(e.claimed||e.id===held?.id));
  return {...m,to:`home/minigames/${gameId}`,sourceActivity:true,reward:won?.amount??null,state:won?'claimed':status.used>0&&status.remaining===0?'ended':'todo'};
 }
 if(m.kind==='affiliate'){
  for(const cv of s.user.cases||[])recordAffiliateJudging(s,cv);
  // Preserve events written by the previous daily-only mock when upgrading.
  for(const [date,data] of Object.entries(s.user.daily))for(const event of data.affiliateJudging||[])if(!(s.user.affiliateJudgingEvents||[]).some(e=>e.id===event.id)){s.user.affiliateJudgingEvents??=[];s.user.affiliateJudgingEvents.push({...event,date});}
  const events=(s.user.affiliateJudgingEvents||[]).filter(e=>(m.missionType==='limited'?m.startDate<=e.date&&e.date<=m.endDate&&e.date<=s.date:e.date===s.date)&&(m.offerMode!=='specific'||e.offerId===m.offerId));
  progress=new Set(events.map(e=>e.offerId)).size;
 }
 const store=m.missionType==='limited'?(s.user.limitedMissionAchievements??={}):(d.categoryMissionAchievements??={});
 let achievement=store[m.id];
 if(!achievement&&progress>=m.targetCount)achievement=store[m.id]={reward:m.reward,title:m.title,claimed:false};
 return {...m,progress,categoryReward:true,reward:achievement?.reward??m.reward,state:achievement?(achievement.claimed?'claimed':'achieved'):'todo'};
}
