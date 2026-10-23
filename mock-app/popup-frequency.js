// Fixed calendar windows in Japan time, not a cooldown from the last impression.
export const defaultPopupFrequency={interval:3,unit:'hour',count:1};
export const popupUnitLabels={day:'日',hour:'時間',minute:'分'};
const minute=60000,day=1440*minute;
export function popupFrequency(state){return state.popupFrequency||{...defaultPopupFrequency};}
export function savePopupFrequency(state,input){
 const {interval,unit,count}=input;
 if(!Number.isSafeInteger(interval)||interval<1)throw Error('期間は1以上の整数で入力してください。');
 if(!Object.hasOwn(popupUnitLabels,unit))throw Error('日・時間・分を選んでください。');
 if(!Number.isSafeInteger(count)||count<1)throw Error('回数は1以上の整数で入力してください。');
 const max={day:365,hour:24,minute:1440}[unit];
 if(interval>max)throw Error(`期間は${max}${popupUnitLabels[unit]}以内で入力してください。`);
 const old=state.popupFrequency;
 state.popupFrequency={interval,unit,count,anchorDate:old&&old.interval===interval&&old.unit===unit?old.anchorDate:state.date};
 // The legacy global stop is replaced only after an explicit save.
 delete state.popupMode;
}
export function popupNow(state,now=Date.now()){
 const time=state.popupTestTime||new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(now);
 return Date.parse(`${state.date}T${time}+09:00`);
}
export function popupWindow(state,now=popupNow(state)){
 const config=popupFrequency(state);
 const midnight=Math.floor((now+9*60*minute)/day)*day-9*60*minute;
 if(config.unit==='day'){
  const anchor=Date.parse(`${config.anchorDate||state.date}T00:00:00+09:00`),duration=config.interval*day;
  const start=anchor+Math.floor((now-anchor)/duration)*duration;
  return {start,end:start+duration};
 }
 const duration=config.interval*(config.unit==='hour'?60:1)*minute;
 const start=midnight+Math.floor((now-midnight)/duration)*duration;
 return {start,end:Math.min(start+duration,midnight+day)};
}
export function canShowPopup(state,now=popupNow(state)){
 const {start,end}=popupWindow(state,now);
 return (state.user.popupImpressions||[]).filter(at=>at>=start&&at<end).length<popupFrequency(state).count;
}
export function recordPopupImpression(state,now=popupNow(state)){
 (state.user.popupImpressions??=[]).push(now);
}
