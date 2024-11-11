import { login, logout, getInfo } from "@/api/login";
import defAva from "@/assets/images/profile.jpg";
import cache from "@/utils/cache";
import { defineStore } from "pinia";
const useUserStore = defineStore("user", {
  state: () => ({
    token: cache.local.get("token"),
    id: "",
    name: "",
    avatar: "",
    roles: [],
  }),
  actions: {
    // 登录
    login(userInfo: any) {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      return new Promise((_, reject) => {
        login(username, password, code)
          .then((res) => {
            cache.local.set("token", res.data.token);
            this.token = res.data.token;
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 获取用户信息
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo()
          .then((res) => {
            const user = res.data.user;
            const avatar =
              user.avatar == "" || user.avatar == null
                ? defAva
                : import.meta.env.VITE_APP_BASE_API + user.avatar;

            if (res.data.roles && res.data.roles.length > 0) {
              // 验证返回的roles是否是一个非空数组
              this.roles = res.data.roles;
            }
            this.id = user.userId;
            this.name = user.userName;
            this.avatar = avatar;
            resolve(res);
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
    // 退出系统
    logOut() {
      return new Promise((_, reject) => {
        logout()
          .then(() => {
            this.token = "";
            this.roles = [];
            cache.local.clear();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },
  },
});

export default useUserStore;
