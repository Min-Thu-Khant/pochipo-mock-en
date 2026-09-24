# デザイン部品を扱うAIへ

対象案の`AI-GUIDE.md`・`COMPONENTS.md`・`DESIGN-NOTES.md`を最初に読む。共通描画コードは[components.js](components.js)、線画の規則は[ICON-GUIDELINES.md](ICON-GUIDELINES.md)。

- 対象案の色・アイコン・文字のルールを優先する。多色ジェリー案に単色線画の規則を一律に適用しない。
- 見本の数値・達成条件・画面構成を、アプリ本体の確定仕様にしない。
- 仕様とアプリ本体はGitのmainを正とし、ローカルで検討した仕様を取り込まない。
- 部品IDと機能IDは分ける。機能要件は`docs/prd/`の対象PRDを読む。
- 共通描画コードの変更は両案で確認する。`preview-base.css`は部品集専用で、アプリ本体のCSSとは分離する。
- 素材の出典・フォントのライセンス・既存の検証記録を維持する。
