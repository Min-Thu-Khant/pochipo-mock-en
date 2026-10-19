import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,offersOf,visibleSlots,challengeSlots,offerTerms,saveNacsChallenge,settleChallenges} from '../model.js';
import {configureChallengeDemo} from '../challenge-demo.js';

test('チャレンジボーナスは非SURのみを配信し、旧SUR枠はバナー・一覧・詳細に出さない',()=>{
 const s=initialState(),seed=s.slots.find(c=>c.id==='challenge');
 assert.ok(challengeSlots(s).every(c=>!offersOf(s).find(o=>o.id===c.destination).sur));
 seed.destination='game'; // Previously saved campaign.
 assert.equal(visibleSlots(s).some(c=>c.id===seed.id),false);
 assert.equal(challengeSlots(s).some(c=>c.id===seed.id),false);
 assert.equal(offerTerms(s,'game').challenge,undefined);
 assert.equal(offerTerms(s,'game').sur,true);
});

test('SUR対象の新規登録・公開を拒否し、既存の対象外枠は停止できる',()=>{
 const s=initialState(),seed=s.slots.find(c=>c.id==='challenge'),before=structuredClone(s);
 for(const enabled of [false,true])assert.throws(()=>saveNacsChallenge(s,{...seed,id:'new-sur',destination:'game',enabled}),/SUR案件.*対象外/);
 assert.deepEqual(s,before);
 seed.destination='game';
 assert.throws(()=>saveNacsChallenge(s,{...seed,enabled:true}),/SUR案件.*対象外/);
 saveNacsChallenge(s,{...seed,enabled:false});
 assert.equal(seed.enabled,false);
});

test('旧SURデモが残っていても非SURで6件を補充し、成果と残高を維持する',()=>{
 const s=initialState(),seed=s.slots.find(c=>c.id==='challenge');seed.destination='game';
 for(const id of ['starquest','cafe-game'])s.slots.push({...seed,id:'demo-challenge-'+id,destination:id,mockDemo:true});
 const campaigns=structuredClone(s.slots),user=structuredClone(s.user);
 assert.equal(configureChallengeDemo(s),3);
 assert.equal(challengeSlots(s).length,6);
 assert.ok(challengeSlots(s).every(c=>!offersOf(s).find(o=>o.id===c.destination).sur));
 assert.deepEqual(s.user,user);
 assert.deepEqual(s.slots.slice(0,campaigns.length),campaigns);
 const after=structuredClone(s);
 assert.equal(configureChallengeDemo(s),0);
 assert.deepEqual(s,after);
});

test('旧SUR成果を後から承認してもチャレンジボーナスを新規付与しない',()=>{
 const s=initialState(),cv=s.user.cases.find(c=>c.offerId==='game'),seed=s.slots.find(c=>c.id==='challenge');
 seed.destination='game';seed.participants=seed.challengeGoal;
 Object.assign(cv,{challengeId:seed.id,challengeBonus:20000,status:'approved',bonusPaid:false});
 const user=structuredClone(s.user);
 assert.equal(settleChallenges(s),0);
 assert.deepEqual(s.user,user);
});
