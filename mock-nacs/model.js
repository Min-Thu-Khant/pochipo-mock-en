// NACS モックはアプリ・管理画面と同じドメインモデルを使う（同じ localStorage の状態を読み書きする）
export * from '../mock-app/model.js';

import {nacsList,setListPinned,orderedListIds,NACS_LIST_LIMIT,nacsAudit} from '../mock-app/model.js';

export function setListDisplayOrder(s,code,id,position){
 const l=nacsList(s,code);if(!l||!l.offerIds.includes(id))throw Error('一覧内の案件を選択してください。');
 if(position===0){setListPinned(s,code,id,false);return;}
 const ids=orderedListIds(l,s);if(!Number.isInteger(position)||position<1||position>Math.min(ids.length,NACS_LIST_LIMIT))throw Error('表示順が範囲外です。');
 const reordered=ids.filter(x=>x!==id);reordered.splice(position-1,0,id);
 const pinCount=Math.max(position,(l.pinnedIds||[]).length);
 l.offerIds=reordered;l.pinnedIds=reordered.slice(0,pinCount);
 nacsAudit(s,`表示順を指定：${code}`,`${id} → ${position}番目`);
}
