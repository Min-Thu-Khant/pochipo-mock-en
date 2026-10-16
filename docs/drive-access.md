# Google Driveのアクセスルール

ユーザーから指定された範囲です。PJTを別の会話・端末で扱う場合も参照します。フォルダ名・中身・技術的な権限は、このリポジトリ整理では確認していません。

| フォルダ | 許可範囲 |
| --- | --- |
| [Pochipo用の指定フォルダ](https://drive.google.com/drive/folders/19-EtcInWjkzQtnMJ256iJzInLcOCyyeV) | このフォルダと実際の配下。依頼された作業の範囲で閲覧・編集 |
| [追加の閲覧用フォルダ](https://drive.google.com/drive/folders/1K_F-qkGYe_GAIy97ylmx8pmLpAxAZT43) | このフォルダと実際の配下の閲覧のみ。編集は未許可 |
| [議事録閲覧用フォルダ](https://drive.google.com/drive/folders/1cjE3-4r4onJgt6jecKYkK3RG8jHxlP0V) | このフォルダと実際の配下の閲覧のみ。編集は未許可。目的は議事録の内容把握（決定・提案・未決の読み取り）。本文のGit保存はしない |

- 範囲外のフォルダ・ファイルにアクセスする前に対象と目的を伝え、許可を得る。
- Drive全体の検索をしない。許可範囲内に限定できない操作は行わない。
- ショートカット・資料内のリンクは範囲外のアクセス許可にならない。
- 新規フォルダの作成、範囲外への移動・コピー・書き出しは、ユーザーが依頼済みの場合を除き事前に確認する。
- 許可範囲内でも閲覧確認の依頼だけで編集・共有設定変更をしない。
- 追加許可を得た場合は範囲と操作種別を、この表と作業場所のルールに記録する。

これはAIの作業ルールです。Google側のOAuth権限や共有設定を技術的に制限したものではありません。

## 2026-09-25 個別に閲覧許可された議事録

- https://docs.google.com/document/d/1uG99tbPdXhf6eFEs_udgMiGXCYYTCiBhM-Vtq0UAXHQ/edit?tab=t.p4twfmsu6ox2
- ユーザーの「議事録これ！」という提示に基づき、この文書のメモ・文字起こしをPRD・機能要件表への反映目的で閲覧する。文書の編集・共有設定変更、親フォルダやリンク先へのアクセス許可は含まない。

## 個別に閲覧・編集許可された機能要件表

- https://docs.google.com/spreadsheets/d/1g00ZxLGprVNT4T4uSmzw--vRpp95HQ1Uq9i8GnJpmS4/edit
- ユーザーの作成・更新依頼に基づき、このファイルのみ閲覧・編集する。親フォルダ・他ファイルや共有設定は対象外。
