# デザインコンポーネント

共有対象は次の2案です。アプリ本体の仕様・配色を切り替えず、部品の表示と操作を比較します。

| 案 | 部品集 | 組み合わせ例 | 作業ガイド |
| --- | --- | --- | --- |
| ブライトジェリー | [部品集](bright-jelly/index.html) | [プレビュー](bright-jelly/preview.html) | [AI-GUIDE](bright-jelly/AI-GUIDE.md) |
| ぷるんとジェリー | [部品集](bright-jelly-plump/index.html) | [プレビュー](bright-jelly-plump/preview.html) | [AI-GUIDE](bright-jelly-plump/AI-GUIDE.md) |

ルートの`npm start`で起動し、`http://localhost:4173/mock-app/design-system/bright-jelly/`または`bright-jelly-plump/`を開きます。

## 共通の依存ファイル

- `components.js`：表示用HTMLの組み立て。状態変更・本番の業務処理を担わない。
- `icons.js`・`icons.css`・`icon-logic.js`：線画アイコンと再生成ルール。
- `colors.css`・`typography.css`：部品集の色・文字の基準。
- `preview-base.css`：共有時点のプレビュー用レイアウト。元の作業用CSSを部品集の内側に保存し、アプリ本体の`styles.css`へ適用しない。
- `../assets/figma-icons/`・`../assets/generated/dice-v2/`：部品が使用するSVG。
- 各案の`assets/`：ジェリーPNG。ぷるんと版にはフォントとライセンスを同梱。

数値の書式とカテゴリ名はGit版の`../model.js`を参照します。ローカルで変更したモデルは含めません。案の見本値を本番の仕様として採用しないでください。

元の作業用モック・仕様変更・通常版カタログ全体は共有対象に含めていません。既存のverification画像・検証記録は作成時点のものです。
