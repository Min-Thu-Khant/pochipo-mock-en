import {challengeSlots,visibleOffers} from './model.js';

// Explicit local preview only. Preserve existing campaigns, CVs and balances.
export function configureChallengeDemo(state){
 const current=challengeSlots(state);
 if(current.length>=6)return 0;
 const used=new Set(state.slots.filter(x=>x.kind==='challenge').map(x=>x.destination));
 const preferred=['marche','luna-card','leaf-card','cosme','interior','trip-card'];
 const candidates=visibleOffers(state).filter(o=>!o.sur&&!used.has(o.id)).sort((a,b)=>{
  const rank=id=>preferred.includes(id)?preferred.indexOf(id):preferred.length;
  return rank(a.id)-rank(b.id);
 });
 const examples=[{goal:5000,participants:3600,bonus:15000,days:7},{goal:3000,participants:3200,bonus:20000,days:10},{goal:10000,participants:9840,bonus:30000,days:1},{goal:5000,participants:1280,bonus:10000,days:14}];
 const needed=6-current.length;
 const lastOrder=Math.max(0,...state.slots.filter(x=>x.kind==='challenge').map(x=>x.displayOrder??(100-x.priority)));
 let added=0;
 for(const o of candidates.slice(0,needed)){
  const id='demo-challenge-'+o.id;
  if(state.slots.some(x=>x.id===id))continue;
  const example=examples[added%examples.length],end=new Date(state.date+'T00:00:00Z');end.setUTCDate(end.getUTCDate()+example.days);
  state.slots.push({id,name:'表示確認用チャレンジ：'+o.name,title:o.name+'のチャレンジボーナス',text:'モック表示確認用の仮データ',destination:o.id,kind:'challenge',placements:['challenge'],enabled:true,start:state.date,end:end.toISOString().slice(0,10),segment:'all',priority:50,displayOrder:lastOrder+added+1,visual:o.id,rewardMode:'flat',reward:0,mission:false,notification:'',challengeGoal:example.goal,participants:example.participants,bonus:example.bonus,mockDemo:true});
  added++;
 }
 return added;
}
