<script setup lang="ts">
import { ref, onMounted } from "vue";
/**
 * getUsers は openapi.yml の operationId: getUsers から自動生成された関数。
 * User 型も openapi.yml の components/schemas/User から自動生成。
 *
 * 生成コマンド: npm run generate:api
 * 生成元ファイル: openapi/openapi.yml
 */
import { getUsers } from "@/api/generated/services.gen";
import type { User } from "@/api/generated/types.gen";

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await getUsers();
    users.value = data ?? [];
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : "予期しないエラーが発生しました";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="users-view">
    <h1>ユーザー一覧</h1>

    <p v-if="loading" class="status">読み込み中...</p>
    <p v-else-if="error" class="status error">{{ error }}</p>

    <table v-else class="users-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名前</th>
          <th>メールアドレス</th>
          <th>作成日時</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.email }}</td>
          <td>
            {{
              user.createdAt
                ? new Date(user.createdAt).toLocaleString("ja-JP")
                : "-"
            }}
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!loading && !error && users.length === 0" class="status">
      ユーザーが見つかりませんでした。
    </p>
  </div>
</template>
