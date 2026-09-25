# 2026-09-25｜9/24会議取り込み後の手動同期

## 同期元・同期先

- 原本：[ポイ活合宿](https://docs.google.com/document/d/1uG99tbPdXhf6eFEs_udgMiGXCYYTCiBhM-Vtq0UAXHQ/edit?tab=t.p4twfmsu6ox2)。同じ文書のメモと文字起こしを照合。
- 根拠：[MTG-20260924-01](https://docs.google.com/document/d/1uG99tbPdXhf6eFEs_udgMiGXCYYTCiBhM-Vtq0UAXHQ/edit?tab=t.p4twfmsu6ox2)。議事録の本文・要約はGitに保存せず、仕様に必要な決定事項・未決事項は個別PRDで管理する。
- 編集元：[F01〜F18の個別PRD](../prd/features/README.md)と[全体PRD v0.4](../prd/app-requirements/requirements-draft.md)。変更履歴を各ファイルに保持。
- ベースコミット：`6068b5012c680f347f41a995aba9e4dcbbd2ea9c`。今回のPRD・分割は未コミットのローカル変更。mainへ反映済みとは扱わない。
- 同期先：[新ポイ活 機能要件表](https://docs.google.com/spreadsheets/d/1g00ZxLGprVNT4T4uSmzw--vRpp95HQ1Uq9i8GnJpmS4/edit)。既存ファイルを更新。ファイル名・共有設定は変更していない。
- [前回同期](sync-20260925.md)は原本取得前の履歴として保持。今回で原本待ちを解消した。自動取り込み・自動同期の実装ではない。

## 反映結果

既存F01〜F18のIDで対応を確認し、値が異なる90セルだけを書き換えた。Phase1〜3の定義は維持し、F07の対象群別配信を「Phase1見積候補・難しければPhase2」へ訂正。会議で全18機能のPhaseが合意されたとは記載していない。

| タブ | 確認した範囲 | 値の更新数 | 内容 |
| --- | --- | --- | --- |
| 機能要件一覧 | A1:N32 | 39 | 取得状況、目的・達成条件・範囲、モックとの差、根拠。31行目へ履歴追加 |
| 機能要件詳細（非表示） | A1:E181 | 35 | 個別PRDの180観点と照合し、変更した本文・見出しを更新。D1の注記も更新 |
| 共通・運用要件（非表示） | A1:E29 | 1 | ミッション設定の対象群・採否を訂正 |
| 未決事項（非表示） | A1:F19 | 4 | Q07・Q08・Q11・Q12を更新。ID・担当・未決状態を保持 |
| Phase定義 | A1:D12 | 11 | 原本URL・確認済み状態、グループ配信の条件付き優先度、歩数許諾、現在版 |

機能一覧のJ列（main）・K列（初回履歴リンク）は保持。個別PRDはまだGitへ公開していないため、存在しない個別ファイルURLを公開済みのリンクとして追加していない。N列にローカルの個別PRDパスと未コミット状態を明記した。

## 検証

- 書き込み後、90セルを読み戻し、生成元と全件一致。変更対象外の1,465セルの値も一致。
- 既存1,552セルの書式を照合。Phase定義C10への新原本URLの自動リンク付与以外は保持。履歴31行目は30行目から書式だけをコピー。
- ネイティブテーブル `PochipoFeatures`（A6:N24）、Phase1〜3／仕様状態のドロップダウン、固定行列・非表示タブを保持。セルのデータ検証ルールを上書きしていない。
- ブラウザー操作面とartifact_tool_v2が利用できないため、Google Sheetsの画面レンダリングは未確認。APIで折り返し、上揃え、フォント、既存色、固定位置と値を確認する代替検証を実施。
- 個別PRD18件・各7項目、IDとリンク、HTMLの各機能入口を検証。リポジトリの確認結果は下記に追記する。

## 残る作業

仕様承認・開発見積・実API連携は未完了。モックの5件表示、マイページの準備中と旧交換導線、ミニゲの表記差などは各PRDに記録した。今回の依頼ではモックを参照し、コード変更・デプロイ・commit・pushは行っていない。

更新後のPRDをGitへ統合してから、Sheetsの公開参照先を同じ版へ揃える。自動同期が稼働しているとは扱わない。

## ローカル検証結果と版の識別

`npm run docs:check`（83 Markdown・504リンク・13移動先）、`npm run check`、`npm test`（153件成功）を確認。外部URL、実機、本番APIの検証ではない。別途18個別PRD・7項目FMTとHTML内の機能／Qアンカー・操作要素・相対リンクを確認した。

以下は今回同期元のファイル内容SHA-256。未コミット状態でも同期版を識別できるように保持する。

| ファイル | SHA-256 |
| --- | --- |
| `docs/prd/features/F01-account.md` | `5d3ed30c7c3a414abce6cc787fa5c8fd18837dc3278dc108e2ed7544d77e27f5` |
| `docs/prd/features/F02-home.md` | `66cc107bb502a3695cfc36422453835012eef287ebf41f39a8f45078fe2feaf4` |
| `docs/prd/features/F03-offer-list.md` | `aa7be3e9d1c79c7b9c6d2765a3e5eaa6f323854b784a3c83db2b63f01b0dcbe2` |
| `docs/prd/features/F04-offer-entry.md` | `e35fe95a3110d5429a47fe9e01f9d63406cbb27c6157a37aaab0122e6b244524` |
| `docs/prd/features/F05-my-offers.md` | `a7c176f57ef551cb5601486c790457649d15ed1908ee93c3e7f72654ecce3c7a` |
| `docs/prd/features/F06-challenge-bonus.md` | `c44f577230501d4ffc038612ad58a02091775f95c158ba401766d756ad15d0f2` |
| `docs/prd/features/F07-daily-mission.md` | `f85dcd924a83967280a6eea76a19515c6bee00bf54eb546f5b98ed87a7055fa0` |
| `docs/prd/features/F08-walking.md` | `c70a0a5fca6ab65a72110643e268c27a41fcc6c25ce9e0f63d6cf78f80e04577` |
| `docs/prd/features/F09-rewarded-video.md` | `8bcf9e99e11408f9142ed0834ea251488ce12f5b6319fa8cb07ac39d7a126a77` |
| `docs/prd/features/F10-surveys.md` | `8e94a3b54600264d85ba730f7223a20bcd24038bac6076ae6dfd339aa0292c79` |
| `docs/prd/features/F11-mini-games.md` | `298d9f1758f37eb69f40fe451c0ddb5efa1ac48127f27155c188f8d91e91033f` |
| `docs/prd/features/F12-points.md` | `8e7db91439d67baf67b2e0e5631d142e18903b85d38049be62479bac03e06756` |
| `docs/prd/features/F13-point-exchange.md` | `aadc15c01765458db24740731ee19ad41b316b8197f5366fa572d27e64b341b8` |
| `docs/prd/features/F14-referral.md` | `47912977a8f351b36a9d0fbd4e13c85230759897756b2fdd6c9b67e40d256b7f` |
| `docs/prd/features/F15-ad-placements.md` | `8baac6713c2bb44549fb75f69205d59acd4760d9c91f5f7eb5391f85deada1e9` |
| `docs/prd/features/F16-campaign-pages.md` | `469020bd3a912999a167d1aee3db9af0b05671ac7fc4936636406eb5b0469c38` |
| `docs/prd/features/F17-notifications.md` | `9c7baaa5c08a702e7403045f8dd5c5a3166232f9182ceb48275aa3901f5c59bb` |
| `docs/prd/features/F18-mypage-support.md` | `ec34554aec9dcef2a23da5135aac3d92b8d50fc3277a8e549dc0ce87d7a3ba0b` |
| `docs/prd/app-requirements/requirements-draft.md` | `ff2f2d6998f2f488b546eec2904b2ef4b0ad800cc51383d32e032d22d3a79dd2` |
