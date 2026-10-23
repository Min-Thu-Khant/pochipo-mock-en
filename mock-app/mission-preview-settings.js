const requests=new WeakMap();
export function requestDailySurveyQuote(state,fetcher=fetch){
 const date=state.date,d=state.user.daily[date]??={};
 if(d.surveyMissionQuote)return Promise.resolve(false);
 let dates=requests.get(state);if(!dates){dates=new Map();requests.set(state,dates);}
 if(dates.has(date))return dates.get(date);
 const promise=(async()=>{
  const response=await fetcher('./survey-mission-preview.json',{cache:'no-store'});
  if(!response.ok)throw Error('アンケート最大報酬を取得できませんでした');
  const data=await response.json();
  if(!Array.isArray(data.items)||data.items.some(item=>!Number.isInteger(item.reward)||item.reward<0))throw Error('アンケート報酬が不正です');
  d.surveyMissionQuote={maxReward:Math.max(0,...data.items.map(item=>item.reward)),date};
  return true;
 })().catch(()=>{d.surveyMissionQuoteError=true;return false;});
 dates.set(date,promise);return promise;
}
