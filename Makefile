.PHONY: generate generate-front generate-back setup \
        dev-front dev-back dev stop \
        up down logs \
        lint lint-front lint-back \
        test test-front test-back \
        check check-front check-back check-all \
        migrate build help

# ─────────────────────────────────────────
# コード生成
# ─────────────────────────────────────────

## openapi.yml からフロント・バック両方を一括生成
generate: generate-front generate-back
	@echo "✅ 生成完了"

## フロント: openapi.yml → src/api/generated/
generate-front:
	@echo "⚡ [Front] API クライアント生成中..."
	cd frontend && npm run generate:api

## バック: openapi.yml → generated/api/UsersApi.java など
generate-back:
	@echo "⚡ [Back] Controller インターフェース生成中..."
	cd backend && mvn generate-sources -q

# ─────────────────────────────────────────
# DB / JOOQ
# ─────────────────────────────────────────

## DDL をDBへ適用 → JOOQ クラスを生成
migrate:
	@echo "⚡ [Back] Flyway migrate + JOOQ codegen..."
	cd backend && mvn flyway:migrate jooq-codegen:generate -q
	@echo "✅ DB マイグレーション & JOOQ 生成完了"

# ─────────────────────────────────────────
# 静的解析（Lint）
# ─────────────────────────────────────────

## フロント + バック 静的解析
lint: lint-front lint-back
	@echo "✅ Lint 完了"

## フロント静的解析 (ESLint)
lint-front:
	@echo "⚡ [Front] ESLint 実行中..."
	cd frontend && npm run lint

## バック静的解析 (Checkstyle)
lint-back:
	@echo "⚡ [Back] Checkstyle 実行中..."
	cd backend && mvn checkstyle:check --no-transfer-progress \
	  && echo "✅ Checkstyle 成功" \
	  || { echo "❌ Checkstyle 失敗"; exit 1; }

# ─────────────────────────────────────────
# テスト
# ─────────────────────────────────────────

## フロント + バック テスト
test: test-front test-back
	@echo "✅ テスト完了"

## フロントテスト (Vitest)
test-front:
	@echo "⚡ [Front] テスト実行中..."
	cd frontend && npm run test --if-present

## バックテスト (JUnit)
test-back:
	@echo "⚡ [Back] テスト実行中..."
	cd backend && mvn test --no-transfer-progress

# ─────────────────────────────────────────
# 静的解析 + テスト まとめて実行
# ─────────────────────────────────────────

## フロント + バック 静的解析 & テスト
check: check-front check-back
	@echo "✅ 静的解析 & テスト 完了"

## フロントのみ 静的解析 & テスト
check-front: lint-front test-front
	@echo "✅ [Front] チェック完了"

## バックのみ 静的解析 & テスト
check-back: lint-back test-back
	@echo "✅ [Back] チェック完了"

## 静的解析 & テスト & ビルドまで（push前の最終確認用）
check-all: check build
	@echo "✅ 全チェック & ビルド完了 → push OK"

# ─────────────────────────────────────────
# 初回セットアップ（devcontainer 起動直後に1回だけ実行）
# ─────────────────────────────────────────

## 依存インストール + 全生成 + マイグレーション
setup:
	@echo "🚀 初回セットアップ開始..."
	npm install
	cd frontend && npm install
	$(MAKE) migrate
	$(MAKE) generate
	@echo "✅ セットアップ完了！　make dev-front / make dev-back で起動できます"

# ─────────────────────────────────────────
# 開発サーバー起動 / 停止
# ─────────────────────────────────────────

## フロント開発サーバー起動 (http://localhost:5173)
dev-front:
	cd frontend && npm run dev

## バック開発サーバー起動 (http://localhost:8080)
dev-back:
	cd backend && mvn spring-boot:run

## 全部まとめて起動（バック → フロント）
## ※ DB は devcontainer 起動時にすでに立ち上がっている
dev:
	@echo "⚡ バック起動中..."
	cd backend && mvn spring-boot:run &
	@sleep 10
	@echo "⚡ フロント起動中..."
	cd frontend && npm run dev

## 全サービス停止
stop:
	@echo "🛑 停止中..."
	@pkill -f "spring-boot" || true
	@pkill -f "vite" || true
	@echo "✅ 停止完了"

# ─────────────────────────────────────────
# Docker Compose（フロント・バック・DB を全部コンテナで起動）
# ─────────────────────────────────────────

## 全サービスをビルドして起動（front: http://localhost:5173 / back: http://localhost:8080/api）
up:
	docker compose up -d --build
	@echo "✅ 起動完了: フロント http://localhost:5173 / バック http://localhost:8080/api"

## 全サービス停止・コンテナ削除
down:
	docker compose down

## 全サービスのログを表示
logs:
	docker compose logs -f

# ─────────────────────────────────────────
# ビルド
# ─────────────────────────────────────────

## ビルド（生成 → フロント・バックまとめてビルド）
build: generate
	@echo "🔨 フロントビルド中..."
	cd frontend && npm run build
	@echo "🔨 バックビルド中..."
	cd backend && mvn package -DskipTests
	@echo "✅ ビルド完了"

# ─────────────────────────────────────────
# ヘルプ
# ─────────────────────────────────────────
help:
	@echo ""
	@echo "使い方:"
	@echo "  make setup          初回セットアップ（devcontainer起動後に1回）"
	@echo ""
	@echo "  make generate       openapi.yml 変更後にフロント・バック一括生成"
	@echo "  make generate-front フロントのみ生成"
	@echo "  make generate-back  バックのみ生成"
	@echo ""
	@echo "  make migrate        DDL変更後にFlywayとJOOQ生成を実行"
	@echo ""
	@echo "  make lint           フロント + バック 静的解析"
	@echo "  make lint-front     フロントのみ静的解析"
	@echo "  make lint-back      バックのみ静的解析"
	@echo ""
	@echo "  make test           フロント + バック テスト"
	@echo "  make test-front     フロントのみテスト"
	@echo "  make test-back      バックのみテスト"
	@echo ""
	@echo "  make check          フロント + バック 静的解析 & テスト"
	@echo "  make check-front    フロントのみ 静的解析 & テスト"
	@echo "  make check-back     バックのみ 静的解析 & テスト"
	@echo ""
	@echo "  make dev            バック + フロント まとめて起動"
	@echo "  make dev-front      フロント開発サーバー起動"
	@echo "  make dev-back       バック開発サーバー起動"
	@echo "  make stop           全サービス停止"
	@echo ""
	@echo "  make up             Docker Compose で全サービス起動（フロント・バック・DB）"
	@echo "  make down           Docker Compose の全サービス停止・削除"
	@echo "  make logs           Docker Compose のログ表示"
	@echo ""
	@echo "  make build          ビルド（生成 → フロント・バック）"
	@echo ""
