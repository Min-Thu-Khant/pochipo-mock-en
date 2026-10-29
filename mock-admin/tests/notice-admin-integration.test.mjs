import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=readFileSync(new URL('../admin.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../admin.css',import.meta.url),'utf8');

test('運営お知らせ・企業アイコン・友達招待の管理入口を同時に維持する',()=>{
 for(const entry of ["['notices','運営お知らせ','new']","['quick-links','企業アイコン設定','new']","['invite-settings','友達招待設定','new']"]){
  assert.ok(source.includes(entry),entry);
 }
 assert.ok(source.includes("notices:['運営お知らせ',()=>noticeManagement(state)]"));
 assert.ok(source.includes("pages['quick-links']=['企業アイコン設定',()=>companyIconsEditor(state,esc)]"));
 assert.ok(source.includes("'invite-settings':['友達招待設定',()=>inviteEditor(state,esc)]"));
});

test('お知らせの操作登録と既存管理機能の保存処理を維持する',()=>{
 assert.ok(source.includes('bindNoticeManagement(root,{load,getState:()=>state,save,render,toast,audit})'));
 assert.ok(source.includes('bindCompanyIconLimits(document,toast)'));
 assert.ok(source.includes('readHomeRecommendForm(f,homeRecommendOffers(),state)'));
 assert.match(source,/saveInviteSettings\(state,/);
 assert.ok(styles.includes('.company-icons-admin'));
 assert.ok(styles.includes('.notice-fields'));
});
