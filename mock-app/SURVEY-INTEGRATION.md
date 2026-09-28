# アンケート回答ページへの接続

一覧の回答ボタンは詳細画面を挟まず開く。案件とは独立した state.surveyResponseURLs[調査ID] または調査の responseURL にHTTPSの回答URLを設定する。Webモックのデモ設定からも編集できる。URLのクエリ・フラグメントは保持する。

- iOS側は window.pochipoNative.openSafariView(url) を実装し、表示受付時に true を返す。SFSafariViewControllerをモーダル表示する接続口であり、実装本体はこのWebリポジトリにない。失敗・false・タイムアウト時はエラーと再試行にする。
- ネイティブ接続がないブラウザーでは、回答ボタン押下時に別タブで実URLを開く。外部サイトをiframe内へ埋め込まない。
- URL未設定時だけ、Safari View風のデモ回答画面を使用する。実会社のページへの接続とは扱わない。
- Safari Viewを開く・閉じる操作では、回答済み・ポイント残高を変更しない。本番の報酬付与はアンケート会社の検証済み完了通知に基づく別実装が必要。Webのローカルデモ完了は既存の模擬付与処理。

Apple公式仕様：https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller
