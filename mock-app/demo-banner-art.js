// 同梱する架空広告。運用でアップロードした画像を常に優先する。
import {slotBannerSize} from './banner-sizes.js';
const asset=name=>new URL(`./assets/banners/${name}.jpg`,import.meta.url).href;
export function demoBannerArt(slot){
 const target=slot.to||`offer/${slot.destination}`;
 const size=slotBannerSize(slot);if(!size)return null;
 const wide=size.width===320&&size.height===100,rectangle=size.width===300&&size.height===250;
 const photo=(name,alt)=>({src:asset(name),alt});
 if(['offer/travel','feature/autumn-trip'].includes(target))return wide?photo('travel-wide','旅日和トラベル。秋の休日、旅に出よう。特集を見る'):rectangle?photo('travel-rectangle','旅日和トラベル。秋の休日、旅に出よう。特集を見る'):null;
 if(target==='offer/starquest'&&wide)return photo('game-wide','星ねこクエスト。星を集めて、冒険へ。ゲームを見る');
 if(target==='offer/marche'&&wide)return photo('shopping-wide','モリノマルシェ。暮らしに、小さなごほうび。お買い物へ');
 if(target==='offer/cafe-game'&&rectangle)return photo('cafe-rectangle','こもれびカフェ物語。小さなカフェの、大きな夢。ゲームを見る');
 if(target==='offer/cosme'&&rectangle)return photo('cosme-rectangle','LUMI コスメ。いつもの私に、ひとさじの彩り。コレクションを見る');
 if(['offer/sec','feature/sec-campaign'].includes(target)&&wide)return photo('finance-wide-v2','サンプル証券。未来のための、はじめの一歩。特集を見る');
 const cards={'offer/luna-card':['LUNAカード','わたしの毎日に、\n新しい1枚。'],'offer/leaf-card':['リーフカード','毎日の買い物を、\nもっと心地よく。'],'offer/trip-card':['トリップカード','次の旅を、\nもっと楽しみに。']};
 if(cards[target]&&(wide||rectangle)){const [brand,headline]=cards[target];return {...photo('card-background',''),brand,headline};}
 return null;
}
