import {ensureChinchiro,day,daily,audit} from './model.js';

export const DICE_ROLES=Object.freeze([
 {id:'pin',label:'Pゾロ',condition:'1・1',normal:1,boosted:1},
 {id:'double',label:'ゾロ目',condition:'2・2〜6・6',normal:5,boosted:5},
 {id:'even',label:'偶数',condition:'ゾロ目以外で合計が偶数',normal:12,boosted:12},
 {id:'odd',label:'奇数',condition:'合計が奇数（ハズレ）',normal:18,boosted:12}
]);
export function diceRoleFor([a,b]){return a===b?(a===1?'pin':'double'):(a+b)%2===0?'even':'odd';}
export function diceProbabilities(boosted=false){
 const key=boosted?'boosted':'normal',sum=DICE_ROLES.reduce((n,r)=>n+r[key],0);
 return DICE_ROLES.map(r=>({...r,probability:r[key]/sum}));
}
export function ensureDiceGame(s){
 if(!s.diceGame){
  ensureChinchiro(s);
  const reward=(id,fallback)=>{const r=s.chinchiro.normalTable.find(x=>x.id===id);return Math.max(1,Math.round(r?.pt??s.chinchiro.baseReward*(r?.mult??fallback)));};
  s.diceGame={enabled:s.chinchiro.enabled,dailyLimit:Math.min(3,s.chinchiro.dailyLimit),rewards:{pin:reward('pin',5),double:reward('triple',3),even:reward('eye2',2),odd:0}};
 }
 return s.diceGame;
}
export function setDiceGame(s,patch){
 const current=ensureDiceGame(s),next={...current,...patch,rewards:{...current.rewards,...patch.rewards,odd:0}};
 if(typeof next.enabled!=='boolean')throw Error('公開状態が不正です。');
 if(!Number.isInteger(next.dailyLimit)||next.dailyLimit<0||next.dailyLimit>3)throw Error('1日の回数は0〜3回です。');
 for(const id of ['pin','double','even'])if(!Number.isInteger(next.rewards[id])||next.rewards[id]<1||next.rewards[id]>99999)throw Error('当選ポイントは1〜99,999の整数で入力してください。');
 s.diceGame=next;audit(s,'サイコロゲーム設定を更新',JSON.stringify(next));return next;
}
export function diceStatus(s){
 const cfg=ensureDiceGame(s),used=day(s).chinchiro||0;
 return {visible:cfg.enabled,remaining:cfg.enabled?Math.max(0,cfg.dailyLimit-used):0,dailyLimit:cfg.dailyLimit,used,early:false};
}
const pairs=Array.from({length:36},(_,i)=>[Math.floor(i/6)+1,i%6+1]);
export function drawDiceGame(s,boosted=false,random=Math.random){
 if(typeof boosted!=='boolean')throw Error('抽選設定が不正です');
 const st=diceStatus(s);if(!st.visible)throw Error('サイコロゲームは現在停止中です。');
 if(!st.remaining)throw Error('本日の挑戦は終了しました。');
 const table=diceProbabilities(boosted),value=random();let cumulative=0;
 const role=table.find(r=>{cumulative+=r.probability;return value<cumulative;})||table.at(-1);
 const candidates=pairs.filter(p=>diceRoleFor(p)===role.id);
 const dice=[...candidates[Math.min(candidates.length-1,Math.floor(random()*candidates.length))]];
 const amount=ensureDiceGame(s).rewards[role.id];
 daily(s).chinchiro=(daily(s).chinchiro||0)+1;s.user.chinchiroRolls=(s.user.chinchiroRolls||0)+1;
 const result={id:crypto.randomUUID(),dice,prize:{id:role.id,label:role.label},amount,boosted,drawDate:s.date,remaining:st.remaining-1};
 s.user.chinchiroUnclaimed=amount>0?result:null;return result;
}

export const miniGamesMode=s=>s.miniGamesPreviewMode==='all'?'all':'tier1';
export const miniGamesEntry=s=>miniGamesMode(s)==='tier1'?'home/minigames/dice':'home/minigames';
export function setMiniGamesMode(s,mode){if(!['tier1','all'].includes(mode))throw Error('表示モードが不正です');s.miniGamesPreviewMode=mode;}
export function diceEntryState(s){return s.user.chinchiroUnclaimed?.drawDate===s.date?'B':diceStatus(s).remaining>0?'A':'C';}
