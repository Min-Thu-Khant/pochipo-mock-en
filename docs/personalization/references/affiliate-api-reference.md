---
id: api-affiliate
status: active
# pbi: <!-- 要確認: 起点となった PBI が不明 -->
related:
  - ../domains/affiliate.md
  - ../integrations/nacs.md
  - ../admin/affiliate-screen.md
  - ../screens/affiliate-detail.md
  - ../screens/affiliate-list.md
  - ../screens/affiliate-group-list.md
  - ../screens/affiliate-category-list.md
  - ../screens/affiliate-my-affiliates.md
  - common-errors.md
proto: proto/jp/ameba/nantes/poikatsu/v1/api.proto
updated: 2026-09-02
---

# アフィリエイト API 意味論

> **このドキュメントの責務**: proto に書けない RPC の意味論（エラーの発生条件・冪等性・認可の前提・レート制限と、それらのクライアントへの含意）だけを定義する。
>
> - 型・フィールド・メッセージ・シグネチャ・enum は proto 定義が正。**書き写さない**
> - ビジネスルールの本体は [アフィリエイト案件](../domains/affiliate.md) が正。「どのルールを実行するか」のリンクだけを書く
> - エラー時の画面表示は screens/ が正。「どの表示になるか」のリンクだけを書く
> - 共通例外は [全 RPC 共通のエラー意味論](common-errors.md) を参照し、本 API 固有のエラーのみ書く

## 対象

| サービス名 | proto ファイル |
|---|---|
| V1Service | `proto/jp/ameba/nantes/poikatsu/v1/api.proto` |

本ファイルの全 RPC は、Ameba 連携済み・ゲストの両方が呼べ、サードパーティ（Ameba アプリ）からの呼び出しも許可する（proto の custom option が正）。

案件の実データは [NACS](../integrations/nacs.md) から取得するため、以下で「取得に失敗」は NACS への照会の失敗を含む。

---

## FetchAffiliateGroups

- **実行するルール**: 画面コードに対して、その時点で**適用中の画面設定**のグループ階層を返す（[アフィリエイト案件](../domains/affiliate.md) の「3.3」。設定の入稿は [案件画面設定](../admin/affiliate-screen.md)）
- **冪等性**: 読み取りのみ
- **認可の前提**: proto 参照
- **レート制限**: 該当なし

**応答の契約**

| 項目 | 契約 |
|---|---|
| 未登録の画面コード・適用中の設定がない | **エラーにせず 0 件**を返す。クライアントは「該当セクションを表示しない」等の空表示にする |
| 並び順 | 各階層内でグループの表示順の昇順。応答の順序をそのまま使ってよい |
| 階層 | ルートのグループの中にサブグループが入る（再帰）。アプリが表示に使うのは 2 階層まで |
| グループ種別 | **常に「グループ」を返す。** proto にはアンケート種別が定義されているが、返す経路はない<!-- 要確認: ためトク画面のアンケート一覧への分岐が到達不能。https://github.com/ca-media-poi/poikatsu-spec/issues/210 --> |
| 表示名・アイコン | 入稿された表示名と、アイコンの識別子（アイコン画像の解決は静的な配信ドメインとの組み合わせ。未設定なら空） |
| 案件一覧コードの有無 | 応答には含まれない。案件を持つグループかナビ用かは、そのグループで `FetchAffiliates` を呼んだ結果で分かる |

**画面コードの一覧**（アプリが使うもの。値の追加・変更は本表の改訂を伴う）

| 画面コード | 用途 |
|---|---|
| `home` | [ホーム画面](../screens/home.md) の案件カルーセル |
| `tametoku_nav` / `tametoku_quick` / `tametoku_grid` | [ためトク画面](../screens/tametoku.md) のナビ / クイックアクセス / 案件グループ |
| `category_all` | [カテゴリー一覧画面](../screens/affiliate-category-list.md) |
| `personality_type_a_1` 〜 `personality_type_e_1`（10 種） | [ポイ活タイプ診断](../domains/personality-type.md) の結果画面とホームのタイプ別おすすめ |

**エラー:**

| ErrorType | 発生条件 | クライアントへの含意 |
|---|---|---|
| 共通検証のもの | [全 RPC 共通のエラー意味論](common-errors.md) の「5.」 | 同左 |
| `ERROR_TYPE_INTERNAL` | 画面設定の取得に失敗 | リトライ可。セクション単位のエラー表示 |

---

## FetchAffiliates

- **実行するルール**: 案件グループ（省略可）に属する案件の一覧を、リクエスト元の OS と、ユーザーのインストール案件の解禁状態で絞り込んで返す（[アフィリエイト案件](../domains/affiliate.md) の「3.2」「3.3」）
- **冪等性**: 読み取りのみ
- **認可の前提**: proto 参照
- **レート制限**: 該当なし

**応答の契約**

| 項目 | 契約 |
|---|---|
| ページング | オフセット方式。`limit` は 1 以上必須、`offset` は 0 以上。**`limit` の上限はない。** 次のページの有無は `has_next_page` で返す（`next_cursor` は非推奨で常に未設定） |
| 並び順 | NACS が返す順（案件一覧コード内の掲出順）。応答の `order` は 1 始まりの通し番号（ページ内ではなく、そのページのオフセットに依存しない**ページ内の連番**）<!-- 要確認: order はページごとに 1 から振り直される。複数ページを連結して表示する場合はクライアントが通し番号を計算する --> |
| 案件グループの指定なし | 絞り込みなしで全案件を返す（OS・インストール案件の絞り込みは適用する） |
| 案件グループに案件一覧コードがない（ナビ用グループ） | 指定なしと同じ（全案件） |
| 表示単位 | 定額報酬の表示単位（円 / ポイント）はグループの設定で決まる。グループの指定なし・未設定はポイント |
| タグ | グループの設定でタグ非表示なら、応答の tags は空 |
| SUR 案件の報酬額 | 全段階の合計ポイント。`is_sur` が真 |
| CV 済み案件の除外 | **行わない。** ユーザーがすでに成果を上げた案件も一覧に含まれる。`is_ranking` はサーバーで参照しない<!-- 要確認: proto コメントは「ランキング以外は CV 済みを除外」と記述。https://github.com/ca-media-poi/poikatsu-spec/issues/207 --> |

**エラー:**

| ErrorType | 発生条件 | クライアントへの含意 |
|---|---|---|
| 共通検証のもの | [全 RPC 共通のエラー意味論](common-errors.md) の「5.」 | 同左 |
| `ERROR_TYPE_INVALID_ARGUMENT` | `limit` が 0 以下、または `offset` が負 | リトライ不可。アプリの不具合 |
| `ERROR_TYPE_NOT_FOUND` | 指定した案件グループが存在しない（削除された設定のグループ等） | リトライ不可。グループ一覧を取り直す |
| `ERROR_TYPE_INTERNAL` | 案件一覧の取得に失敗、または報酬額の算出に必要な設定が不整合 | リトライ可。初回はセクション・画面のエラー表示、追加読み込みは末尾の再読み込み導線（各画面仕様） |

---

## GetAffiliate

- **実行するルール**: 案件 1 件の詳細と、呼び出したユーザーのその案件に対する成果状況を返す（[アフィリエイト案件](../domains/affiliate.md) の「3.4」「3.6」）
- **冪等性**: 読み取りのみ
- **認可の前提**: proto 参照
- **レート制限**: 該当なし

**応答の契約**

| 項目 | 契約 |
|---|---|
| 端末非対応 | 案件がリクエスト元の OS に対応していなければ `unsupported_device` が真。**詳細は返る**（クライアントが表示を出し分ける） |
| 有効期間外 | `is_active` が偽。詳細は返る |
| 成果ステータス | ユーザーがこの案件の成果を持つときだけ設定される。SUR 案件では「全段階承認 → 承認」「一部承認または発生中 → 挑戦中」、それ以外は未設定。非 SUR 案件では成果の状態（判定中 / 承認 / 否認）をそのまま返す |
| SUR の各段階 | 段階ごとの条件・報酬ポイント・並び順・その段階の成果ステータス（承認済みの段階だけ「承認」、それ以外は未設定）。承認済みの段階の報酬額は成果の実額 |
| 報酬上限額 | 定率案件で定額の上限が設定されているときだけ、上限を**ポイント**で返す |
| 報酬 | 定率なら率（%）、定額ならポイント。SUR 案件は全段階の合計 |

**エラー:**

| ErrorType | 発生条件 | クライアントへの含意 |
|---|---|---|
| 共通検証のもの | [全 RPC 共通のエラー意味論](common-errors.md) の「5.」 | 同左 |
| `ERROR_TYPE_NOT_FOUND` | 案件が存在しない、または配信終了で NACS から取得できない | リトライ不可。[案件詳細画面](../screens/affiliate-detail.md) の案件未発見の表示 |
| `ERROR_TYPE_INTERNAL` | 案件または成果の取得に失敗、報酬額の算出に必要な設定が不整合 | リトライ可。画面のエラー表示と再読み込み導線 |

---

## GetAffiliateClickURL

- **実行するルール**: チャレンジの起点となる署名付きクリック URL を返す（[アフィリエイト案件](../domains/affiliate.md) の「3.5」）
- **冪等性**: 読み取りに近いが、呼び出しごとに**異なる署名（発行時刻を含む）**の URL が返る。再送しても副作用はない
- **認可の前提**: proto 参照
- **レート制限**: 該当なし

**応答の契約**

| 項目 | 契約 |
|---|---|
| 有効期限 | URL の署名は**発行から前後 30 秒**だけ有効。クライアントはチャレンジ確定の直後に呼び、返った URL を**そのまま即座に外部ブラウザで開く**。保持して後から開かない |
| 案件の状態 | **有効期間外・端末非対応でも URL は返る。** チャレンジ可否の判定は `GetAffiliate` の応答でクライアントが行う<!-- 要確認: proto コメントの ERROR_TYPE_UNSUPPORTED_DEVICE は存在せず、サーバーも端末を検査しない。https://github.com/ca-media-poi/poikatsu-spec/issues/207 --> |
| URL の中身 | 変更・分解しない。クエリに識別子と署名が含まれる |

**エラー:**

| ErrorType | 発生条件 | クライアントへの含意 |
|---|---|---|
| 共通検証のもの | [全 RPC 共通のエラー意味論](common-errors.md) の「5.」 | 同左 |
| `ERROR_TYPE_NOT_FOUND` | 案件が存在しない、または配信終了 | リトライ不可。失敗の通知を出し、ブラウザは開かない |
| `ERROR_TYPE_INTERNAL` | 案件の取得に失敗、案件にクリック URL が設定されていない、署名鍵が未設定 | リトライ可。同上 |

---

## FetchMyAffiliates

- **実行するルール**: ユーザーの成果（CV）を成果ステータス別に返す（[アフィリエイト案件](../domains/affiliate.md) の「3.6」）
- **冪等性**: 読み取りのみ
- **認可の前提**: proto 参照
- **レート制限**: 該当なし

**応答の契約**

| 項目 | 契約 |
|---|---|
| ステータスの指定 | 必須。挑戦中 / 判定中 / 承認 / 否認 のいずれか。未指定・不明な値は `ERROR_TYPE_INVALID_ARGUMENT` |
| ステータスと対象 | 挑戦中 = **SUR 案件**の発生中の成果。判定中 = **非 SUR 案件**の発生中の成果。承認 = 承認済み（SUR を含む）。否認 = 否認済み（SUR を含む） |
| 1 件の単位 | 成果（CV）ごと。同じ案件で複数の成果があれば複数件返る。`cv_id` が成果の識別子 |
| 日時 | 挑戦中・判定中は成果の発生日時、承認は承認日時、否認は否認日時 |
| ポイント | SUR 案件は承認済み段階の合計（承認タブでは全段階）、非 SUR 案件は成果の実額を還元設定と上限で換算した値 |
| ページング | `FetchAffiliates` と同じ（オフセット方式・`limit` 1 以上・`has_next_page`） |
| 案件 ID | 応答の `id` はそのまま `GetAffiliate` に渡せる |

**エラー:**

| ErrorType | 発生条件 | クライアントへの含意 |
|---|---|---|
| 共通検証のもの | [全 RPC 共通のエラー意味論](common-errors.md) の「5.」 | 同左 |
| `ERROR_TYPE_INVALID_ARGUMENT` | `limit` が 0 以下、`offset` が負、成果ステータスが不明 | リトライ不可 |
| `ERROR_TYPE_INTERNAL` | 成果の取得に失敗、成果に案件情報が欠けている、日時が欠けている | リトライ可。[マイ案件画面](../screens/affiliate-my-affiliates.md) のエラー表示 |

---

## 提供を終了した RPC

`FetchAffiliateHomeGroups` / `FetchAffiliateTametokuGroups` / `FetchAllAffiliateGroups` / `FetchAffiliateRankingGroups` は proto に定義が残っているが、サーバーは実装を持たない（呼び出すと未実装のエラーになる）。いずれも `FetchAffiliateGroups` に統合済み。ランキング表示は廃止された。<!-- 要確認: proto 上で deprecated の印がない。https://github.com/ca-media-poi/poikatsu-spec/issues/207 -->

---

## 関連

| 種類 | リンク |
|---|---|
| ドメイン仕様（アフィリエイト案件） | [affiliate](../domains/affiliate.md) |
| 外部連携（NACS） | [nacs](../integrations/nacs.md) |
| 運用（案件画面設定） | [affiliate-screen](../admin/affiliate-screen.md) |
| 画面仕様 | [affiliate-detail](../screens/affiliate-detail.md) / [affiliate-list](../screens/affiliate-list.md) / [affiliate-group-list](../screens/affiliate-group-list.md) / [affiliate-category-list](../screens/affiliate-category-list.md) / [affiliate-my-affiliates](../screens/affiliate-my-affiliates.md) |
| API 意味論（全 RPC 共通） | [common-errors](common-errors.md) |
| 決定の経緯 | <!-- 要確認: poikatsu-context decisions/ の該当 URL が不明 --> |
| API Proto 定義リポジトリ | https://github.com/ca-media-nantes/poikatsu-protobuf |
