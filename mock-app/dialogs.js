import {pointSymbol} from './point-symbol.js';

// Figma「ホーム」上の隣接する14フレーム。金額は呼び出し元の運用設定を使用する。
export const dialogDefinitions = {
  'step-select': {node:'58630:44091', name:'歩いてためる・獲得選択', title:'ポイントゲット', kind:'choice'},
  'health-ios': {node:'58630:44082', name:'ヘルスケア連携（iOS）', title:'ヘルスケア連携をしましょう', image:'953c6-coral.png', description:'「設定」→「アプリ」→「ヘルスケア」→「データアクセスとデバイス」で「タメルコ」を選択し、歩数のアクセスをONにしてください。', permission:true},
  'health-android-settings': {node:'58630:44094', name:'身体活動へのアクセス①（設定）', title:'身体活動へのアクセス', image:'ba306-coral.png', description:'「アプリ情報」→「権限」→「身体活動の権限」より「許可」をお願いします。', permission:true, actionLabel:'設定へすすむ'},
  'health-android': {node:'58630:44844', name:'身体活動へのアクセス②（初回）', title:'身体活動へのアクセス', image:'f3361-coral.png', description:'次に表示される画面で「許可」をタップしてください。歩数が反映されるようになります。', permission:true},
  'earned': {node:'58630:44847', name:'報酬獲得・ポイント', title:'ゲット！', kind:'earned'},
  'date-change': {node:'58630:44856', name:'日付切り替え', title:'日付が切り替わりました', description:'0時を過ぎたためデイリーミッションが更新されました。最新の内容を表示します。', actionLabel:'更新する', retry:true},
  'ad-empty': {node:'58630:44850', name:'エラー・広告在庫なし', title:'現在ご利用いただける広告がありません', description:'しばらく時間をおいてから再度お試しください。'},
  'ad-load': {node:'58630:44853', name:'エラー・読み込み失敗', title:'読み込みに失敗しました', description:'通信状況をご確認のうえ、もう一度お試しください。', retry:true},
  'ad-network': {node:'58630:44859', name:'エラー・ネットワーク環境', title:'通信エラーが発生しました', description:'ネットワークに接続できませんでした。電波の良い場所で再度お試しください。', retry:true},
  'ad-request': {node:'58630:44862', name:'エラー・不正リクエスト／設定ミス', title:'広告の表示に失敗しました', description:'この広告は現在ご利用いただけません。しばらくしてから再度お試しください。'},
  'ad-mediation': {node:'58630:44079', name:'エラー・メディエーション', title:'広告の表示に失敗しました', description:'一時的な問題が発生しています。しばらくしてから再度お試しください。', retry:true},
  'ad-device': {node:'58630:44088', name:'エラー・環境不適合', title:'この端末では広告を表示できません', description:'お使いの端末では動画広告をご利用いただけません。別の端末をご利用ください。'},
  'ad-unknown': {node:'58630:44085', name:'エラー・未分類', title:'エラーが発生しました', description:'もう一度お試しください。何度も失敗する場合は、時間を空けてからお試しください。', retry:true},
  'reward-failed': {node:'58630:44097', name:'エラー・報酬獲得失敗', title:'報酬の獲得に失敗しました', description:'エラーにより、報酬を獲得できていません。もう一度読み込みをお試しください。', retry:true},
};
const esc = text => String(text??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const points = value => Math.max(0, Math.floor(Number(value)||0)).toLocaleString('ja-JP');
const asset = file => `assets/figma-dialogs/${file}`;
const button = (label, action, type='primary') => `<button type="button" class="fd-button fd-${type}" data-action="${action}">${label}</button>`;

export function dialogMarkup(id, {amount=30, balance=100, adReward=30, noAdReward=5, ads=true, preview=false, closeLabel='とじる', miniGameRemaining=null, miniGameSingle=false}={}) {
  const d=dialogDefinitions[id];
  if(!d) throw new Error(`Unknown dialog: ${id}`);
  const action = name => preview ? 'dialog-preview-action' : name;
  let hero='', value='', actions='';
  if(d.kind==='choice') {
    hero=`<div class="fd-choice-art"><img src="${asset('6e019.svg')}" width="151" height="150" alt=""></div>`;
    actions=`<div class="fd-choice-buttons">${ads?button(`<span class="fd-movie" aria-hidden="true"></span>動画を見て ${points(adReward)}pt`,action('step-ad')):''}</div>${button('とじる','close','text')}`;
  } else if(d.kind==='earned') {
    hero='<div class="fd-earned-art"><img src="assets/report/savings-coins.png" width="144" height="108" alt=""></div>';
    value=`<div class="fd-value"><div>${pointSymbol()}<strong>${points(amount)}</strong><small>pt</small></div></div>`;
    actions=miniGameRemaining===null?button(esc(closeLabel),'close'):
      (miniGameRemaining>0?button('もう一度チャレンジ',action('chinchiro')):'')+
      (miniGameSingle?(miniGameRemaining>0?'':button('ホームに戻る',action('mini-games-home'))):button('ミニゲーム一覧に戻る',action('mini-games-list'),miniGameRemaining>0?'secondary':'primary'));
  } else {
    if(d.image)hero=`<div class="fd-health-art"><img src="${asset(d.image)}" alt="" width="${id==='health-android-settings'?1026:1062}" height="720"></div>`;
    actions=button(d.actionLabel||(d.retry?'再読み込み':'閉じる'),d.permission?action('dialog-permission'):d.retry?action('dialog-retry'):'close');
    if(d.retry)actions+=button('とじる','close','text');
  }
  return `<div class="fd-card ${hero?'fd-with-art':''}" data-figma-node="${d.node}">${hero}${value}<div class="fd-content"><div class="fd-copy"><h2 id="fd-title">${esc(d.title)}</h2>${d.description?`<p id="fd-description">${esc(d.description)}</p>`:''}${d.permission?'<small>※歩数以外のデータは一切使用しません。</small>':''}</div><div class="fd-actions">${actions}</div></div></div>`;
}

// Retry never grants points. The original operation must run its normal eligibility checks again.
export function adErrorFor({online=true, ads=true, failure='none', scenario='normal'}={}) {
  if(!online)return 'ad-network';
  if(!ads)return 'ad-empty';
  if(failure.startsWith('ad-')&&dialogDefinitions[failure])return failure;
  return scenario==='error'?'ad-load':null;
}

// Walk permission is health / physical activity, not GPS location.
export function walkPermissionDialog(state) {
  if(!['unlinked','denied','none','unknown'].includes(state.stepLink))return null;
  if(state.os!=='android')return 'health-ios';
  return state.stepLink==='denied'?'health-android-settings':'health-android';
}
