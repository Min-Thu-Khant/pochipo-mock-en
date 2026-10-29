// The prototype clock is state.date; production uses the user-ID issuance timestamp.
export function canShowReferralEntry(state) {
  const elapsed = Date.parse(state.date) - Date.parse(state.user?.registered);
  return state.operationSettings?.invite?.enabled!==false && Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 72 * 60 * 60 * 1000 && !state.user?.inviteApplied;
}
export function referralCallout(state) {
  if (!canShowReferralEntry(state)) return '';
  return '<span class="referral-callout">招待コードはこちら</span>';
}
