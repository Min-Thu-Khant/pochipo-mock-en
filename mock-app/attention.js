import {caseTabLabels,caseDisplayStatus} from './my-case-status.js';
import {total,stepsClaimable,chinchiroStatus,challengeSlots,visibleOffers,homeCategoryOffers,availableSurveys,pillSlots,slotLink,featureById,featureIsPublished,featureOffers} from './model.js';
import {listed} from './receipt-model.js';

// Kept outside the shared app/admin state so an admin save cannot reset read markers.
export const ATTENTION_KEY='tameruko-attention-v1';
const caseVersion=c=>JSON.stringify([c.status,c.paidStages,c.level,c.bonusPaid,c.reward,c.date]);
const itemVersion=x=>JSON.stringify([x.id,x.start||'']);
const pillVersion=x=>JSON.stringify([x.id,x.start,x.end,x.title,x.text,slotLink(x),x.notification]);
export function initialAttention(state){return {version:1,lastTotal:total(state),points:false,seen:{},cases:Object.fromEntries(state.user.cases.map(c=>[c.id,caseVersion(c)]))};}
export function readAttention(state,storage){try{const a=JSON.parse(storage.getItem(ATTENTION_KEY));if(a?.version===1&&a.seen&&a.cases&&Number.isFinite(a.lastTotal))return a;}catch{}return initialAttention(state);}
export function observePoints(state,attention){const value=total(state);if(value>attention.lastTotal)attention.points=true;attention.lastTotal=value;}
export function attentionInventory(state,receipt){
  const eligible=new Set(visibleOffers(state).map(o=>o.id));
  const categories=Object.fromEntries(['game','shopping','credit'].map(k=>[k,homeCategoryOffers(state,k).map(itemVersion)]));
  categories.challenge=challengeSlots(state).filter(x=>eligible.has(x.destination)).map(itemVersion);
  categories.survey=(state.scenario==='empty'?[]:availableSurveys(state)).map(itemVersion);
  categories.receipt=listed(receipt).filter(x=>x.start<=state.date&&x.end>=state.date).map(itemVersion);
  const pills=pillSlots(state).filter(x=>{
    const [page,id]=slotLink(x).split('/');
    if(page==='offer')return eligible.has(id);
    if(page==='feature'){const f=featureById(state,id);return f&&featureIsPublished(state,f)&&featureOffers(state,f).length;}
    return true;
  });
  return {categories,pills};
}
export function markCategoryRead(attention,inventory,key){
  if(!inventory.categories[key])return;
  attention.seen[key]=[...new Set([...(attention.seen[key]||[]),...inventory.categories[key]])];
}
export function markPillRead(attention,inventory,id){const item=inventory.pills.find(x=>x.id===id);if(item)attention.seen.pills={...(attention.seen.pills||{}),[id]:pillVersion(item)};}
export function markCasesRead(state,attention,status){for(const c of state.user.cases.filter(c=>caseDisplayStatus(c.status)===caseDisplayStatus(status)))attention.cases[c.id]=caseVersion(c);}
export function acknowledgeAttention(state,attention,inventory,{page,tab,caseTab='judging'}={}){
  if(page==='points')attention.points=false;
  if(page==='home')markCategoryRead(attention,inventory,tab);
  if(page==='challenges')markCategoryRead(attention,inventory,'challenge');
  if(page==='surveys')markCategoryRead(attention,inventory,'survey');
  if(page==='receipt'&&!tab)markCategoryRead(attention,inventory,'receipt');
  if(page==='mycases')markCasesRead(state,attention,caseTab);
}
export function attentionFlags(state,attention,inventory){
  const tabs=Object.fromEntries(Object.entries(inventory.categories).map(([key,items])=>[key,items.some(id=>!(attention.seen[key]||[]).includes(id))]));
  tabs.steps=stepsClaimable(state);
  const game=chinchiroStatus(state);tabs.minigames=game.visible&&game.remaining>0&&game.used<3;
  const cases=state.user.cases.filter(c=>attention.cases[c.id]!==caseVersion(c));
  return {points:!!attention.points,tabs,cases:cases.length>0,caseStatuses:Object.fromEntries(Object.keys(caseTabLabels).map(status=>[status,cases.some(c=>caseDisplayStatus(c.status)===status)])),pills:Object.fromEntries(inventory.pills.map(x=>[x.id,attention.seen.pills?.[x.id]!==pillVersion(x)]))};
}
