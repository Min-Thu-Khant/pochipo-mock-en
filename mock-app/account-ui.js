import {checkInvite,applyInvite} from './operation-settings.js';
import {checkSession} from './account-model.js';
import {AD_PROVIDER,demographicsMarkup,parentalConsentMarkup,registerDemographics,confirmParentalConsent,needsDemographics,isMinor,genderLabels} from './demographics.js';
import {DEMO_CODE,currentAccount,findAccount,activateAccount,logoutAccount,withdrawAccount} from './account-model.js';

export function createAccountUI({getState,save,render,go,button,icon,esc,toast,showModal,close,nav}){
 let draft={},flow=null,error='',busy=false,returnTo='mypage',lastComplete='',mode='signup',identity,intent=null,exchangeGrant=null,exchangeReturn=null;
 let demographicDraft={},demographicError='',parentalChecked=false;
 let showGuestStart=sessionStorage.getItem('pochipo-auth-guest-entry')!=='hidden';
 function setGuestStart(visible){showGuestStart=visible;sessionStorage.setItem('pochipo-auth-guest-entry',visible?'shown':'hidden');}
 const providers=['LINE','Apple','Google'];
 const protectedScreens=new Set(['edit','logout','withdraw','invite','invite-done']);
 const state=()=>getState();
 const btn=(text,action,cls='btn primary wide',extra='')=>`<button type="button" class="${cls}" data-auth="${action}" ${extra}>${text}</button>`;
 const link=(text,route,cls='text-link')=>`<a class="${cls}" href="#${route}">${text}</a>`;
 const field=(name,label,type='text',extra='')=>`<label class="account-field" for="account-${name}">${label}<input id="account-${name}" name="${name}" type="${type}" value="${esc(draft[name]||'')}" ${extra} aria-describedby="account-error" ${error?'aria-invalid="true"':''}></label>`;
 const submit=(label)=>`<button class="btn primary wide" type="submit" ${busy?'disabled':''}>${busy?'確認しています…':label}</button>`;
 const form=(kind,html,label)=>`<form data-account-form="${kind}" novalidate>${html}<p id="account-error" class="account-error" role="alert">${esc(error)}</p>${submit(label)}</form>`;
 const head=(title,back='back')=>`<header class="app-header account-header">${btn(icon('back'),back,'icon-button','aria-label="戻る"')}<h1>${title}</h1><span class="icon-button"></span></header>`;
 const shell=(title,html,back='back')=>head(title,back)+`<main class="account-page" aria-busy="${busy}">${html}</main>`;
 const h=(title,description='')=>`<div class="account-intro"><h2>${title}</h2>${description?`<p>${description}</p>`:''}</div>`;
 const errorBox=()=>`<p id="account-error" class="account-error" role="alert">${esc(error)}</p>`;
 function navigate(route){error='';go(route);render();document.querySelector('.phone-scroll')?.scrollTo(0,0);}
 function start(target='signup',origin){setGuestStart(origin==='home');flow=null;draft={};error='';mode=target==='login'?'login':'signup';returnTo=origin||((location.hash||'#mypage').slice(1).startsWith('auth')?'mypage':(location.hash||'#mypage').slice(1));navigate('auth/start');}
 function providerButtons(){return `<div class="account-providers">${providers.map(provider=>btn(`<img src="./assets/auth/${provider.toLowerCase()}.${provider==='Google'?'png':'svg'}" alt=""><span>${provider}で続ける</span>`,'provider',`btn provider-button provider-${provider.toLowerCase()} wide`,`data-provider="${provider}"`)).join('')}</div>`;}
 function page(path){
 const [root,step='start']=path;
 if(root==='onboarding'){
  const n=Math.min(2,Math.max(1,Number(step)||1));
  const slides=[['earn-coral.png','自分に合ったお仕事でポイントを貯めよう。<br>「これならできる！」がきっと見つかる。'],['exchange-borderless.png','ポイントをためて、現金や好きなサービスに交換しよう。']];
  const exchangeCallout=n===2?'<p class="onboarding-exchange-callout"><span class="onboarding-callout-mark" aria-hidden="true">＼</span><span class="onboarding-callout-gap-third" aria-hidden="true"> </span><span class="onboarding-callout-fee">手数料無料</span><span class="onboarding-callout-gap-half" aria-hidden="true"> </span><span class="onboarding-callout-connector">で</span><span class="onboarding-callout-gap-half" aria-hidden="true"> </span>まるごとおトク<span class="onboarding-callout-mark" aria-hidden="true">／</span></p>':'';
  const message=n===1?`<span class="onboarding-earn-copy">${slides[0][1]}</span>`:slides[1][1];
  return `<main class="onboarding-page"><div class="onboarding-top"><span class="sr-only">2ページ中${n}ページ</span>${btn('スキップ','finish-onboarding','text-link')}</div><div class="onboarding-art${n===2?' onboarding-art--exchange':''}">${exchangeCallout}<img src="./assets/onboarding/${slides[n-1][0]}" alt="${['日常の活動でポイントをためる','ポイントを現金や各種サービスに交換する','自分に合ったポイ活の方法を見つける'][n-1]}"></div><div class="onboarding-message${n===1?' onboarding-message--earn':''}">${message}</div><div class="onboarding-footer">${btn(n===2?'次へ':'次へ',n===2?'finish-onboarding':'slide','btn primary wide',`data-step="${n+1}"`)}${n>1?btn('戻る','slide','text-link',`data-step="${n-1}"`):''}</div></main>`;
 }
 if(root==='account'){
  const a=currentAccount(state());
  if(step==='demographics')return demographicsMarkup({profile:state().demographics,draft:demographicDraft,esc,button,error:demographicError});
  if(step==='parental-consent')return parentalConsentMarkup({button,icon,checked:parentalChecked,error:demographicError,esc});
  if(protectedScreens.has(step)&&!a)return shell('アカウント',h('ログインしてください','ご本人の情報を確認するには、再度ログインが必要です。')+btn('ログインする','login')+btn('ゲストとして戻る','guest','text-link wide'));
  if(step==='profile'||step==='edit')return head('アカウント情報','profile-exit')+`<main class="member-info-page"><section><h2>アカウント</h2><div class="member-info-lines"><p>ユーザーID：${esc(a?.id||state().accountAuth.guestId)}</p><p>登録方法：${a?(a.provider==='email'?'メールアドレス':esc(a.provider)):'未登録'}</p><p>電話番号（下4桁）：${a?.phone?esc(a.phone.slice(-4)):'未登録'}</p></div></section>${a?`<div class="member-info-actions">${btn('ログアウト','logout-confirm','btn member-logout wide')}${btn('アカウント削除','withdraw-about','btn member-danger wide')}</div>`:''}</main>${nav()}`;
  if(step==='invite')return shell('招待コードを入力',h('友達からの招待', '友達から受け取った招待コードを入力してください。')+form('invite',field('inviteCode','招待コード','text','maxlength="32"'),'入力内容を確認する'),'exit');
  if(step==='invite-done')return shell('招待コードの確認',h('入力内容を確認しました')+`<p>招待コード：${esc(state().user.inviteCode||'')}</p><p>電話番号：●●●●●●●${esc(a.phone?.slice(-4)||'')}</p><p class="account-hint">招待特典 ${state().user.inviteApplied?.amount||0}ptを獲得しました。</p>`+btn('マイページへ','exit'),'exit');
  if(step==='logout')return shell('ログアウト',h('ログアウトしますか？','ポイントと履歴はアカウントに保存されます。同じ登録方法でログインすると、続きから利用できます。')+btn('ログアウトする','logout')+link('キャンセル','account/profile','text-link wide'));
  if(step==='withdraw')return shell('退会手続き',h('退会前にご確認ください')+`<div class="account-warning"><p>退会すると、このアカウントを利用できなくなります。</p><ul><li>保有・準備中のポイントは失効します。</li><li>会員向けの通知と新しいポイント付与が停止します。</li><li>退会したアカウントには再ログインできません。</li></ul><b>現在のポイント：${(state().user.approved+state().user.pending).toLocaleString()}pt</b></div>`+form('withdraw',`<label class="account-check"><input name="agree" type="checkbox" ${draft.agree?'checked':''}>上記の内容を確認し、退会を申請します</label>`,'退会を申請する')+link('退会しない','account/profile','text-link wide'));
 }
 if(root!=='auth')return '';
 if(step==='start')return shell('会員登録・ログイン',(showGuestStart&&!intent?btn('さっそくはじめる','guest'):'')+(intent?'<p class="account-required" role="status">この操作には会員登録が必要です。</p>':'')+'<div class="account-signin-options"><p class="account-signin-bubble">すでにアカウントをお持ちの方は、<br>ログインしてから遊んでください！</p><p class="account-hint">ゲストでためたポイントは、新規会員登録時に引き継がれます。登録済みのアカウントにログインする場合は引き継がれません。</p>'+providerButtons()+'</div>','exit');
 if(step==='provider')return shell(`${flow?.provider||''}で${mode==='signup'?'登録':'ログイン'}`,h('利用するアカウントを確認',`${esc(flow?.provider||'')}のアカウントで続けます。`)+`<div class="account-provider-card"><b>${esc(flow?.provider||'')} デモアカウント</b><p>${esc(flow?.email||'')}</p></div>`+form('provider',mode==='signup'?`<label class="account-check"><input type="checkbox" name="agree" ${draft.agree?'checked':''}>利用規約・プライバシーポリシーに同意する</label>`:'','このアカウントで続ける')+btn('キャンセル','cancel-provider','text-link wide'));
 if(step==='phone')return shell(flow?.kind==='invite'?'電話番号の登録':'交換時の本人確認',h(flow?.kind==='invite'?'電話番号を登録してください':'SMSで本人確認',flow?.kind==='invite'?'友達からの招待を受けるには、初回のみ電話番号の登録が必要です。':'SMSを受信できる携帯電話番号を入力してください。')+form('phone',field('phone','携帯電話番号','tel','autocomplete="tel" placeholder="09012345678"'),flow?.kind==='invite'?'登録して進む':'認証コードを送信'));
 if(step==='sms')return shell('本人確認',h('本人確認のため、SMS認証をしてください。',`●●●●●●●${esc(flow?.phone?.slice(-4)||'')}宛に送信した6桁の認証コードを入力してください。`)+`<p class="account-hint">※SMSが届くまで5分程度かかることがあります</p>`+form('sms',field('code','認証コードを入力','text','inputmode="numeric" autocomplete="one-time-code" maxlength="6"'),'認証して進む')+btn('認証コードを再送する','resend','text-link wide','data-channel="sms"')+`<div class="account-help"><h3>認証コードが届かない場合</h3><ul><li>電話番号に間違いがないかご確認ください。</li><li>${btn('別の電話番号を使う','change-phone','text-link')}</li><li>送信に時間がかかる場合があります。しばらくお待ちください。</li></ul>${btn('解決しない場合','help','text-link')}</div>`);
 if(step==='exchange-complete')return head('本人確認','cancel-exchange')+`<main class="account-page exchange-auth-complete"><div class="account-success"><img src="./assets/onboarding/verified-organic.png" width="260" height="174" alt=""><h2>本人確認が完了しました</h2>${btn('ドットマネー交換に進む','exchange-continue')}</div></main>`;
 if(step==='complete')return shell('登録・ログイン完了',`<div class="account-success"><img src="./assets/onboarding/verified-organic.png" width="260" height="174" alt=""><h2>${esc(lastComplete||'本人確認が完了しました')}</h2>${btn('さっそくはじめる','done')}</div>`,'done');
 if(step==='withdrawn')return shell('退会完了',h('退会を受け付けました','会員・ポイント・通知を停止しました。ご利用ありがとうございました。')+btn('ゲストとしてホームへ','guest'),'guest');
 return shell('会員登録・ログイン',h('もう一度お試しください')+btn('登録・ログインへ','login'));
 }
 function issue(){flow.issuedAt=Date.now();flow.attempts=0;draft.code='';}
 function verify(){if(!flow)throw Error('登録・ログインからやり直してください。');if(flow.attempts>=5)throw Error('入力回数の上限に達しました。コードを再送してください。');if(Date.now()-flow.issuedAt>300000)throw Error('認証コードの有効期限が切れました。再送してください。');flow.attempts++;if(draft.code!==DEMO_CODE)throw Error('認証コードが正しくありません。もう一度入力してください。');}
 const identityKey=()=>state().accountAuth.active+':'+state().accountAuth.sessionValid;
 const isExchange=path=>path.startsWith('exchange-');
 function newMember(){return {id:state().accountAuth.guestId,provider:flow.provider,email:flow.email,phone:'',status:'active',notifications:true};}
 function finish(account,isNew=false){activateAccount(state(),account,{newAccount:isNew});flow=null;draft={};identity=identityKey();state().accountAuth.onboarded=true;save();lastComplete=isNew?'会員登録が完了しました':'ログインしました';const resume=intent;intent=null;navigate(resume||'auth/complete');}
 function beginExchange(target){exchangeGrant=null;flow={kind:'exchange',target,phone:currentAccount(state())?.phone||''};draft={};if(flow.phone){issue();return 'auth/sms';}return 'auth/phone';}
 function endExchange(){exchangeGrant=null;exchangeReturn=null;state().user.sms=false;save();}
 async function submitForm(kind){
  if(busy)return;busy=true;error='';document.querySelector('[data-account-form] button[type="submit"]')?.setAttribute('disabled','');
  try{
   if(kind==='provider'){
    if(!providers.includes(flow?.provider))throw Error('登録方法を選び直してください。');
    const a=findAccount(state(),flow.email,flow.provider);
    if(a?.status==='withdrawn')throw Error('このアカウントは退会済みです。');
    if(!a&&!draft.agree)throw Error('規約への同意が必要です。');
    finish(a||newMember(),!a);
   }else if(kind==='phone'){const phone=(draft.phone||'').replace(/[\s-]/g,'');if(!/^0[789]0\d{8}$/.test(phone))throw Error('11桁の携帯電話番号を入力してください。');if(!currentAccount(state()))throw Error('ログインしてください。');flow.phone=phone;if(flow.kind==='invite'){currentAccount(state()).phone=phone;applyInvite(state(),state().user.inviteCode);save();flow=null;draft={};navigate('account/invite-done');}else{issue();navigate('auth/sms');}}
   else if(kind==='sms'){verify();if(flow.kind!=='exchange'||!currentAccount(state()))throw Error('交換からやり直してください。');currentAccount(state()).phone=flow.phone;exchangeGrant=currentAccount(state()).id;state().user.sms=true;exchangeReturn=flow.target;flow=null;draft={};save();navigate('auth/exchange-complete');}
   else if(kind==='invite'){const code=(draft.inviteCode||'').trim();checkInvite(state(),code);state().user.inviteCode=code;save();if(currentAccount(state()).phone){applyInvite(state(),code);save();navigate('account/invite-done');}else{flow={kind:'invite'};draft={};navigate('auth/phone');}}
   else if(kind==='withdraw'){if(!draft.agree)throw Error('退会後の取り扱いを確認してください。');withdrawAccount(state(),currentAccount(state())?.id);flow=null;draft={};save();navigate('auth/withdrawn');}
  }catch(e){error=e.message;}
  finally{busy=false;render();if(error)document.querySelector('#account-error')?.scrollIntoView({block:'nearest'});}
 }
 async function action(el){const a=el.dataset.auth;if(busy)return;
  if(a==='profile-exit'){navigate('mypage');}
  else if(a==='profile-back'){navigate('account/profile');}
  else if(a==='exchange-continue'){if(exchangeGrant===currentAccount(state())?.id&&exchangeReturn)navigate(exchangeReturn);else navigate('points');}
  else if(a==='cancel-exchange'){endExchange();navigate('points');}
  else if(a==='logout-confirm')showModal('本当にログアウトしますか？',btn('ログアウトする','logout','btn member-danger wide')+button('キャンセル','close','text-link wide'));
  else if(a==='withdraw-about')showModal('アカウント削除について','<p>持っているポイントやデータは削除され、復元できません。会員向けの通知も停止します。</p>'+button('キャンセル','close','btn primary wide')+btn('アカウント削除へすすむ','withdraw-open','text-link wide'));
  else if(a==='withdraw-open'){close();navigate('account/withdraw');}
  else if(a==='slide')navigate('onboarding/'+el.dataset.step);
  else if(a==='finish-onboarding'){if(state().demographics?.confirmedAt){start('signup','home');}else{state().demographics={...state().demographics,required:true};demographicDraft={};demographicError='';parentalChecked=false;save();navigate('account/demographics');}}
  else if(a==='login')start('login','mypage');
  else if(a==='provider'){if(!providers.includes(el.dataset.provider))return;flow={provider:el.dataset.provider,email:el.dataset.provider.toLowerCase()+'.demo@example.com'};mode=findAccount(state(),flow.email,flow.provider)?'login':'signup';draft={};navigate('auth/provider');}
  else if(a==='cancel-provider'){flow=null;draft={};navigate('auth/start');}
  else if(a==='change-phone'){draft.code='';navigate('auth/phone');}
  else if(a==='resend'){if(!flow)return;const wait=30-Math.floor((Date.now()-flow.issuedAt)/1000);if(wait>0){error=`再送するにはあと${wait}秒お待ちください。`;render();return;}issue();error='';render();toast('認証コードを再送しました。');}
  else if(a==='done'){flow=null;draft={};navigate(returnTo.startsWith('auth')||returnTo.startsWith('account')?'mypage':returnTo);}
  else if(a==='guest'){flow=null;draft={};intent=null;exchangeGrant=null;if(!state().accountAuth.sessionValid)logoutAccount(state());state().accountAuth.onboarded=true;save();navigate('home');}
  else if(a==='exit'){flow=null;draft={};intent=null;exchangeGrant=null;navigate(returnTo.startsWith('auth')||returnTo.startsWith('account')||isExchange(returnTo)?'mypage':returnTo);}
  else if(a==='back'){const step=location.hash.split('/')[1];const target={provider:'auth/start',phone:flow?.kind==='invite'?'account/invite':'points',sms:'points',logout:'account/profile',withdraw:'account/profile'}[step]||'auth/start';if(['auth/start','points','account/invite'].includes(target))flow=null;navigate(target);}
  else if(a==='logout'){setGuestStart(false);close();logoutAccount(state());flow=null;draft={};save();navigate('auth/start');mode='login';render();}
  else if(a==='terms')showModal('利用規約・プライバシーポリシー','<p>このモックの規約画面です。本番の規約・個人情報の取り扱いは公開前に確定します。</p>'+button('閉じる','close','btn primary wide'));
  else if(a==='help')showModal('認証コードが届かない場合','<p>電話番号とSMSの受信設定をご確認ください。受信できない場合は時間をおいて再送してください。</p>'+button('閉じる','close','btn primary wide'));
  else if(a==='demo-expire'){const auth=state().accountAuth;if(!currentAccount(state())){toast('ログイン中のときに確認できます。');return;}auth.expiresAt=state().date;flow=null;draft={};save();render();}
  else if(a==='expired-login'){close();start('login',(location.hash||'#home').slice(1));}
  else if(a==='demo-code-expire'){if(flow){flow.issuedAt=Date.now()-301000;toast('認証コードを期限切れにしました。');}}
  else if(a==='demo-resend-ready'){if(flow)flow.issuedAt=Date.now()-31000;toast('コードを再送できる状態にしました。');}
  else if(a==='demo-failure')showModal('本人確認できませんでした','<p>しばらく時間をおいてから、もう一度お試しください。</p>'+button('OK','close','btn primary wide'));
 }
 function finishDemographics(){state().accountAuth.onboarded=true;save();demographicDraft={};demographicError='';parentalChecked=false;start('signup','home');}
 document.addEventListener('input',e=>{
  const form=e.target.closest('[data-demographics-form]');
  if(form){demographicDraft[e.target.name]=e.target.value;const fields=new FormData(form);form.querySelector('[type="submit"]').disabled=!['year','month','day','gender'].every(k=>fields.get(k));}
  if(e.target.id==='parental-agree'){parentalChecked=e.target.checked;document.querySelector('[data-action="demographics-consent"]').disabled=!parentalChecked;document.querySelector('.parental-agreement').classList.toggle('checked',parentalChecked);}
 });
 document.addEventListener('submit',e=>{
  const form=e.target.closest('[data-demographics-form]');if(!form)return;e.preventDefault();demographicError='';
  try{if(state().demographics?.confirmedAt){finishDemographics();return;}demographicDraft=Object.fromEntries(new FormData(form));if(navigator.onLine===false)throw Error('登録できませんでした。通信環境を確認して、もう一度お試しください。');const minor=registerDemographics(state(),demographicDraft);parentalChecked=false;save();if(minor)navigate('account/parental-consent');else finishDemographics();}
  catch(error){demographicError=error.message;render();}
 });
 document.addEventListener('click',e=>{
  const el=e.target.closest('[data-action^="demographics-"]');if(!el)return;e.preventDefault();const action=el.dataset.action;
  if(action==='demographics-back'){parentalChecked=false;demographicError='';navigate('account/demographics');}
  if(action==='demographics-consent'){try{if(navigator.onLine===false)throw Error('同意を保存できませんでした。通信環境を確認して、もう一度お試しください。');confirmParentalConsent(state(),parentalChecked);finishDemographics();}catch(error){demographicError=error.message;render();}}
  if(action==='demographics-terms'||action==='demographics-privacy'){showModal(action==='demographics-terms'?'利用規約':'プライバシーポリシー','<p>この画面はモックです。正式な文書の掲載先は未設定です。</p>'+button('閉じる','close','btn primary wide'));}
 });
 document.addEventListener('click',e=>{const el=e.target.closest('[data-auth]');if(el){e.preventDefault();action(el);}});
 document.addEventListener('input',e=>{if(e.target.closest('[data-account-form]'))draft[e.target.name]=e.target.type==='checkbox'?e.target.checked:e.target.value;});
 document.addEventListener('submit',e=>{const form=e.target.closest('[data-account-form]');if(form){e.preventDefault();for(const [k,v] of new FormData(form))draft[k]=v;draft.agree=!!form.querySelector('[name="agree"]:checked');submitForm(form.dataset.accountForm);}});
 function prepare(path){if(checkSession(state()))save();if(state().accountAuth.expiredNotice)setTimeout(expiredNotice);
  const key=identityKey();if(identity!==undefined&&identity!==key){flow=null;draft={};demographicDraft={};demographicError='';parentalChecked=false;error='';exchangeGrant=null;}identity=key;
  const target=path.join('/'),a=currentAccount(state());
  if(path[0]==='auth'&&['email','mail','recover','new-password'].includes(path[1])){flow=null;draft={};return 'auth/start';}
  if(needsDemographics(state())&&!['account/demographics','account/parental-consent'].includes(target))return state().demographics.birthDate&&isMinor(state())?'account/parental-consent':'account/demographics';
  if(target==='account/parental-consent'&&(!state().demographics?.birthDate||!isMinor(state())))return 'account/demographics';
  if(path[0]==='auth'&&path[1]==='exchange-complete'&&(!a||exchangeGrant!==a.id||!exchangeReturn))return 'points';
  if(!isExchange(target)&&target!=='auth/exchange-complete'&&!(path[0]==='auth'&&flow?.kind==='exchange')){exchangeGrant=null;state().user.sms=false;}
  if((isExchange(target)||path[0]==='invite'||(path[0]==='account'&&['invite','invite-done'].includes(path[1])))&&!a){setGuestStart(false);intent=target;returnTo='mypage';mode='signup';flow=null;return 'auth/start';}
  if(isExchange(target)&&exchangeGrant!==a?.id)return beginExchange(target);
  if(path[0]==='account'&&path[1]==='edit')return 'account/profile';
  if(path[0]==='auth'&&['phone','sms','provider'].includes(path[1])&&!flow)return 'auth/start';
  if(path[0]==='auth'&&path[1]==='complete'&&!lastComplete)return 'auth/start';
  if(!state().accountAuth.sessionValid&&!['auth','onboarding'].includes(path[0]))return 'auth/start';
  return null;
 }
 function expiredNotice(){const auth=state().accountAuth;if(!auth.expiredNotice)return;delete auth.expiredNotice;save();showModal('ログインの有効期限が切れました','<p>最後のログインから半年が経過したため、ログアウトしました。ポイントと履歴はアカウントに保存されています。もう一度ログインすると、続きから利用できます。</p>'+btn('ログインする','expired-login')+button('ゲストのまま使う','close','text-link wide'));}
 function demo(){return `<details class="account-demo"><summary>会員登録・認証の確認</summary><p>架空の情報で操作してください。SMS・外部ログインの実通信はありません。</p><p>SMSコード：<b>${DEMO_CODE}</b><br>Google・Apple・LINEのいずれかで新規登録した後、同じ方法でログインを確認できます。</p>${link('オンボーディングから確認','onboarding/1','btn secondary wide')}<p>広告連携先：${AD_PROVIDER}のみ（SDK未接続）</p>${link('生年月日・性別の確認','account/demographics','btn secondary wide')}${link('アカウント情報','account/profile','btn secondary wide')}<p>ログインの有効期限：${currentAccount(state())?esc(state().accountAuth.expiresAt||'')+'まで（最後のログインから半年）':'未ログイン'}</p>${btn('最後のログインから半年経過させる','demo-expire','btn secondary wide')}${btn('コード期限切れ','demo-code-expire','btn secondary wide')}${btn('再送待ちを終了','demo-resend-ready','btn secondary wide')}${btn('本人確認の通信失敗','demo-failure','btn secondary wide')}</details>`;}
 return {page,start,prepare,demo,endExchange,exchangeAllowed:()=>!!currentAccount(state())&&exchangeGrant===currentAccount(state()).id,isScreen:path=>['auth','account','onboarding'].includes(path[0])};
}
