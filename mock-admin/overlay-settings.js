import {defaultAdDelivery} from '../mock-app/overlay-ads.js';
import {popupFrequencyFields} from './popup-frequency-fields.js';
export function adDeliveryForm(state,position){
 if(!['popup','interstitial'].includes(position))return '';
 const c={...defaultAdDelivery,...state.adDelivery};
 const fields=position==='popup'?popupFrequencyFields(state):`<label>配信状態<select name="enabled" aria-label="配信状態"><option value="1" ${c.enabled?'selected':''}>配信する</option><option value="0" ${!c.enabled?'selected':''}>停止する</option></select></label><label>ポイント獲得何回ごとに表示するか<input type="number" name="rewardEvery" min="1" step="1" value="${c.rewardEvery}" required></label><p class="wide desc">ポイント獲得後、実績レポートの「戻る」を押したときにも表示します。</p>`;
 return `<section class="panel"><h3>表示タイミング</h3><form class="grid" id="ad-delivery-form" data-kind="${position}">${fields}<div class="actions"><button class="btn primary" type="submit">表示設定を保存</button><span class="err" role="alert"></span></div></form><p class="tiny">配信中の広告がない場合は表示されません。${position==='popup'?'':'複数候補から1枚を均等に選びます。'}全画面広告はモック表示で、外部広告SDKには接続していません。</p></section>`;
}
