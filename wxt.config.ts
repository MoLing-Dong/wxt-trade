import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: "chrome",
  modules: ["@wxt-dev/module-vue"],
  // 默认打开地址
  manifest: {
    name: "My Extension",
    description: "A custom browser extension",
    version: "1.0",
    permissions: ["storage", "http://*/*", "https://*/*"],
  },
  runner: {
    startUrls: ["https://baidu.com"],
  },
});
