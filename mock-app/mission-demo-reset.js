// Explicit local mock replay only; existing balances and transactions are preserved.
export function resetDailyMissionDemo(state,requestId){
 if(!requestId||state.user.mockMissionReplay?.requestId===requestId)return false;
 state.user.mockMissionReplay={requestId,historyIds:state.user.history.map(row=>row.id)};
 const d=state.user.daily[state.date]??={};d.video=0;d.surveys=0;d.missionRewards=[];
 delete state.user.dailyMissionJourney;
 state.user.answered=[];
 state.user.surveyMissionPermissionPending=false;
 return true;
}

export function configureSevenMissionDemo(state,requestId){
 resetDailyMissionDemo(state,requestId);
 state.dailyMissionGroups=[{id:'default',name:'7件表示の確認用',enabled:true,minDays:0,maxDays:0,missions:[
  {id:'video',title:'動画を見る',to:'videos',enabled:true},
  {id:'survey',title:'アンケートに回答する',to:'surveys',enabled:true},
  {id:'video-2',title:'動画を2回見る',to:'videos',enabled:true},
  {id:'survey-count-2',title:'アンケートに2件回答する',to:'surveys',enabled:true},
  {id:'video-3',title:'動画を3回見る',to:'videos',enabled:true},
  {id:'survey-s1',title:'お買い物のアンケートに回答する',to:'surveys',enabled:true},
  {id:'survey-s2',title:'スマートフォンのアンケートに回答する',to:'surveys',enabled:true}
 ]}];
 state.dailyMissionSamplesV1=true;state.dailyMissionSingleGroupV1=true;
}
