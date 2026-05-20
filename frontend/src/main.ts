import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { client } from '@hey-api/client-fetch'
import App from './App.vue'
import router from './router'
import './style.css'

// openapi-ts が生成したクライアントのベースURL設定
client.setConfig({
  baseUrl: '/api',
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
