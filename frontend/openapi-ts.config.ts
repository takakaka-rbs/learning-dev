import { defineConfig } from '@hey-api/openapi-ts'

/**
 * openapi-ts 設定
 *
 * openapi.yml → src/api/generated/ へ TypeScript クライアントを自動生成する。
 * 生成コマンド: npm run generate:api
 *
 * 生成物:
 *   - src/api/generated/types.gen.ts  ... スキーマ型定義
 *   - src/api/generated/services.gen.ts ... APIクライアント関数
 *   - src/api/generated/client.gen.ts  ... fetchクライアント
 */
export default defineConfig({
  client: '@hey-api/client-fetch',
  input: '../openapi/openapi.yml',
  output: {
    path: 'src/api/generated',
    format: 'prettier',
  },
})
