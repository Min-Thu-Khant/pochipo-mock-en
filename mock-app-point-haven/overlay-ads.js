import {bannersAt,equalBannerSelection} from './carousel-model.js';
import {overlayAdSeeds} from './overlay-ad-seeds.js';
export const defaultAdDelivery={enabled:true,every:3,cooldownSeconds:30,maxPerSession:3};
// 一度だけ追加する。運用者が停止・削除した広告は復活させない。
export function ensureOverlayAds(state){
 if(!state.overlayAdsInitialized){
  for(const seed of overlayAdSeeds){if(!state.slots.some(s=>s.id===seed.id))state.slots.push({...seed,start:state.date,end:'2099-12-31'});}
  state.popupMode='always';state.overlayAdsInitialized=true;
 }
 state.adDelivery={...defaultAdDelivery,...state.adDelivery};return state;
}
export function setAdDelivery(state,kind,input){
 if(kind==='popup'){
  if(!['always','daily','off'].includes(input.mode))throw Error('起動時の表示頻度を選んでください。');
  state.popupMode=input.mode;return;
 }
 if(kind!=='interstitial')throw Error('広告枠が不正です。');
 for(const [key,min,max,label] of [['every',2,30,'タブ切り替え回数'],['cooldownSeconds',0,3600,'表示間隔'],['maxPerSession',1,20,'1起動中の表示上限']]){
  if(!Number.isSafeInteger(input[key])||input[key]<min||input[key]>max)throw Error(`${label}は${min}〜${max}の整数で入力してください。`);
 }
 if(typeof input.enabled!=='boolean')throw Error('配信状態を選んでください。');
 state.adDelivery={enabled:input.enabled,every:input.every,cooldownSeconds:input.cooldownSeconds,maxPerSession:input.maxPerSession};
}
export function tabDestination(hash){
 const [page='home',tab='daily']=String(hash||'home').replace(/^#/,'').split('/');
 if(page==='home')return 'home/'+tab;
 return {offers:'offers',high:'offers/high',quick:'offers/quick',mycases:'offers/mycases',surveys:'surveys',mypage:'mypage'}[page]||null;
}
export const newAdSession=()=>({transitions:0,shown:0,lastAdAt:null});
export function nextInterstitial(state,session,from,to,{now=Date.now(),blocked=false,random=Math.random}={}){
 const a=tabDestination(from),b=tabDestination(to),config={...defaultAdDelivery,...state.adDelivery};
 if(!config.enabled){session.transitions=0;return null;}
 if(blocked||!a||!b||a===b||session.shown>=config.maxPerSession)return null;
 session.transitions=Math.min(config.every,session.transitions+1);
 if(session.transitions<config.every||session.lastAdAt!==null&&now-session.lastAdAt<config.cooldownSeconds*1000)return null;
 const slot=equalBannerSelection(bannersAt(state,'interstitial'),random)[0];
 if(!slot)return null;
 session.transitions=0;session.shown++;session.lastAdAt=now;return slot;
}
