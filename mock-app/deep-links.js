export function deepLinkUrl(route,adminUrl){const url=new URL('../mock-app/',adminUrl);url.hash=route;return url.href;}
export function resolveBannerLink(state,value,adminUrl){
 let route=String(value||'').trim();
 if(/^https?:\/\//i.test(route)){let url;try{url=new URL(route);}catch{throw Error('URLを確認してください。');}const app=new URL('../mock-app/',adminUrl);if(url.origin!==app.origin||url.pathname.replace(/\/$/,'')!==app.pathname.replace(/\/$/,'')||url.search)throw Error('このアプリで発行した案件・特集ページのURLを貼り付けてください。');route=url.hash.slice(1);}
 else route=route.replace(/^#/,'');
 const match=/^(offer|feature)\/([a-zA-Z0-9-]+)$/.exec(route);if(!match)throw Error('案件または特集ページのディープリンクを入力してください。');
 const [_,kind,id]=match;const target=(kind==='offer'?state.nacs?.offers:state.features)?.find(x=>x.id===id);if(!target)throw Error('リンク先の案件・特集ページが見つかりません。');
 return {to:route,destination:kind==='offer'?id:null};
}
