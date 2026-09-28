# 共通描画コードの案内

[ブライトジェリーの仕様](bright-jelly/COMPONENTS.md)と[ぷるんとジェリーの仕様](bright-jelly-plump/COMPONENTS.md)に、部品ID・用途・実装例を記載しています。

共通の`components.js`は、missionRow / missionProgress / bottomNav / surveyBanner / offerListItem / surveyCard等を提供します。呼び出し元は各案の`components.js`です。アプリ本体を共通部品へ置き換えたことは意味しません。

HTML文字列を受け取る引数は信頼できるテンプレートに限定し、可変テキストは`esc()`でエスケープします。報酬・二重操作防止・保存・状態遷移は機能側で扱います。
