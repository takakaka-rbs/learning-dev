import { defineConfig } from "@playwright/test";

/**
 * VRT（ビジュアルリグレッションテスト）用の Playwright 設定。
 *
 * 事前に `npm run build-storybook` で storybook-static を生成しておくこと
 * （make test-vrt はビルドから通しで実行する）。
 *
 * スナップショットはプラットフォーム別（-win32 / -linux 等のサフィックス）に
 * tests/vrt/__screenshots__/ 配下へ保存し、Git にコミットしてベースラインとする。
 * CI では --update-snapshots=missing で実行し、未生成のベースラインは
 * 失敗にせず Artifacts から取得してコミットできる運用にする。
 */
export default defineConfig({
  testDir: "./tests/vrt",
  outputDir: "./test-results/vrt",
  fullyParallel: true,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report/vrt", open: "never" }],
  ],
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFileName}/{arg}-{platform}{ext}",
  expect: {
    toHaveScreenshot: {
      // アニメーション・カーソル起因の揺らぎを抑える
      animations: "disabled",
      caret: "hide",
      // アンチエイリアス等の微差を許容する
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: "http://localhost:6006",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: "npx http-server storybook-static --port 6006 --silent",
    url: "http://localhost:6006/iframe.html",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
