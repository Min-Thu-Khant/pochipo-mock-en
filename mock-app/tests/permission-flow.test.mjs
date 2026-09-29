import test from 'node:test';
import assert from 'node:assert/strict';
import {permissionPlan} from '../permission-flow.js';

const state=()=>({user:{},os:'ios',trackingPermission:'notDetermined',notificationPermission:'notDetermined'});
test('初回ミッション達成後だけ通知からATTを案内する',()=>{
 const s=state();
 assert.deepEqual(permissionPlan(s,{source:'walk'}),[]);
 assert.deepEqual(permissionPlan(s,{source:'video',missionCompleted:true}),['notification','att']);
 assert.deepEqual(permissionPlan(s,{source:'video',missionCompleted:true}),[]);
 s.user.permissionProgress.attIntroduced=true;
 assert.deepEqual(permissionPlan(s,{source:'video',missionCompleted:true}),['att']);
 assert.deepEqual(permissionPlan(s,{source:'walk'}),['att']);
 assert.deepEqual(permissionPlan(s,{source:'survey'}),[]);
});
test('許可済み・Android・制限ありのATTは表示しない',()=>{
 for(const settings of [{os:'android'},{trackingPermission:'authorized'},{trackingPermission:'restricted'}]){
  const s={...state(),...settings};
  assert.deepEqual(permissionPlan(s,{missionCompleted:true}),['notification']);
  s.user.permissionProgress.attIntroduced=true;
  assert.deepEqual(permissionPlan(s,{source:'walk'}),[]);
 }
 const s={...state(),trackingPermission:'authorized',notificationPermission:'authorized'};
 assert.deepEqual(permissionPlan(s,{missionCompleted:true}),[]);
});
test('拒否後の再案内は報酬データを変えない',()=>{
 const s=state();s.trackingPermission='denied';s.user.permissionProgress={missionPrompted:true,attIntroduced:true};
 s.user.points=250;s.user.history=[{amount:100}];
 assert.deepEqual(permissionPlan(s,{source:'walk'}),['att']);
 assert.equal(s.user.points,250);assert.deepEqual(s.user.history,[{amount:100}]);
});
