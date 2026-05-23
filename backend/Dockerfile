# ── ① ビルドステージ ──────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# openapi.yml をコピー（generate-sources で参照する）
# context がリポジトリルートなので直接参照できる
COPY openapi ./openapi

# 依存関係を先にキャッシュ（ソースが変わっても再ダウンロードしない）
COPY backend/pom.xml ./backend/pom.xml
RUN cd backend && mvn dependency:go-offline -q

# ソースをコピーしてビルド
COPY backend/src ./backend/src
RUN cd backend && mvn package -DskipTests -q

# ── ② 本番ステージ ──────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# jarだけコピー
COPY --from=builder /app/backend/target/*.jar app.jar

# 非rootユーザーで実行
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]