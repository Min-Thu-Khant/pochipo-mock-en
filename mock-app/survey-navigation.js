// Provider URLs come from the survey integration, never from a guessed URL.
export function surveyDestination(state,survey){
 if(['interrupted','ended'].includes(state.surveyPreview))return {demo:true};
 if(state.surveyPreview==='url-error')return {error:'アンケートの回答ページを開けません。時間をおいてお試しください。'};
 const raw=state.surveyResponseURLs?.[survey.id]??survey.responseURL;
 if(raw==null||typeof raw==='string'&&!raw.trim())return {demo:true};
 try{const url=new URL(raw);if(url.protocol!=='https:'||url.username||url.password||/(^|\.)(example|invalid|test)$/.test(url.hostname))throw Error();return {url:url.href};}
 catch{return {error:'アンケートの回答ページを開けません。時間をおいてお試しください。'};}
}
export async function openNativeSurvey(native,url){
 let timer;try{return await Promise.race([Promise.resolve().then(()=>native.openExternalBrowser(url)),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),5000);})])===true;}catch{return false;}finally{clearTimeout(timer);}
}
