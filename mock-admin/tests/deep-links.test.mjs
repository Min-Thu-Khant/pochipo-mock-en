import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState} from '../model.js';
import {deepLinkUrl,resolveBannerLink} from '../../mock-app/deep-links.js';
const admin='http://localhost:4174/mock-admin/#banners';
test('案件・特集のURLを発行して保存可能な内部リンクへ戻す',()=>{const s=initialState();for(const route of ['offer/travel','feature/autumn-trip']){const url=deepLinkUrl(route,admin);assert.equal(url,'http://localhost:4174/mock-app/#'+route);assert.equal(resolveBannerLink(s,url,admin).to,route);}assert.equal(resolveBannerLink(s,' #offer/shop ',admin).destination,'shop');assert.equal(resolveBannerLink(s,'feature/autumn-trip',admin).destination,null);});
test('不明な案件・特集、別サイト、スクリプト、壊れたリンクを拒否',()=>{const s=initialState();for(const value of ['offer/missing','feature/missing','javascript:alert(1)','https://other.example/mock-app/#offer/travel','http://localhost:4174/other/#offer/travel','home',''])assert.throws(()=>resolveBannerLink(s,value,admin));});
