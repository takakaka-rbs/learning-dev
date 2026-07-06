import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test, expect } from "@playwright/test";

/**
 * Storybook 全ストーリーの VRT（スクリーンショット比較）。
 *
 * storybook-static/index.json（storybook build の出力）から全ストーリーを列挙し、
 * iframe.html?id=<storyId> を開いてスクリーンショットをベースラインと比較する。
 * ストーリーを追加すれば自動的に VRT の対象になる。
 */

interface StoryIndexEntry {
  id: string;
  title: string;
  name: string;
  type: string;
}

const indexJsonPath = fileURLToPath(
  new URL("../../storybook-static/index.json", import.meta.url),
);

const storyIndex = JSON.parse(readFileSync(indexJsonPath, "utf-8")) as {
  entries: Record<string, StoryIndexEntry>;
};

const stories = Object.values(storyIndex.entries).filter(
  (entry) => entry.type === "story",
);

for (const story of stories) {
  test(`VRT: ${story.title} / ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    // ストーリーの描画完了を待つ（storybook-root に中身が入るまで）
    await page.waitForSelector("#storybook-root > *", { state: "attached" });
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
  });
}
