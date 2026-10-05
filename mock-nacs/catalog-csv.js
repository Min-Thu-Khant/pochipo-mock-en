export function normalizeASPCatalog(r){
 if(!('ASP案件ID' in r))return r;
 const lines=v=>String(v||'').replace(/\\n/g,'\n').split(/\r?\n/).filter(Boolean);
 const parse=(v,price)=>lines(v).map(line=>{const m=line.match(/^(\d+)[：:](.*)$/);if(!m)throw Error('StepUpの番号・内容を確認してください。');const value=price?Number(m[2].replace(/[円,\s]/g,'')):m[2];if(price&&(!Number.isFinite(value)||value<=0))throw Error('StepUp単価を確認してください。');return {order:Number(m[1]),value};});
 const conditions=parse(r['StepUpミッション'],false),prices=parse(r['単価'],true);
 if(conditions.length!==prices.length||new Set(conditions.map(x=>x.order)).size!==conditions.length||new Set(prices.map(x=>x.order)).size!==prices.length||conditions.some(c=>!prices.some(p=>p.order===c.order)))throw Error('StepUpミッションと単価の番号が一致しません。');
 if(!['amount','rate'].includes(r['手数料種別']))throw Error('手数料種別はamountまたはrateを指定してください。');
 for(const k of ['Web','iOS','Android','インストール案件'])if(!/^(true|false)$/i.test(r[k]||''))throw Error(`${k}はtrueまたはfalseを指定してください。`);
 const sur=conditions.sort((a,b)=>a.order-b.order).map(c=>({label:c.value,gross:prices.find(p=>p.order===c.order).value}));
 if(sur.length&&r['手数料種別']!=='amount')throw Error('StepUp案件の手数料種別を確認してください。');
 return {asp:({skyflag:'SKYFLAG',skyfall:'SKYFLAG',valuecommerce:'ValueCommerce',janet:'JANet',tg:'Rakuten TG'})[r.ASP.toLowerCase()]||r.ASP,aspId:r['ASP案件ID'],requestedBundleId:r['バンドルID'],name:r['案件名'],overview:r['概要'],condition:r['成果条件'],rejectCondition:r['否認条件'],achievementTime:r['達成目安時間'],rewardType:sur.length?'sur':r['手数料種別']==='rate'?'rate':'flat',gross:Number(r['手数料']),commissionLimitType:r['手数料上限種別'],commissionLimit:r['手数料上限'],platforms:[['Web','web'],['iOS','ios'],['Android','android']].filter(([key])=>r[key].toLowerCase()==='true').map(([,value])=>value),install:r['インストール案件'].toLowerCase()==='true',trackingUrl:r['トラッキングURL'],imageUrls:lines(r['画像URL']),sourceStart:r['開始日時'],sourceEnd:r['終了日時'],category:'アプリ',categoryUnassigned:true,sur,sourceFields:{...r}};
}
