// Reuse the wallet's available width, including when the wallet is not mounted.
export function syncWideActionWidth(){
 const scroll=document.querySelector('.phone-scroll');
 if(!scroll)return;
 const root=document.documentElement,style=getComputedStyle(root);
 const outer=parseFloat(style.getPropertyValue('--mypage-page-inset'))||16;
 const inner=parseFloat(style.getPropertyValue('--mypage-wallet-inset'))||20;
 const width=Math.max(0,scroll.clientWidth-2*(outer+inner));
 if(width)root.style.setProperty('--ds-wide-action-width',width+'px');
}
