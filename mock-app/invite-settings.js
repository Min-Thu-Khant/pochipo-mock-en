import {operationSettings} from './operation-settings.js';
export function inviteSettings(s){
 const c=operationSettings(s).invite,p=s.operatorWorkflows?.invite||{};
 return {enabled:c.enabled,condition:'phone',inviterReward:p.inviterReward??c.reward,inviteeReward:p.inviteeReward??c.reward,perInviter:p.perInviter??10,totalCap:p.totalCap??1000000};
}
export function saveInviteSettings(s,input){
 if(typeof input.enabled!=='boolean')throw Error('開始・停止を選択してください。');
 if(input.condition!=='phone')throw Error('成立条件を選択してください。');
 const next={enabled:input.enabled,condition:input.condition};
 for(const key of ['inviterReward','inviteeReward','perInviter','totalCap']){
  const raw=input[key],value=Number(raw);
  if(raw===null||raw===undefined||String(raw).trim()===''||!Number.isSafeInteger(value)||value<(key==='perInviter'?1:0))throw Error('報酬・上限を正しい整数で入力してください。招待者ごとの上限は1件以上です。');
  next[key]=value;
 }
 const cfg=operationSettings(s).invite;cfg.enabled=next.enabled;
 s.operatorWorkflows??={};s.operatorWorkflows.bundles??=[];s.operatorWorkflows.invite={...s.operatorWorkflows.invite,...next};
 return next;
}
