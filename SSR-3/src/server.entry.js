// 服务端打包
import createApp from "./main";
// 通过server.js文件中的toString传进来的参数
// 服务端会执行此方法

export default context => {
  // // 服务端需要调用当前这个文件 去产生一个vue实例
  // const { app, router } = createApp();
  // // context.url  服务端要把对应的路由和此url相匹配
  // router.push(context.url); //渲染当前页面对应的路由
  // return app; //拿这个实例去服务端渲染结果

  // 为了异步渲染 建议使用promise 服务端renderToString会等待promise执行完成再执行
  return new Promise((resolve, reject) => {
    // 服务端需要调用当前这个文件 去产生一个vue实例
    const { app, router, store } = createApp();
    // context.url  服务端要把对应的路由和此url相匹配
    router.push(context.url); //渲染当前页面对应的路由
    // 页面跳转成功之后，所有异步组件加载完毕再执行
    router.onReady(() => {
      // 获取当前跳转匹配到的所有组件,整个都在服务端执行
      const match = router.getMatchedComponents();
      if (match.length === 0) {
        //会走到renderToString的err中
        reject({ code: 404 });
      }
      // 有可能匹配多个组件
      Promise.all(
        match.map(component => {
          // 只是在服务端渲染好之后返回出去的
          if (component.asyncData) {
            //asyncData是在服务端调用的。如果当前的路由组件有asyncData函数 就执行此函数。
            return component.asyncData(store);
          }
        })
      ).then(() => {
        // Parmise.all()中的方法会改变store中的state  此时数据已经被改变
        // 服务器执行完成之后把状态改变了 会在window上生成一个变量 <script>window.__INITIAL_STATE__={"name":"温远思"}</script>
        // __INITIAL_STATE__是固定的名字
        context.state = store.state; //名字必须为state(规定) 把vuex的状态挂载到上下文中，会将状态挂载到window上
        resolve(app);
      });
    }, reject);
  });
};
// 服务端配置好后 【打包后】给node来使用
