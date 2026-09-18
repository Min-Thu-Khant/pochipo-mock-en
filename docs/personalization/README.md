# 開発に向けた要件整理 v0.9

- review.html：本文・NACS別添・図3枚を埋め込んだ閲覧用ファイル。
- specification-draft.md：本文の編集用Markdown。
- nacs-guide.md：NACSの概要と連携に必要な情報。
- tier-roadmap / architecture / phase2-flow のPNG・JPEG：説明用の図3枚。
- references/：NACS連携に関係する参考仕様3点。NACS直接APIの原本ではありません。
- build-artifacts.py：図・HTMLの生成コード（PillowとmacOS日本語フォントを利用）。

サービスの方針をもとに、開発範囲と実現方法を検討するための資料である。
前提・用語・Tier／Phase定義は本文1〜3章、全体構成・役割・設計原則は4〜6章、BigQueryのデータ一覧は7章、機能別Tierは9章、機能の参考資料は13章に記載する。Brazeは使用しない。
Tier1に手動プッシュとBigQueryデータ基盤、Tier3にLINE。その他の細かなTier配置・難易度は検討案。
図・本文の編集時はbuild-artifacts.pyを実行してreview.htmlを再生成してください。
