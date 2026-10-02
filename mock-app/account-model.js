// Local-only authentication simulator. Production identity and authorization require a server.
const copy=v=>JSON.parse(JSON.stringify(v));
const personalKeys=['demographics','user','chatSessions','surveyStarts','surveyCompletions','consumedConversions','stepLink','trackingPermission','notificationPermission'];
export const DEMO_CODE='123456';
export const DEMO_PASSWORD='Demo12345';
export function snapshot(s){return Object.fromEntries(personalKeys.filter(k=>s[k]!==undefined).map(k=>[k,copy(s[k])]));}
export function emptyData(s){const data=snapshot(s);data.user={approved:0,pending:0,earned:0,registered:s.date,member:false,sms:false,profile:false,installUnlocked:false,entries:{},cases:[],answered:[],daily:{},history:[],pendings:[],chinchiroRolls:0};delete data.demographics;data.chatSessions={};data.surveyStarts=[];data.surveyCompletions=[];data.consumedConversions=[];data.stepLink='none';data.trackingPermission='unknown';data.notificationPermission='notDetermined';return data;}
function apply(s,data){for(const k of personalKeys)delete s[k];Object.assign(s,copy(data));}
export function initAccounts(s,{fresh=false}={}){
 if(s.accountAuth?.version===1){s.accountAuth.guestId||=crypto.randomUUID();return;}
 const old=snapshot(s),guest=s.persona==='guest'||fresh;
 s.accountAuth={version:1,guestId:crypto.randomUUID(),accounts:{demo:{id:'demo',email:'demo@example.com',name:'デモ会員',provider:'email',phone:'09000000000',status:'active',data:guest?emptyData(s):old}},active:null,guest:guest&&!fresh?old:emptyData(s),onboarded:!fresh,sessionValid:true};
 if(!guest){s.accountAuth.accounts.demo={id:'demo',email:'demo@example.com',name:'デモ会員',provider:'email',phone:'09000000000',status:'active',data:old};s.accountAuth.active='demo';}
 else {apply(s,s.accountAuth.guest);s.persona='guest';}
}
export function currentAccount(s){const a=s.accountAuth;return a?.sessionValid&&a.active&&a.accounts[a.active]?.status==='active'?a.accounts[a.active]:null;}
export function syncAccount(s){const a=s.accountAuth;if(!a)return;const acc=currentAccount(s);if(acc)acc.data=snapshot(s);else if(!a.active&&a.sessionValid)a.guest=snapshot(s);}
export function emailError(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'':'メールアドレスを正しく入力してください。';}
export function passwordError(p){return p.length>=8&&/[a-zA-Z]/.test(p)&&/\d/.test(p)?'':'パスワードは英字と数字を含む8文字以上で入力してください。';}
export async function passwordDigest(email,password){const bytes=new TextEncoder().encode('pochipo-demo:'+email.toLowerCase()+':'+password);return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');}
export function findAccount(s,email,provider='email'){return Object.values(s.accountAuth.accounts).find(a=>a.email===email.toLowerCase()&&a.provider===provider);}
export async function checkPassword(a,password){return a&&((a.id==='demo'&&!a.passwordHash&&password===DEMO_PASSWORD)||a.passwordHash===await passwordDigest(a.email,password));}
export function requireAccount(s,id){const a=currentAccount(s);if(!a||a.id!==id)throw Error('本人のアカウントでログインしてください。');return a;}
export function updateProfile(s,id,name){const a=requireAccount(s,id);name=name.trim();if(!name||name.length>30)throw Error('お名前は1〜30文字で入力してください。');a.name=name;}
export function sessionExpiry(date){const d=new Date(date+'T00:00:00Z');const day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+6);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d.toISOString().slice(0,10);}
export function checkSession(s){const a=s.accountAuth;if(!a?.active||!a.sessionValid)return false;if(!a.expiresAt){a.expiresAt=sessionExpiry(s.date);return false;}if(s.date<a.expiresAt)return false;expireSession(s);return true;}
export function activateAccount(s,account,{newAccount=false}={}){
 if(account.status!=='active')throw Error('このアカウントは退会済みです。');
 syncAccount(s);const a=s.accountAuth;
 if(newAccount){if(findAccount(s,account.email,account.provider))throw Error('登録済みのアカウントです。ログインしてください。');account.data=copy(a.guest);a.guest=emptyData(s);a.guestId=crypto.randomUUID();a.accounts[account.id]=account;}
 // Existing-account login never merges anonymous points automatically.
 a.active=account.id;a.sessionValid=true;a.expiresAt=sessionExpiry(s.date);apply(s,account.data);s.persona='regular';s.user.member=true;s.user.sms=false;s.user.installUnlocked=true;syncAccount(s);
}
export function logoutAccount(s){syncAccount(s);s.accountAuth.active=null;s.accountAuth.sessionValid=true;apply(s,s.accountAuth.guest);s.persona='guest';}
export function expireSession(s){syncAccount(s);s.accountAuth.sessionValid=false;apply(s,emptyData(s));s.persona='guest';}
export function withdrawAccount(s,id){const a=requireAccount(s,id);syncAccount(s);a.status='withdrawn';a.withdrawnAt=new Date().toISOString();a.notifications=false;a.data=emptyData(s);delete a.passwordHash;logoutAccount(s);}
export function stopWithdrawnUpdate(s,id){return s.accountAuth.accounts[id]?.status==='withdrawn';}
