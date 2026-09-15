# 管理画面・API・不正対策仕様案

**次段階の設計案です。今回のモックには管理画面・交換手続き・本番APIを実装していません。** 以下の管理操作や閾値は提案であり、動作済みの機能一覧ではありません。今回動く範囲はREADMEを参照してください。

## 管理画面は4画面

| 画面 | 主な操作 |
|---|---|
| 枠・キャンペーン | 一覧・検索・新規・複製・編集、下書き→反映、停止。共通フォームと右側アプリプレビュー |
| カレンダー | 期間で自動表示する同じ枠を日付に配置。テンプレートから登録 |
| 確認・交換条件 | フラグがある報酬だけキュー表示。手動承認／保留、交換条件・動画上限・品質閾値 |
| 実績 | 枠imp/tap/CV、案件獲得件数、アンケート回答数・完了率。CSV出力 |

変更ログは全画面共通。通知は枠フォームに付随させ、専用の大きな配信システムは作らない。

## 枠モデル

| 項目 | 型・条件 |
|---|---|
| id / name | 不変ID／管理用名称 |
| kind | 告知・キャンペーン・おすすめ・ミッション・アンケート |
| enabled | ON/OFF、緊急停止にも利用 |
| start / end | YYYY-MM-DD、JSTの日単位・両端を含む。逆転不可 |
| segment | 全員・新規・継続・金融未利用 |
| priority | 0〜100、大きい値から優先。重複時はIDで安定ソート |
| placements | carousel / feed / sub。mission指定は対象AFをタスク化 |
| destination | 案件ID／survey／wallet／missions。任意外部URLはモックでは不可 |
| title / text / visual | 表示文・説明・画像プリセット（架空案件のSVG）。画像URLのAPIは本番で追加 |
| rewardMode / reward | 固定額pt／倍率／還元率。倍率は通常報酬に適用、定率は購入額から計算 |
| entryRequired | 利用前エントリー必須。動画併用の条件はAPI仕様で拡張 |
| challengeGoal / participants / bonus | 対象人数・到達人数・達成後ボーナスpt。人数は管理入力のデモ値、本番は承認成果から集計 |
| notification / notificationDate | 通知文／予約日。通知タップは同じリンク先、実送信なし |
| surveyRewardType / ownFirst / mediaReward | screening / main / demographic。自社優先／自社・他社報酬を別設定 |

一覧→編集フォーム→妥当性検査→反映。下書きを閉じる場合は破棄を確認。反映はローカルで単一更新、変更前後と日時・操作名・デモ運用者を記録。実サービスではversion/If-Matchによる競合検出と公開権限が必要。

## 表示と金額

- enabled AND start <= 確認日 <= end AND segment一致。
- 金融利用済みのデモ利用者には金融カテゴリの枠と案件を除外。
- ホームの仕事数＝残り動画回数＋未回答の対象アンケート数＋表示対象の未開始AFミッション数。
- 見込み額はアンケート・動画・固定額AFの合算。定率案件と条件付きチャレンジボーナスは合計から除外し、その旨を明記。即日受取の保証はしない。
- 表示は円相当。内部ptは整数で保持（100pt=1円相当を旧仕様から暫定継承）。仮付与と正式付与を別台帳状態にし、承認時は仮→正式への移動のみで二重加算しない。
- 同じ案件のエントリー／開始は1回。開始時に条件と報酬をスナップショットし、後日の運用変更で進行中の獲得条件が変わらない。
- 日次動画上限・起動報酬のリセットはJSTの確認日ごと。アンケートは案件ID単位で回答済みを保持。

## 管理可能な閾値（全て仮値）

| キー | デモ初期値 | 判定 |
|---|---:|---|
| exchange.minEarnedPt | 30000pt | 累計正式獲得が到達 |
| exchange.minDays | 3日 | 初回は登録から経過 |
| exchange.minAmountPt | 30000pt | 最低交換額 |
| exchange.dailyNewPt | 50000pt | 新規・基本レベルの1日上限 |
| exchange.dailyTrustedPt | 300000pt | 継続レベルの1日上限 |
| exchange.trustedDays | 30日 | 継続レベルへの暫定条件 |
| video.dailyLimit | 3回 | 日次受取上限 |
| quality.minSeconds | 3秒/問 | 本番ではサーバーで計測・判定。デモでは保留シナリオで再現 |

SMS未認証、交換先無効・重複、凍結、条件未達、正式残高不足、日次上限超過は交換不可。送信失敗時は残高を消費しない。受付後は送金完了と分けて表示。再送のidempotency_keyは必須。

## 不正対策

| 検知・制御 | モック | 本番仕様／要確認 |
|---|---|---|
| 仮付与・確認キュー | 保留シナリオ→管理者承認→正式残高、保留維持 | 異議申立て・本人通知・処理期限 |
| 端末／IP／交換先重複 | フラグの種類と交換先異常シナリオ | Adjust/Firebase IDは個人の一意性を保証しない。複合シグナルと誤検知対応が必要 |
| 回答時間・指示問・一貫性 | 管理項目とフラグ例 | LIFE側で計測可能な項目・納品保留・特許の個別調査【要確認】 |
| AI自由記述判定 | 仕様のみ | 自動凍結の単独根拠にしない。判定精度とレビュー手順【要確認】 |
| 成果否認 | 仕様のみ | ASPごとの承認／否認APIと締め日【要確認】 |

## API契約案（未接続）

| API | 主な入出力 | 依存／不足 |
|---|---|---|
| GET /app/config | version, serverTime, slots[], limits | Firebase Remote Configか自社配信API。署名・キャッシュ・段階配信 |
| PUT /admin/slots/:id | version, commonFields, reward, challenge | 競合検出、変更ログ、公開権限 |
| GET /affiliate/offers | offerId, category, basePt/rate, boostPt/rate, conditions, dates | GMO／エドコード／各ASP【要確認】 |
| POST /offers/:id/entry | entryId, conditionVersion | エントリー時点条件の固定、動画併用条件 |
| GET /affiliate/progress | milestones[], current, next, approvedPt | 段階成果・遅延・否認情報が取得できるか |
| GET /campaigns/:id/progress | approvedCount, goal, updatedAt | 重複除外、対象者集計、到達時のボーナス台帳 |
| GET /surveys | type, rewardByMedia, quota, ownPriority, status | LIFE Surveyの配信枠・報酬種別【要確認】 |
| GET /surveys/invitations | parentSurveyId, nextSurveyId, eligibility | スクリーニング→本調査。インタビューは将来API |
| POST /profile | demographicFields, completeness | 新認証IDと同意、ゲスト回答可否【要確認】 |
| POST /reward-events | eventId, amountPt, pending/approved/rejected | 署名検証、重複付与防止、媒体別原資 |
| GET /wallet | approvedPt, pendingPt, earnedPt, exchangeConditions | 外部基幹の台帳を正とする |
| POST /exchange | amountPt, smsToken, idempotencyKey | ドットマネーの口座有効性・重複・KYC【要確認】 |
| POST /notifications | slotId, scheduledAt, segment | FCM等。許諾・頻度上限・静穏時間・取消 |
| POST /events; GET /admin/metrics | eventId, slotId, offerId, imp/tap/start/complete/CV | CVは承認成果。開始クリックと混同しない |

## 仕様のみ／外部接続待ち

実際の広告再生、本人認証、LIFE Survey WebView、サーバー判定、ASP成果集計・否認、交換増量の契約、OSプッシュ、同時更新制御。モック内ではデモ操作と明記し、本番完了と表示しない。
