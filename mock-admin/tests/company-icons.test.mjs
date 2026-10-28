import test from 'node:test';
import assert from 'node:assert/strict';
import {homeRecommendSettings,validateHomeRecommendSettings} from '../../mock-app/home-recommend-settings.js';
import {categoryQuickLinks,initialState} from '../../mock-app/model.js';
import {missionMarketView} from '../../mock-app/mission-market-view.js';
import {companyIconsEditor} from '../company-icons-editor.js';
import {companyIconVisual} from '../../mock-app/company-icon.js';

const extra=i=>({id:'site-'+i,label:'追加企業'+i,image:'',destinationType:'custom-url',destination:'#home',home:false,offers:false,enabled:false,sale:false});
test('各画面5件・合計10チェックを保存でき、6件目は画面ごとに拒否する',()=>{
 const c=homeRecommendSettings({});assert.doesNotThrow(()=>validateHomeRecommendSettings(c));
 for(const screen of ['home','offers']){const v=structuredClone(c),r=extra(1);r[screen]=true;v.pointLinks.push(r);assert.throws(()=>validateHomeRecommendSettings(v),/それぞれ5件/);}
});
test('企業登録数はチェック上限と別で、未掲載企業も追加して保持できる',()=>{
 const c=homeRecommendSettings({});c.pointLinks.push(...Array.from({length:15},(_,i)=>extra(i)));
 const saved=validateHomeRecommendSettings(c);assert.equal(saved.pointLinks.length,20);assert.equal(saved.pointLinks.filter(x=>x.home).length,5);assert.equal(saved.pointLinks.filter(x=>x.offers).length,5);
});
test('ホームだけ・お得だけを別々に描画し、共通のSALEを維持する',()=>{
 const c=homeRecommendSettings({}),s=initialState();c.pointLinks[0].home=false;c.pointLinks[1].offers=false;s.homeRecommendation=validateHomeRecommendSettings(c);
 assert.ok(categoryQuickLinks(s,'offers').some(x=>x.id==='mile'));assert.ok(!categoryQuickLinks(s,'offers').some(x=>x.id==='vpoint'));
 const html=missionMarketView({settings:s.homeRecommendation,date:s.date,offers:[],surveys:[],surveyTotal:0,surveyCount:0,terms:()=>({reward:0}),surveyAmount:()=>0,image:()=>'',esc:String,pt:String,missionCard:'',progress:{items:[]}});
 assert.ok(!html.includes('マイルの関連案件'));assert.ok(html.includes('Vポイントの関連案件・SALE'));
});
test('管理画面には表示先チェック・件数・新規追加を備える',()=>{
 const html=companyIconsEditor({},String);assert.equal((html.match(/name="pointHome"/g)||[]).length,5);assert.equal((html.match(/name="pointOffers"/g)||[]).length,5);assert.match(html,/合計 10\/10チェック/);assert.match(html,/企業アイコンを新規追加/);
});
test('吹き出しは任意文言をエスケープし、空欄ではSALE設定が残っていても非表示にする',()=>{
 const esc=s=>String(s).replaceAll('<','&lt;').replaceAll('>','&gt;');
 assert.match(companyIconVisual({id:'a',label:'企業',callout:'増量中'},esc),/>増量中</);
 assert.doesNotMatch(companyIconVisual({id:'a',label:'企業',sale:true,callout:''},esc),/market-point-callout/);
 assert.ok(!companyIconVisual({id:'a',label:'企業',callout:'<script>'},esc).includes('<script>'));
 const c=homeRecommendSettings({});c.pointLinks[0].callout='あ'.repeat(21);assert.throws(()=>validateHomeRecommendSettings(c),/20文字/);
});
