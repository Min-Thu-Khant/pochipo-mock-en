export const pointSymbol=(cls="")=>`<i class="coin ${cls}" aria-hidden="true">P</i>`;

// Shared numeric amount used by the 4187 layout; non-numeric input renders as zero.
export const pointAmount=value=>{
 const amount=Number(value),label=(Number.isFinite(amount)?amount:0).toLocaleString('ja-JP');
 return `<span class="ds-point-amount" aria-label="${label}ポイント">${pointSymbol()}<span class="ds-point-value">${label}</span><small class="ds-point-unit">pt</small></span>`;
};
