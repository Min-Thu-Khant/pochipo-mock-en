# 部品仕様と実装例

## ファイルの役割

| ファイル | 内容 |
| --- | --- |
| tokens.css | 6色とニュートラル、役割色、角丸・動きの時間 |
| theme.css | `.bj` 内だけに適用する部品の見た目 |
| components.js | 素材・ボタン・ミッション・進捗・報酬などの表示関数 |
| interactions.js | 部品集とプレビューで使う通知・ダイアログ・コイン演出 |
| index.html / catalog.js / catalog.css | 日本語の部品集、検索、状態の比較 |
| preview.html / preview.js / preview.css | 既存の構成を保つホームの組み合わせ例 |
| assets/ | 指定PNG4点、新規PNG12点、フォント3種 |
| plump.css | ぷるんと感を強める見た目。最終に読み込む |
| fonts.css | 源柔ゴシックの定義 |

## 一覧

| ID | 部品 | 状態・用途 | 既存との関係 |
| --- | --- | --- | --- |
| BJ-F01 | パレット | 主操作／進捗／報酬／補助／本文／面／境界 | 別テーマのCSS変数 |
| BJ-F02 | ジェリーアイコン | 記録・ポイント・歩数・起動 | 提供PNGを再利用 |
| BJ-F03 | 日本語の文字階層 | 見出し24/16、本文14、補足12px | 源柔ゴシックRegular／Medium／Boldを使用 |
| BJ-A01 | 立体ボタン | 緑・青・黄・補助・無効 | 別案の新しい部品 |
| BJ-A02 | 選択チップ | 選択／未選択 | 枠・チェック・aria-pressed |
| BJ-P01 | 残高と交換目標 | 受取前／受取後／目標到達 | 残高位置を保持、目標は部品・内訳の見本 |
| BJ-P02 | ミッション行 | 未達成／受取可能／受取済み | 既存 `missionRow()` を再利用 |
| BJ-P03 | ミッション進捗 | 0〜5の見本 | 既存 `missionProgress()` を再利用 |
| BJ-P04 | 歩数の進捗 | 現在値・残り・バー | 歩数カテゴリ向け表示例 |
| BJ-P05 | 週の達成記録 | 達成／今日未達成／未来 | 追加候補。ホームへの挿入なし |
| BJ-P06 | 達成ダイアログ | 表示／閉じる／元の場所へ復帰 | 節目用候補。ネイティブdialog |
| BJ-S01 | ヘッダー・下部メニュー | 残高／チンチロ／通知、4メニュー | 位置・既存 `bottomNav()` を保持 |
| BJ-S02 | アンケートバナー | 一覧への入口 | 既存 `surveyBanner()` を再利用 |
| BJ-S03 | 案件・アンケートカード | 条件・ポイント・遷移 | 既存のカード関数をそのまま利用 |
| BJ-S04 | 読み込み・空・エラー | 読み込み表示／0件／再試行 | 状態の比較用 |

## 組み込み

既存テーマへ追記せず、別のHTMLエントリで読み込みます。相対パスはこのフォルダのHTMLから見たものです。

```html
<link rel="stylesheet" href="../colors.css">
<link rel="stylesheet" href="../typography.css">
<link rel="stylesheet" href="../preview-base.css">
<link rel="stylesheet" href="../icons.css">
<link rel="stylesheet" href="fonts.css">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="theme.css">
<link rel="stylesheet" href="plump.css">
<body class="bj">…</body>
```

```js
import {action, jellyIcon, mission, goal} from './components.js';

const receiveButton = action(
  `${jellyIcon('coin', 22)}受け取る`,
  'claim',
  'sun',
  'data-id="launch"'
);

const row = mission({
  id: 'launch', kind: 'launch', state: 'achieved',
  title: 'アプリを起動する', sub: '達成しました', reward: 10
});
const target = goal(240, 300); // 残高240 / 目標300 → あと60pt
```

`action()` のlabel・extra、ダイアログbodyは信頼できるHTMLテンプレート用です。管理画面や利用者の文字列は `esc()` でエスケープしてください。アイコン名は登録済み16点から選び、数字には検証済みの値を渡してください。

## 寸法と状態

- 基本ボタン：高さ46px以上、角丸18px、下辺4px、押下で3px移動。既存ミッション行内は高さ34pxのコンパクト版で、既存密度を保持。
- アイコン：ミッション42px（透明余白を含む）、報酬28px、説明66〜80px、達成100px。元の正方形キャンバスのため、実際の図柄は指定サイズより小さく見えます。
- 一般面：白。ページ背景 `#F7FAF8`。ミッション／アンケートバナーは単色 `#58CC02`、左右余白12px。
- フッター：既存4項目。`.phone-body` の中でスクロール領域の兄弟要素に置き、下部に常時表示。
- ダイアログ：幅最大380px、左右16px以上、閉じる／Esc／外側クリック、フォーカス復帰。
- 動きを減らす：OS設定、または部品集のチェックボックスで有効。通知文・数値更新は動きなしでも残す。

## 見本値と業務ルール

`preview.js` はメモリ内のサンプルだけを変更します。残高240pt、起動報酬10pt、交換目標300pt、歩数目標4,000歩は確定要件ではありません。週の記録は静的な状態見本です。

プレビューの完了数は「受け取り済みの数」を示し、初期1/5→受取後2/5となります。実アプリへ統合する場合は既存の集計定義を確認してください。「達成済みの数」にする場合は見出しと集計を一緒に変更します。

部品集のクリックは見本の操作で、本番のポイント付与や永続保存はしません。チンチロの確率や報酬、AF承認、動画再生、アンケート回答を部品コード内で新たに決めないでください。
