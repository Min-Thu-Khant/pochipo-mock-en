// Local workflow simulator shared by the two operator consoles. No network or real money.
import {creditPoints,ensurePointAccount} from '../mock-app/point-ledger.js';
import {initAccounts,syncAccount} from '../mock-app/account-model.js';

export function workflows(s){
 const w=s.operatorWorkflows??={};
 w.results??=[];w.imports??=[];w.grants??=[];w.audit??=[];w.bundles??=[];w.incidents??=[];
 w.vc??={enabled:false,interval:60,lastRun:'',nextRun:'',error:''};
 w.missions??={resetHour:0,conditions:{},videoRequired:{},bonus:{enabled:false,amount:100,completed:3}};
 w.videoSlots??={standalone:{enabled:true,reward:s.limits.videoReward,limit:s.limits.videoLimit},mission:{enabled:true,reward:0,limit:20},steps:{enabled:true,reward:s.limits.stepRewardAd,limit:10}};
 w.notices??=[];w.delivery??={enabled:true,dailyCap:3,quietStart:22,quietEnd:8,invalidToken:false};
 w.invite??={inviterReward:5000,inviteeReward:5000,perInviter:10,totalCap:1000000,condition:'phone',budget:'自社負担',decisions:[]};
 return w;
}
export const memberId=s=>s.accountAuth?.active||s.accountAuth?.guestId||'demo';
export function members(s){initAccounts(s);syncAccount(s);return [{id:s.accountAuth.guestId,name:'ゲスト',status:'active',data:s.accountAuth.guest},...Object.values(s.accountAuth.accounts)];}
export function memberState(s,id){
 if(id===memberId(s))return s;
 const m=members(s).find(m=>m.id===id);if(!m)throw Error('会員IDが見つかりません。');
 return {...s,...m.data,user:m.data.user};
}
export const now=s=>s.date+'T'+(s.operatorTime||'12:00');
export function previewMissionClaim(s,{task,count,video}){
 const w=workflows(s),target=w.missions.conditions[task]||1;
 if(count<target)return '達成条件に届いていません。付与しません。';
 if(w.missions.videoRequired[task]&&video!=='complete')return '動画が完了していないため受け取れません。';
 const date=Number((s.operatorTime||'12:00').slice(0,2))<w.missions.resetHour?new Date(Date.parse(s.date+'T00:00Z')-86400000).toISOString().slice(0,10):s.date;
 const key=date+':'+task;w.missions.previewClaims??=[];
 if(w.missions.previewClaims.includes(key))return date+'のこのタスクは受取済みです。二重付与しません。';
 w.missions.previewClaims.push(key);return date+'の受取を確認しました（テスト用。アプリの残高は変更しません）。';
}
export function auditOperation(s,actor,system,label,before,after,result='成功'){
 workflows(s).audit.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),actor,system,label,before:structuredClone(before??null),after:structuredClone(after??null),result});
}
export function resultKey(r){return [r.asp,r.cvId,r.stage||'-'].join(':');}
export function validateResult(s,r){
 if(!r.asp?.trim()||!r.cvId?.trim())return 'ASPと成果IDが必要です。';
 const offer=s.nacs.offers.find(o=>o.id===r.offerId);if(!offer)return '案件IDが見つかりません。';
 if(!members(s).some(m=>m.id===r.memberId))return '会員IDが未照合です。';
 const click=s.nacs.clicks.find(c=>c.id===r.clickId)||s.nacs.clickArchive?.[r.clickId];
 if(!click||click.offerId!==r.offerId||click.memberId!==r.memberId)return 'クリックID・会員・案件の組み合わせが一致しません。';
 if(!['judging','approved','rejected'].includes(r.status))return '状態はjudging / approved / rejectedです。';
 if(!Number.isSafeInteger(Number(r.amount))||Number(r.amount)<0)return '報酬は0以上の整数です。';
 if(!Number.isFinite(Date.parse(r.updatedAt)))return 'ASP更新日時が不正です。';
 if(offer.sur&&!offer.sur[Number(r.stage)-1])return 'SURは1から始まる段階番号を指定してください。';
 if(!offer.sur&&r.stage)return '通常案件には段階を指定しません。';
 const old=workflows(s).results.find(x=>x.key===resultKey(r));
 if(old&&(old.offerId!==r.offerId||old.memberId!==r.memberId||old.clickId!==r.clickId))return '同一成果の会員・案件・クリックは変更できません。';
 return '';
}
export function ingestResult(s,input,{correction=false,reason=''}={}){
 const error=validateResult(s,input);if(error)throw Error(error);
 const w=workflows(s),r={...input,amount:Number(input.amount),key:resultKey(input)},old=w.results.find(x=>x.key===r.key);
 if(old){
  if(Date.parse(r.updatedAt)<Date.parse(old.updatedAt))return '古いデータのため反映なし';
  if(old.status===r.status&&old.amount===r.amount){old.updatedAt=r.updatedAt;return '重複のため反映なし';}
  if(Date.parse(r.updatedAt)===Date.parse(old.updatedAt))throw Error('同一更新日時で内容が異なるため確認が必要です。');
  if(['approved','rejected'].includes(old.status)&&(!correction||!reason.trim()))throw Error('確定・否認済みです。訂正として理由を入力してください。');
 }
 const history=old?.history||[];history.push({at:now(s),before:old?{status:old.status,amount:old.amount,updatedAt:old.updatedAt}:null,after:{status:r.status,amount:r.amount,updatedAt:r.updatedAt},reason});
 if(old)Object.assign(old,r,{history});else w.results.push({...r,history});
 const event={id:crypto.randomUUID(),workflowKey:r.key,type:r.status,cvId:r.cvId,offerId:r.offerId,offerName:s.nacs.offers.find(o=>o.id===r.offerId).name,memberId:r.memberId,stage:r.stage?Number(r.stage)-1:null,amount:r.amount,at:now(s),status:'queued',result:'',desc:reason||'成果連携',revision:r.updatedAt};
 s.nacs.notifications.unshift(event); // Result and outbox are saved by the caller in one localStorage write.
 const personal=memberState(s,r.memberId),caseId='linked:'+r.key;
 let c=personal.user.cases.find(c=>c.id===caseId);
 if(!c){c={id:caseId,offerId:r.offerId,name:event.offerName,rewardMode:'flat',paidStages:0};personal.user.cases.push(c);}
 Object.assign(c,{status:r.status,reward:r.amount,base:r.amount,date:r.updatedAt,condition:r.stage?'段階 '+r.stage:'成果条件達成',workflowKey:r.key,stage:r.stage});
 return old?'訂正・更新を反映しました':'新しい成果を記録しました';
}
export function receiveWorkflowEvent(s,n){
 const w=workflows(s),requestId='grant:'+n.workflowKey,old=w.grants.find(g=>g.requestId===requestId);
 if(old&&Date.parse(old.revision)>=Date.parse(n.revision))return 'duplicate';
 if(n.type!=='approved'){
  if(old){old.revision=n.revision;old.aspStatus=n.type;old.status=old.status==='credited'?'correction-needed':'cancelled';}
  return '判定状態を同期';
 }
 if(old?.status==='credited'||old?.status==='correction-needed'){
  if(old.amount!==n.amount||old.aspStatus!=='approved'){old.status='correction-needed';old.aspStatus=n.type;old.revision=n.revision;return '付与済みのため差額確認が必要';}
  return 'duplicate';
 }
 if(n.amount<=0)return 'zero';
 const row={requestId,key:n.workflowKey,cvId:n.cvId,stage:n.stage===null?'':String(n.stage+1),memberId:n.memberId,offerId:n.offerId,amount:n.amount,aspStatus:'approved',revision:n.revision,status:'pending',reason:'',transactionId:''};
 if(old)Object.assign(old,row);else w.grants.push(row);return 'registered';
}
export function processGrant(s,id,decision,reason){
 if(!reason?.trim())throw Error('処理理由を入力してください。');
 const g=workflows(s).grants.find(x=>x.requestId===id);if(!g)throw Error('付与依頼が見つかりません。');
 if(g.status==='credited')return '処理済みのため再付与なし';
 if(!['pending','failed'].includes(g.status))throw Error('付与済み訂正・却下・取消は再付与できません。');
 if(decision==='reject'){g.status='rejected';g.reason=reason;return '却下しました';}
 const current=workflows(s).results.find(r=>r.key===g.key);
 if(!current||current.status!=='approved'||current.amount!==g.amount)throw Error('最新のASP判定・金額と一致しません。通知を再同期してください。');
 const personal=memberState(s,g.memberId);ensurePointAccount(personal);
 creditPoints(personal,{requestId:g.requestId,title:'案件を達成して獲得',amount:g.amount,category:'AFFILIATE',desc:g.cvId+(g.stage?' 段階'+g.stage:'')});
 g.status='credited';g.transactionId=g.requestId;g.reason=reason;syncAccount(s);return 'ポイント台帳に反映しました';
}
export function parseResultsCSV(text){
 const lines=[];let row=[],value='',quoted=false;text=text.replace(/^\uFEFF/,'');
 for(let i=0;i<=text.length;i++){const c=text[i]??'\n';if(c==='"'){if(quoted&&text[i+1]==='"'){value+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(value.replace(/\r$/,'').trim());value='';if(c==='\n'){if(row.some(Boolean))lines.push(row);row=[];}}else value+=c;}
 if(quoted)throw Error('CSVの引用符が閉じていません。');
 const headers=lines.shift();
 const required=['asp','cvId','clickId','memberId','offerId','stage','status','amount','updatedAt'];
 if(!required.every(x=>headers?.includes(x)))throw Error('CSVヘッダーをサンプルと同じ項目にしてください。');
 if(new Set(headers).size!==headers.length)throw Error('CSVの列名が重複しています。');
 return lines.map((values,i)=>{if(values.length!==headers.length)throw Error((i+2)+'行目の列数が合いません。');return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));});
}
export function saveBundle(s,d){
 const w=workflows(s),ids=[...new Set(d.offerIds)];
 if(!d.name?.trim()||!ids.length)throw Error('バンドル名と案件を指定してください。');
 if(ids.some(id=>!s.nacs.offers.some(o=>o.id===id)))throw Error('存在しない案件が含まれています。');
 if(w.bundles.some(b=>b.id!==d.id&&b.offerIds.some(id=>ids.includes(id))))throw Error('選択した案件は別のバンドルに登録されています。');
 if(!ids.includes(d.selectedId))throw Error('バンドル内から掲載案件を1件選んでください。');
 if(!Number.isSafeInteger(d.rank)||d.rank<0)throw Error('順位は0以上の整数です。');
 const locked=s.nacs.governance?.[w.bundles.find(b=>b.id===d.id)?.selectedId]?.locked;
 if(locked&&w.bundles.find(b=>b.id===d.id).selectedId!==d.selectedId)throw Error('営業ロック中の掲載案件は切り替えできません。');
 const item={...d,offerIds:ids,id:d.id||crypto.randomUUID()};const at=w.bundles.findIndex(b=>b.id===item.id);if(at<0)w.bundles.push(item);else w.bundles[at]=item;return item;
}
export function bundleCandidates(s){const used=new Set(workflows(s).bundles.flatMap(b=>b.offerIds)),groups=new Map();for(const o of s.nacs.offers.filter(o=>!used.has(o.id))){const key=o.name.normalize('NFKC').replace(/[\s・]/g,'').toLowerCase();groups.set(key,[...(groups.get(key)||[]),o]);}return [...groups.values()];}
export function bundleEligible(s,o){const w=s.operatorWorkflows;if(!w)return true;const b=w.bundles.find(b=>b.offerIds.includes(o.id));if(!b)return true;const filter=w.bundleFilter||{};return b.enabled&&b.selectedId===o.id&&(!filter.genre||b.genre===filter.genre)&&(!filter.tag||b.tags.includes(filter.tag));}
export function bundleRank(s,id){return s?.operatorWorkflows?.bundles.find(b=>b.selectedId===id)?.rank??100000;}
export function operationFailures(s){
 const w=workflows(s),rows=w.incidents.filter(r=>r.status!=='resolved');
 for(const n of s.nacs.notifications.filter(n=>n.status!=='delivered'))rows.push({id:n.id,type:'成果通知',owner:'NACS運用',status:n.status,reason:n.result||'通知待ち',route:'../mock-nacs/#notifications'});
 for(const g of w.grants.filter(g=>['failed','correction-needed'].includes(g.status)))rows.push({id:g.requestId,type:'ポイント付与',owner:'ポイント運用',status:g.status,reason:g.reason||'ASP訂正と付与済み台帳の確認が必要',route:'#member-operations'});
 for(const m of members(s)){const p=memberState(s,m.id);for(const r of p.user.exchangeRequests||[])if(r.status!=='completed')rows.push({id:r.id,type:'交換',owner:'ポイント運用',status:r.status,reason:r.error||'送信待ち',route:'#member-operations'});}
 if(w.vc.error)rows.push({id:'vc',type:'VC成果取得',owner:'NACS運用',status:'failed',reason:w.vc.error,route:'../mock-nacs/#result-import'});
 return rows;
}
