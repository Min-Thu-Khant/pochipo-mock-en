// Separate browser tab standing in for the survey company's website.
// Completion is simulated against the same local mock store; no provider request is sent.
import {KEY,surveys,availableSurveys,completeSurvey,missionTasks} from './model.js';
import {syncAccount} from './account-model.js';
import {escapeHtml as esc} from './design-system/app-theme/components.js';

const root=document.querySelector('#survey');
const params=new URLSearchParams(location.search),id=params.get('id');
const mission=params.has('mission')?{id:params.get('mission'),date:params.get('missionDate'),token:params.get('missionToken')}:null;
const read=()=>JSON.parse(localStorage.getItem(KEY)||'null');
const initial=read(), account=initial?.accountAuth?.active;
const q=surveys.find(x=>x.id===id);
let step=0,answers=[],finished=false;
const returnButton=()=>'<button type="button" data-close>アプリに戻る</button><p id="return-help" hidden>元のアプリのタブに戻ってください。</p>';
function render(){
  const s=read();
  if(!q||!s||s.accountAuth?.active!==account){root.innerHTML='<h1>回答ページを開けませんでした</h1><p>アプリから開き直してください。</p>'+returnButton();return;}
  if(finished||s.user.answered.includes(id)){root.innerHTML='<h1>ご協力ありがとうございます。</h1><p>回答を送信しました。ポイントはアプリで確認できます。</p>'+returnButton();return;}
  if(!availableSurveys(s).some(x=>x.id===id)){root.innerHTML='<h1>このアンケートは現在回答できません。</h1>'+returnButton();return;}
  root.innerHTML=`<h1>${esc(q.title)}</h1><p>${step+1} / ${q.questions.length}</p><progress max="${q.questions.length}" value="${step+1}" aria-label="回答の進捗"></progress><form><fieldset><legend>${esc(q.questions[step])}</legend>${q.choices[step].map((choice,i)=>`<label><input required type="radio" name="answer" value="${i}" ${answers[step]===i?'checked':''}>${esc(choice)}</label>`).join('')}</fieldset><p id="error" role="alert"></p><button type="submit">${step===q.questions.length-1?'回答を送信する':'次の質問へ'}</button>${step?'<button type="button" class="secondary" data-previous>前の質問へ</button>':''}</form><button type="button" class="secondary" data-close>回答を中断して戻る</button><p id="return-help" hidden>元のアプリのタブに戻ってください。</p>`;
}
root.addEventListener('change',e=>{if(e.target.name==='answer')answers[step]=Number(e.target.value);});
root.addEventListener('click',e=>{
  if(e.target.closest('[data-previous]')){step--;render();}
  if(e.target.closest('[data-close]')){window.close();document.querySelector('#return-help').hidden=false;}
});
root.addEventListener('submit',e=>{
  e.preventDefault();if(answers[step]===undefined)return;
  if(step<q.questions.length-1){step++;render();return;}
  try{
    // Re-read before writing so changes in the app while this tab is open are preserved.
    const s=read();if(!s||s.accountAuth?.active!==account)throw Error('ログイン状態が変わりました。アプリから開き直してください。');
    if(s.user.answered.includes(id)){finished=true;render();return;}
    const before=missionTasks(s).done;
    if(!completeSurvey(s,id,{mission}))throw Error('ミッションの状態が変わりました。アプリの一覧からやり直してください。');
    if(!mission&&missionTasks(s).done>before)s.user.surveyMissionPermissionPending=true;
    syncAccount(s);localStorage.setItem(KEY,JSON.stringify(s));finished=true;render();
    if(mission)window.close();
  }catch(error){document.querySelector('#error').textContent=error.message;}
});
render();
