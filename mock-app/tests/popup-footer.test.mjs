import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
function setup(){
 const context=vm.createContext({state:{},modal:{open:false,removeAttribute(){},setAttribute(){},showModal(){this.open=true;}},accountUI:{isScreen:()=>false},route:()=> 'home',adSession:{},rememberDialogFocus(){},initBannerCarousels(){},record(){},markPopupSeen(){},save(){},positionInterstitial(){},featureById:()=>null,esc:String,bannerHref:s=>s,slotLink:s=>s.to,uploadedBanner:()=>'',generatedBanner:()=>'',icon:s=>s,button:(label,action,cls,attrs='')=>`<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`});
 const start=source.indexOf('function popupBanner(');
 const end=source.indexOf('\n}',source.indexOf('function showInterstitial(',start))+2;
 assert.ok(start>=0&&end>start);
 vm.runInContext(source.slice(start,end),context);
 return context;
}
const slot={id:'test-popup',title:'広告',text:'説明',to:'offers'};
test('起動時POPUPは下部ボタンを出さず、閉じる×と広告リンクを残す',()=>{
 const ctx=setup();ctx.showPopup(slot);
 assert.doesNotMatch(ctx.modal.innerHTML,/あとで見る|text-link wide/);
 assert.match(ctx.modal.innerHTML,/aria-label="閉じる"/);
 assert.match(ctx.modal.innerHTML,/data-action="popup-go"/);
 assert.ok(ctx.modal.innerHTML.endsWith('</a></div></div>'));
});
test('画面間広告は起動時POPUPと同じサイズクラス・マークアップを使用する',()=>{
 const ctx=setup();ctx.showInterstitial(slot);
 assert.equal(ctx.modal.className,'popup interstitial');
 assert.doesNotMatch(ctx.modal.innerHTML,/あとで見る|interstitial-label/);
 assert.match(ctx.modal.innerHTML,/aria-label="閉じる"/);
 assert.match(ctx.modal.innerHTML,/data-banner-size="300x250"/);
 const popup=setup();popup.showPopup(slot);
 assert.equal(ctx.modal.innerHTML,popup.modal.innerHTML);
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 assert.doesNotMatch(css,/dialog\.interstitial\s*\{|\.interstitial\s+\.popup-/);
});
