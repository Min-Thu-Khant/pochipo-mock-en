import {icon,escapeHtml as esc} from './components.js';
export const dialogExamples={
 confirm:{icon:'question',title:'入力内容を破棄しますか？',body:'保存していない内容は失われます。',primary:'キャンセル',secondary:'破棄する',danger:true},
 success:{icon:'coin',title:'ポイントを獲得しました',body:'アンケート回答の報酬',amount:'2,100',primary:'閉じる'},
 error:{icon:'info',title:'読み込めませんでした',body:'通信状況をご確認のうえ、もう一度お試しください。',primary:'再読み込み',secondary:'閉じる'},
 permission:{icon:'walk',title:'歩数の利用を許可してください',body:'歩数に応じたポイントを計算するために、歩数データを使用します。',primary:'設定を開く',secondary:'あとで'},
 choice:{icon:'play',title:'受け取り方を選んでください',body:'動画を視聴すると、受け取るポイントが増えます。',primary:'動画を見て30pt受け取る',secondary:'そのまま5pt受け取る'},
 pending:{icon:'clock',title:'送信しています',body:'処理結果を確認しています。完了までお待ちください。',primary:'送信中',disabled:true}
};
export function dialogCard(key,prefix='demo'){
 const d=dialogExamples[key];return `<div class="pg-dialog-card pg-dialog-${key}"><div class="pg-dialog-symbol">${icon(d.icon)}</div><h2 id="${prefix}-title">${esc(d.title)}</h2><p id="${prefix}-body">${esc(d.body)}</p>${d.amount?`<div class="pg-dialog-reward">${d.amount}<small> pt</small></div>`:''}<div class="pg-dialog-actions"><button class="pg-dialog-primary" data-dialog-action ${d.disabled?'disabled':''}>${esc(d.primary)}</button>${d.secondary?`<button class="pg-dialog-secondary ${d.danger?'destructive':''}" data-dialog-action>${esc(d.secondary)}</button>`:''}</div></div>`;
}
