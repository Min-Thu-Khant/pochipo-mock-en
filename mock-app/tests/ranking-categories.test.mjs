import test from 'node:test';
import assert from 'node:assert/strict';
import {offers} from '../model.js';
import {RANKING_TABS,matchesRankingCategory} from '../ranking-categories.js';
test('ランキングのタブは指定の7つ・指定順',()=>{
 assert.deepEqual(RANKING_TABS.map(x=>x[1]),['総合','カード','口座開設','ゲーム','エンタメ','買い物','旅行']);
});
test('カードと口座開設は重複せず、既存の金融案件を分類する',()=>{
 const cards=offers.filter(o=>matchesRankingCategory(o,'credit')).map(o=>o.id);
 assert.deepEqual(cards,['card','luna-card','leaf-card','trip-card']);
 const finance=offers.filter(o=>matchesRankingCategory(o,'finance')).map(o=>o.id);
 assert.deepEqual(finance,['pay','sec']);
 assert.ok(cards.every(id=>!finance.includes(id)));
});
test('総合の対象案件は維持し、旅行・ゲームは対応する案件のみ',()=>{
 assert.ok(offers.every(o=>matchesRankingCategory(o,'all')));
 assert.deepEqual(offers.filter(o=>matchesRankingCategory(o,'travel')).map(o=>o.id),['travel']);
 assert.ok(offers.filter(o=>matchesRankingCategory(o,'game')).every(o=>o.category==='ゲーム'));
 assert.equal(matchesRankingCategory({category:'アプリ'},'game'),false);
});
test('エンタメには動画案件を含め、ゲームや一般ニュースは含めない',()=>{
 assert.deepEqual(offers.filter(o=>matchesRankingCategory(o,'entertainment')).map(o=>o.id),['video']);
 assert.equal(matchesRankingCategory({category:'エンタメ'},'entertainment'),true);
 assert.equal(matchesRankingCategory({category:'金融',name:'動画特典付きカード'},'entertainment'),false);
});
test('買い物には通販・美容・家具を含む',()=>{
 assert.deepEqual(offers.filter(o=>matchesRankingCategory(o,'shopping')).map(o=>o.id),['shop','marche','cosme','interior']);
});
