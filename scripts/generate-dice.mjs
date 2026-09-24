// Deterministic new SVG extension using verified Figma icon construction rules.
import {writeFile,mkdir} from 'node:fs/promises';
import {diceSvg} from '../mock-app/design-system/icon-logic.js';
const directory=new URL('../mock-app/assets/generated/dice-v2/',import.meta.url);
await mkdir(directory,{recursive:true});
for(const weight of ['regular','bold'])for(let face=1;face<=6;face++)await writeFile(new URL(`${weight}-${face}.svg`,directory),diceSvg(face,weight));
console.log('Generated 12 dice SVGs from design-system/icon-logic.js');
