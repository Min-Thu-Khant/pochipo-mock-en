// レシキャン接続前の架空データ。掲載設定と応募履歴だけをこのモックに保存する。
export const RECEIPT_KEY='tameruko-receipt-demo-v1';
export const campaigns=[
 ['cheese','まろやかクリームチーズ','こもれび乳業','乳',9000,'食品','全国のスーパー',true],
 ['tea','すっきり緑茶 600ml','日和茶房','茶',3000,'飲料','全国のコンビニ・スーパー',true],
 ['soap','やさしい泡ハンドソープ','暮らしラボ','泡',12000,'日用品','全国のドラッグストア',true],
 ['yogurt','朝のプレーンヨーグルト','こもれび乳業','乳',5000,'食品','全国のスーパー',true],
 ['coffee','ひと息ドリップコーヒー','日和珈琲','珈',8000,'飲料','全国のスーパー',true],
 ['cereal','果実のグラノーラ','朝日和フーズ','穀',10000,'食品','全国のスーパー',false],
 ['juice','しぼりたてオレンジ','日和果樹園','果',4000,'飲料','全国のスーパー',true]
].map(([id,name,brand,art,reward,category,stores,active])=>({id,name,brand,art,reward,category,stores,active,start:'2026-09-01',end:active?'2026-12-31':'2026-09-10',limit:id==='cheese'?5:1}));
export const initialReceipt=()=>({listing:campaigns.map((c,i)=>({id:c.id,enabled:i<5,ranking:true,limited:i<3})),applications:[],log:[]});
export function readReceipt(storage=localStorage){try{const s=JSON.parse(storage.getItem(RECEIPT_KEY));return s&&Array.isArray(s.listing)&&Array.isArray(s.applications)?s:initialReceipt()}catch{return initialReceipt()}}
export function writeReceipt(s,storage=localStorage){storage.setItem(RECEIPT_KEY,JSON.stringify(s));}
export function listed(s){return s.listing.filter(x=>x.enabled).map(x=>campaigns.find(c=>c.id===x.id)).filter(c=>c?.active);}
export function canApply(s,id){const c=campaigns.find(c=>c.id===id);return !!c&&listed(s).some(c=>c.id===id)&&s.applications.filter(a=>a.campaignId===id).length<c.limit;}
export function submitReceipt(s,id){if(!canApply(s,id))throw Error('現在このキャンペーンには応募できません。');const c=campaigns.find(c=>c.id===id);const a={id:'RC-'+(s.applications.length+1).toString().padStart(5,'0'),campaignId:id,name:c.name,reward:c.reward,status:'pending',at:new Date().toISOString()};s.applications.unshift(a);return a;}
export function moveListing(s,id,delta){const i=s.listing.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=s.listing.length)return;[s.listing[i],s.listing[j]]=[s.listing[j],s.listing[i]];}
export function progressReceipt(s,id,to){const a=s.applications.find(a=>a.id===id);const allowed={pending:['approved','rejected'],approved:['credited']};if(!a||!allowed[a.status]?.includes(to))return false;a.status=to;return true;}
export const statusLabels={pending:'判定中',approved:'承認・付与待ち',credited:'付与済み',rejected:'否認'};

export function receiptAreas(s){if(!s.areas)s.areas={top:[{id:'ranking',name:'人気のランキング',ids:s.listing.filter(x=>x.ranking!==false).map(x=>x.id)},{id:'limited',name:'期間限定！',ids:s.listing.filter(x=>x.limited??['cheese','tea','soap'].includes(x.id)).map(x=>x.id)}],category:[{id:'all',name:'すべて',auto:true,ids:[]},...['食品','飲料','日用品'].map((name,i)=>({id:'cat-'+i,name,ids:campaigns.filter(c=>c.category===name).map(c=>c.id)}))]};return s.areas;}
export function tabProducts(s,t){return t?.auto?listed(s):(t?.ids||[]).map(id=>listed(s).find(c=>c.id===id)).filter(Boolean);}
