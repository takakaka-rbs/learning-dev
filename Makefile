.PHONY: generate generate-front generate-back setup dev-front dev-back migrate help

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
# 初回セットアップ（devcontainer 起動直後に1回だけ実行）
# ─────────────────────────────────────────

## 依存インストール + 全生成 + マイグレーション
setup:
	@echo "🚀 初回セットアップ開始..."
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
# ヘルプ
# ─────────────────────────────────────────
help:
	@echo ""
	@echo "使い方:"
	@echo "  make setup          初回セットアップ（devcontainer起動後に1回）"
	@echo "  make generate       openapi.yml 変更後にフロント・バック一括生成"
	@echo "  make migrate        DDL変更後にFlywayとJOOQ生成を実行"
	@echo "  make dev-front      フロント開発サーバー起動"
	@echo "  make dev-back       バック開発サーバー起動"
	@echo ""
