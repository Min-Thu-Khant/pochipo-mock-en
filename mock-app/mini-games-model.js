import {chinchiroStatus,drawChinchiro,claimChinchiro,ensureChinchiro,schedule} from './model.js';

export const miniGames=[
 {id:'dice',title:'サイコロゲーム',description:'サイコロを振って、今日の運だめし！'},
 {id:'omikuji',title:'おみくじ',description:'おみくじを引いて、今日の運勢をチェック！'},
 {id:'roulette',title:'ルーレット',description:'くるっと回して、ポイントを当てよう！'}
];
export const gameFor=id=>miniGames.find(game=>game.id===id);
export function gameHeld(state,id){return id==='dice'?state.user.chinchiroUnclaimed:state.user[id+'Unclaimed'];}

// Preview rules: reuse the existing draw table, with independent attempts and
// unclaimed results. Production omikuji rates and shared caps remain undecided.
function omikujiState(state,id='omikuji'){
 ensureChinchiro(state);
 const daily=state.user.daily;
 return {...state,user:{...state.user,
  chinchiroRolls:state.user[id+'Rolls']||0,
  chinchiroUnclaimed:state.user[id+'Unclaimed']||null,
  daily:{...daily,[state.date]:{...daily[state.date],chinchiro:daily[state.date]?.[id]||0}}
 }};
}
export function gameStatus(state,id){
 if(!gameFor(id))throw Error('ゲームが見つかりません');
 const status=chinchiroStatus(id!=='dice'?omikujiState(state,id):state);
 return {...status,remaining:Math.max(0,Math.min(status.remaining,3-status.used))};
}
export function drawGame(state,id,boosted=false){
 if(!gameFor(id))throw Error('ゲームが見つかりません');
 if(id==='dice')return drawChinchiro(state,boosted);
 const view=omikujiState(state,id);
 const result=drawChinchiro(view,boosted);
 state.user.daily[state.date]??={};
 state.user.daily[state.date][id]=view.user.daily[state.date].chinchiro;
 state.user[id+'Rolls']=view.user.chinchiroRolls;
 state.user[id+'Unclaimed']=view.user.chinchiroUnclaimed;
 return result;
}
export function fortuneLabel(result){
 return ({pin:'大吉',triple:'中吉',shigoro:'小吉',none:'末吉',spill:'末吉',hifumi:'末吉'})[result.prize.id]||(result.amount>0?'吉':'末吉');
}
export function claimGame(state,id,resultId){
 if(!gameFor(id))return false;
 if(id==='dice')return claimChinchiro(state,resultId);
 const result=state.user[id+'Unclaimed'];
 if(!result||result.id!==resultId)return false;
 schedule(state,id==='roulette'?'ルーレットで獲得':'おみくじで獲得',result.amount,id.toUpperCase(),'auto',(id==='roulette'?'ルーレット当選':fortuneLabel(result))+(result.boosted?'・当選確率UP':''));
 state.user[id+'Unclaimed']=null;
 return true;
}
