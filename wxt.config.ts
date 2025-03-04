import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    name: "Tradesparq",
    description: "Tradesparq Get All Data",
    version: "1.0",
    permissions: ["storage", "http://*/*", "https://*/*"],
  },
  // 默认打开地址
  runner: {
    startUrls: ["https://baidu.com"],
  },
});
