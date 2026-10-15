# 全体構想と検討案

現在の全体像は[開発に向けた要件整理v0.10](personalization/specification-draft.md)から読みます。用語、Tier／Phase、構成、データ基盤、機能別の導入案がまとまっています。同じ内容を概要文書へ複製せず、本文を編集します。

| 資料 | 位置づけ |
| --- | --- |
| [要件整理v0.10](personalization/specification-draft.md) | 全体要件の検討資料。詳細仕様・API・工数は未確定 |
| [閲覧用HTML](personalization/review.html) | 本文・NACS別添・図をまとめた生成物 |
| [アプリの18機能ドラフト](../prd/app-requirements/README.md) | 1本目のアプリの機能要件と根拠・検証記録。F01〜F18を維持 |
| [NACS連携ガイド](personalization/nacs-guide.md) | 責務・接続条件・担当に確認する項目 |
| [複数アプリ管理の構想](proposals/admin-phase-plan.md) | 管理画面側の検討経緯・モックで確認できる範囲 |
| [キャンペーン拡張案](proposals/campaign-expansion-plan.md) | 将来の案と2026-09-18のモック実装記録 |

## 検討資料間の差

要件整理v0.10ではデータ基盤・手動プッシュをTier1に含めます。一方、管理画面側の構想にはフェーズ2でデータ活用を説明する記述があります。Tier（導入段階）とPhase（運用判断の方法）を混同せず、機能別PRDを起こすときに範囲と根拠を確認します。

ポイント管理基盤と自社バックエンドの責務にも、資料ごとの粒度差があります。本文の言い換えだけで確定せず、外部連携・完成条件をPRDへ落とし込みます。今回の移動で事業ルールを変更したものではありません。

## 生成物の更新

`personalization/`はMarkdown・図・生成スクリプトを含む一式です。本文を変更したら、リポジトリルートから次を実行し、生成されたHTML・図を確認します。

```bash
python3 docs/product/personalization/build-artifacts.py
```

既存スクリプトはPillowとmacOSの日本語フォントを使用します。モック起動に必要な依存関係ではありません。参考仕様のコピーと固定コミットへのリンクは同じ一式内に保持しています。

[アプリの表記ルール](wording-rules.md)は機能PRDと分けて管理する。
