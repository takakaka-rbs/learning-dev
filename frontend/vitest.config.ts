import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    passWithNoTests: true, // テストファイルがない場合もエラーにしない
    // Playwright のテスト（VRT / E2E）は vitest の対象外
    exclude: ["**/node_modules/**", "**/dist/**", "tests/**"],
    reporters: [
      "default",
      // JUnit形式のXMLレポート（CI サマリー用）
      "junit",
    ],
    outputFile: {
      junit: "./test-results/junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: [
        "text", // コンソール出力
        "html", // HTMLレポート（Artifact用）
        "lcov", // lcov形式（カバレッジバッジ用）
      ],
      reportsDirectory: "./coverage",
      // 自動生成ファイルはカバレッジ対象外
      exclude: ["src/api/generated/**", "**/*.config.*", "**/node_modules/**"],
      // カバレッジ目標（下回るとテスト失敗）
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
});
