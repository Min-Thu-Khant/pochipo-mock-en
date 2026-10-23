import {popupFrequency,popupUnitLabels} from '../mock-app/popup-frequency.js';
export function popupFrequencyFields(state){
 const c=popupFrequency(state);
 const legacy=!state.popupFrequency?`<p class="wide desc">現在の保存済み設定：${{always:'起動ごとに表示',daily:'1日1回',off:'停止'}[state.popupMode]||'1日1回'}。下の「表示設定を保存」で新しい頻度に切り替わります。</p>`:'';
 return `${legacy}<div class="wide"><label>起動時の表示頻度</label><div class="popup-frequency-inputs"><input type="number" name="interval" aria-label="期間の数値" min="1" step="1" value="${c.interval}" required><select name="unit" aria-label="期間の単位">${Object.entries(popupUnitLabels).map(([v,label])=>`<option value="${v}" ${c.unit===v?'selected':''}>${label}</option>`).join('')}</select><span>に</span><input type="number" name="count" aria-label="表示回数" min="1" step="1" value="${c.count}" required><span>回</span></div></div>`;
}
