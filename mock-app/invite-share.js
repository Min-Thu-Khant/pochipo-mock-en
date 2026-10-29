export const inviteShareData=code=>({title:'タメルコの友達招待',text:`タメルコの招待コード：${code}\n招待が成立すると、お互いに特典ポイントがもらえます。`});

export async function shareInvite({code,navigator,showFallback}){
 const data=inviteShareData(code);
 if(typeof navigator.share==='function'){
  try{await navigator.share(data);return 'shared';}
  catch(error){if(error.name==='AbortError')return 'cancelled';}
 }
 showFallback(data);
 return 'fallback';
}

export function inviteShareMenu({code,esc,button}){
 const data=inviteShareData(code),text=encodeURIComponent(data.text);
 const destinations=[
  ['LINE',`https://line.me/R/share?${text}`],
  ['X',`https://twitter.com/intent/tweet?text=${text}`],
  ['メール',`mailto:?subject=${encodeURIComponent(data.title)}&body=${text}`]
 ];
 return `<div class="invite-share-menu"><p>共有先を選んでください。</p><div class="invite-share-destinations">${destinations.map(([label,url])=>`<a class="invite-share-destination" href="${esc(url)}" ${label==='メール'?'':'target="_blank" rel="noopener noreferrer"'}><span aria-hidden="true">${label==='メール'?'メール':label}</span><b>${label}で送る</b></a>`).join('')}</div><p class="invite-share-message">${esc(data.text)}</p>${button('招待メッセージをコピーする','copy-invite-message','btn secondary wide')}${button('キャンセル','close','text-link wide')}</div>`;
}
