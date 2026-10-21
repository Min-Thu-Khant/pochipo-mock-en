// 新規広告は従来の初期値「公開」で登録する。編集・コピーの状態は維持する。
export function adPublicationField(existing){
 if(!existing)return '<input type="hidden" name="enabled" value="1">';
 return `<label>公開状態<select name="enabled"><option value="1" ${existing.enabled?'selected':''}>公開</option><option value="0" ${!existing.enabled?'selected':''}>停止</option></select></label>`;
}

// テキスト広告では編集項目を出さず、保存時には既存の配信設定を引き継ぐ。
export function textAdDeliveryFields(existing={}){
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return `<input type="hidden" name="priority" value="${esc(existing.priority??50)}"><input type="hidden" name="enabled" value="${existing.enabled===false?'0':'1'}"><input type="hidden" name="segment" value="${esc(existing.segment??'all')}">`;
}
