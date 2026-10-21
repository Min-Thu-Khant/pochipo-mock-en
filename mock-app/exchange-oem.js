import {effectiveBalance,creditPoints} from './point-ledger.js';
import {exchangeAccount,connectExchange,createExchange,sendExchange} from './exchange-model.js';

// Local-only stand-ins for the provider's product list. These are not contracted
// product IDs/rates and must never be sent to a real ExchangeOEM endpoint.
export const oemProducts=[
 {id:'amazon',name:'Amazonギフトカード',kind:'gift'},
 {id:'paypay',name:'PayPayマネーライト',kind:'link'},
 {id:'dpoint',name:'dポイント',kind:'link'},
 {id:'bank',name:'銀行振込',kind:'bank'},
];
export const oemProduct=id=>oemProducts.find(p=>p.id===id);
export const oemDraft=s=>s.user.oemExchange??null;
export function selectOEMProduct(s,id){
 if(!oemProduct(id))throw Error('交換先を選び直してください。');
 const previous=oemDraft(s);
 const request=s.user.exchangeRequests?.find(r=>r.id===previous?.requestId);
 if(request&&!request.withdrawalStatus)throw Error('手続き中の交換を先に確認してください。');
 s.user.oemExchange={productId:id,amount:100};
 return s.user.oemExchange;
}
export function setOEMAmount(s,amount){
 const d=oemDraft(s);
 if(!d||!oemProduct(d.productId))throw Error('交換先を選び直してください。');
 if(s.user.exchangeRequests?.some(r=>r.id===d.requestId))throw Error('申請済みの交換内容は変更できません。');
 if(exchangeAccount(s).status!=='active')throw Error('ドットマネーの口座を利用できません。ヘルプをご確認ください。');
 if(!Number.isSafeInteger(amount)||amount<100||amount%100||amount>effectiveBalance(s))throw Error('交換可能ポイントの範囲内で、100pt以上・100pt単位で入力してください。');
 delete d.requestId;d.amount=amount;d.confirmed=true;
 return d;
}
export function depositOEM(s,id){
 const d=oemDraft(s);
 if(!d?.confirmed||!oemProduct(d.productId))throw Error('交換内容の確認からやり直してください。');
 // Keep one request ID, even if the response is lost or the user presses twice.
 d.requestId??=id;
 const r=createExchange(s,{id:d.requestId,amount:d.amount});
 r.productId??=d.productId;
 return sendExchange(s,r.id);
}
export function submitOEMDestination(s){
 const d=oemDraft(s),r=s.user.exchangeRequests?.find(x=>x.id===d?.requestId);
 if(!s.accountAuth?.active||!s.user.sms)throw Error('本人確認からやり直してください。');
 if(!r||r.status!=='completed')throw Error('マネーへの交換結果を先に確認してください。');
 if(r.withdrawalStatus)return r;
 const a=exchangeAccount(s);
 if(a.status!=='active')throw Error('口座の利用が停止されています。ドットマネーにお問い合わせください。');
 if(a.balance<r.money)throw Error('マネー残高が不足しています。');
 // Simulate submission only; do not claim a real gift/transfer has completed.
 a.balance-=r.money;r.withdrawalStatus='submitted';
 r.withdrawalReference='mock-withdrawal-'+r.id;
 return r;
}

export function createExchangeOEMUI({getState,save,go,render,button,esc,pt,accountUI,showModal,close,readInput}){
 const s=()=>getState();
 const action=(label,name,extra='')=>button(label,'oem-'+name,'btn primary wide',extra);
 const link=(label,to,cls='btn secondary wide')=>`<a class="${cls}" href="#${to}">${label}</a>`;
 const flow=(id,step='input')=>'exchange-flow/'+id+'/'+step;
 const draft=()=>oemDraft(s());
 const current=()=>s().user.exchangeRequests?.find(r=>r.id===draft()?.requestId);
 const summary=(d,p)=>`<div class="balance-lines"><div><span>交換先</span><b>${esc(p.name)}</b></div><div><span>利用するタメルコポイント</span><b>${pt(d.amount)}pt</b></div><div><span>ドットマネーへの交換額</span><b>${pt(d.amount/100)}マネー</b></div></div>`;
 const shell=(title,body)=>`<header class="oem-header"><button class="text-link" data-action="oem-exit">閉じる</button><b>ドットマネー</b><span>画面モック</span></header><main class="oem-page"><p class="oem-preview-note">ドットマネー提供画面の操作確認用です。実際の交換・送信は行いません。</p><h1>${title}</h1>${body}</main>`;
 const error=(message)=>showModal('手続きを確認してください',`<p role="alert">${esc(message)}</p>${button('閉じる','close','btn primary wide')}`);
 const guidance=()=>showModal('ドットマネーのヘルプ',`<p>口座の利用停止や交換先への反映についてはドットマネーへお問い合わせください。</p><p class="tiny">これは案内画面のモックです。問い合わせは送信しません。</p>${button('閉じる','close','btn primary wide')}`);
 function page(step='list',id){
  const a=exchangeAccount(s()),d=draft(),p=oemProduct(id),r=current();
  if(step==='list'){
   const resume=r&&!r.withdrawalStatus?link('手続き中の交換を確認',flow(d.productId,'result')):'';
   return shell('交換先を選ぶ',`<div class="oem-balance"><span>交換可能なタメルコポイント</span><strong>${pt(effectiveBalance(s()))}<small>pt</small></strong></div>${resume}<div class="oem-products">${oemProducts.map(p=>button(`<span>${esc(p.name)}</span><span aria-hidden="true">›</span>`,'oem-select','oem-product',`data-id="${p.id}" ${r&&!r.withdrawalStatus?'disabled':''}`)).join('')}</div><p class="tiny">掲載先は表示例です。交換先別のレート・最低交換額・手数料は、本番の契約設定に従います。</p>${link('タメルコに戻る','mypage','text-link')}<details class="oem-demo"><summary>モックの確認用データ</summary><p class="tiny">残高が足りない場合に、架空のポイントを追加できます。</p>${action('確認用の10,000ptを追加','demo-credit')}</details>`);
  }
  if(!p||!d||d.productId!==p.id)return shell('交換先を選び直してください',link('交換先一覧へ','exchange-destinations'));
  if(a.status==='unlinked')return shell('初めてご利用の方へ',`<p>${esc(p.name)}への交換には、ドットマネーの利用規約への同意と口座開設が必要です。</p><div class="oem-terms"><b>利用規約の確認（モック）</b><p>本番ではドットマネーの利用規約・プライバシーポリシーが表示されます。</p></div><label class="oem-check"><input type="checkbox" id="oem-agree">利用規約に同意する（モック）</label>${action('同意して口座を開設する','agree')}${link('交換先一覧に戻る','exchange-destinations')}`);
  if(a.status!=='active')return shell('口座を利用できません',`<p role="alert">${a.status.toLowerCase()==='frozen'?'この口座はマネーの利用が停止されています。マネー付与が可能な状態でも、交換先への手続きには進めません。':'ドットマネーの口座が利用できません。'}</p>${action('ヘルプを確認','help')}${link('交換先一覧に戻る','exchange-destinations')}`);
  if(r&&['input','confirm'].includes(step))step='result';
  if(step==='terms')step='input';
  if(step==='input')return shell('交換に使うポイントを入力',`<p class="oem-product-name">${esc(p.name)}</p><p>交換可能：${pt(effectiveBalance(s()))}pt</p><label class="exchange-input">タメルコポイント<input id="exchange-amount" type="number" inputmode="numeric" min="100" step="100" max="${effectiveBalance(s())}" value="${d.amount}"></label><p class="tiny">モック用設定：100pt＝1マネー、100pt以上・100pt単位。タメルコ→ドットマネーの手数料0円。</p>${action('交換内容を確認','review')}${link('交換先を選び直す','exchange-destinations')}`);
  if(step==='confirm')return shell('交換内容を確認',`${summary(d,p)}<p>確定するとタメルコポイントを消費し、ドットマネーに交換します。その後、${esc(p.name)}への交換手続きを続けます。</p>${action('確定して次へ','deposit')}${link('入力内容を修正',flow(p.id))}`);
  if(step==='result'){
   if(!r)return shell('交換を完了できませんでした',`<p>ポイントは消費されていません。内容をご確認のうえ、再度お試しください。</p>${link('入力画面へ戻る',flow(p.id))}`);
   if(r.status!=='completed')return shell('交換を受付中です',`${summary(r,p)}<p role="status">送信待ちです。タメルコポイントは交換用に消費済みです。同じ申請で再確認し、二重に消費しません。</p>${r.error?`<p role="alert">${esc(r.error)}</p>`:''}${action('同じ申請で再確認する','deposit')}${action('タメルコに戻る','exit')}`);
   if(r.withdrawalStatus)return shell('交換申請を受け付けました',`<p>${esc(p.name)}への申請を受け付けた状態のモックです。</p>${summary(r,p)}<p>交換先への反映完了とは異なります。</p><p class="tiny">実際のギフト発行・振込は行っていません。</p>${action('タメルコの履歴に戻る','exit')}`);
   return shell('マネーへの交換が完了しました',`${summary(r,p)}<div class="balance-lines"><div><span>交換後のタメルコ残高</span><b>${pt(effectiveBalance(s()))}pt</b></div><div><span>ドットマネー残高</span><b>${pt(a.balance)}マネー</b></div></div><p>続けて${esc(p.name)}への交換情報を確認してください。</p><p class="tiny">この時点では、交換先への交換は完了していません。</p>${link('交換先への手続きを続ける',flow(p.id,'destination'))}`);
  }
  if(step==='destination'&&r?.status==='completed'){
   if(r.withdrawalStatus)return page('result',id);
   const info=p.kind==='bank'?'振込先：モック銀行・テスト支店・普通 0000000（架空）':p.kind==='link'?`${p.name}の連携先：テストアカウント（架空）`:'ギフトの受け取り先：テストユーザー（架空）';
   return shell('交換先の情報を確認',`<p>${esc(p.name)}</p><div class="oem-terms"><p>${esc(info)}</p></div><p class="tiny">口座情報・外部ID連携はサンプルです。実情報は入力しないでください。</p>${p.id==='paypay'?'<p class="tiny">本番では外部アプリでのID連携後、元のアプリに戻って手続きを続けます。</p>':''}<label class="oem-check"><input type="checkbox" id="oem-destination-agree">交換先を確認しました（モック）</label>${action('交換申請する（モック）','submit')}${link('前の画面に戻る',flow(p.id,'result'))}`);
  }
  return shell('交換内容を確認してください',link('交換先一覧へ','exchange-destinations'));
 }
 function handle(name,id){
  if(!name.startsWith('oem-'))return false;
  if(name==='oem-exit'){accountUI.endExchange();close();go('points');return true;}
  if(!accountUI.exchangeAllowed()){close();go('exchange-destinations');return true;}
  try{
   if(name==='oem-help'){guidance();return true;}
   if(name==='oem-demo-credit'){creditPoints(s(),{requestId:'oem-demo-'+crypto.randomUUID(),title:'交換モック確認用ポイント',amount:10000});save();render();}
   if(name==='oem-select'){
    const previousCompleted=!!current()?.withdrawalStatus;
    selectOEMProduct(s(),id);save();
    // Browser back to the list must not reuse the previous exchange's SMS grant.
    if(previousCompleted)accountUI.endExchange();
    go(flow(id));
   }
   if(name==='oem-agree'){
    if(!readInput('oem-agree')?.checked)throw Error('利用規約への同意を確認してください。');
    connectExchange(s());save();go(flow(draft().productId));render();
   }
   if(name==='oem-review'){setOEMAmount(s(),Number(readInput('exchange-amount')?.value));save();go(flow(draft().productId,'confirm'));}
   if(name==='oem-deposit'){depositOEM(s(),crypto.randomUUID());save();go(flow(draft().productId,'result'));render();}
   if(name==='oem-submit'){
    if(!readInput('oem-destination-agree')?.checked)throw Error('交換先の確認にチェックを入れてください。');
    submitOEMDestination(s());save();go(flow(draft().productId,'result'));
   }
  }catch(e){save();error(e.message);}
  return true;
 }
 return {page,handle};
}
