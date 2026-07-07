import type { Preview } from "@storybook/vue3";
import "../src/style.css";

/**
 * 全ストーリー共通の設定。
 * アプリ本体と同じグローバルスタイルを読み込み、見た目を実画面と揃える。
 */
const preview: Preview = {
  parameters: {},
};

export default preview;
