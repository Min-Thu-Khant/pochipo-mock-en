# Pochipo

会議で検討した内容を、操作できるモック・機能別PRD・機能一覧として揃え、開発会社へ引き渡すためのリポジトリです。タメルコは既存資料・モックで使用している1本目のアプリの仮名称です。

## 最初に開くもの

| 目的 | 入口 |
| --- | --- |
| 最新の全体構想を読む | [プロダクト資料](docs/product/README.md) |
| 1本目のアプリの18機能を読む | [機能要件定義ドラフト](docs/prd/app-requirements/README.md) |
| 仕様・資料を探す | [ドキュメント一覧](docs/README.md) |
| 機能の仕様を書く | [機能別PRD](docs/prd/README.md)・[規定FMT](docs/templates/feature-prd.md) |
| 機能ID・優先度を管理する | [機能一覧の運用](docs/features/README.md) |
| 会議から成果物を更新する | [運用フロー](docs/workflow.md) |
| 開発会社へ渡す | [引き渡し手順](docs/handoff/README.md) |
| ファイルの置き場所を判断する | [構成と移動一覧](docs/repository-structure.md) |

## 起動・確認

Node.js 20以上。モックの起動とJavaScriptの検証に追加パッケージは不要です。

```bash
npm start           # http://localhost:4173/
npm test            # アプリ・管理画面・NACSの既存ロジック検証
npm run check       # JavaScript構文確認
npm run docs:check  # 資料の内部リンク・移動先確認
```

| モック | URL | 説明 |
| --- | --- | --- |
| アプリ | http://localhost:4173/mock-app/ | [README](mock-app/README.md) |
| 管理画面 | http://localhost:4173/mock-admin/ | [README](mock-admin/README.md) |
| 複数アプリ管理 | http://localhost:4173/mock-admin/console.html | アプリ追加・共通／個別設定の検討用 |
| NACS | http://localhost:4173/mock-nacs/ | [README](mock-nacs/README.md) |
| 連動デモ | http://localhost:4173/mock-demo/ | [README](mock-demo/README.md) |

これらはローカル確認用URLです。外部へ渡す際は、同じ版の共有URLまたは起動可能な一式を用意します。

## 構成

```text
mock-app/           アプリと共有ドメインモデル・素材・テスト
mock-admin/         管理画面・複数アプリ管理・テスト
mock-nacs/          外部サービス側の挙動を再現するモック・テスト
mock-demo/          連動デモ
docs/               全体構想・PRD・機能一覧・会議・引き渡し・参考資料
scripts/            資料の検証とパス移行情報
.github/            変更レビュー用テンプレート
design-lab/         ローカルで作業中のデザイン実験
output/             ローカルの生成物・調査出力
server.mjs          モックを同一オリジンで配信
AGENTS.md           AIが読む作業ルール
```

`design-lab/`と`output/`は個人の作業場所にある場合の配置です。共有対象には含めません。

## 現時点の位置づけ

- モックは架空のデータとlocalStorageを利用します。外部API・認証・実際の広告配信や報酬付与は未接続です。
- [要件整理v0.10](docs/product/personalization/specification-draft.md)は全体構想の検討資料です。機能別の確定PRDとは区別します。
- [18機能の個別PRD](docs/prd/features/README.md)を1機能1ファイルで管理します。IDはF01〜F18を維持。[全体PRD](docs/prd/app-requirements/requirements-draft.md)は共通方針と一覧の入口です。Sheetsは手動で更新済み、自動同期・会議の自動取り込みは未実装です。
- [旧仕様との差分](docs/references/legacy-spec-gap.md)と[試作履歴](docs/archive/README.md)は作成時点の記録です。数値や画面構成を自動的に最新仕様として採用しません。
- 既存サービスの仕様は[poikatsu-spec](https://github.com/ca-media-poi/poikatsu-spec)を参照します。本リポジトリから原本へ書き込みません。新仕様・旧仕様・モックに差があればPRDの未決事項へ記録します。

## 共同作業

機能単位の作業ブランチで、PRD・モック・関連記録をまとめて変更します。mainへの取り込み前に担当者が確認します。

共有するデザイン部品は[デザインコンポーネント](mock-app/design-system/README.md)を参照してください。bright-jelly / bright-jelly-plumpは検討版として独立し、アプリ本体のテーマや仕様を変更しません。

仕様とモック本体はGitのmainを正とし、個人のローカル試作や未確定の仕様変更はアップロード対象に混ぜません。
