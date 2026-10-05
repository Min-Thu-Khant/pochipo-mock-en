import {normalizeASPCatalog} from './catalog-csv.js';
import {saveNacsOffer,nacsAudit,saveAdvertiser,OFFER_CATEGORIES} from './model.js';
export function intake(s){return s.nacs.intake??={catalogs:[],bundles:[],blocked:[]};}
export const awaitingReview=c=>['審査待ち','バンドル候補登録済み'].includes(c.status);
export function candidates(s,row){return intake(s).bundles.filter(b=>b.id===row.requestedBundleId||b.catalogIds.some(id=>{const c=intake(s).catalogs.find(c=>c.id===id);return c&&c.asp===row.asp&&c.aspId===row.aspId;})||b.keywords.some(k=>row.name.toLowerCase().includes(k.toLowerCase())));}
export function createBundle(s,v){
 if(!v.name?.trim())throw Error('バンドル名を入力してください。');
 const b={id:'bundle-'+crypto.randomUUID().slice(0,8),name:v.name.trim(),keywords:(v.keywords||[]).filter(Boolean),tags:v.tags||[],catalogIds:[],selectedId:null,active:false,payoutRate:85,start:s.date,end:'2027-12-31'};
 intake(s).bundles.push(b);nacsAudit(s,'バンドルを作成',b.name);return b;
}
export function updateBundleBox(s,id,v){const b=intake(s).bundles.find(b=>b.id===id);if(!b||!v.name.trim())throw Error('バンドル名を入力してください。');Object.assign(b,{name:v.name.trim(),keywords:v.keywords,tags:v.tags});nacsAudit(s,'バンドルを更新',b.name);}
export function addCatalogs(s,rows){
 const clean=rows.map(r=>({...r,name:String(r.name||'').trim(),aspId:String(r.aspId||'').trim(),gross:Number(r.gross),rewardType:['rate','sur'].includes(r.rewardType)?r.rewardType:'flat'}));
 for(const r of clean){if(!r.name||!r.aspId||!['SKYFLAG','ValueCommerce','JANet','Rakuten TG','ASP A','ASP B','ASP C'].includes(r.asp)||!Number.isFinite(r.gross)||r.gross<=0||(r.rewardType==='rate'&&r.gross>100)||!OFFER_CATEGORIES.includes(r.category)||!r.condition?.trim())throw Error('案件名・ASP・ASP案件ID・正の報酬額・カテゴリ・成果条件を確認してください。');}
 const m=intake(s);let added=0;
 for(const r of clean){const duplicate=m.catalogs.some(c=>['name','aspId','asp','gross','category','condition'].every(k=>c[k]===r[k])&&(c.rewardType||'flat')===r.rewardType&&JSON.stringify(c.sourceFields||{})===JSON.stringify(r.sourceFields||{}));if(duplicate)continue;
 const blocked=m.blocked.some(b=>b.asp===r.asp&&b.aspId===r.aspId);m.catalogs.unshift({...r,id:crypto.randomUUID(),status:blocked?'自動却下':'バンドル候補登録済み',kind:m.catalogs.some(c=>c.asp===r.asp&&c.aspId===r.aspId)?'変更':'新規',at:s.date});added++;}
 nacsAudit(s,'カタログを入稿',`${added}件登録・${rows.length-added}件重複スキップ`);return added;
}
export function reviewCatalog(s,id,decision,bundleId='',name='',reason='',schedule={}){
 const m=intake(s),c=m.catalogs.find(c=>c.id===id);if(!c||!awaitingReview(c))throw Error('審査待ちの案件を選択してください。');
 if(decision==='approve'||decision==='reject'){
 if(decision==='approve'){const start=schedule.start||s.date,end=schedule.end||'';if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||(end&&(!/^\d{4}-\d{2}-\d{2}$/.test(end)||end<start)))throw Error('配信期間を確認してください。');}

 let b=m.bundles.find(b=>b.id===bundleId);
 if(!b){if(bundleId)throw Error('バンドルが見つかりません。');if(!name.trim())throw Error('新規バンドル名を入力してください。');b=createBundle(s,{name,keywords:[c.name],tags:[]});}
 c.bundleId=b.id;c.reason=reason.trim();if(decision==='approve'){b.catalogIds.push(c.id);if(!b.selectedId){b.selectedId=c.id;b.payoutRate=c.rewardType==='rate'?70:85;b.start=schedule.start||s.date;b.end=schedule.end||'';}c.start=schedule.start||s.date;c.end=schedule.end||'';c.status='審査済み';}else c.status='却下';
 }else if(decision==='block'){c.status=decision==='block'?'NG':'却下';c.reason=reason.trim();if(decision==='block'){if(!m.blocked.some(b=>b.asp===c.asp&&b.aspId===c.aspId))m.blocked.push({asp:c.asp,aspId:c.aspId,reason:reason.trim()});for(const row of m.catalogs)if(awaitingReview(row)&&row.asp===c.asp&&row.aspId===c.aspId)row.status='自動却下';}}
 else throw Error('審査結果が不正です。');nacsAudit(s,`カタログ${c.status}：${c.name}`,`${c.asp} / ${c.aspId} ${reason}`);return c;
}
export function saveBundle(s,id,v){
 const m=intake(s),b=m.bundles.find(b=>b.id===id);if(!b)throw Error('バンドルが見つかりません。');
 if(b.salesLocked&&v.salesLocked!==false&&v.selectedId!==b.selectedId)throw Error('営業ロックを解除してから掲載元を変更してください。');
 const wasLocked=!!b.salesLocked;
 const c=m.catalogs.find(c=>c.id===v.selectedId&&c.status==='審査済み'&&b.catalogIds.includes(c.id));if(!c)throw Error('審査済みの掲載案件を選択してください。');
 if(!v.name.trim()||!Number.isFinite(v.payoutRate)||v.payoutRate<0||v.payoutRate>100||!/^\d{4}-\d{2}-\d{2}$/.test(v.start)||(v.end&&(!/^\d{4}-\d{2}-\d{2}$/.test(v.end)||v.start>v.end)))throw Error('名称・還元率（0〜100%）・掲載期間を確認してください。');
 const advertiserId='adv-'+b.id;saveAdvertiser(s,{id:advertiserId,name:c.name+'（モック広告主）',asp:c.asp});
 saveNacsOffer(s,{id:b.id,name:v.name.trim(),category:c.category,advertiserId,rewardType:c.rewardType||'flat',gross:c.gross,grossRate:c.gross,sur:c.sur,payoutRate:v.payoutRate,condition:c.condition,platforms:c.platforms||['ios','android'],install:!!c.install,clickUrl:c.trackingUrl||'',rejectCondition:c.rejectCondition||'',achievementTime:c.achievementTime||'',sourceFields:c.sourceFields,commissionLimit:c.commissionLimit,commissionLimitType:c.commissionLimitType,start:v.start,end:v.end||'9999-12-31',active:v.active,description:c.overview||`${c.name}。${c.condition}`,sourceAsp:c.asp,sourceAspId:c.aspId});
 Object.assign(b,v);if(wasLocked!==!!b.salesLocked)nacsAudit(s,b.salesLocked?'営業ロックを設定':'営業ロックを解除',`${b.name} / ${c.asp} / ${c.aspId}`);nacsAudit(s,'バンドル掲載設定を保存',`${b.name} / ${c.asp} / ${c.aspId}`);
}
export function releaseBlock(s,asp,aspId){const m=intake(s);m.blocked=m.blocked.filter(b=>b.asp!==asp||b.aspId!==aspId);nacsAudit(s,'ASP案件IDのNGを解除',`${asp} / ${aspId}`);}
export function parseCatalogCSV(text){
 const records=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));records.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('CSVの引用符が閉じられていません。');if(cell||row.length){row.push(cell.replace(/\r$/,''));records.push(row);}
 const headers=records.shift()?.map(c=>c.replace(/^\uFEFF/,'').trim());const required=['asp','aspId','name','gross','category','condition'];if(!headers||(!headers.includes('ASP案件ID')&&required.some(k=>!headers.includes(k))))throw Error('モック用CSVテンプレートの列が必要です。');
 return records.filter(r=>r.some(c=>c.trim())).map(r=>normalizeASPCatalog(Object.fromEntries(headers.map((h,i)=>[h,r[i]||'']))));
}

// 既存の入稿・設定を残したまま、一度だけ比較用サンプルを追加する。
export function ensureBundleSample(s){
 const m=intake(s);if(m.sampleVersion>=1)return;
 const id='bundle-sample-credit';
 if(!m.bundles.some(b=>b.id===id)){
 const rows=['A','B','C'].map((letter,i)=>({id:`sample-credit-${letter.toLowerCase()}`,asp:`ASP ${letter}`,aspId:`${letter}-CARD-001`,name:'サンプルクレジットカード',gross:[8000,10000,9000][i],category:'金融',condition:'新規カード発行後、翌月末までに1回利用',status:'審査済み',at:s.date,bundleId:id}));
 m.catalogs.push(...rows);m.bundles.push({id,name:'サンプルクレジットカード',keywords:['サンプルクレジットカード'],tags:['クレジットカード'],catalogIds:rows.map(c=>c.id),selectedId:rows[1].id,active:false,payoutRate:85,start:s.date,end:'2027-12-31',sample:true});
 }m.sampleVersion=1;
}
