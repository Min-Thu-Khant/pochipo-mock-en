# 機能別PRD一覧

**仕様の編集元は1機能1ファイル。** 既存IDのF01〜F18をそのまま維持し、スプレッドシートの同じ機能IDと対応させる。

[全体PRD](../app-requirements/requirements-draft.md)は一覧・共通方針・Phase定義・共通の確認事項の入口。以下のPRDは[規定FMT](../../templates/feature-prd.md)の7項目に沿って、従来の10観点を移行している。

| 機能ID・編集先 | 機能名 | 導入優先度 |
| --- | --- | --- |
| [F01](F01-account.md) | 会員登録・認証・利用者情報 | Phase1（提案） |
| [F02](F02-home.md) | ホーム・画面構成・上部メニュー | Phase1（提案） |
| [F03](F03-offer-list.md) | アフィリエイト案件の一覧・検索・カテゴリ・並び順 | Phase1（提案） |
| [F04](F04-offer-entry.md) | アフィリエイト案件の詳細・参加・エントリー | Phase1（提案） |
| [F05](F05-my-offers.md) | マイ案件・成果状態・成果通知 | Phase1（提案） |
| [F06](F06-challenge-bonus.md) | チャレンジボーナス | Phase1（ユーザー指定） |
| [F07](F07-daily-mission.md) | デイリーミッション | Phase1（提案） |
| [F08](F08-walking.md) | 歩数によるポイント獲得 | Phase1（提案） |
| [F09](F09-rewarded-video.md) | 動画リワード広告 | Phase1（提案） |
| [F10](F10-surveys.md) | アンケート | Phase1（提案） |
| [F11](F11-mini-games.md) | ミニゲーム：チンチロ | Phase1（提案） |
| [F12](F12-points.md) | ポイント残高・履歴・確定処理 | Phase1（提案） |
| [F13](F13-point-exchange.md) | ポイント交換 | Phase1（提案） |
| [F14](F14-referral.md) | 友達招待 | Phase2（提案） |
| [F15](F15-ad-placements.md) | バナー・テキスト広告・起動時POPUP・画面間広告 | Phase1（提案） |
| [F16](F16-campaign-pages.md) | キャンペーンページ・単一案件LP・特集記事 | Phase1（提案） |
| [F17](F17-notifications.md) | プッシュ通知・アプリ内のお知らせ | Phase1（提案） |
| [F18](F18-mypage-support.md) | マイページ・ヘルプ・問い合わせ | Phase1（提案） |

## 更新の流れ

1. 議事録の決定・提案・未決を区別し、対象IDの個別PRDを開く。
2. 本文・達成条件・モックとの差・変更履歴を同じ変更で更新する。
3. 共通方針や複数機能に影響する事項だけ、全体PRDにも反映する。
4. ID・機能名・Phase等を変更した場合はこの一覧と全体の一覧も更新する。
5. レビューした版から、同じIDのスプレッドシート行を更新する。公開前のファイルへのGitHubリンクを公開済みとして案内しない。

Phase全体の割当は提案。9/24議事録はメモ・文字起こしを照合済み（[会議記録](https://docs.google.com/document/d/1uG99tbPdXhf6eFEs_udgMiGXCYYTCiBhM-Vtq0UAXHQ/edit?tab=t.p4twfmsu6ox2)）。新機能は既存18機能との重複を確認してから採番する。レシートは未採番のままで今回の分割対象には追加しない。

## 将来構想（Phase未割当）

既存機能の拡張を独立して採否管理する5件。基本機能の再採番ではない。Phaseセルは空欄とする。

| 機能ID・編集先 | 機能名 | 関連機能 | Phase |
| --- | --- | --- | --- |
| [PCH-F-0001](PCH-F-0001-ad-skip-reward.md) | ミッション達成による広告スキップ特典 | F07・F09・F11 | |
| [PCH-F-0002](PCH-F-0002-additional-mini-games.md) | チンチロ以外のミニゲーム追加 | F11 | |
| [PCH-F-0003](PCH-F-0003-bingo-missions.md) | ビンゴ形式のミッション | F07 | |
| [PCH-F-0004](PCH-F-0004-side-panel-content.md) | サイド告知枠の内容切替・出し分け | F02・F15 | |
| [PCH-F-0005](PCH-F-0005-targeted-missions.md) | ユーザー属性・利用傾向に応じたミッション配信 | F07 | |
