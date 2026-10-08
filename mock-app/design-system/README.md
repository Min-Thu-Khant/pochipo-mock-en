# デザインコンポーネント

現在のアプリのカラー・アイコンを使う部品集は、[現行UIコンポーネント](app-theme/library.html)です。[使い方・参考Figmaとの対応](app-theme/LIBRARY.md)も参照してください。

2026-10-08の共有対象は、4173で確認しているアプリ本体と、この現行UIコンポーネントです。デイリーミッションの受取導線、アンケート一覧、チャレンジ達成表示などの変更を関連PRDと併せて管理します。`npm start`後、`http://localhost:4173/mock-app/design-system/app-theme/library.html`で開けます。ヘッダーの¥100,000やアンケートの報酬範囲は表示確認用の仮値です。

以下の2案は過去の検討版です。アプリ本体の仕様・配色を切り替えず、部品の表示と操作を比較します。

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

過去のジェリー2案は共有当時の`../model.js`を参照する検討版です。現行アプリ・部品集のモックモデルとは区別し、案の見本値を本番の仕様として採用しないでください。

ジェリー2案の初回共有時は作業用モック・仕様変更・通常版カタログ全体を対象外としていました。今回の現行アプリ・部品集の共有範囲は冒頭の案内を参照してください。既存のverification画像・検証記録は作成時点のもので、今回の実表示確認を示すものではありません。
