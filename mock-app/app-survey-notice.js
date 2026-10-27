import {availableSurveys,surveyRewardRange} from './model.js';

export function appSurveyNotice(state){
 const items=availableSurveys(state).filter(q=>q.provider==='life-survey');
 return {items,count:items.length,maxReward:items.reduce((sum,q)=>sum+surveyRewardRange(state,q).max,0)};
}
