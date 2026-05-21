# アプリ開発勉強リポジトリ

# フルスタック開発テンプレート

Vue3 + Spring Boot + PostgreSQL による Spec 駆動開発（OpenAPI）テンプレートを利用している

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
make stop           # バック・フロントをまとめて停止

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
├── docker-compose.yml               # PostgreSQL + devcontainerの定義
├── Makefile                         # コマンド集約
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
    │   └── generated/              # 自動生成APIモデル ※git管理しない
    ├── src/main/resources/
    │   ├── application.yml
    │   └── db/migration/            # ★ DDLをここに追加
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
