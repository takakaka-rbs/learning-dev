# ── ① ビルドステージ ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 依存インストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# openapi.yml をコピーしてAPIクライアント生成
COPY openapi ./openapi
COPY frontend/ .
RUN npm run generate:api && npm run build

# ── ② 本番ステージ ──────────────────────────────
FROM nginx:alpine AS runner

# ビルド成果物をnginxの配信ディレクトリへ
COPY --from=builder /app/dist /usr/share/nginx/html

# SPAのルーティング対応（全パスをindex.htmlへフォールバック）
# context がリポジトリルートなので frontend/ プレフィックスが必要
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]