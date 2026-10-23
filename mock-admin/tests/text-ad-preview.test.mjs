import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {initialState,homeTabsFor} from '../model.js';
import {framePlacement} from '../../mock-app/carousel-model.js';
import {bannerPreviewTarget} from '../../mock-app/banner-preview-model.js';

function setup(){
 const state=initialState(),original=JSON.stringify(state),caption={textContent:''},opened=[],sent=[],timers=[];
 const form={dataset:{section:'text'},elements:{},querySelector:()=>({querySelector:()=>caption})};
 let handler;const draft={id:'draft-text',title:'保存前の新しい広告文',to:'https://example.com/',enabled:false,start:'2099-01-01',end:'2099-01-31',placements:['pill']};
 const context=vm.createContext({framePlacement,bannerPreviewTarget,homeTabsFor,URL,structuredClone,location:{href:'http://localhost:4204/mock-admin/#banners/offers/text',origin:'http://localhost:4204'},document:{querySelector:selector=>selector.includes('[data-section="text"]')?form:null,addEventListener:(_,fn)=>{handler=fn;}},window:{open:url=>{opened.push(url);return {closed:false,document:{readyState:'complete'},location:{href:url},postMessage:(payload,origin)=>sent.push({payload,origin})};}},setInterval:fn=>{timers.push(fn);return timers.length;},clearInterval:()=>{}});
 const source=readFileSync(new URL('../banner-preview.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
 vm.runInContext(source,context);
 context.initPlacementPreview(()=>state,(f,preview)=>{assert.equal(f,form);assert.equal(preview,true);return {...draft};});
 return {state,original,caption,opened,sent,draft,click(){handler({target:{closest:()=>true}});while(timers.length)timers.shift()();}};
}
test('テキスト広告の下書きをお得画面へ送り、保存済み状態を変えない',()=>{
 const t=setup();t.click();assert.equal(t.opened[0],'http://localhost:4204/mock-app/?bannerPreview=1#offers');
 assert.equal(t.sent[0].payload.placement,'pill');assert.equal(t.sent[0].payload.slot.title,t.draft.title);
 assert.equal(t.sent[0].origin,'http://localhost:4204');assert.equal(JSON.stringify(t.state),t.original);
 t.draft.title='修正後の広告文';t.click();assert.equal(t.sent[1].payload.slot.title,'修正後の広告文');
 assert.equal(t.sent[1].payload.slot.enabled,false);assert.equal(t.sent[1].payload.slot.start,'2099-01-01');
});
test('空欄・文字数超過は案内を表示し、プレビューを開かない',()=>{
 for(const title of ['   ','あ'.repeat(121)]){const t=setup();t.draft.title=title;t.click();assert.match(t.caption.textContent,/1〜120文字/);assert.equal(t.opened.length,0);}
});
