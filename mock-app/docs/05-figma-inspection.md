# Figma既存デザイン確認（2026-09-15）

## 確認範囲と取得状況

- 参照元：[指定Figmaファイル](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/)。Figma MCPで読み取り。
- 変更方針：`poikatsu/new-poikatsu/context/2026-09-15_タメルコ改修_AIコンテキスト.md`。
- 既存モック：`poikatsu/new-poikatsu/outputs/tameruko-boost` のREADME、差分資料、CSS、画面コードを確認。
- 「まいにちポケット」のコード・素材・デザインは参照していない。
- Figmaとモックの実装は変更していない。この文書は読み取り結果の記録。

Figma MCPが途中で対象Enterprise組織のCollab席のツール利用上限を返したため、確認は部分的。`whoami`で席種を確認済み。配色・書体・余白・スクリーンショットの照合は未完了。以下は取得できたノード情報に限る。

## 画面の構造

| 対象 | 確認済みの構造・部品 | 状況 |
|---|---|---|
| [TOP／ホーム](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/?node-id=52177-36587) | 幅402px、全体高さ約3671px。`App Header+Status bar`（98px）、`content`、`Global Footer+Indicator`（84px）。別に402×874pxの1st view、読み込み中、エラー画面 | 画面直下の構造とページ内の部品一覧を取得 |
| [AF一覧／ためトク](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/?node-id=58153-36461) | 幅402px、全体高さ約4517px。ヘッダー領域98px、`content`、`Global Footer+Indicator`（84px）。読み込み中、エラー、ためトクナビ＋クイックアクセスの部品群、通知許可ダイアログ | 画面直下の構造とページ内の部品一覧を取得 |
| [AF案件詳細](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/?node-id=16547-70474) | ページの存在を確認 | 内部取得時に利用上限 |
| [マイ案件](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/?node-id=17277-445453) | マイ案件のコンポーネントセット、0件表示、スケルトン、取得エラー、掲載終了時の画面、問い合わせカード。Type5は幅402px、ヘッダー98px、Navigation Tab 47px、広告、フッター | ページ内の構造を取得。各バリエーションの表示内容は未確認 |
| [アンケート一覧](https://www.figma.com/design/OxKHX6jb2qWVEOs3UkzP8W/?node-id=18497-446568) | ページの存在を確認 | 内部取得時に利用上限 |

### TOPページ内の部品

| 部品群 | 実際のノード名・状態 |
|---|---|
| アンケート | `Survey Card Carousel`、`Survey Section` のコンポーネントセットが既に存在 |
| 動画リワード | `Video Reward`、背景画像、再生カウント、本日分終了の状態 |
| デイリーミッション | `Misson List Item`、`Misson List`、`Mission_Progress Bar`、`Mission Calender Top`、スタンプ。全クリア／一部受取／全受取の状態 |
| 歩いてためる | `Milestone`、`Wave`、`Bubble`、`Gauge Pattern`等の部品群。ヘルスケア連携・身体活動アクセスのダイアログ |
| 共通ダイアログ | `01 App Popup Dialog`、`Reward Option Dialog`、`Reward Result Dialog`。広告在庫なし、読み込み失敗、ネットワーク、報酬獲得失敗、日付切り替え等 |
| 診断 | 既存TOPページ内に部品群が存在。今回の変更方針では採用しない |

これらの部品がページ内に存在することは確認済み。通常ホームの`content`内部での配置順・表示条件までは未取得。

### 共通基盤の所在

ページ一覧に `🎨 Colors`（2143:3231）、`📕 テキスト`（22017:173）、`ℹ️ アイコン`（22080:223688）、`Primary🧑‍🧑‍🧒`（20693:209149）、Error、Empty、Dialog、ADを確認。色や書体の値はまだ取得していない。

先頭の「Brazeバナー枠」には、402×211、402×126、402×63pxのバナーバリエーションがある。これは既存ファイル上の名称・寸法であり、新方針でBraze依存を採用する意味ではない。

## 配色：モックの値とFigmaを区別

以下は既存モックの`styles.css`で確認した値。Figmaの正式値ではない。

| CSS変数 | モックの色 |
|---|---|
| `--green` | `#19765F` |
| `--dark` | `#173E34` |
| `--mint` | `#EAF5EF` |
| `--lime` | `#E9F1BD` |
| `--ink` | `#29352F` |
| `--muted` | `#68756E` |
| `--line` | `#E5EAE6` |
| `--warm` | `#FCF2DB` |
| `--surface` | `#FFFFFF` |

モックは表示内容幅390px。Figmaの対象標準画面は402pxであり、ヘッダー・ナビの寸法もモックとは異なる。既存モックの差分資料にも色・余白は暫定値と明記されているため、現時点ではFigma準拠の外観と扱わない。

## 再開時に確認すること

1. TOP、ためトク、アンケート一覧のスクリーンショットと`content`内部の構造。
2. Colors・テキスト・Primaryページと、実画面のfills／styles／variables／余白／角丸。
3. AF案件詳細とアンケート一覧の状態・部品・遷移。
4. 確認した値を基にモックとの差分を整理。改修方針はAFブーストを軸とし、既存部品を活かしてアンケート導線を強化する。
