import { test, expect } from "@playwright/test";

/**
 * ユーザー一覧画面の E2E テスト。
 *
 * フロント（Vite）→ バック（Spring Boot）→ DB（PostgreSQL）を通しで検証する。
 * 期待値の根拠:
 * - 画面: UsersView.vue（ユーザー一覧の表示）
 * - データ: V1_1__insert_sample_user_data.sql のサンプルユーザー
 */
test.describe("ユーザー一覧画面", () => {
  test("一覧画面を開くとサンプルユーザーが表示される", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "ユーザー一覧" }),
    ).toBeVisible();

    // API 経由でサンプルデータ（3件以上）が表示される
    const rows = page.locator("table.users-table tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThanOrEqual(3);

    // サンプルデータの代表ユーザーが表示されている
    await expect(page.getByRole("cell", { name: "山田太郎" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "yamada@example.com" }),
    ).toBeVisible();
  });
});
