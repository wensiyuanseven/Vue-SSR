import Vue from "vue";
import Router from "vue-router";
import Foo from "./components/Foo";
import Bar from "./components/Bar";
// 每个服务器创建应用，都应该有一个自己的路由。所以路由也需要写成一个函数
// 每次调用都产生一个路由系统

Vue.use(Router);

export default () => {
  const router = new Router({
    mode: "history",
    //   动态路由必须返回一个promise函数
    routes: [{ path: "/", component: Foo }, { path: "/Bar", component: Bar }]
  });
  return router;
};
