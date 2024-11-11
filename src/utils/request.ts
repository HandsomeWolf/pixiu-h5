import axios from "axios";
import cache from "@/utils/cache";
import { tansParams } from "./common";
import { showToast } from "vant";
import { showConfirmDialog } from "vant";
import useUserStore from "@/store/modules/user";

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // 超时
  timeout: 10000,
});

// request拦截器
service.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false;

    if (cache.local.get("token") && !isToken) {
      config.headers["Authorization"] = cache.local.get("token");
    }
    // get请求映射params参数
    if (config.method === "get" && config.params) {
      let url = config.url + "?" + tansParams(config.params);
      url = url.slice(0, -1);
      config.params = {};
      config.url = url;
    }
    if (
      !isRepeatSubmit &&
      (config.method === "post" || config.method === "put")
    ) {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === "object"
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const requestSize = Object.keys(JSON.stringify(requestObj)).length; // 请求数据大小
      const limitSize = 5 * 1024 * 1024; // 限制存放数据5M
      if (requestSize >= limitSize) {
        console.warn(
          `[${config.url}]: ` +
            "请求数据大小超出允许的5M限制，无法进行防重复提交验证。"
        );
        return config;
      }
      const sessionObj = cache.session.get("sessionObj");
      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ""
      ) {
        cache.session.set("sessionObj", requestObj);
      } else if (typeof sessionObj === "object" && sessionObj !== null) {
        const {
          url: s_url,
          data: s_data,
          time: s_time,
        } = sessionObj as { [key: string]: any };

        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          s_data === requestObj.data &&
          requestObj.time - s_time < interval &&
          s_url === requestObj.url
        ) {
          const message = "数据正在处理，请勿重复提交";
          console.warn(`[${s_url}]: ` + message);
          return Promise.reject(new Error(message));
        } else {
          cache.session.set("sessionObj", requestObj);
        }
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    // 获取错误信息
    const msg = res.data.msg || "系统未知错误，请反馈给管理员";
    // 二进制数据则直接返回
    if (
      res.request.responseType === "blob" ||
      res.request.responseType === "arraybuffer"
    ) {
      return res.data;
    }
    if (code === 401) {
      showConfirmDialog({
        title: "系统提示",
        message: "登录状态已过期，您可以继续留在该页面，或者重新登录",
        confirmButtonText: "重新登录",
        cancelButtonText: "取消",
      }).then(() => {
        cache.local.clear();
        useUserStore()
          .logOut()
          .then(() => {
            location.href = "/index";
          });
      });
      return Promise.reject("会话已过期，请重新登录。");
    } else if (code !== 200) {
      showToast({ message: msg });
      return Promise.reject(new Error(msg));
    } else {
      return Promise.resolve(res.data);
    }
  },
  (error) => {
    let { message } = error;
    if (message == "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    showToast({ message: message, duration: 5 * 1000 });
    return Promise.reject(error);
  }
);

export default service;
