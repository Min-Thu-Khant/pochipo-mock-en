// Vector adaptation of the user-provided P ring and solid upward arrow (2026-10-28).
// The attachment is the visual reference, not an exported Figma glyph.
export function goalArrowIcon(cls=''){
 const safeClass=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 // Optical adjustment: move P 0.5px right from the geometric-centre version.
 return `<svg class="icon ds-line-icon goal-arrow ${safeClass}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#626C69" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" shape-rendering="geometricPrecision" aria-hidden="true" focusable="false"><g class="goal-coin"><path d="M19 11A9 9 0 1 0 15.4 18.2"/><g class="goal-letter" transform="translate(-1 -0.5)" stroke-width="1.5"><path d="M7.2 16.1V6.9c0-.6.4-1 1-1h3.6c2.4 0 4 1.6 4 3.9s-1.6 3.9-4 3.9H9.9v2.4c0 .6-.4 1-1 1h-.7c-.6 0-1-.4-1-1Z"/><path d="M9.9 11.4V8.6h1.5c.9 0 1.5.5 1.5 1.4s-.6 1.4-1.5 1.4Z"/></g></g><path class="goal-up-arrow" fill="#EF7264" stroke="none" d="m14.2 15.4 3.9-3.8c.4-.4 1-.4 1.4 0l3.9 3.8c.4.4.2.8-.4.8h-1.8v4.5c0 .5-.3.8-.8.8h-3.2c-.5 0-.8-.3-.8-.8v-4.5h-1.8c-.6 0-.8-.4-.4-.8Z"/></svg>`;
}
