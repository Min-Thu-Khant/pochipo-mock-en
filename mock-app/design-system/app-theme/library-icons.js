import {icon as appIcon} from '../../poigig-icons.js';
// Component-library vector family. New simplifications based on the current chat/home outlines.
// Uniform 2px stroke at 24px, including inner details; rounded line caps and joins.
const shapes={
  "chat": "<path d=\"M8 3h8c4 0 5 2 5 6v4c0 4-1 5-5 5h-5c-2 0-3 3-5 3-1 0-1-2-1-4-2-1-2-3-2-5V9c0-4 1-6 5-6Z\"/><path d=\"M7 9h10 M7 13h6\" />",
  "home": "<path d=\"M4 10c2-3 5-7 8-7s6 4 8 7c1 2 1 5 1 7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4c0-2 0-5 1-7Z\"/><path d=\"M9 21v-6a3 3 0 0 1 6 0v6\" />",
  "gift": "<path d=\"M5 10v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8 M3 7h18v4H3Z M12 7v14 M12 7C5 7 5 2 8 2c2 0 3 2 4 5 1-3 2-5 4-5 3 0 3 5-4 5Z\"/>",
  "user": "<circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M12 15c-5 0-9 2-9 4s3 2 9 2 9 0 9-2-4-4-9-4Z\"/>",
  "bell": "<path d=\"M5 15v-5a7 7 0 0 1 14 0v5c0 2 2 2 2 3s-2 1-4 1H7c-2 0-4 0-4-1s2-1 2-3\"/><path d=\"M10 22h4\" />",
  "back": "<path d=\"M15,4 L9.121320343559642,9.878679656440358 A2.9999999999999996 2.9999999999999996 0 0 0 9.121320343559642,14.121320343559642 L15,20\"/>",
  "arrow": "<path d=\"M9,4 L14.878679656440358,9.878679656440358 A2.9999999999999996 2.9999999999999996 0 0 1 14.878679656440358,14.121320343559642 L9,20\"/>",
  "down": "<path d=\"M4,8 L9.878679656440358,13.878679656440358 A2.9999999999999996 2.9999999999999996 0 0 0 14.121320343559642,13.878679656440358 L20,8\"/>",
  "check": "<path d=\"M4,12 L6.878679656440358,14.878679656440358 A2.9999999999999996 2.9999999999999996 0 0 0 11.121320343559642,14.878679656440358 L20,6\"/>",
  "close": "<path d=\"m6 6 12 12 M18 6 6 18\"/>",
  "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v4.5c0 1 .5 1.5 1.5 2l2.5 1.5\" />",
  "play": "<path d=\"M7 5c0-2 2-2 4-1l8 5c3 2 3 4 0 6l-8 5c-2 1-4 1-4-1V5Z\"/>",
  "walk": "<circle cx=\"13\" cy=\"4\" r=\"2\"/><path d=\"m10 20 3-6-3-4-3 4 M10 10l3-3 3 4 3 1 M13 14l4 6\"/>",
  "survey": "<rect x=\"4\" y=\"3\" width=\"16\" height=\"18\" rx=\"4\"/><path d=\"M8 8h8 M8 12h8 M8 16h4\"/>",
  "search": "<circle cx=\"10\" cy=\"10\" r=\"7\"/><path d=\"M15 15l6 6\"/>",
  "info": "<path d=\"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z \" /><path d=\"M12 11v6 \" /><path d=\"M12 7h.01\" />",
  "list": "<path d=\"M9 5h12 \" /><path d=\"M9 12h12 \" /><path d=\"M9 19h12 \" /><path d=\"M3 5h.01 \" /><path d=\"M3 12h.01 \" /><path d=\"M3 19h.01\" />",
  "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"4\"/><path d=\"M7 3v4 M17 3v4 M3 11h18 M8 16h4\"/>",
  "chart": "<path d=\"M3 3v15a3 3 0 0 0 3 3h15\"/><path d=\"M8 16v-4 M13 16V8 M18 16V4\" />",
  "settings": "<path d=\"M3 6h18 \" /><path d=\"M3 12h18 \" /><path d=\"M3 18h18 \" /><path d=\"M8 3v6 \" /><path d=\"M16 9v6 \" /><path d=\"M10 15v6\" />",
  "download": "<path d=\"M12 3v12\"/><path d=\"M7,10 L9.878679656440358,12.878679656440358 A2.9999999999999996 2.9999999999999996 0 0 0 14.121320343559642,12.878679656440358 L17,10\"/><path d=\"M4 17v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1\"/>",
  "bag": "<path d=\"M7 8h10c4 0 5 2 4 6l-1 3c-1 3-2 4-5 4H9c-3 0-4-1-5-4l-1-3c-1-4 0-6 4-6Z M8 8V6a4 4 0 0 1 8 0v2\"/>",
  "wallet": "<rect x=\"3\" y=\"6\" width=\"18\" height=\"15\" rx=\"5\"/><path d=\"M3 10V7c0-3 2-4 5-4h8\"/><path d=\"M21 11h-4c-3 0-3 5 0 5h4\" />",
  "coin": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M10 17V7h3a3 3 0 0 1 0 6h-3\" />",
  "question": "<path d=\"M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z \" /><path d=\"M9 8a3 3 0 0 1 6 1c0 2-3 2-3 5 \" /><path d=\"M12 18h.01\" />",
  "ticket": "<path d=\"M6 4h12a3 3 0 0 1 3 3v3a2 2 0 0 0 0 4v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a2 2 0 0 0 0-4V7a3 3 0 0 1 3-3Z\"/><path d=\"M9 7v3 M9 14v3\" />",
  "cart": "<path d=\"M2 4h1c2 0 2 2 3 5l1 3c1 3 2 4 5 4h3c3 0 4-1 5-4l.5-2c.5-2-.5-3-2.5-3H7\"/><circle cx=\"10\" cy=\"20\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/>",
  "phone": "<rect x=\"5\" y=\"2\" width=\"14\" height=\"20\" rx=\"5\"/><path d=\"M10 6h4 M11 18h2\" />",
  "game": "<path d=\"M8 6h8c3 0 4 2 5 7l.5 3c.5 3-2 4-4 2l-2-2h-7l-2 2c-2 2-4.5 1-4-2l.5-3c1-5 2-7 5-7Z\"/><path d=\"M6 11h4 M8 9v4\"/><circle cx=\"16.5\" cy=\"11.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/>",
  "plane": "<path d=\"M4 9 18 3c3-1 4 0 3 3l-6 14c-1 2-2 2-3-1l-2-5-5-2c-3-1-3-2-1-3Z\"/><path d=\"M10 14l6-6\" />",
  "yen": "<path d=\"m6 4 6 7 6-7 M12 11v10 M7 13h10 M7 17h10\"/>",
  "external": "<path d=\"M14 3h4a3 3 0 0 1 3 3v4 M20 4l-9 9 M10 4H8c-4 0-5 1-5 5v7c0 4 1 5 5 5h8c4 0 5-1 5-5v-2\"/>",
  "trophy": "<path d=\"M7 5c0-2 2-2 5-2s5 0 5 2v5c0 4-2 6-5 6s-5-2-5-6V5Z M7 6H5c-2 0-2 1-2 3s2 4 5 4 M17 6h2c2 0 2 1 2 3s-2 4-5 4 M12 16v4 M8 21h8\"/>",
  "card": "<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"4\"/><path d=\"M3 10h18 M7 15h3\"/>",
  "quick": "<path d=\"M13 3 5 13h6l-1 8 9-12h-6l1-6\"/>",
  "receipt": "<path d=\"M7 3h10a3 3 0 0 1 3 3v15l-4-2-4 2-4-2-4 2V6a3 3 0 0 1 3-3Z\"/><path d=\"M8 8h8 M8 12h6\"/>",
  "dice": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"7.5\" cy=\"7.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"16.5\" cy=\"16.5\" r=\"1.2\" fill=\"currentColor\" stroke=\"none\"/>",
  "camera": "<path d=\"M8 6c1-3 2-3 4-3s3 0 4 3h1c4 0 5 2 5 7s-1 7-5 7H7c-4 0-5-2-5-7s1-7 5-7h1Z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/>",
  "pouch": "<path d=\"M8 8 6 3h12l-2 5c3 3 5 6 5 10 0 3-4 4-9 4s-9-1-9-4c0-4 2-7 5-10Z M8 8h8\"/><path d=\"M10 18v-6h3a2 2 0 0 1 0 4h-3\"/>"
};
const aliases={spark:'quick',minigames:'dice'};
export const iconNames=Object.freeze([...Object.keys(shapes),...Object.keys(aliases)]);
export const iconMetrics=Object.freeze({grid:24,stroke:2});
export function icon(name,cls=''){
 // Share the walking shoe artwork from the 4187 preview with the app.
 if(name==='walk')return appIcon('walk',cls);
 const key=aliases[name]||name,shape=shapes[key];
 if(!shape)throw new Error('Unknown icon: '+name);
 const safeClass=String(cls).replace(/[^a-zA-Z0-9_ -]/g,'');
 return `<svg class="icon ds-line-icon ${safeClass}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${key==='play'?`<g class="ds-optical-play">${shape}</g>`:shape}</svg>`;
}
