import {icon,esc,jellyIcon,celebration} from './components.js';
let returnFocus,noticeTimer;
export const reduced=()=>document.body.dataset.reduced==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches;
export function notify(text){const el=document.querySelector('#bj-notice');el.textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.textContent='',3500);}
export function openDialog(title,body){
 const el=document.querySelector('#bj-dialog');returnFocus=document.activeElement;
 el.innerHTML=`<div class="bj-dialog-close"><button data-bj="close" aria-label="閉じる">${icon('close')}</button></div><div class="bj-dialog-body">${title?`<h2>${esc(title)}</h2>`:''}${body}</div>`;
 el.setAttribute('aria-label',title||'ポイント獲得');if(!el.open)el.showModal();
}
export function initDialog(){const dialog=document.querySelector('#bj-dialog');dialog.addEventListener('close',()=>{if(returnFocus?.isConnected&&!returnFocus.disabled)returnFocus.focus();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});}
export function flyCoins(from,to){
 if(reduced()||!from||!to)return;
 const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
 for(let i=0;i<5;i++){
  const el=document.createElement('img');el.src=new URL('assets/coin.png',import.meta.url).href;el.alt='';el.className='bj-flying-coin';el.style.left=`${a.left+a.width/2-14}px`;el.style.top=`${a.top+a.height/2-14}px`;document.body.append(el);
  el.animate([{transform:'translate(0,0) scale(.65)',opacity:0},{offset:.2,transform:`translate(${(i-2)*13}px,-22px) scale(1)`,opacity:1},{transform:`translate(${b.left+b.width/2-a.left-a.width/2}px,${b.top+b.height/2-a.top-a.height/2}px) scale(.45)`,opacity:0}],{duration:640,delay:i*55,easing:'cubic-bezier(.2,.7,.35,1)'}).finished.finally(()=>el.remove());
 }
}
export function commonAction(el){const act=el.dataset.bj;
 if(act==='close'){document.querySelector('#bj-dialog').close();return true;}
 if(act==='celebrate'){openDialog('',celebration());return true;}
 if(act==='dice'){openDialog('チンチロ',`<p>既存のサイコロアイコンと、淡い緑の入口を引き継いでいます。今回はデザイン部品の見本です。</p><p>大当たり／あたり／ハズレの判定条件やポイント設定は、現行仕様で管理します。</p>`);return true;}
 if(act==='notice'){openDialog('お知らせ','<p>新しいお知らせはありません。</p>');return true;}
 if(act==='notify'){notify('押した操作を受け付けました');return true;}
 return false;
}
