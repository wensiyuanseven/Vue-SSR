import Vue from "vue";
import App from "./App";
// 客户端和服务端需要区分开 服务端渲染 每个人都应该有一个自己的vue实例
export default () => {
  const app = new Vue({
    render: h => h(App)
  });
  return { app };
};
