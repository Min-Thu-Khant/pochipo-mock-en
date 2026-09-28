import test from 'node:test';
import assert from 'node:assert/strict';
import {applicationURL,outboundDecision,readTracking} from '../offer-preflight.js';

const state={os:'ios',date:'2026-09-28'};
const offer={active:true,platforms:['ios','android'],start:'2026-09-01',end:'2026-10-31',clickUrl:'https://merchant.example.com/apply?a=1&b=2#form'};
test('iOS permits only an authorized status and preserves the configured URL',()=>{
 assert.deepEqual(outboundDecision(state,offer,'authorized'),{url:offer.clickUrl});
 for(const status of ['denied','notDetermined','restricted','unknown',undefined])assert.deepEqual(outboundDecision(state,offer,status),{settings:true});
});
test('Android does not gate applications on ATT',()=>{
 assert.equal(outboundDecision({...state,os:'android'},offer,'denied').url,offer.clickUrl);
});
test('ended, stopped, unsupported and missing offers cannot navigate',()=>{
 for(const o of [null,{...offer,active:false},{...offer,start:'2027-01-01'},{...offer,end:'2026-09-01'},{...offer,platforms:['android']}])assert.ok(outboundDecision(state,o,'authorized').error);
});
test('unsafe, unconfigured and seeded placeholder URLs are rejected',()=>{
 for(const clickUrl of ['',undefined,'javascript:alert(1)','data:text/html,hi','file:///tmp/file','//somewhere.com','https://user:password@somewhere.com','https://track.nacs.example/c/game','https://bad.invalid'])assert.equal(applicationURL({clickUrl}),null,clickUrl);
 assert.ok(outboundDecision(state,{...offer,clickUrl:''},'authorized').error);
});
test('native ATT state overrides the mock; native errors do not grant permission',async()=>{
 assert.equal(await readTracking(null,'authorized'),'authorized');
 assert.equal(await readTracking(null),'notDetermined');
 assert.equal(await readTracking({getTrackingAuthorizationStatus:async()=>'denied'},'authorized'),'denied');
 assert.equal(await readTracking({getTrackingAuthorizationStatus:async()=>{throw Error('offline');}},'authorized'),'unknown');
 assert.equal(await readTracking({},'authorized'),'unknown');
 assert.equal(await readTracking({getTrackingAuthorizationStatus:async()=>'invalid'},'authorized'),'unknown');
});
