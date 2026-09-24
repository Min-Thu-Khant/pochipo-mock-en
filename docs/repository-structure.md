# ファイルの置き場所と移行記録

## 配置の原則

モックのURL・import・同一オリジンでの状態共有を維持するため、実行コードは既存の4フォルダに置きます。横断資料はdocsへ集約し、目的別に分類します。実行コード全体の機能分割は別の変更として扱います。

```text
docs/
├── product/                 全体構想と検討案
│   ├── personalization/     v0.10本文・NACS別添・図・生成スクリプト
│   └── proposals/           複数アプリ管理・キャンペーンの検討案
├── prd/                     今後の機能別PRD
│   └── app-requirements/    既存18機能（F01〜F18）の要件定義ドラフト一式
├── features/                一覧の列定義と採番・同期ルール
├── meetings/                MTG-YYYYMMDD-xxの会議記録
├── handoff/                 vX.Yの引き渡し記録
├── templates/               PRD・会議・引き渡しFMT
├── mock-guides/             操作・確認シナリオ
├── references/              旧仕様との比較
├── archive/prototype/       初期試作の履歴
├── workflow.md              更新手順
└── drive-access.md          外部資料へのアクセス範囲
```

素材・テストは利用するモックの近くに置きます。部品集は`mock-app/design-system/`に置き、検討中のテーマをアプリ本体へ自動適用しません。

## 既存資料の移動

| 旧パス | 新パス |
| --- | --- |
| `docs/personalization/` | `docs/product/personalization/`（生成物・参考コピーも一式移動） |
| `docs/app-requirements/` | `docs/prd/app-requirements/`（既存ID・本文・HTML・根拠・検証記録を一式保持） |
| `mock-admin/phase-plan.md` | `docs/product/proposals/admin-phase-plan.md` |
| `mock-admin/campaign-expansion-plan.md` | `docs/product/proposals/campaign-expansion-plan.md` |
| `mock-app/docs/01〜07-*.md` | `docs/archive/prototype/` |
| `mock-app/docs/08-spec-gap.md` | `docs/references/legacy-spec-gap.md` |
| `mock-app/docs/overlay-ads-demo.md` | `docs/mock-guides/overlay-ads-demo.md` |

正確な対応は[scripts/document-paths.json](../scripts/document-paths.json)。ルートの`npm start`では旧URLから新URLへ転送します。GitHub上の旧パスはリポジトリ履歴から参照してください。独自の静的ホストではこのJSONに沿って転送を設定する必要があります。

アプリ単体のサーバーはアプリ配下しか配信しません。横断資料や連動デモの確認にはルートの`npm start`を使います。

## 正式版とローカル試作

仕様とアプリ本体はGitの最新mainを基準にします。個人のローカルで変更した仕様・試作は、正式仕様やアップロード対象に混ぜません。今回共有するデザインコンポーネントは別案として扱い、見本値を本番仕様にしません。

`design-lab/`、`output/`、ローカルのLime Jelly関連ファイルは手元に残します。フォルダ単位の一括追加で混ぜず、Gitへ追加する対象を明示します。調査を正式に採用する場合は、出典と位置づけを確認したうえで適切なdocsへ移します。

## 資料の検証

`npm run docs:check`は資料のローカルMarkdownリンクと移動先の存在を検査します。外部URLの認証・到達性、文章の意味、HTML内アンカーは保証しません。未同梱の相対参照を持つNACS参考コピー3点は原文を保ち、検査対象外として表示します。参照元の固定版URLはNACS連携ガイドにあります。
