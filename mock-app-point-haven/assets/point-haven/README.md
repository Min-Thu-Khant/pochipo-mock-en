# ポイントヘイブン 南国ジェリー素材

2026-09-28。built-in image_genで作成した新規素材。既存素材の原本ではない。

`tropical-atlas.png` は16点の透過画像をまとめた素材。アプリの `havenArt()` で各領域を表示する。島、ウミガメ、貝、熱帯魚、花、サンダル、ヒトデ、巻貝、ココナッツ、巻物、宝箱、財布、シュノーケル、ハリセンボン、波、コインを収録。

元のフラットな `island.svg` は未使用。色の参照元は bright-jelly-plump/tokens.css。既存の名称ラベルと操作を維持し、装飾を変更する。

## 生成プロンプト

```text
Create a single production UI sprite atlas for Point Haven tropical rewards app, 2048 square, exactly 4 columns x 4 rows equal square cells, transparent alpha background, no grid lines, no text labels. Each object centered in its cell with 12% clear padding, no overlap across cells. Match supplied reference ONLY for colorful plump candy jelly rendering: very bright saturated lime green #58CC02, sky blue #1CB0F6, coral #FF4B4B, yellow #FFC800, purple #A855F7, orange #FF9600. Thick rounded volumes, 3D depth lower-right, creamy upper-left highlights, smooth toy gummy surfaces, clean simple silhouettes. NOT flat vector, NOT muted pastel, no black outlines. All tropical ocean theme. Row1 left-to-right: (1) dimensional palm-tree sandy island sitting on a thick turquoise water disc with a few gold coins (2) adorable baby sea turtle mascot with big kind eyes, bright lime skin and turquoise raised segmented shell, three-quarter face, waving flipper (3) plump coral pink scallop shell with white pearl (4) bright orange and blue tropical fish. Row2: (1) red hibiscus flower (2) lime tropical beach flip-flops (3) golden starfish (4) purple conch shell. Row3: (1) coconut drink with green leaf and blue straw (2) ivory message scroll with coral pink shell seal (3) open wooden treasure chest overflowing with chunky yellow coins (4) turquoise waterproof card wallet with tiny hibiscus emblem. Row4: (1) cobalt diving mask with orange snorkel (2) yellow pufferfish mascot (3) blue tropical wave with white rounded crest (4) golden thick P reward coin. Keep each of 16 items separate and optically comparable. Full alpha background, no tiles or white backdrop.
```

## 追加アイコン

内蔵image_genで同じアトラスをスタイル参照に生成。

- `home.png`: 木製の南国バンガロー。ライムの葉屋根、ターコイズのドア、厚みのあるジェリー表現、透過背景。
- `receipt.png`: 切り取り線のある白いレシート。青緑の明細線、ハイビスカス、同じ立体表現、透過背景。

生成指示は共通して、中央配置、32pxでも認識できる単純な形状、左上のハイライト、鮮やかな色、文字なし、背景タイルなしとした。
