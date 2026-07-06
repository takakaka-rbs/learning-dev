import { defineConfig } from "@playwright/test";

/**
 * E2E テスト用の Playwright 設定。
 *
 * webServer でバックエンド（Spring Boot :8080）とフロントエンド（Vite :5173）を
 * 自動起動する。PostgreSQL は事前に起動しておくこと
 * （devcontainer / docker compose / CI の postgres サービス）。
 *
 * 実行: npm run test:e2e（リポジトリルートからは make test-e2e）
 */
export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/e2e",
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/e2e", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 720 },
    // 実行結果レポート用に全テストでスクリーンショットを取得する
    screenshot: "on",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      // バックエンド（起動確認は実在するエンドポイントで行う）
      command: "mvn -f ../backend/pom.xml spring-boot:run --no-transfer-progress",
      url: "http://localhost:8080/api/users",
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
