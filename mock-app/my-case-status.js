// Keep NACS's in-progress SUR state internally; present three user-facing tabs.
export const caseTabLabels=Object.freeze({judging:'判定中',approved:'承認',rejected:'否認'});
export const caseDisplayStatus=status=>status==='challenging'?'judging':status;
export const restoredCaseTab=status=>Object.hasOwn(caseTabLabels,caseDisplayStatus(status))?caseDisplayStatus(status):'judging';
