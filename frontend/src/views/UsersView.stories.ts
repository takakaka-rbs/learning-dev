import type { Decorator, Meta, StoryObj } from "@storybook/vue3";
import UsersView from "./UsersView.vue";

/**
 * UsersView（ユーザー一覧画面）のストーリー。
 *
 * 画面の状態仕様（データあり・ローディング・空・エラー）を1ストーリーずつ定義し、
 * VRT（npm run test:vrt）のスクリーンショット比較対象にする。
 *
 * API 呼び出し（生成クライアント経由の fetch）はストーリーごとに
 * グローバル fetch をスタブして切り離す（実サーバーには接続しない）。
 */

/** 決定的なスクリーンショットのため、日時は固定値にする */
const sampleUsers = [
  {
    id: 1,
    name: "山田太郎",
    email: "yamada@example.com",
    createdAt: "2026-01-01T09:00:00Z",
  },
  {
    id: 2,
    name: "鈴木花子",
    email: "suzuki@example.com",
    createdAt: "2026-01-02T09:00:00Z",
  },
  {
    id: 3,
    name: "佐藤次郎",
    email: "sato@example.com",
    createdAt: "2026-01-03T09:00:00Z",
  },
];

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** fetch をスタブするストーリーデコレーター */
const withFetchStub =
  (handler: () => Promise<Response>): Decorator =>
  (story) => {
    globalThis.fetch = handler as unknown as typeof fetch;
    return {
      components: { story },
      template: "<story />",
    };
  };

const meta: Meta<typeof UsersView> = {
  title: "views/UsersView",
  component: UsersView,
};

export default meta;
type Story = StoryObj<typeof UsersView>;

/** ユーザーが登録されている通常の一覧表示 */
export const Default: Story = {
  decorators: [withFetchStub(() => Promise.resolve(jsonResponse(sampleUsers)))],
};

/** 取得中（ローディング）の表示 */
export const Loading: Story = {
  decorators: [
    // 解決しない Promise を返してローディング状態を維持する
    withFetchStub(() => new Promise<Response>(() => {})),
  ],
};

/** ユーザーが0件のときの表示 */
export const Empty: Story = {
  decorators: [withFetchStub(() => Promise.resolve(jsonResponse([])))],
};

/** API がエラーを返したときの表示 */
export const ApiError: Story = {
  decorators: [
    withFetchStub(() =>
      Promise.resolve(
        jsonResponse({ message: "Internal Server Error", code: "E500" }, 500),
      ),
    ),
  ],
};
