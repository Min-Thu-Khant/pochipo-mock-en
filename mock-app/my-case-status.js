// Each result retains its own status, including in-progress SUR offers.
export const caseTabLabels=Object.freeze({challenging:'挑戦中',judging:'判定中',approved:'承認',rejected:'否認'});
export const caseDisplayStatus=status=>status;
export const restoredCaseTab=status=>Object.hasOwn(caseTabLabels,status)?status:'challenging';
