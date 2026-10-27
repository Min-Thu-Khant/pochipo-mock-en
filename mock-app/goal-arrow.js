// Goal shortcut: a rising P coin and a curved upward arrow, on the shared 24px grid.
export function goalArrowIcon(cls=''){
 const safeClass=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg class="icon ds-line-icon goal-arrow goal-growth ${safeClass}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><g class="goal-growth-puffs" stroke="none" fill="currentColor"><circle class="goal-growth-puff" cx="3" cy="21" r=".8"/><circle class="goal-growth-puff" cx="7" cy="22" r=".65"/><circle class="goal-growth-puff" cx="2" cy="17" r=".6"/></g><path class="goal-growth-arrow" d="M14 20c7-2 8-8 6-16m-4 3 4-4 2 5"/><g class="goal-growth-coin"><circle cx="8.5" cy="14" r="5.5"/><path d="M7 17v-6h2a1.75 1.75 0 0 1 0 3.5H7" stroke-width="1.5"/></g></svg>`;
}
