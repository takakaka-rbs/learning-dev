<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app-wrapper">
    <header class="app-header">
      <span class="logo">⚡ AppName</span>
      <nav>
        <RouterLink to="/users">
          ユーザー一覧
        </RouterLink>
      </nav>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
</template>
