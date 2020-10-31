import Vue from "vue";
import App from "./App";
import createRouter from "./router";
import createStore from "./store";
// 客户端和服务端需要区分开 服务端渲染 每个人都应该有一个自己的vue实例
export default () => {
  const router = createRouter(); //创建新的router实例
  const store = createStore();
  console.log(store,'store')
  const app = new Vue({
    router,
    store,
    render: h => h(App)
  });
  return { app, router, store };
};
