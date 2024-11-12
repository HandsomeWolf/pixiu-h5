import { createApp } from "vue";
import "./style.css";
import "vant/lib/index.css";
import App from "./App.vue";
import router from "./router";

createApp(App).use(router).mount("#app");
