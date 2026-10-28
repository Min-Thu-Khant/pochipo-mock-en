import {bundleOffers,offerAttributes} from './f03-display.js';
export const POINT_SERVICES=[['mile','マイル'],['vpoint','Vポイント'],['rakuten','楽天'],['paypay','PayPay'],['dpoint','dポイント']];
export const HOME_RECOMMEND_SECTIONS=[['notice','新着アンケート通知'],['banner','最上部バナー'],['points','ポイント・マイル'],['pointUp','期間限定ポイントアップ！'],['missions','デイリーミッション'],['popular','人気案件'],['challenges','チャレンジボーナス'],['surveys','アンケート'],['recommended','おすすめ案件']];
export const HOME_BUNDLE_SECTIONS=['pointUp','popular','challenges','recommended'];
export const HOME_FIXED_SECTIONS=['notice','banner','points'];
export function homeBundleSections(settings){return settings.sections.filter(row=>HOME_BUNDLE_SECTIONS.includes(row.key)||row.kind==='offers').map(row=>row.key);}
export function homeSectionLimit(key){return key==='pointUp'?8:key==='challenges'?1000:6;}
export const validHomeDeepLink=value=>/^(#[a-z][^\s]*|[a-z][a-z0-9+.-]*:\/\/[^\s]+)$/i.test(value);
export function homePointLinkTarget(item){return item.destinationType==='offer-detail'?'#offer/'+encodeURIComponent(item.destination):item.destinationType==='custom-url'?item.destination:'#offers/'+encodeURIComponent('bundle:'+item.destination);}
export function defaultHomePointLinks(){const destinations={mile:'旅行',vpoint:'三井住友',rakuten:'楽天',paypay:'yahoo',dpoint:'dポイント',ponta:'Ponta'};return POINT_SERVICES.map(([id,label])=>({id,label,enabled:true,home:true,offers:true,sale:id==='vpoint',image:id==='mile'?'':'assets/quick-links/'+id+'.png',destinationType:id==='mile'?'custom-url':'affiliate-list',destination:id==='mile'?'#offers/'+encodeURIComponent('旅行'):destinations[id]}));}
export function homeRecommendSettings(state){
 const saved=state.homeRecommendation||{};
 const oldOrder=(saved.pointServices??POINT_SERVICES.map(([id])=>id)).filter(id=>id!=='ponta'),defaults=defaultHomePointLinks(),pointLinks=(saved.pointLinks??[...oldOrder.map(id=>defaults.find(item=>item.id===id)).filter(Boolean),...defaults.filter(item=>!oldOrder.includes(item.id))].map(item=>({...item,enabled:oldOrder.includes(item.id)}))).filter(item=>item.id!=='ponta').map(item=>({...item,home:item.home??!!item.enabled,offers:item.offers??!!item.enabled,sale:item.sale??item.id==='vpoint'}));
 const sections=(saved.sections? saved.sections.map(row=>({...row})):HOME_RECOMMEND_SECTIONS.map(([key,label],i)=>({key,title:key==='notice'?'アプリ限定の新着アンケートが届いています':label,enabled:true,order:i+1,start:'',end:'',bundleAttribute:'',offerOrder:[]}))).map(row=>({...row,moreLink:row.moreLink??({missions:'#home/daily',challenges:'#home/challenge',surveys:'#surveys'}[row.key]||'#offers')}));
 return {missionsEnabled:saved.missionsEnabled??true,pointsEnabled:saved.pointsEnabled??sections.find(row=>row.key==='points')?.enabled??true,campaignEnabled:saved.campaignEnabled??true,campaignLine1:saved.campaignLine1??'ドットマネーへの',campaignLine2:saved.campaignLine2??'交換手数料ゼロ',pointServices:oldOrder,pointLinks,bubbles:saved.bubbles??[{sectionKey:'pointUp',text:'最高還元',position:1},{sectionKey:'pointUp',text:'最高還元',position:4}],calloutAttribute:saved.calloutAttribute??'',sections};
}
export function recommendBundleOffers(offers,settings,key){const attribute=settings.sections.find(row=>row.key===key)?.bundleAttribute?.trim();return attribute?sortHomeOffers(bundleOffers(offers,attribute),settings.sections.find(row=>row.key===key)?.offerOrder):[];}
export function sortHomeOffers(offers,order=[]){const ranks=new Map(order.map((id,index)=>[id,index]));return offers.map((offer,index)=>({offer,index})).sort((a,b)=>(ranks.get(a.offer.id)??Infinity)-(ranks.get(b.offer.id)??Infinity)||a.index-b.index).map(row=>row.offer);}
export function recommendChallengeSlots(offers,settings,slots){const ids=new Set(recommendBundleOffers(offers,settings,'challenges').map(o=>o.id)),order=settings.sections.find(row=>row.key==='challenges')?.offerOrder||[];return sortHomeOffers(slots.filter(slot=>ids.has(slot.destination)).map(slot=>({...slot,id:slot.destination,slot})),order).map(row=>row.slot);}
export function recommendCallout(offer,settings){return !!settings.calloutAttribute&&offerAttributes(offer).includes(settings.calloutAttribute);}
export function homeBubbleText(settings,sectionKey,index){return (settings.bubbles||[]).find(row=>row.sectionKey===sectionKey&&row.position===index+1)?.text||'';}
export function recommendSectionStatus(row,date){return !row.enabled?'停止中':row.start&&row.start>date?'予約中':row.end&&row.end<date?'掲載終了':'公開中';}
const validDate=value=>!value||/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function validateHomeRecommendSettings(value,offers){
 const next=structuredClone(value);
 for(const key of ['campaignLine1','campaignLine2']){next[key]=String(next[key]||'').trim();if(!next[key]||next[key].length>(key==='campaignLine1'?9:7))throw Error('吹き出しは1行目9文字、2行目7文字以内で入力してください。');}
 if(!Array.isArray(next.pointServices)||new Set(next.pointServices).size!==next.pointServices.length||next.pointServices.some(id=>!POINT_SERVICES.some(([key])=>key===id)))throw Error('ポイント・マイルの種類が不正です。');
 const links=next.pointLinks??defaultHomePointLinks();
 if(!Array.isArray(links)||new Set(links.map(row=>row.id)).size!==links.length)throw Error('企業アイコンのIDが重複しています。');
 for(const row of links){row.label=String(row.label||'').trim();row.destination=String(row.destination||'').trim();row.image=String(row.image||'').trim();if(!row.id||!row.label||row.label.length>20)throw Error('入口の表示名は1〜20文字で入力してください。');if(!['affiliate-list','offer-detail','custom-url'].includes(row.destinationType)||!row.destination)throw Error('入口の遷移先種別と遷移先を入力してください。');if(row.destinationType==='offer-detail'&&offers&&!offers.some(o=>o.id===row.destination))throw Error('案件詳細の案件IDが見つかりません。');if(row.destinationType==='custom-url'&&!/^(https?:\/\/[^\s]+|#[a-z][^\s]*)$/i.test(row.destination))throw Error('遷移先は http://、https:// またはアプリ内の # で入力してください。');if(row.image&&!/^(https?:\/\/|data:image\/(png|jpeg|webp);base64,|assets\/)/i.test(row.image))throw Error('画像は画像URLまたはアップロードしたPNG・JPEG・WebPを設定してください。');}
 for(const row of links){row.home=row.home??!!row.enabled;row.offers=row.offers??!!row.enabled;row.enabled=row.home||row.offers;if(typeof row.home!=='boolean'||typeof row.offers!=='boolean')throw Error('表示先をチェックで指定してください。');}const homeCount=links.filter(row=>row.home).length,offersCount=links.filter(row=>row.offers).length;if(homeCount>5||offersCount>5||homeCount+offersCount>10)throw Error('企業アイコンはホーム・お得それぞれ5件、合計10チェックまでです。');next.pointLinks=links;
 for(const row of links)if(row.callout!==undefined){row.callout=String(row.callout).trim();if(row.callout.length>20)throw Error('吹き出し文言は20文字以内で入力してください。');}
 next.calloutAttribute=String(next.calloutAttribute||'').trim();if(next.calloutAttribute.length>80)throw Error('バンドル属性は80文字以内で入力してください。');
 const sections=next.sections||homeRecommendSettings({}).sections;
 if(sections.length<3||sections.length>35||new Set(sections.map(row=>row.key)).size!==sections.length||HOME_FIXED_SECTIONS.some(key=>!sections.some(row=>row.key===key))||sections.some(row=>!HOME_RECOMMEND_SECTIONS.some(([key])=>key===row.key)&&(!/^slot-[a-z0-9-]+$/.test(row.key)||row.kind!=='offers')))throw Error('表示枠の構成が不正です。');
 const orders=new Set();
 for(const row of sections){row.moreLink=String(row.moreLink||'#offers').trim();if(!validHomeDeepLink(row.moreLink))throw Error('もっと見るのディープリンクを正しく入力してください。');row.offerOrder=row.offerOrder??[];if(!Array.isArray(row.offerOrder)||new Set(row.offerOrder).size!==row.offerOrder.length||row.offerOrder.some(id=>typeof id!=='string'||!id))throw Error('案件の並び順が不正です。');row.title=String(row.title||'').trim();row.bundleAttribute=String(row.bundleAttribute||'').trim();if(!row.title||row.title.length>40)throw Error('掲載枠名は1〜40文字で入力してください。');if(row.bundleAttribute.length>80)throw Error('バンドル属性は80文字以内で入力してください。');if(!Number.isInteger(row.order)||row.order<1||row.order>sections.length||orders.has(row.order))throw Error('枠の表示順は1〜9の重複しない整数で入力してください。');orders.add(row.order);if(!validDate(row.start)||!validDate(row.end)||row.start&&row.end&&row.start>row.end)throw Error('掲載期間は正しい日付で、開始日が終了日以前になるよう入力してください。');}
 const bubbles=next.bubbles??[];
 if(!Array.isArray(bubbles)||bubbles.length>32)throw Error('吹き出しは32件以内で設定してください。');
 const bubblePositions=new Set();
 for(const bubble of bubbles){bubble.text=String(bubble.text||'').trim();if(!homeBundleSections({sections}).includes(bubble.sectionKey))throw Error('吹き出しの対象掲載枠を選択してください。');if(!bubble.text||bubble.text.length>20)throw Error('吹き出し文言は1〜20文字で入力してください。');const max=homeSectionLimit(bubble.sectionKey);if(!Number.isInteger(bubble.position)||bubble.position<1||bubble.position>max)throw Error('吹き出しを表示する案件の位置を選択してください。');const key=bubble.sectionKey+':'+bubble.position;if(bubblePositions.has(key))throw Error('同じ掲載枠の同じ位置には、吹き出しを1件だけ設定してください。');bubblePositions.add(key);}
 next.bubbles=bubbles;
 next.sections=sections;
 // The sources are attributes; remove legacy per-offer selections on save.
 for(const key of ['pointUpOfferIds','popularOfferIds','recommendedOfferIds','calloutOfferIds'])delete next[key];
 return next;
}
