import {translateEnglish} from './english-text.js';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// English-native preview artwork avoids flattened Japanese text in screenshots.
export function affiliateSampleImage(offer){
 const name=translateEnglish(offer.name||'Sample Offer');
 const palette=['#e5eef1','#eee7f4','#fae6de','#e6f0df'];
 const color=palette[[...String(offer.id)].reduce((n,c)=>n+c.charCodeAt(0),0)%palette.length];
 const words=name.split(/\s+/),lines=[];let line='';
 for(const word of words){if((line+' '+word).trim().length>20&&line){lines.push(line);line=word;}else line=(line+' '+word).trim();}if(line)lines.push(line);
 return `<svg class="affiliate-sample-image" viewBox="0 0 219 219" role="img" aria-label="${esc(name)}"><rect width="219" height="219" rx="16" fill="${color}"/><circle cx="109.5" cy="79" r="43" fill="white" opacity=".7"/><path d="M83 78h53v32H83z" fill="#ee9280"/><path d="M94 78V67a16 16 0 0 1 32 0v11" fill="none" stroke="#ee9280" stroke-width="6"/><path d="m149 39 3 9 10 1-8 6 3 9-8-5-8 5 3-9-8-6 10-1Z" fill="#d7b368"/>${lines.slice(0,3).map((text,i)=>`<text x="109.5" y="${153+i*18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#344b46">${esc(text)}</text>`).join('')}</svg>`;
}
