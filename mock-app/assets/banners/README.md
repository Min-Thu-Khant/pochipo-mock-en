# デモ広告画像（2026-09-17）

組み込みの image_gen で生成した架空サービス向けの広告。画像原本は生成先に保存したまま、Web用JPEGをこのディレクトリに配置した。画像の内容を切り抜かず、縦横比を維持して縮小・余白を追加している。

横長画像は640×200（320×100枠の2倍解像度）、矩形画像は600×500（300×250枠の2倍解像度）。管理画面へアップロードする場合は、配信枠の規定サイズに縮小する。

アプリでは `demo-banner-art.js` が既存の遷移先に対応する画像を選ぶ。管理画面でアップロードした画像が最優先。保存済みの運用設定、配信日、公開状態、遷移先は変更しない。カードは共通背景画像にサービスごとの文字を重ねる。

## 使用したプロンプト

### travel-wide.jpg

Use case: ads-marketing. Generate a finished Japanese mobile display advertising banner for fictional travel service 旅日和トラベル. Very wide horizontal rectangle, exactly 3.2:1 aspect ratio (320x100 placement, generate high resolution). Full bleed square corners, no border, no device or mockup. Premium realistic Japanese autumn lakeside ryokan landscape on right 45%, warm ivory and deep forest green left text area, elegant tasteful travel magazine art direction. Clearly legible exact Japanese headline on left in two short lines: 「秋の休日、」「旅に出よう。」. Small brand above 「旅日和トラベル」 and modest rectangular CTA below 「特集を見る →」. Minimal 3 text groups total, generous whitespace, strong contrast, no tiny legal copy, no price promises, no overlapping elements. Clean professional advertising one banner only.

### game-wide.jpg

Use case: ads-marketing. Finished display ad for fictional Japanese mobile game 星ねこクエスト. Wide 3.2:1 rectangle full bleed square corners. Professional polished playful game key visual. Right half: adorable white cat explorer with navy cape on a floating island under indigo starry sky, golden stars, whimsical premium 3D illustrated game art. Left half dark indigo negative space with large very legible Japanese exact title 「星ねこクエスト」, smaller subtitle 「星を集めて、冒険へ。」 and one yellow rectangular CTA 「ゲームを見る →」. Strong hierarchy, just three text groups, nothing overlaps, no tiny print, no rewards or price claims, one banner only, no device frame.

### shopping-wide.jpg

Use case: ads-marketing. Finished Japanese ecommerce advertising banner for fictional brand モリノマルシェ. Wide horizontal exactly 3.2:1 aspect, full bleed sharp square corners. Editorial product photograph on right: artisan cream ceramic mug, linen tote bag, small vase and fresh green branch on warm natural wood with morning sunlight. Left creamy ivory quiet area with legible deep forest green exact text: small brand 「モリノマルシェ」 then large headline 「暮らしに、小さなごほうび。」 on two lines and simple dark green rectangular CTA 「お買い物へ →」. Clean realistic professional Japanese lifestyle display ad. Generous whitespace, just three text groups. No prices, claims, tiny text, overlapping objects or extra text, no frame.

### card-background.jpg

Use case: ads-marketing. Photorealistic premium display advertisement art background for fictional credit card services. Wide horizontal 3.2:1 ratio, full bleed square corners. Left 60% very dark midnight navy smooth empty negative space suitable for Japanese headline overlay. Right 40% two elegant blank unbranded platinum and navy payment cards standing diagonally on a simple pale stone pedestal, subtle realistic gold chip, refined studio lighting. No card numbers, no text, no logos, no bank brands, no rounded outer canvas. Restrained beautiful commercial photography, sharp focus, no clutter. One banner background only.

### cosme-rectangle.jpg

Use case: ads-marketing. Finished Japanese cosmetic display advertisement for fictional LUMI コスメ. Rectangle 6:5 aspect ratio (300x250 ad placement at high resolution), full bleed square corners. Premium blush pink and ivory cosmetics campaign. Bottom right 55%: realistic pearlescent serum bottle, lip tint and clean cream jar on ivory pedestal with soft warm studio light and delicate floral shadow. Top left generous negative space with exact readable text: small brand 「LUMI コスメ」; large two-line headline 「いつもの私に、」「ひとさじの彩り。」; small simple rectangular dark rose CTA 「コレクションを見る →」. Editorial elegant typography clear at mobile size. No prices, no fake effectiveness claims, no tiny print, no extra text or frame.

### cafe-rectangle.jpg

Use case: ads-marketing. Finished Japanese mobile cozy game display advertisement for fictional こもれびカフェ物語. Rectangle 6:5 aspect ratio for 300x250 placement at high resolution, full bleed sharp outer corners. Warm charming illustrated miniature woodland cafe, sunbeams through trees, tiny cute animal customers and coffee cup, premium cozy game artwork lower right two thirds. Cream colored clear upper left area with exact Japanese text: small 「こもれびカフェ物語」; large two-line 「小さなカフェの、」「大きな夢。」; dark forest green rectangular CTA 「ゲームを見る →」. Typography very legible with generous clear space. No extra text, no rewards or prices, no UI frame, no rounded canvas.

### travel-rectangle.jpg

Use case: ads-marketing. Finished Japanese travel display advertisement for fictional 旅日和トラベル. Rectangle6:5 aspect ratio, 300x250 placement high resolution, sharp square corners full bleed. Beautiful photorealistic autumn Japanese lakeside ryokan outdoor hot spring at sunset filling lower two thirds. Upper left warm ivory gradient reserved for typography: small 「旅日和トラベル」; big readable 「秋の休日、旅に出よう。」 on two lines. Bottom rectangular deep green CTA 「特集を見る →」. Premium travel magazine design, calm clear hierarchy, no prices no tiny text no decorative badges no mockup. One complete ad.

### finance-wide.jpg

Use case: ads-marketing. Finished fictional Japanese securities service advertisement for サンプル証券. Wide rectangle3.2:1, sharp square corners full bleed. Premium navy and light blue palette. Right half clean photorealistic small glass architectural towers and bright morning city skyline with subtle abstract upward steps, avoid profit graphs and any guarantee. Left white to pale blue open area: small 「サンプル証券」; large two-line headline 「未来のための、」「はじめの一歩。」; simple navy rectangular CTA 「特集を見る →」. Professional restrained typography, 3 text groups only, generous whitespace, no money amount, no guaranteed financial claims, no tiny text, no device frame.


## サンプル証券のサイズ修正

使用画像を `finance-wide-v2.jpg` に更新。実寸640×200、表示枠320×100と同じ3.2:1。組み込みimage_genで横長に再構成し、縮小後の上下数ピクセルのみ整えて実寸を検証した。旧画像は未使用。

### 修正プロンプト

Edit this Japanese securities banner into an EXACT 2240 x 700 pixel ultra-wide display ad (aspect ratio 3.2:1). Recompose the design to fill the entire wide canvas edge to edge; do NOT add padding, letterbox bars, frames, or stretch the original. Preserve the navy/pale blue color palette, clear blue city buildings on the right, brand サンプル証券, headline 「未来のための、」「はじめの一歩。」, and rectangular CTA 「特集を見る →」. Left half contains clear spacious typography and CTA, right half the photographic modern glass buildings. Keep all text legible and completely inside canvas with 5% safety margins. Sharp outer corners. Output one finished ultra-wide 2240 by 700 banner only.
