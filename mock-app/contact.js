// Illustrative choices only; taxonomy and fields will be agreed with EDOCODE.
// In-memory draft only. No submission, history API or external transmission.
export const contactTypes=[
 {id:'points',label:'ポイントについて',details:[['missing','準備中ポイントが反映されない'],['pending','判定中のままになっている'],['rejected','否認と判定された'],['conditions','ポイント付与条件について']]},
 {id:'usage',label:'機能の使い方について',details:[['operation','操作方法について'],['other','その他の使い方について']]},
];
export const createContactDraft=()=>({confirmed:false,type:'',detail:'',visit:'',message:''});
export const contactDraft=createContactDraft();
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function updateContactDraft(draft,field,value){
 if(field==='confirmed'){draft.confirmed=value===true;return;}
 if(field==='type'){
  if(!contactTypes.some(t=>t.id===value))return;
  if(draft.type!==value){draft.detail='';draft.visit='';draft.message='';}
  draft.type=value;return;
 }
 const type=contactTypes.find(t=>t.id===draft.type);
 if(field==='detail'){
  if(!type?.details.some(([id])=>id===value))return;
  if(draft.detail!==value){draft.visit='';draft.message='';}
  draft.detail=value;return;
 }
 if(field==='visit'&&['','sample-visit'].includes(value))draft.visit=value;
 if(field==='message')draft.message=String(value);
}
export function contactNext(section,draft=contactDraft){
 if(!draft.confirmed)return null;
 if(section==='notice')return 'contact/type';
 const type=contactTypes.find(t=>t.id===draft.type);
 if(section==='type'&&type)return 'contact/detail';
 if(section==='detail'&&type?.details.some(([id])=>id===draft.detail))return 'contact/form';
 return null;
}
export function contactPage(section,{header,nav,button},draft=contactDraft){
 const type=contactTypes.find(t=>t.id===draft.type);
 const detail=type?.details.find(([id])=>id===draft.detail);
 if(['type','detail','form'].includes(section)&&!draft.confirmed)section=undefined;
 if(['detail','form'].includes(section)&&!type)section='type';
 if(section==='form'&&!detail)section='detail';
 const frame=(content,back)=>`${header('新規お問い合わせ',back)}<main class="contact-page">${content}</main>${nav()}`;
 const note='<p class="contact-note">種類・項目は仮の見本です。正式な内容はEDOCODE様との相談後に決定します。</p>';
 if(section==='type'||section==='detail'){
  const field=section==='type'?'type':'detail';
  const choices=field==='type'?contactTypes.map(t=>[t.id,t.label]):type.details;
  const title=field==='type'?'お問い合わせの種類をお選びください':'詳しいお問い合わせの種類をお選びください';
  const previous=field==='type'?'contact':'contact/type';
  return frame(`<section class="contact-card">${note}<fieldset class="contact-options"><legend>${title}<span class="contact-required">必須</span></legend>${choices.map(([id,label])=>`<label><input type="radio" name="contact-${field}" data-contact-field="${field}" value="${id}" ${draft[field]===id?'checked':''}><span>${esc(label)}</span></label>`).join('')}</fieldset></section>${button('次へ','contact-next','btn primary wide',`data-step="${field}" ${contactNext(field,draft)?'':'disabled'}`)}`,previous);
 }
 if(section==='form')return frame(`<section class="contact-card">${note}<h2>${esc(detail[1])}</h2>${type.id==='points'?`<label class="contact-field">訪問履歴 <span class="contact-required">必須（仮）</span><select data-contact-field="visit"><option value="">ご選択ください</option><option value="sample-visit" ${draft.visit==='sample-visit'?'selected':''}>サンプル案件（訪問履歴の表示見本）</option></select></label>`:''}<label class="contact-field">お問い合わせ内容<textarea data-contact-field="message" rows="6" placeholder="お問い合わせ内容をご入力ください">${esc(draft.message)}</textarea></label></section><p class="contact-note contact-hint">入力・遷移の確認用です。このモックから送信はできません。</p>${button('問い合わせ送信','contact-submit','btn primary wide','disabled')}`,'contact/detail');
 const list=section==='list';
 return `${header('お問い合わせ','mypage')}<nav class="sub-tabs" aria-label="お問い合わせメニュー"><a href="#contact" class="${list?'':'active'}" ${list?'':'aria-current="page"'}>新規お問い合わせ</a><a href="#contact/list" class="${list?'active':''}" ${list?'aria-current="page"':''}>お問い合わせ一覧</a></nav><main class="contact-page">${list?'<section class="contact-card contact-empty"><p>お問い合わせの記録はまだありません</p></section>':`<section class="contact-card" aria-labelledby="contact-notice-title"><h2 id="contact-notice-title">注意事項</h2><p>お問い合わせの前に、注意事項をご確認ください。</p><p class="contact-note">注意事項の内容は準備中です。EDOCODE様との相談後に掲載します。</p></section><label class="contact-confirm"><input type="checkbox" id="contact-confirm" ${draft.confirmed?'checked':''}>注意事項を確認しました</label>${button('お問い合わせへ','contact-continue','btn primary wide',`${draft.confirmed?'':'disabled'} aria-describedby="contact-confirm-hint"`)}<p class="contact-note contact-hint" id="contact-confirm-hint">確認にチェックを入れると進めます。</p>`}</main>${nav()}`;
}
