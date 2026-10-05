import {framePlacement} from '../mock-app/carousel-model.js';
import {bannerPreviewTarget} from '../mock-app/banner-preview-model.js';
import {homeTabsFor} from '../mock-app/model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={'daily-middle':'デイリーミッション中部',top:'ホーム最上部',category:'カテゴリ広告',popup:'起動時ポップアップ',carousel:'ホーム特集枠（旧構成）',feed:'おすすめ枠（旧構成）',sub:'サブ枠（旧構成）'};
export const bannerPreviewField=()=>`<section class="wide placement-preview-link"><button type="button" class="btn" data-preview-refresh>プレビュー ↗</button><p data-preview-caption role="status"></p></section>`;
export function initPlacementPreview(getState,readForm){let timer;
 function refresh(){const f=document.querySelector('#slot-form[data-section="banner"]'),box=f?.querySelector('.placement-preview-link');if(!box)return;const caption=box.querySelector('[data-preview-caption]');let placement;try{placement=framePlacement(f.elements.frame.value,f.elements.framePosition.value);}catch(error){caption.textContent=error.message;return;}
 const state=getState(),selected=placement.placements[0],target=bannerPreviewTarget(selected,placement.tab,placement.position,homeTabsFor(state).map(t=>t.key));
 if(target.error){caption.textContent=target.error;return;}
 let slot;try{slot=readForm(f,true);}catch(error){caption.textContent=error.message;return;}
 caption.textContent='';
 const url=new URL('../mock-app/',location.href);url.searchParams.set('bannerPreview','1');url.hash=target.route;
 const previewWindow=window.open(url.href,'_blank');
 if(!previewWindow){caption.textContent='プレビューを開けませんでした。ブラウザのポップアップ設定を確認してください。';return;}
 const payload={type:'banner-preview',state:structuredClone(state),slot,placement:selected};
 let attempts=0;const sendTimer=setInterval(()=>{if(previewWindow.closed||attempts++>50){clearInterval(sendTimer);return;}try{if(previewWindow.document.readyState==='complete'&&previewWindow.location.href===url.href){previewWindow.postMessage(payload,location.origin);clearInterval(sendTimer);}}catch{}},100);
 }
 document.addEventListener('click',e=>{if(e.target.closest('[data-preview-refresh]'))refresh();});
}
