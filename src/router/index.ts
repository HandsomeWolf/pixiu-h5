import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/home", component: () => import("@/views/home/index.vue") },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/views/404.vue"),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // 重定向
  if (to.path === "/home") {
    next("/");
    return;
  }
  next();
});

export default router;
