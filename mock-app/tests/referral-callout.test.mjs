import test from 'node:test';
import assert from 'node:assert/strict';
import {referralCallout} from '../referral-callout.js';
const state = hours => ({date:new Date(Date.parse('2026-10-01T00:00:00Z')+hours*3600000).toISOString(),user:{registered:'2026-10-01T00:00:00Z'}});
test('visible from issuance until just before 72 hours',()=>{
  for(const hours of [0,24,71.999]) assert.match(referralCallout(state(hours)),/招待コードはこちら/);
});
test('hidden at expiry, after expiry, and after application',()=>{
  for(const hours of [72,73,100]) assert.equal(referralCallout(state(hours)),'');
  const s=state(0);s.user.inviteApplied='FRIEND-DEMO';assert.equal(referralCallout(s),'');
});
test('invalid or future issuance does not expose the invitation',()=>{
  assert.equal(referralCallout(state(-1)),'');assert.equal(referralCallout({}), '');
});
