import type { StorybookConfig } from "@storybook/vue3-vite";

/**
 * Storybook 設定
 *
 * - stories: src 配下の *.stories.ts を対象にする
 * - framework: Vue3 + Vite（vite.config.ts の alias 等をそのまま利用する）
 *
 * 起動: npm run storybook / ビルド: npm run build-storybook
 * VRT: npm run test:vrt（storybook-static を Playwright でスクリーンショット比較）
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|js)"],
  addons: [],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;
