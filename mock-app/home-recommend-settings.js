import {bundleOffers,offerAttributes} from './f03-display.js';
export const POINT_SERVICES=[['mile','マイル'],['vpoint','Vポイント'],['rakuten','楽天'],['paypay','PayPay'],['dpoint','dポイント'],['ponta','Ponta']];
export const HOME_RECOMMEND_SECTIONS=[['notice','新着アンケート通知'],['banner','最上部バナー'],['points','ポイント・マイル'],['pointUp','期間限定ポイントアップ！'],['missions','デイリーミッション'],['popular','人気案件'],['challenges','チャレンジボーナス'],['surveys','アンケート'],['recommended','おすすめ案件']];
export const HOME_BUNDLE_SECTIONS=['pointUp','popular','challenges','recommended'];
export function homePointLinkTarget(item){return item.destinationType==='offer-detail'?'#offer/'+encodeURIComponent(item.destination):item.destinationType==='custom-url'?item.destination:'#offers/'+encodeURIComponent('bundle:'+item.destination);}
export function defaultHomePointLinks(){const destinations={mile:'旅行',vpoint:'三井住友',rakuten:'楽天',paypay:'yahoo',dpoint:'dポイント',ponta:'Ponta'};return POINT_SERVICES.map(([id,label])=>({id,label,enabled:true,image:id==='mile'?'':'assets/quick-links/'+id+'.png',destinationType:id==='mile'?'custom-url':'affiliate-list',destination:id==='mile'?'#offers/'+encodeURIComponent('旅行'):destinations[id]}));}
export function homeRecommendSettings(state){
 const saved=state.homeRecommendation||{};
 const oldOrder=saved.pointServices??POINT_SERVICES.map(([id])=>id),defaults=defaultHomePointLinks(),pointLinks=saved.pointLinks??[...oldOrder.map(id=>defaults.find(item=>item.id===id)).filter(Boolean),...defaults.filter(item=>!oldOrder.includes(item.id))].map(item=>({...item,enabled:oldOrder.includes(item.id)}));
 return {campaignEnabled:saved.campaignEnabled??true,campaignLine1:saved.campaignLine1??'ドットマネーへの',campaignLine2:saved.campaignLine2??'交換手数料ゼロ',pointServices:saved.pointServices??POINT_SERVICES.map(([id])=>id),pointLinks,bubbles:saved.bubbles??[{sectionKey:'pointUp',text:'最高還元',position:1},{sectionKey:'pointUp',text:'最高還元',position:4}],calloutAttribute:saved.calloutAttribute??'',sections:HOME_RECOMMEND_SECTIONS.map(([key,label],i)=>({key,title:key==='notice'?'アプリ限定の新着アンケートが届いています':label,enabled:true,order:i+1,start:'',end:'',bundleAttribute:'',...(saved.sections||[]).find(row=>row.key===key)}))};
}
export function recommendBundleOffers(offers,settings,key){const attribute=settings.sections.find(row=>row.key===key)?.bundleAttribute?.trim();return attribute?bundleOffers(offers,attribute):[];}
export function recommendCallout(offer,settings){return !!settings.calloutAttribute&&offerAttributes(offer).includes(settings.calloutAttribute);}
export function homeBubbleText(settings,sectionKey,index){return (settings.bubbles||[]).find(row=>row.sectionKey===sectionKey&&row.position===index+1)?.text||'';}
export function recommendSectionStatus(row,date){return !row.enabled?'停止中':row.start&&row.start>date?'予約中':row.end&&row.end<date?'掲載終了':'公開中';}
const validDate=value=>!value||/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validateHomeRecommendSettings(value,offers){
 const next=structuredClone(value);
 for(const key of ['campaignLine1','campaignLine2']){next[key]=String(next[key]||'').trim();if(!next[key]||next[key].length>(key==='campaignLine1'?9:7))throw Error('吹き出しは1行目9文字、2行目7文字以内で入力してください。');}
 if(!Array.isArray(next.pointServices)||new Set(next.pointServices).size!==next.pointServices.length||next.pointServices.some(id=>!POINT_SERVICES.some(([key])=>key===id)))throw Error('ポイント・マイルの種類が不正です。');
 const links=next.pointLinks??defaultHomePointLinks();
 if(!Array.isArray(links)||links.length>12||new Set(links.map(row=>row.id)).size!==links.length)throw Error('ポイント・マイルの入口は重複しない12件以内で設定してください。');
 for(const row of links){row.label=String(row.label||'').trim();row.destination=String(row.destination||'').trim();row.image=String(row.image||'').trim();if(!row.id||!row.label||row.label.length>20)throw Error('入口の表示名は1〜20文字で入力してください。');if(!['affiliate-list','offer-detail','custom-url'].includes(row.destinationType)||!row.destination)throw Error('入口の遷移先種別と遷移先を入力してください。');if(row.destinationType==='offer-detail'&&offers&&!offers.some(o=>o.id===row.destination))throw Error('案件詳細の案件IDが見つかりません。');if(row.destinationType==='custom-url'&&!/^(https?:\/\/[^\s]+|#[a-z][^\s]*)$/i.test(row.destination))throw Error('遷移先は http://、https:// またはアプリ内の # で入力してください。');if(row.image&&!/^(https?:\/\/|data:image\/(png|jpeg|webp);base64,|assets\/)/i.test(row.image))throw Error('画像は画像URLまたはアップロードしたPNG・JPEG・WebPを設定してください。');}
 next.pointLinks=links;
 next.calloutAttribute=String(next.calloutAttribute||'').trim();if(next.calloutAttribute.length>80)throw Error('バンドル属性は80文字以内で入力してください。');
 const sections=next.sections||homeRecommendSettings({}).sections;
 if(sections.length!==HOME_RECOMMEND_SECTIONS.length||new Set(sections.map(row=>row.key)).size!==sections.length||sections.some(row=>!HOME_RECOMMEND_SECTIONS.some(([key])=>key===row.key)))throw Error('表示枠の構成が不正です。');
 const orders=new Set();
 for(const row of sections){row.title=String(row.title||'').trim();row.bundleAttribute=String(row.bundleAttribute||'').trim();if(!row.title||row.title.length>40)throw Error('掲載枠名は1〜40文字で入力してください。');if(row.bundleAttribute.length>80)throw Error('バンドル属性は80文字以内で入力してください。');if(!Number.isInteger(row.order)||row.order<1||row.order>sections.length||orders.has(row.order))throw Error('枠の表示順は1〜9の重複しない整数で入力してください。');orders.add(row.order);if(!validDate(row.start)||!validDate(row.end)||row.start&&row.end&&row.start>row.end)throw Error('掲載期間は正しい日付で、開始日が終了日以前になるよう入力してください。');}
 const bubbles=next.bubbles??[];
 if(!Array.isArray(bubbles)||bubbles.length>32)throw Error('吹き出しは32件以内で設定してください。');
 const bubblePositions=new Set();
 for(const bubble of bubbles){bubble.text=String(bubble.text||'').trim();if(!HOME_BUNDLE_SECTIONS.includes(bubble.sectionKey))throw Error('吹き出しの対象掲載枠を選択してください。');if(!bubble.text||bubble.text.length>20)throw Error('吹き出し文言は1〜20文字で入力してください。');const max={pointUp:8,popular:6,recommended:6,challenges:1000}[bubble.sectionKey];if(!Number.isInteger(bubble.position)||bubble.position<1||bubble.position>max)throw Error('吹き出しを表示する案件の位置を選択してください。');const key=bubble.sectionKey+':'+bubble.position;if(bubblePositions.has(key))throw Error('同じ掲載枠の同じ位置には、吹き出しを1件だけ設定してください。');bubblePositions.add(key);}
 next.bubbles=bubbles;
 next.sections=sections;
 // The sources are attributes; remove legacy per-offer selections on save.
 for(const key of ['pointUpOfferIds','popularOfferIds','recommendedOfferIds','calloutOfferIds'])delete next[key];
 return next;
}
