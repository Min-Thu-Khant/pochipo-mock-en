# 源柔ゴシック

この別案には源柔ゴシックをWebフォントとして同梱しています。閲覧者のPCへのインストールや、実行時の外部フォントAPI接続は不要です。

- 本文：Regular / 400
- 見出し・ボタン：Medium / 500〜600（同じMediumファイルを使用）
- 強調数値：Bold / 700
- フォールバック：ヒラギノ丸ゴ ProN → ヒラギノ角ゴ → sans-serif
- 適用範囲：`bright-jelly-plump` のみ。旧版のフォントは変更していません。

取得元：Google Fonts管理の公開アーカイブ [genjyuugothic](https://github.com/googlefonts/chinese/tree/gh-pages/fonts/genjyuugothic)。3点のWOFF2を改変せず保存しました。

作者の説明・著作権情報：[README_GenJyuu.txt](assets/fonts/README_GenJyuu.txt)。
配布ライセンス原文：[SIL Open Font License 1.1](assets/fonts/SIL_Open_Font_License_1.1.txt)。フォントを配布する際はこれらも含めてください。

日本語グリフを広く含むため3ウェイト合計約10MBあります。本番公開前には必要な文字範囲に応じた軽量化を検討します。この試作では文字抜けを避けるため元ファイルを使用しています。
