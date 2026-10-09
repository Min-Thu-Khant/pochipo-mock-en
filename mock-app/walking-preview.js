// Upgrade only the old preview default. Preserve custom operations settings and history.
export function migrateWalkingPreview(state){
 if(state.walkTenThousandMigrated)return;
 if(state.limits.stepMax===4000)state.limits.stepMax=10000;
 state.walkTenThousandMigrated=true;
}
