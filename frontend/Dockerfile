# ── ① ビルドステージ ──────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# 依存インストール
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# openapi.yml をコピー
COPY openapi ./openapi

# ソースをコピー
COPY frontend/ .

# openapi.yml のパスを Docker 環境用に上書きして生成 → ビルド
# ローカルは ../openapi だが Docker では ./openapi にコピーしているため
RUN npx @hey-api/openapi-ts --input ./openapi/openapi.yml --output src/api/generated && npm run build

# ── ② 本番ステージ ──────────────────────────────
FROM nginx:alpine AS runner

# ビルド成果物をnginxの配信ディレクトリへ
COPY --from=builder /app/dist /usr/share/nginx/html

# SPAのルーティング対応（全パスをindex.htmlへフォールバック）
# context がリポジトリルートなので frontend/ プレフィックスが必要
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]