import {framePlacement} from '../mock-app/carousel-model.js';
import {bannerPreviewTarget} from '../mock-app/banner-preview-model.js';
import {homeTabsFor} from '../mock-app/model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={'daily-middle':'デイリーミッション中部',top:'ホーム最上部',category:'カテゴリ広告',popup:'起動時ポップアップ',carousel:'ホーム特集枠（旧構成）',feed:'おすすめ枠（旧構成）',sub:'サブ枠（旧構成）'};
export const bannerPreviewField=()=>`<section class="wide placement-preview"><div><h3>配信先プレビュー</h3><p class="desc">選んだ配信先を、編集中のバナーで確認できます。画像を選択したら「プレビューを更新」を押してください。</p><label>プレビューする配信先<select data-preview-placement></select></label><button type="button" class="btn" data-preview-refresh>プレビューを更新</button><p data-preview-caption role="status"></p><p class="tiny">表示位置の確認用です。期間・公開状態の条件を一時的に外して表示します。プレビュー内のリンク遷移・ポイント操作は無効で、保存するまでアプリには反映されません。</p></div><iframe title="バナー配信先のアプリプレビュー" data-banner-frame hidden></iframe></section>`;
export function initPlacementPreview(getState,readForm){let timer;
 function refresh(){const f=document.querySelector('#slot-form[data-section="banner"]'),box=f?.querySelector('.placement-preview');if(!box)return;const select=box.querySelector('[data-preview-placement]'),frame=box.querySelector('iframe'),caption=box.querySelector('[data-preview-caption]');let placement;try{placement=framePlacement(f.elements.frame.value,f.elements.framePosition.value);}catch(error){caption.textContent=error.message;frame.hidden=true;return;}const placements=placement.placements;const previous=select.value;select.innerHTML=placements.map(p=>`<option value="${p}">${names[p]||p}</option>`).join('');if(placements.includes(previous))select.value=previous;
 const fd=new FormData(f),state=getState(),target=bannerPreviewTarget(select.value,placement.tab,placement.position,homeTabsFor(state).map(t=>t.key));
 if(target.error){caption.textContent=target.error;frame.hidden=true;return;}
 let slot;try{slot=readForm(f,true);}catch(error){caption.textContent=error.message;frame.hidden=true;return;}
 caption.textContent=target.label+'：'+target.description;frame.hidden=false;
 const url=new URL('../mock-app/',location.href);url.searchParams.set('bannerPreview','1');url.hash=target.route;
 const send=()=>frame.contentWindow.postMessage({type:'banner-preview',state,slot,placement:select.value},location.origin);
 frame.onload=send;if(frame.getAttribute('src')!==url.href)frame.src=url.href;else send();
 }
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(refresh,180);};
 document.addEventListener('input',e=>{if(e.target.closest('#slot-form'))schedule();});document.addEventListener('change',e=>{if(e.target.closest('#slot-form'))schedule();});document.addEventListener('click',e=>{if(e.target.closest('[data-preview-refresh]'))refresh();if(e.target.closest('[data-add-slide],[data-remove-slide]'))schedule();});
 new MutationObserver(schedule).observe(document.querySelector('#root'),{childList:true});
 refresh();
}
