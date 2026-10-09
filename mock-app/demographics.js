// Local mock only. Parental consent is not consent to advertising data processing.
export const AD_PROVIDER='AppLovin';
export const MINOR_AGE=18;
export const genderLabels={male:'男性',female:'女性',other:'その他'};
export function parseDemographics({year,month,day,gender},today){
 if(!/^\d{4}$/.test(String(year||''))||!/^\d{1,2}$/.test(String(month||''))||!/^\d{1,2}$/.test(String(day||'')))throw Error('生年月日を正しく入力してください。');
 const y=Number(year),m=Number(month),d=Number(day),date=new Date(Date.UTC(y,m-1,d));
 const birthDate=`${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
 if(y<1900||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d||birthDate>today)throw Error('実在する、今日以前の生年月日を入力してください。');
 if(!Object.hasOwn(genderLabels,gender))throw Error('性別を選択してください。');
 return {birthDate,gender};
}
export function ageOn(birthDate,today){if(!birthDate)return null;const [y,m,d]=birthDate.split('-').map(Number),[ty,tm,td]=today.split('-').map(Number);return ty-y-(tm<m||tm===m&&td<d?1:0);}
export const isMinor=s=>s.demographics?.birthDate?ageOn(s.demographics.birthDate,s.date)<MINOR_AGE:s.persona==='minor';
export function registerDemographics(s,values){
 if(s.demographics?.confirmedAt)throw Error('登録済みの生年月日と性別は変更できません。');
 const profile=parseDemographics(values,s.date);s.demographics={...profile,required:true,confirmedAt:null,parentalConsentAt:null};
 if(!isMinor(s))s.demographics.confirmedAt=new Date().toISOString();
 return isMinor(s);
}
export function confirmParentalConsent(s,checked){
 if(!s.demographics?.birthDate||!isMinor(s))throw Error('生年月日の入力からやり直してください。');
 if(!checked)throw Error('親権者の同意を確認してください。');
 s.demographics.parentalConsentAt=new Date().toISOString();s.demographics.confirmedAt=s.demographics.parentalConsentAt;
}
export const needsDemographics=s=>!!s.demographics?.required&&!s.demographics.confirmedAt;
export const appLovinAvailable=s=>!needsDemographics(s)&&!isMinor(s);

export function demographicsMarkup({profile,draft={},esc,button,error=''}){
 const [year='',month='',day='']=(profile?.birthDate||'').split('-');
 const values={year,month,day,gender:profile?.gender||'',...draft},locked=!!profile?.confirmedAt;
 const dateInput=(name,placeholder,suffix)=>`<label class="demographic-date-field"><input aria-label="${suffix==='年'?'生年':suffix==='月'?'生月':'生日'}" name="${name}" inputmode="numeric" maxlength="${name==='year'?4:2}" placeholder="${placeholder}" value="${esc(values[name])}" ${locked?'disabled':''}><span>${suffix}</span></label>`;
 return `<header class="app-header account-header"><span class="icon-button"></span><h1>生年月日と性別を追加</h1><span class="icon-button"></span></header><main class="demographics-page"><div class="demographics-intro"><h2>あなたのことを教えてください</h2><p>正しい生年月日と性別を入れていただくと、あなたに合ったおすすめ情報を提供いたします。</p><small>※未成年の方も安心してご利用いただけますが、一部機能に制限があります。</small></div><form data-demographics-form novalidate><fieldset><legend>生年月日を入力</legend><div class="demographic-date">${dateInput('year','1990','年')}${dateInput('month','1','月')}${dateInput('day','11','日')}</div><p class="demographics-note">※生年月日は登録後に変更できません<br>※生年月日は公開されません</p></fieldset><fieldset><legend>性別を選択</legend><div class="demographic-gender">${Object.entries(genderLabels).map(([v,label])=>`<label><input type="radio" name="gender" value="${v}" ${values.gender===v?'checked':''} ${locked?'disabled':''}>${label}</label>`).join('')}</div></fieldset><p class="account-error" role="alert">${esc(error)}</p><button type="submit" class="btn primary wide" ${!locked&&!(values.year&&values.month&&values.day&&values.gender)?'disabled':''}>${locked?'次へ':'登録する'}</button></form></main>`;
}
export function parentalConsentMarkup({button,icon,checked=false,error='',esc}){
 return `<header class="app-header account-header">${button(icon('close'),'demographics-back','icon-button','aria-label="閉じる"')}<h1>親権者の同意について</h1><span class="icon-button"></span></header><main class="parental-page"><section class="parental-card"><img class="parental-art" src="assets/onboarding/parental-consent-cat-transparent.png" width="124" height="90" alt=""><div class="parental-copy"><h2>このアプリをご利用いただくには、親権者（保護者）の同意が必要です</h2><p>本アプリ「タメルコ」は、歩数計測や広告視聴、買い物連携などを通じてポイントを獲得し、特典と交換できるサービスです。</p><p>本サービスのご利用にあたり、アプリ内で広告閲覧や成果報酬型の案件参加などを行う場合がございます。<br>未成年の方がご利用される場合、保護者の方の同意が必要となります。<br>以下にチェックを入れていただくことで、本サービスの利用に同意いただいたものとみなします。</p></div><div class="parental-agreement ${checked?'checked':''}"><input id="parental-agree" type="checkbox" ${checked?'checked':''} aria-labelledby="parental-agree-label"><div><label id="parental-agree-label" for="parental-agree">親権者は、本サービスの利用規約・プライバシーポリシーを確認し、私（ユーザー）が本アプリを利用することに同意しています。</label><div class="parental-links">${button('利用規約','demographics-terms','text-link')}${button('プライバシーポリシー','demographics-privacy','text-link')}</div></div></div></section><p class="account-error" role="alert">${esc(error)}</p></main><div class="parental-footer">${button('次へ','demographics-consent','btn primary wide',checked?'':'disabled')}</div>`;
}
