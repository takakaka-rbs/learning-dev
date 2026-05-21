import { createRouter, createWebHistory } from "vue-router";
import UsersView from "@/views/UsersView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/users",
    },
    {
      path: "/users",
      name: "users",
      component: UsersView,
    },
  ],
});

export default router;
