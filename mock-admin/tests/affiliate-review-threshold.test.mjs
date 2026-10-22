import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,affiliateReviewThresholdPoints,setAffiliateReviewThreshold} from '../model.js';
test('threshold defaults and persists with audit',()=>{const s=initialState();assert.equal(affiliateReviewThresholdPoints(s),1000000);setAffiliateReviewThreshold(s,5000);assert.equal(affiliateReviewThresholdPoints(JSON.parse(JSON.stringify(s))),5000);assert.equal(s.logs.length>0,true);setAffiliateReviewThreshold(s,0);assert.equal(affiliateReviewThresholdPoints(s),0);});
test('invalid threshold preserves saved value',()=>{const s=initialState();setAffiliateReviewThreshold(s,2000);for(const value of [-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>setAffiliateReviewThreshold(s,value));assert.equal(affiliateReviewThresholdPoints(s),2000);});

test('legacy yen threshold migrates to points without changing its value',()=>{const s=initialState();s.limits.affiliateReviewThresholdYen=10000;assert.equal(affiliateReviewThresholdPoints(s),1000000);setAffiliateReviewThreshold(s,1500000);assert.equal(affiliateReviewThresholdPoints(s),1500000);assert.equal(s.limits.affiliateReviewThresholdYen,undefined);});
