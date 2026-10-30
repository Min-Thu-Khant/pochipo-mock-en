import {initAccounts} from './account-model.js';

// 管理画面の状態には認証デモ用の初期値がない場合がある。
// 保存済みデータを書き換えず、プレビュー用コピーだけを初期化する。
export function campaignPreviewState(source, feature) {
  const state=structuredClone(source);
  initAccounts(state,{fresh:false});
  state.features=(state.features||[]).filter(f=>f.id!==feature.id);
  state.features.push({...structuredClone(feature),stopped:false,start:'',end:''});
  return state;
}
