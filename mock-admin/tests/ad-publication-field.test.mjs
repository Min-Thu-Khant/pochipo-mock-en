import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {adPublicationField,textAdDeliveryFields} from '../ad-publication-field.js';
import vm from 'node:vm';
import {bannerPreviewField} from '../banner-preview.js';

test('新規広告には公開状態の項目を表示せず、公開で保存する',()=>{
 for(const value of [null,undefined]){
  const html=adPublicationField(value);
  assert.equal(html,'<input type="hidden" name="enabled" value="1">');
  assert.doesNotMatch(html,/公開状態|<select/);
 }
});
test('既存広告の編集は公開・停止の状態を保持し選択できる',()=>{
 assert.match(adPublicationField({enabled:true}),/<option value="1" selected>/);
 assert.match(adPublicationField({enabled:false}),/<option value="0" selected>/);
 assert.match(adPublicationField({enabled:false,copyDraft:true}),/<option value="0" selected>/);
});
test('バナー・テキストの新規登録に共通部品を適用し、他の運用枠は変更しない',()=>{
 const banner=readFileSync(new URL('../carousel-editor.js',import.meta.url),'utf8');
 const admin=readFileSync(new URL('../admin.js',import.meta.url),'utf8');
 assert.ok(banner.includes('${adPublicationField(v)}'));
 assert.ok(admin.includes("${section==='text'?textAdDeliveryFields(o):`"));
 for(const source of [banner,admin])assert.ok(source.includes("enabled:fd.get('enabled')==='1'"));
});

test('テキスト広告の新規・編集・コピーで3項目を隠し配信設定を維持する',()=>{
 const source=readFileSync(new URL('../admin.js',import.meta.url),'utf8');
 const form=source.slice(source.indexOf('function slotForm('),source.indexOf('function campaignBanners('));
 const context=vm.createContext({slotSection:()=> 'text',state:{date:'2026-10-21',features:[]},crypto,esc:String,offersOf:()=>[],formError:'',adPublicationField,textAdDeliveryFields,bannerPreviewField});
 vm.runInContext(form,context);
 const cases=[null,{enabled:false,priority:0,segment:'finance'},{enabled:true,priority:90,segment:'new'},{enabled:false,priority:60,segment:'all',copyDraft:true}];
 for(const value of cases){
  context.record=value&&{id:'text-test',name:'テスト',title:'テキスト',to:'offer/travel',start:'2026-10-01',end:'2026-10-31',placements:['pill'],...value};
  const html=vm.runInContext('slotForm(record)',context);
  assert.doesNotMatch(html,/公開状態|対象者|優先度|<select name="(?:priority|enabled|segment)"/);
  assert.ok(html.includes(`type="hidden" name="priority" value="${value?.priority??50}"`));
  assert.ok(html.includes(`type="hidden" name="enabled" value="${value?.enabled===false?'0':'1'}"`));
  assert.ok(html.includes(`type="hidden" name="segment" value="${value?.segment??'all'}"`));
  assert.match(html,/管理名（必須）/);assert.match(html,/表示開始日/);assert.match(html,/表示終了日/);assert.match(html,/広告テキスト/);assert.match(html,/リンク先/);
  assert.match(html,/<button type="button" class="btn" data-preview-refresh>プレビュー/);
 }
});
