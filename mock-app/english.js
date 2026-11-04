import {translateEnglish} from './english-text.js';

// Localize rendered content rather than stored category names, IDs, or routes.
// This keeps the app, admin, and NACS on the same data contract.
const textAttributes=['title','alt','aria-label','aria-description','placeholder','label'];
const excluded='script,style,code,pre,[translate="no"],[data-english-ignore]';
const originals=new WeakMap();
const translatedFields=new WeakSet();
function localizeElement(element){
 if(element.closest(excluded))return;
 if(element.tagName==='IMG'){
  const replacements={'invite-banner-yellow.png':'invite-banner.svg','att.png':'tracking-permission.svg','side-travel-square.png':'side-travel-square.svg'};
  const name=element.getAttribute('src')?.split('/').pop();
  if(replacements[name])element.src=new URL('assets/english/'+replacements[name],import.meta.url).href;
 }
 if(element.tagName==='OPTION'&&!element.hasAttribute('value'))element.value=element.textContent;
 for(const attribute of textAttributes){
  if(!element.hasAttribute(attribute))continue;
  const old=element.getAttribute(attribute),english=translateEnglish(old);
  if(english!==old)element.setAttribute(attribute,english);
 }
 if(!translatedFields.has(element)&&((element.tagName==='INPUT'&&['text','button','submit','reset'].includes(element.type))||element.tagName==='TEXTAREA')){
  translatedFields.add(element);
  const english=translateEnglish(element.value);
  if(element.value!==english)element.value=english;
 }
}
function localize(root){
 if(root.nodeType===Node.TEXT_NODE){
  if(root.parentElement?.closest(excluded))return;
  // An option without an explicit value derives it from text. Preserve that
  // original value before changing the visible label.
  if(root.parentElement?.tagName==='OPTION')localizeElement(root.parentElement);
  const translated=translateEnglish(root.nodeValue);
  const english=root.parentElement?.classList.contains('home-tab-label')&&translated==='Recommended'?'For You':translated;
  if(english!==root.nodeValue){originals.set(root,root.nodeValue);root.nodeValue=english;}
  return;
 }
 if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
 if(root.nodeType===Node.ELEMENT_NODE){if(root.matches(excluded))return;localizeElement(root);}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){
  if(node.nodeType===Node.TEXT_NODE)localize(node);else localizeElement(node);
 }
}
const observer=new MutationObserver(records=>{
 const roots=new Set();
 for(const record of records){
  if(record.type==='childList')for(const node of record.addedNodes)roots.add(node);
  else roots.add(record.target);
 }
 for(const root of roots)localize(root);
});
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:textAttributes});
document.documentElement.lang='en';
const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=new URL('english.css',import.meta.url);document.head.append(stylesheet);
for(const name of ['alert','confirm','prompt']){
 const original=window[name].bind(window);
 window[name]=(message,...args)=>original(translateEnglish(message),...args);
}
// Native share sheets and copied invitation messages also use English.
if(navigator.share){
 const share=navigator.share.bind(navigator);
 navigator.share=data=>share({...data,...(data.title?{title:translateEnglish(data.title)}:{}),...(data.text?{text:translateEnglish(data.text)}:{})});
}
if(navigator.clipboard?.writeText){
 const copy=navigator.clipboard.writeText.bind(navigator.clipboard);
 navigator.clipboard.writeText=text=>copy(translateEnglish(text));
}
window.PochipoEnglish=Object.freeze({translate:translateEnglish,refresh:()=>localize(document),originalText:node=>originals.get(node)});
localize(document);
document.addEventListener('DOMContentLoaded',()=>localize(document),{once:true});
