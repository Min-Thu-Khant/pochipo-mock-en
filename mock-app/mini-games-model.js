import {chinchiroStatus,drawChinchiro,claimChinchiro,ensureChinchiro,schedule} from './model.js';

export const miniGames=[
 {id:'dice',title:'サイコロゲーム',description:'サイコロを振って、今日の運だめし！'},
 {id:'omikuji',title:'おみくじ',description:'おみくじを引いて、今日の運勢をチェック！'}
];
export const gameFor=id=>miniGames.find(game=>game.id===id);
export function gameHeld(state,id){return id==='omikuji'?state.user.omikujiUnclaimed:state.user.chinchiroUnclaimed;}

// Preview rules: reuse the existing draw table, with independent attempts and
// unclaimed results. Production omikuji rates and shared caps remain undecided.
function omikujiState(state){
 ensureChinchiro(state);
 const daily=state.user.daily;
 return {...state,user:{...state.user,
  chinchiroRolls:state.user.omikujiRolls||0,
  chinchiroUnclaimed:state.user.omikujiUnclaimed||null,
  daily:{...daily,[state.date]:{...daily[state.date],chinchiro:daily[state.date]?.omikuji||0}}
 }};
}
export function gameStatus(state,id){
 if(!gameFor(id))throw Error('ゲームが見つかりません');
 const status=chinchiroStatus(id==='omikuji'?omikujiState(state):state);
 return {...status,remaining:Math.max(0,Math.min(status.remaining,3-status.used))};
}
export function drawGame(state,id,boosted=false){
 if(!gameFor(id))throw Error('ゲームが見つかりません');
 if(id==='dice')return drawChinchiro(state,boosted);
 const view=omikujiState(state);
 const result=drawChinchiro(view,boosted);
 state.user.daily[state.date]??={};
 state.user.daily[state.date].omikuji=view.user.daily[state.date].chinchiro;
 state.user.omikujiRolls=view.user.chinchiroRolls;
 state.user.omikujiUnclaimed=view.user.chinchiroUnclaimed;
 return result;
}
export function fortuneLabel(result){
 return ({pin:'大吉',triple:'中吉',shigoro:'小吉',none:'末吉',spill:'末吉',hifumi:'末吉'})[result.prize.id]||(result.amount>0?'吉':'末吉');
}
export function claimGame(state,id,resultId){
 if(!gameFor(id))return false;
 if(id==='dice')return claimChinchiro(state,resultId);
 const result=state.user.omikujiUnclaimed;
 if(!result||result.id!==resultId)return false;
 schedule(state,'おみくじで獲得',result.amount,'OMIKUJI','auto',fortuneLabel(result)+(result.boosted?'・当選確率UP':''));
 state.user.omikujiUnclaimed=null;
 return true;
}
