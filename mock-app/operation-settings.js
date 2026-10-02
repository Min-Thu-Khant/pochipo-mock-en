import {creditPoints} from './point-ledger.js';
export function operationSettings(s){return s.operationSettings??={guide:'利用前に獲得条件・対象外条件を確認してください。\n「ポイントゲット」からサービスを利用してください。\n承認後のポイントはポイント獲得履歴で確認できます。',help:'ポイントが反映されない場合は、案件名・利用日時・会員IDを確認してお問い合わせください。',contactURL:'',privacyURL:'',termsURL:'',surveyPriority:'default',surveyPageSize:20,invite:{enabled:true,reward:5000,hours:72,codes:[{code:'FRIEND-DEMO',owner:'sample-friend'}]},pushes:[],notificationsEnabled:true};}
export function ownInviteCode(s){return 'POI-'+(s.accountAuth?.active||s.accountAuth?.guestId||'GUEST').replaceAll('-','').slice(0,8).toUpperCase();}
export function checkInvite(s,code){
 const cfg=operationSettings(s).invite;code=String(code||'').trim().toUpperCase();
 if(!cfg.enabled)throw Error('友達招待は現在停止しています。');
 if(!s.accountAuth?.active)throw Error('会員登録・ログイン後に入力してください。');
 if(s.user.inviteApplied)throw Error('招待コードは適用済みです。');
 if(code===ownInviteCode(s))throw Error('自分の招待コードは利用できません。');
 if(Date.parse(s.date)-Date.parse(s.user.registered)>cfg.hours*3600000)throw Error('招待コードの入力期限を過ぎています。');
 const row=cfg.codes.find(x=>x.code===code&&!x.stopped);if(!row)throw Error('有効な招待コードを入力してください。');
 if(s.accountAuth.accounts[row.owner]?.status==='withdrawn')throw Error('この招待コードは利用できません。');
 if(row.owner===s.accountAuth.active)throw Error('自分を招待することはできません。');return {...row,code};
}
function applyInviteChecked(s,code){
 const invite=checkInvite(s,code),account=s.accountAuth.accounts[s.accountAuth.active];
 if(!account.phone)throw Error('電話番号を登録してください。');
 const cfg=operationSettings(s).invite,requestId='invite:'+s.accountAuth.active,policy=s.operatorWorkflows?.invite;
 if(policy){if(policy.condition==='first-approved'&&!s.user.cases.some(c=>c.status==='approved'))throw Error('初回案件の承認後に招待特典を受け取れます。');
 if((cfg.results||[]).filter(r=>r.inviter===invite.owner).length>=policy.perInviter)throw Error('この招待者の成立上限に達しています。');
 if((cfg.results||[]).reduce((n,r)=>n+(r.totalReward??r.amount*2),0)+policy.inviterReward+policy.inviteeReward>policy.totalCap)throw Error('招待特典の原資上限に達しています。');}
 creditPoints(s,{requestId,title:'友達招待特典',amount:policy?.inviteeReward??cfg.reward,category:'REFERRAL'});
 s.user.inviteApplied={code:invite.code,date:s.date,amount:cfg.reward};
 const inviter=s.accountAuth.accounts[invite.owner];const inviterCredited=inviter?.status==='active';if(inviterCredited)creditPoints({date:s.date,user:inviter.data.user},{requestId,title:'友達招待特典',amount:policy?.inviterReward??cfg.reward,category:'REFERRAL'});
 cfg.results??=[];cfg.results.unshift({id:requestId,date:s.date,code:invite.code,member:account.id,inviter:invite.owner,inviterCredited,amount:policy?.inviteeReward??cfg.reward,totalReward:(policy?.inviterReward??cfg.reward)+(policy?.inviteeReward??cfg.reward)});return cfg.reward;
}
export function registerInviteCode(s){const cfg=operationSettings(s).invite,code=ownInviteCode(s);if(s.accountAuth?.active&&!cfg.codes.some(x=>x.code===code))cfg.codes.push({code,owner:s.accountAuth.active});return code;}
export function deliverPush(s,push,{test=false}={}){
 const cfg=operationSettings(s),account=s.accountAuth?.accounts[s.accountAuth?.active];
 const allowed=s.notificationPermission==='authorized'&&cfg.notificationsEnabled&&account?.status==='active'&&account.notifications!==false;
 const policy=s.operatorWorkflows?.delivery,hour=Number((s.operatorTime||'12:00').slice(0,2));
 let reason=allowed?'':'未許諾・配信停止・未ログインのため対象外';
 if(push.id&&cfg.pushes.some(p=>p.id===push.id&&p.status==='delivered'))reason='同じ通知は配信済みです';
 if(policy){const quiet=policy.quietStart===policy.quietEnd?false:policy.quietStart<policy.quietEnd?hour>=policy.quietStart&&hour<policy.quietEnd:hour>=policy.quietStart||hour<policy.quietEnd;
 if(!policy.enabled)reason='運営による配信停止';else if(policy.invalidToken)reason='無効な端末トークン';else if(quiet)reason='停止時間帯';else if(cfg.pushes.filter(p=>p.date===s.date&&p.memberId===s.accountAuth?.active&&p.status==='delivered'&&!p.test).length>=policy.dailyCap)reason='日次配信上限';}
 const result={...push,id:push.id||crypto.randomUUID(),date:s.date,memberId:s.accountAuth?.active,status:reason?'skipped':'delivered',reason:reason||'アプリ内で受信を再現',test};
 cfg.pushes.unshift(result);return result;
}

export function applyInvite(s,code){
 const cfg=operationSettings(s).invite;cfg.attempts??=[];
 try{const amount=applyInviteChecked(s,code);cfg.attempts.unshift({date:s.date,member:s.accountAuth?.active||'guest',code,status:'成立',reason:'成立条件を満たしました'});return amount;}
 catch(error){cfg.attempts.unshift({date:s.date,member:s.accountAuth?.active||'guest',code,status:'未成立',reason:error.message});throw error;}
}
