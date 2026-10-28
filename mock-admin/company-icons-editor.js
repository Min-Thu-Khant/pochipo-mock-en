import {homeRecommendSettings} from '../mock-app/home-recommend-settings.js';
import {pointRow} from './company-icon-row.js';

export function companyIconsEditor(state,esc){
 const rows=homeRecommendSettings(state).pointLinks;
 const home=rows.filter(x=>x.home).length,offers=rows.filter(x=>x.offers).length;
 return `<section class="panel company-icons-admin"><h2>企業アイコン設定</h2><p>企業ポイント・サイトごとに、表示する画面をチェックしてください。同じ企業を両画面に表示できます。画像・リンク先・吹き出し文言は共通です。吹き出しは空欄で非表示になります。</p><form id="home-recommend-form" data-company-only="true" data-dirty="0"><p data-company-count aria-live="polite">ホーム ${home}/5件 ／ お得 ${offers}/5件 ／ 合計 ${home+offers}/10チェック</p><div class="tbl"><table class="home-point-links-table"><thead><tr><th>並び順</th><th>名前（企業ポイント・サイト）</th><th>出面</th><th>リンク</th><th>吹き出し文言</th><th>操作</th></tr></thead><tbody data-home-sort="points">${rows.map((r,i)=>pointRow(r,esc,i)).join('')}</tbody></table></div><button class="btn" type="button" data-home-point-add>＋ 企業アイコンを新規追加</button><p class="tiny">新規追加時は両画面とも未選択です。表示できるのは各画面5件、合計10チェックまでです。未掲載の企業も登録できます。</p><p class="tiny" data-home-point-error role="alert"></p><div class="actions"><button class="btn primary" type="submit">変更を保存</button><button class="btn" type="button" data-home-cancel>キャンセル</button></div><p class="err" role="alert"></p></form></section>`;
}

export function bindCompanyIconLimits(doc,toast){
 const update=form=>{const home=form.querySelectorAll('[name=pointHome]:checked').length,offers=form.querySelectorAll('[name=pointOffers]:checked').length;const out=form.querySelector('[data-company-count]');if(out)out.textContent=`ホーム ${home}/5件 ／ お得 ${offers}/5件 ／ 合計 ${home+offers}/10チェック`;};
 doc.addEventListener('change',e=>{if(!e.target.matches('[name=pointHome],[name=pointOffers]'))return;const form=e.target.closest('form');if(!form)return;const error=form.querySelector('[data-home-point-error]');if(e.target.checked&&form.querySelectorAll(`[name=${e.target.name}]:checked`).length>5){e.target.checked=false;const text='各画面に表示できる企業アイコンは5件までです。先に他のチェックを外してください。';if(error)error.textContent=text;toast(text);}else if(error)error.textContent='';update(form);});
 doc.addEventListener('click',e=>{const form=e.target.closest('form[data-company-only]');if(form)update(form);});
}
