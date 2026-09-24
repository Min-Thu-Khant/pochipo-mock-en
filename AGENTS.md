# Pochipoを扱うAIへ

最初に`README.md`、`docs/README.md`、`docs/workflow.md`を読む。配置は`docs/repository-structure.md`に従う。

## 仕様と成果物

- 全体構想は`docs/product/`、機能別の要件・履歴は`docs/prd/`。検討案や見本値を確定仕様にしない。
- 新規の個別PRDは`docs/templates/feature-prd.md`を使用する。機能IDは`PCH-F-0001`形式で固定し、仕様状態とモック状態を分ける。
- 既存の18機能ドラフトは`docs/prd/app-requirements/`に根拠・検証記録ごと保持する。既存IDのF01〜F18は変更せず、個別PRDへ分割する場合は新旧IDの対応を明記し、同じ機能を重複採番しない。
- 仕様・モックを変更する際は、影響するPRD・完成条件・履歴も更新する。PRDがない既存機能は未採番・未整理であることを明示し、範囲を確認して起票する。
- 会議の決定と提案を分け、原本の根拠を残す。過去の会議や検討資料を最新仕様として上書きしない。
- 機能一覧の編集元はPRD。Sheetsの提案を採用する場合はPRDへ戻してから一覧を更新する。同期・会議取り込みは未実装。
- `docs/product/personalization/`の本文・図を更新したら、同梱の生成スクリプトでHTMLを再生成し、表示を確認する。移動だけの場合は生成物を作り直さない。
- `docs/archive/`と旧仕様の参考コピーは履歴・参考として扱う。原本の`poikatsu-spec`に書き込まない。

## コード・共同作業

- 仕様とモック本体はGitの最新mainを正とする。個人のローカル試作・仕様変更は手元に残し、今回の共有対象に混ぜない。bright-jelly / bright-jelly-plumpと必要な描画依存は共有対象。

- 既存モックのURLと同一オリジンでの状態共有を維持する。構成整理だけを理由に業務ルールやUIを変更しない。
- 部品集が存在する場合は`mock-app/design-system/AI-GUIDE.md`と`COMPONENTS.md`を読み、部品を再利用する。アイコンは`ICON-GUIDELINES.md`と`icon-logic.js`、Figma追加部品は`FIGMA-COMPONENT-AUDIT.md`がある場合にそれも読む。
- 別worktreeの未コミット部品集を、このブランチへ統合済みとして扱わない。作業途中の変更を勝手に上書き・削除・コミットしない。
- 資料を移動したら内部リンクと`scripts/document-paths.json`の旧URL転送を更新する。参考コピーの欠落リンクを確認済みとみなさない。
- 確認コマンドは`npm run check`、`npm run docs:check`、`npm test`。変更に応じたモック操作も確認する。

## Driveと外部共有

`docs/drive-access.md`の許可範囲を守る。範囲外にアクセスする前に必ずユーザーの許可を得る。Driveの整理はユーザーが担当する。依頼なしに外部フォルダ・シートを作成・編集しない。
