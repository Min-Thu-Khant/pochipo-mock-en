import {bannersAt,equalBannerSelection} from './carousel-model.js';
import {overlayAdSeeds} from './overlay-ad-seeds.js';
import {savePopupFrequency} from './popup-frequency.js';
import {defaultWorkAdDelivery,workAdConfig,finishWorkAd} from './work-ad-triggers.js';
export const defaultAdDelivery=defaultWorkAdDelivery;
// 一度だけ追加する。運用者が停止・削除した広告は復活させない。
export function ensureOverlayAds(state){
 if(!state.overlayAdsInitialized){
  for(const seed of overlayAdSeeds){if(!state.slots.some(s=>s.id===seed.id))state.slots.push({...seed,start:state.date,end:'2099-12-31'});}
  state.popupMode='always';state.overlayAdsInitialized=true;
 }
 state.adDelivery=workAdConfig(state);return state;
}
export function setAdDelivery(state,kind,input){
 if(kind==='popup'){
  savePopupFrequency(state,input);return;
 }
 if(kind!=='interstitial')throw Error('広告枠が不正です。');
 if(!Number.isSafeInteger(input.rewardEvery)||input.rewardEvery<1)throw Error('ポイント獲得回数は1以上の整数で入力してください。');
 if(typeof input.enabled!=='boolean')throw Error('配信状態を選んでください。');
 state.adDelivery={enabled:input.enabled,rewardEvery:input.rewardEvery};
 if(!input.enabled&&state.user.workAdProgress)state.user.workAdProgress.queue=[];
}
export function nextInterstitial(state,{blocked=false,random=Math.random}={}){
 if(blocked||!workAdConfig(state).enabled)return null;
 const ticket=state.user.workAdProgress?.queue[0];if(!ticket)return null;
 const slot=equalBannerSelection(bannersAt(state,'interstitial'),random)[0];
 if(!slot){finishWorkAd(state,ticket.id);return null;}
 return {slot,ticket};
}
