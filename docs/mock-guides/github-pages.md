# モックをGitHub Pagesで共有する

アプリ・管理画面・NACS・連動デモの実行ファイルを同一サイトで配信する。PRD・議事録・会議要約・テスト・Git履歴は配信しない。リポジトリ自体の公開範囲は変更しない。

## 初回に管理者が行う設定

1. リポジトリの Settings → Pages を開く。
2. Build and deployment の Source を **GitHub Actions** にする。
3. サイトの公開範囲を選べる場合は、URLを知っている人が閲覧できる **Public** にする。
4. Actions → **Publish mocks to GitHub Pages** → **Run workflow** で `main` を実行する。
5. 完了後、Pages設定またはデプロイ結果に表示されるURLを確認する。アプリは `mock-app/`、管理画面は `mock-admin/` を開く。

2026-09-25時点ではPagesは未設定。接続中のアカウントはコードへの書き込み権限のみで、Pagesの管理権限はない。非公開リポジトリからのPages公開可否は組織の契約・ポリシーに依存する。設定できない場合は組織管理者へ確認し、リポジトリを公開へ変更して回避しない。

## 更新と配信範囲

初回設定後は、`main` のモック関連ファイル更新でテスト・配信を実行する。PRDのみの更新ではデプロイしない。公開ファイルは `node scripts/build-pages.mjs` で `_site/` に生成される。

公開対象はGit管理下にある4つのモックディレクトリ内のHTML・JavaScript・CSS・画像・フォント。`tests/` と `design-system/`、Markdownなどは対象外。入口は公開専用に生成する。検索エンジン向けにrobots.txtを置くが、アクセス制限ではない。

管理画面は実サービスの管理画面ではなく、ブラウザーのlocalStorageだけを変更するモック。同じブラウザー・同じオリジンではアプリと状態を共有するが、別の利用者・端末とは共有しない。既存SitesやローカルのデータはGitHub Pagesへ移行されない。
