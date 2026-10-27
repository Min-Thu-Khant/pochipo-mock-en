// The prototype clock is state.date; production uses the user-ID issuance timestamp.
export function referralCallout(state) {
  const elapsed = Date.parse(state.date) - Date.parse(state.user?.registered);
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= 72 * 60 * 60 * 1000 || state.user?.inviteApplied) return '';
  return '<span class="referral-callout">招待コードはこちら</span>';
}
