export function chevron(direction='right',cls='') {
 const rotate={right:0,left:180,down:90,up:270}[direction]||0;
 return `<svg class="icon ui-chevron ${cls}" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 2 L10 7.5 L5 13" transform="rotate(${rotate} 7.5 7.5)"/></svg>`;
}
