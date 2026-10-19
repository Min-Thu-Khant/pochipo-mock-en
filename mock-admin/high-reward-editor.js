import {offersOf} from '../mock-app/model.js';
import {highRewardSettings,highRewardMaxPoints,HIGH_REWARD_SORT_NOTE} from '../mock-app/high-reward-model.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function highRewardEditor(s,month=s.date.slice(0,7)){
 const settings=highRewardSettings(s,month);
 const saved=new Map(settings.manual.map(row=>[row.offerId,row]));
 const rows=offersOf(s).slice().sort((a,b)=>(saved.get(a.id)?.order??Infinity)-(saved.get(b.id)?.order??Infinity));
 return `<section class="panel high-reward-admin"><h2>高還元タブの掲載設定</h2>
 <p class="desc">おすすめ内の「ポイント高還元順」とは独立した設定です。上位20件を月ごとに手動設定します。20件未満の空き枠と21件目以降は、最大付与ポイントが1,000,000pt以上の案件を自動表示します。合計最大100件です。</p>
 <div class="note spec"><strong>人気順：未定</strong><p>${HIGH_REWARD_SORT_NOTE}</p></div>
 <form id="high-reward-month-form" class="actions"><label>編集対象月 <input type="month" name="month" value="${esc(month)}" required></label><button class="btn" type="submit">対象月を開く</button></form>
 <p class="note">${settings.configured?esc(month)+'の保存済み設定':settings.inherited?esc(settings.sourceMonth)+'の手動設定を継続（'+esc(month)+'は未設定）':'手動設定なし：自動案件のみ表示'}。翌月が未設定の場合は直近の過去月の設定を継続します。</p>
 <form id="high-reward-form"><input type="hidden" name="month" value="${esc(month)}"><h3>${esc(month)}の手動掲載（最大20件）</h3><p class="desc">掲載にチェックし、重複しない1〜20の表示順を指定してください。100万ポイント未満も選べます。翌月以降を開いて保存すると、その月の月初（日本時間）から適用されます。モックでは上部の「確認日」で判定します。0件で保存した月は自動案件のみの設定となり、前月からは引き継ぎません。</p>
 <div class="tbl"><table><thead><tr><th>掲載</th><th>表示順</th><th>案件</th><th>最大付与ポイント</th></tr></thead><tbody>${rows.map((o)=>{
  const row=saved.get(o.id),max=highRewardMaxPoints(s,o);
  return `<tr data-high-offer="${esc(o.id)}"><td><input type="checkbox" name="enabled" ${row?'checked':''} aria-label="${esc(o.name)}を手動掲載"></td><td><input type="number" name="order" min="1" max="20" value="${row?.order??''}" aria-label="${esc(o.name)}の表示順"></td><td>${esc(o.name)}</td><td>${max===null?'上限不明（自動掲載対象外）':max.toLocaleString('ja-JP')+'pt'}</td></tr>`;
 }).join('')}</tbody></table></div><div class="actions"><button type="submit" class="btn primary">掲載設定を保存</button><span class="err" role="alert"></span></div></form>
 <p class="desc">停止中・公開期間外・ユーザーの表示条件に合わない案件は、手動でも表示せず、自動案件で補充します。同じ案件は手動側の1件だけ表示します。自動案件も不足する場合は空のカードを出さず、表示可能な件数だけを表示します。</p>
 <style>.high-reward-admin .tbl{overflow:auto}.high-reward-admin table{min-width:650px}.high-reward-admin input[type=number]{width:72px}.high-reward-admin input[type=month]{width:160px}.high-reward-admin input[type=checkbox]{width:18px;height:18px}</style></section>`;
}
export function readHighRewardForm(form){
 return [...form.querySelectorAll('[data-high-offer]')].filter(row=>row.querySelector('[name=enabled]').checked).map(row=>({offerId:row.dataset.highOffer,order:Number(row.querySelector('[name=order]').value)}));
}
