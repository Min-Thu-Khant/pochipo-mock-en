import {receiptLinkExists} from './receipt-options.js';
export function isWebUrl(value){if(typeof value!=='string'||!/^https?:\/\//i.test(value)||/[\u0000-\u0020]/.test(value))return false;try{const url=new URL(value);return !!url.hostname&&!url.username&&!url.password;}catch{return false;}}
export function bannerHref(route){return isWebUrl(route)?route:/^(?:challenges|(?:offer|feature|receipt|receipt-lp|receipt-cm)\/[a-zA-Z0-9-]+)$/.test(route)?'#'+route:'#';}
export function deepLinkUrl(route,adminUrl){if(isWebUrl(route))return route;const url=new URL('../mock-app/',adminUrl);url.hash=route;return url.href;}
export function resolveBannerLink(state,value,adminUrl){
 let route=String(value||'').trim();
 if(/^https?:/i.test(route)){if(!isWebUrl(route))throw Error('http:// または https:// で始まる正しいURLを入力してください。');const url=new URL(route),app=new URL('../mock-app/',adminUrl);if(url.origin!==app.origin||url.pathname.replace(/\/$/,'')!==app.pathname.replace(/\/$/,'')||url.search||!/^#(?:challenges$|(?:offer|feature|receipt|receipt-lp|receipt-cm)\/)/.test(url.hash))return {to:route,destination:null};route=url.hash.slice(1);}
 else route=route.replace(/^#/,'');
 if(route==='challenges')return {to:route,destination:null};
 const match=/^(offer|feature|receipt|receipt-lp|receipt-cm)\/([a-zA-Z0-9-]+)$/.exec(route);if(!match)throw Error('リンク先のURL（http://・https://）またはアプリ内リンクを入力してください。');
 const [_,kind,id]=match;const target=kind.startsWith('receipt')?receiptLinkExists(kind,id):(kind==='offer'?state.nacs?.offers:state.features)?.find(x=>x.id===id);if(!target)throw Error('リンク先の案件・特集ページが見つかりません。');
 return {to:route,destination:kind==='offer'?id:null};
}
