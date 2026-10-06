import{dialogCard,dialogExamples}from'./dialog-components.js';
const labels={confirm:'破棄確認',success:'獲得・節目の完了',error:'再試行できるエラー',permission:'権限の説明',choice:'報酬の選択',pending:'処理中'};
const live=document.querySelector('#live');let trigger=null,key=null;
document.querySelector('#samples').innerHTML=Object.keys(dialogExamples).map((k,i)=>`<article><span class="id">PG-D0${i+1}</span><h3>${labels[k]}</h3><div class="dialog-sample-stage" inert>${dialogCard(k,'sample-'+k)}</div><button class="sample-button" style="margin-top:16px" data-open="${k}">見本を開く</button></article>`).join('');
document.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;trigger=b;key=b.dataset.open;live.innerHTML=dialogCard(key,'live');if(key==='pending')live.insertAdjacentHTML('beforeend','<button data-dialog-action class="sample-button">見本を閉じる</button>');live.setAttribute('aria-labelledby','live-title');live.setAttribute('aria-describedby','live-body');live.showModal();live.querySelector('button:not(:disabled)')?.focus();});
live.addEventListener('click',e=>{if(e.target.closest('[data-dialog-action]')){document.querySelector('#result').textContent='見本の操作を確認しました。';live.close();}});
live.addEventListener('close',()=>trigger?.focus());
