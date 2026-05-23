import { createApp } from "vue";
import { createPinia } from "pinia";
import { createClient, createConfig } from "@hey-api/client-fetch";
import App from "./App.vue";
import router from "./router";
import "./style.css";

createClient(
  createConfig({
    baseUrl: "/api",
  }),
);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
