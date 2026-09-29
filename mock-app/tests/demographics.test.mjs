import test from 'node:test';
import assert from 'node:assert/strict';
import {parseDemographics,ageOn,registerDemographics,confirmParentalConsent,needsDemographics,appLovinAvailable,AD_PROVIDER} from '../demographics.js';
import {initialState} from '../model.js';
import {initAccounts,activateAccount,logoutAccount,syncAccount} from '../account-model.js';
test('生年月日は実在日・未来日・性別を検証し、誕生日で18歳に切り替わる',()=>{
 const valid={year:'2008',month:'9',day:'29',gender:'other'};
 assert.deepEqual(parseDemographics(valid,'2026-09-29'),{birthDate:'2008-09-29',gender:'other'});
 assert.equal(ageOn('2008-09-29','2026-09-28'),17);assert.equal(ageOn('2008-09-29','2026-09-29'),18);
 for(const value of [{...valid,year:'2027'},{...valid,month:'2',day:'30'},{...valid,gender:''},{...valid,month:'0'},{...valid,year:''}])assert.throws(()=>parseDemographics(value,'2026-09-29'));
 assert.equal(parseDemographics({...valid,year:'2008',month:'2',day:'29'},'2026-09-29').birthDate,'2008-02-29');
});
test('未成年は親権者同意まで未完了で、同意しても広告配信へ切り替えない',()=>{
 const s={date:'2026-09-29',persona:'guest'};
 assert.equal(registerDemographics(s,{year:'2012',month:'4',day:'1',gender:'female'}),true);
 assert(needsDemographics(s));assert(!appLovinAvailable(s));assert.throws(()=>confirmParentalConsent(s,false));
 confirmParentalConsent(s,true);assert(!needsDemographics(s));assert(s.demographics.parentalConsentAt);assert(!appLovinAvailable(s));
 assert.throws(()=>registerDemographics(s,{year:'1990',month:'1',day:'1',gender:'male'}),/変更できません/);
});
test('成人は同意画面をスキップし、広告連携先はAppLovinのみ',()=>{
 const s={date:'2026-09-29',persona:'guest',demographics:{required:true}};
 assert(!appLovinAvailable(s));assert.equal(registerDemographics(s,{year:'1990',month:'1',day:'1',gender:'male'}),false);
 assert(!needsDemographics(s));assert(appLovinAvailable(s));assert.equal(AD_PROVIDER,'AppLovin');assert.equal(s.demographics.parentalConsentAt,null);
});
test('ゲストの年齢・同意は新規会員に引き継ぎ、ログアウト後の別ゲストに漏れない',()=>{
 const s=initialState();initAccounts(s,{fresh:true});registerDemographics(s,{year:'2012',month:'1',day:'1',gender:'other'});confirmParentalConsent(s,true);syncAccount(s);
 const member={id:s.accountAuth.guestId,email:'age@example.com',provider:'email',status:'active',name:'確認用'};
 activateAccount(s,member,{newAccount:true});assert.equal(s.demographics.birthDate,'2012-01-01');assert(!appLovinAvailable(s));
 logoutAccount(s);assert.equal(s.demographics,undefined);activateAccount(s,member);assert.equal(s.demographics.birthDate,'2012-01-01');assert(s.demographics.parentalConsentAt);
});
