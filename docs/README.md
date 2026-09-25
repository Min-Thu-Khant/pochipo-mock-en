# ドキュメント案内

| 保存先 | 内容・編集するもの |
| --- | --- |
| [product/](product/README.md) | 全体構想、Tier／Phase、システム構成、複数アプリ・キャンペーンの検討案 |
| [prd/](prd/README.md) | F01〜F18の個別PRD、全体の共通方針、達成条件・変更履歴 |
| [features/](features/README.md) | 機能一覧の列・同期方針・採番ルール |
| [meetings/](meetings/README.md) | 議事録の保管・参照ルール（本文・会議要約はGitに保存しない） |
| [handoff/](handoff/README.md) | 同じ版のモック・PRD・機能一覧を渡すための記録 |
| [templates/](templates/README.md) | PRD・会議・引き渡しのFMT |
| [mock-guides/](mock-guides/README.md) | モックの再現手順・デモ値・制約 |
| [references/](references/README.md) | 旧仕様との比較、参照元の案内 |
| [archive/](archive/README.md) | 過去の試作・調査・統合記録 |

[運用フロー](workflow.md)に沿って、会議の決定をPRDと機能要件表に反映します。モックは別途依頼時に更新します。置き場所の判断と旧パスは[構成と移動一覧](repository-structure.md)を参照してください。

全体構想は機能ごとの要件を検討する入口、PRDはその機能の詳細を書く場所です。モックの説明をPRDの代わりにしたり、試作記録を確定仕様へ昇格させたりしません。

最新mainの[要件整理v0.10](product/personalization/README.md)と[アプリの18機能ドラフト](prd/app-requirements/README.md)は、本文・図・閲覧用HTML・根拠を一式で移動しています。根拠の固定コミットと検証記録は作成時点の情報を保持しています。

機能ごとの編集は[個別PRD一覧](prd/features/README.md)から始めます。全体PRDは共通方針・一覧の入口です。
