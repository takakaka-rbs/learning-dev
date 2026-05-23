# フルスタック開発テンプレート

Vue3 + Spring Boot + PostgreSQL による Spec 駆動開発（OpenAPI）テンプレート

---

## 採用技術

### 開発環境

| ツール         | 用途                                                                                    |
| -------------- | --------------------------------------------------------------------------------------- |
| Dev Container  | ホストPCに何もインストールせず統一された開発環境を提供。VS Code + Docker だけあれば動く |
| Docker Compose | PostgreSQL の起動・管理                                                                 |
| Makefile       | よく使うコマンドを1つにまとめる                                                         |

### フロントエンド

| ツール                | 用途                                             |
| --------------------- | ------------------------------------------------ |
| Vue 3                 | UIフレームワーク                                 |
| Vite                  | ビルドツール・開発サーバー                       |
| TypeScript            | 型安全な開発                                     |
| Vue Router            | ルーティング                                     |
| Pinia                 | 状態管理                                         |
| @hey-api/openapi-ts   | openapi.yml → TypeScript APIクライアント自動生成 |
| @hey-api/client-fetch | 生成されたAPIクライアントの実行ランタイム        |

### バックエンド

| ツール                     | 用途                                              |
| -------------------------- | ------------------------------------------------- |
| Spring Boot 3              | Webアプリケーションフレームワーク                 |
| openapi-generator (spring) | openapi.yml → Controller インターフェース自動生成 |
| JOOQ                       | DDL → Java クラス自動生成・型安全なSQLクエリ      |
| Flyway                     | DBマイグレーション（DDLのバージョン管理）         |
| Maven                      | ビルド・依存関係管理                              |

### データベース

| ツール        | 用途 |
| ------------- | ---- |
| PostgreSQL 16 | RDB  |

---

## アーキテクチャ概要

```
openapi/openapi.yml  ← ★ API仕様の唯一の定義。ここだけ書けばOK
       │
       ├─▶ frontend/src/api/generated/     （make generate で自動生成）
       │     types.gen.ts                      型定義
       │     services.gen.ts                   APIクライアント関数
       │
       └─▶ backend/target/generated-sources/  （make generate で自動生成）
             UsersApi.java                      Controllerインターフェース
             User.java                          レスポンスモデル

backend/src/main/resources/db/migration/
  V1__create_xxx.sql  ← ★ DDLをここに書く
       │
       └─▶ backend/src/main/java/.../jooq/   （make migrate で自動生成）
             tables/Users.java                   テーブルクラス
             tables/records/UsersRecord.java      レコードクラス
```

自動生成されたファイルは直接編集しない。openapi.yml や DDL を変更して再生成する。

---

## 初回セットアップ

### 1. devcontainer を開く

VS Code で `Reopen in Container` を選択する。
Node.js・Java・Maven は devcontainer 内に自動インストールされるため、ホストPCへの個別インストールは不要。
PostgreSQL は devcontainer の起動と同時に立ち上がる。

### 2. セットアップコマンドを実行

```bash
make setup
```

`npm install` → DBマイグレーション → 全コード生成 まで一括で完了する。

---

## コマンド一覧

```bash
# 初回セットアップ（devcontainer起動後に1回だけ実行）
make setup

# openapi.yml を変更したら実行（フロント・バック両方のコードを一括生成）
make generate

# DDL（migration/*.sql）を変更したら実行（Flyway適用 + JOOQクラス生成）
make migrate

# 開発サーバー起動
make dev            # バック + フロントをまとめて起動
make dev-back       # バックのみ起動 (http://localhost:8080)
make dev-front      # フロントのみ起動 (http://localhost:5173)

# 停止
make stop

# 静的解析
make lint           # フロント + バック
make lint-front     # ESLint
make lint-back      # Checkstyle

# テスト
make test           # フロント + バック
make test-front     # Vitest
make test-back      # JUnit

# 静的解析 + テスト まとめて実行（push前の確認に使う）
make check          # フロント + バック
make check-back     # バックのみ
make check-front    # フロントのみ
make check-all      # 静的解析 + テスト + ビルドまで

# ビルド（生成 → フロント・バックまとめてビルド）
make build

# コマンド一覧を確認
make help
```

---

## 開発フロー

### API を追加・変更するとき

1. `openapi/openapi.yml` を編集する
2. `make generate` を実行する
3. バック: 生成された `XxxApi` インターフェースを `implements` したコントローラーを手書きする
4. フロント: 生成された関数・型を Vue コンポーネントからインポートして使う

### テーブルを追加・変更するとき

1. `backend/src/main/resources/db/migration/` に `V{n}__xxx.sql` を追加する
2. `make migrate` を実行する
3. 生成された JOOQ クラスをサービスからインポートして使う

### push 前の確認

```bash
make check-all   # 静的解析 + テスト + ビルド が全部通ればOK
```

---

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に従う。
husky + commitlint により、規約に違反したメッセージはコミット時に自動で弾かれる。

### フォーマット

```
<type>: <subject>
```

### type 一覧とバージョンへの影響

| type        | 意味                       | バージョン変動                |
| ----------- | -------------------------- | ----------------------------- |
| `feat!`     | 破壊的変更を含む新機能     | major up（例: 1.0.0 → 2.0.0） |
| `fix!`      | 破壊的変更を含むバグ修正   | major up                      |
| `refactor!` | 破壊的変更を含むリファクタ | major up                      |
| `feat`      | 新機能                     | minor up（例: 1.0.0 → 1.1.0） |
| `fix`       | バグ修正                   | patch up（例: 1.0.0 → 1.0.1） |
| `perf`      | パフォーマンス改善         | patch up                      |
| `refactor`  | リファクタリング           | patch up                      |
| `docs`      | ドキュメントのみの変更     | 変動なし                      |
| `style`     | フォーマット等             | 変動なし                      |
| `test`      | テストの追加・修正         | 変動なし                      |
| `build`     | ビルド・依存関係の変更     | 変動なし                      |
| `ci`        | CI設定の変更               | 変動なし                      |
| `chore`     | その他                     | 変動なし                      |
| `revert`    | コミットの取り消し         | 変動なし                      |

`!` は破壊的変更（Breaking Change）を意味する。どの type に付けても major up になる。

### 例

```bash
git commit -m "feat: ユーザー検索APIを追加"
git commit -m "fix: ログイン時にエラーが発生する問題を修正"
git commit -m "feat!: 認証方式をJWTに変更"
```

---

## ブランチ戦略と CI/CD

### ブランチ構成

```
main  ← 本番リリース用（直接pushしない）
 └── dev  ← 開発統合ブランチ
      └── feature/xxx  ← 機能開発ブランチ（ここで作業する）
```

### コーディングから本番リリースまでの流れ

```
① feature ブランチで開発
        │  make check-all でローカル確認
        │  git push → CI が自動実行
        ▼
② feature → dev に PR & マージ
        │  Release (dev) ワークフローが自動実行
        │    セキュリティチェック・Lint・テスト
        │    プレリリースバージョニング（例: v1.1.0-dev.1）
        │    Docker イメージ build & push（latest タグなし）
        │    JAR・npm パッケージを GitHub Packages に publish
        ▼
③ dev → main に PR & マージ
           Release ワークフローが自動実行
             セキュリティチェック・Lint・テスト
             正式バージョニング（例: v1.1.0）
             Docker イメージ build & push（latest タグあり）
             JAR・npm パッケージを GitHub Packages に publish
```

### 各ワークフローの詳細

| ワークフロー  | トリガー                      | 実行内容                                                            |
| ------------- | ----------------------------- | ------------------------------------------------------------------- |
| CI            | feature ブランチへの push・PR | セキュリティチェック・Lint・テスト                                  |
| Release (dev) | dev ブランチへの push         | checks + バージョニング(プレリリース) + Docker + JAR + npm          |
| Release       | main ブランチへの push        | checks + バージョニング(正式) + Docker + JAR + npm + GitHub Release |

### CI で実行されるチェック内容

| チェック                 | ツール                 | 概要                                                             |
| ------------------------ | ---------------------- | ---------------------------------------------------------------- |
| セキュリティ（フロント） | npm audit              | 依存ライブラリの脆弱性チェック（high以上で失敗）                 |
| セキュリティ（バック）   | OWASP Dependency Check | 依存JARの脆弱性チェック（CVSS 7以上で失敗）                      |
| 静的解析（フロント）     | ESLint                 | コード品質チェック                                               |
| 静的解析（バック）       | Checkstyle             | Googleスタイルに基づくコード規約チェック                         |
| テスト（フロント）       | Vitest                 | ユニットテスト                                                   |
| テスト（バック）         | JUnit + JaCoCo         | ユニットテスト・カバレッジチェック（行・分岐・メソッド 70%以上） |

---

## アクセス先

| サービス         | URL                                        |
| ---------------- | ------------------------------------------ |
| フロントエンド   | http://localhost:5173                      |
| バックエンド API | http://localhost:8080/api                  |
| Swagger UI       | http://localhost:8080/api/swagger-ui.html  |
| OpenAPI JSON     | http://localhost:8080/api/api-docs         |
| PostgreSQL       | localhost:5432 / DB: appdb / User: appuser |

---

## ディレクトリ構成

```
.
├── .devcontainer/
│   └── devcontainer.json            # devcontainer設定（拡張機能・ポート転送など）
├── .github/
│   ├── actions/
│   │   ├── setup-frontend/          # フロント共通セットアップ Action
│   │   └── setup-backend/           # バック共通セットアップ Action
│   └── workflows/
│       ├── _reusable-checks.yml     # 共通チェック（セキュリティ・Lint・テスト）
│       ├── ci.yml                   # feature ブランチ用CI
│       ├── release-dev.yml          # dev ブランチ用リリース
│       └── release.yml              # main ブランチ用リリース
├── docker-compose.yml               # PostgreSQL + devcontainerの定義
├── Makefile                         # コマンド集約
├── commitlint.config.js             # コミットメッセージ規約設定
├── package.json                     # husky / commitlint のルート設定
├── openapi/
│   └── openapi.yml                  # ★ API仕様（唯一の真実）
├── frontend/                        # Vue3アプリ
│   ├── src/
│   │   ├── api/generated/           # 自動生成APIクライアント ※git管理しない
│   │   ├── views/                   # 画面コンポーネント
│   │   └── router/index.ts          # ルーター定義
│   ├── openapi-ts.config.ts         # フロントコード生成設定
│   └── package.json
└── backend/                         # Spring Bootアプリ
    ├── src/main/java/com/example/app/
    │   ├── controller/              # ★ 手書き（生成interfaceをimplements）
    │   ├── service/                 # ビジネスロジック
    │   ├── jooq/                    # 自動生成JOOQクラス ※git管理しない
    │   └── generated/               # 自動生成APIモデル ※git管理しない
    ├── src/main/resources/
    │   ├── application.yml
    │   └── db/migration/            # ★ DDLをここに追加
    ├── checkstyle.xml               # Checkstyle設定（Googleスタイル準拠）
    └── pom.xml
```

---

## .gitignore

自動生成ファイルはコミットしない。`make generate` / `make migrate` で各自の環境に生成する。

```gitignore
# 自動生成ファイル
frontend/src/api/generated/
backend/src/main/java/com/example/app/jooq/
backend/src/main/java/com/example/app/generated/
backend/target/

# 依存関係
frontend/node_modules/

# OS
.DS_Store
```
