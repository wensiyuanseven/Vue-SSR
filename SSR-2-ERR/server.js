const Koa = require("koa");
const Router = require("koa-router");
const static = require("koa-static");
const vueServerRender = require("vue-server-renderer");
const fs = require("fs");
const { pathToFileURL } = require("url");
const app = new Koa();
const router = new Router();
const path = require("path");
// 不读取它 而是引入映射文件 交给vue-server-renderer自动出路
// const serverBundle = fs.readFileSync("./dist/server.bundle.js", "utf8");
// 需要在build目录中配置好webpack plugin
const serverBundle = require("./dist/vue-ssr-server-bundle.json"); // 引入服务端映射文件
const clientManifest = require("./dist/vue-ssr-client-manifest.json"); // 引入客户端映射文件
const template = fs.readFileSync("./dist/index.ssr.html", "utf8");
// 渲染打包后的结果 让客户端与服务端文件相互关联
// 相当于告诉webpack 服务端打包的时候需要用到manifest.json(客户端的映射文件),然后根据这个映射文件在template模板中自动注入客户端js文件(client.bundle.js)
// 这样就不需要主动去引入客户端打包好的js文件了
const render = vueServerRender.createBundleRenderer(serverBundle, {
  template,
  clientManifest
});

// koa只能用promise
router.get("/", async ctx => {
  // 此时打包之后的结果全是字符串，字符串没有任何的事件功能 所以js逻辑不生效(打包之后vue-server-render也会丢弃js逻辑，所以页面中只有css(vue-style-loader的功劳)和html逻辑)
  // 所以需要把客户端打包后的结果挂载到模板上，因为客户端代码包含事件逻辑
  // 此时需要三个个步骤 1.在模板(dist目录)中先手动引入客户端打包后的结果 <script src="./client.bundle.js"></script> (因为js中的事件逻辑不需要被爬虫爬取)
  // 2.但此时服务器并没有读取此文件，所以需要 koa-static 静态服务中间件 去dist查找此文件
  // 3.需要在App.vue中指定id='app' ,客户端激活
  // 这种方法比较笨

  ctx.body = await new Promise((resolve, reject) => {
    // 必须写成回调函数的形式否则css样式不生效
    render.renderToString(
      {
        title: "服务"
      },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  }); // 返回promise 结果为 '<h1 data-server-rendered="true">hello,ssr</h1>' 会把结果塞给 template
});

app.use(router.routes());
// koa静态服务中间件 会去dist目录插查找看是否有client.bundle.js 如果有就从服务器中返回此文件
app.use(static(path.resolve(__dirname, "dist")));
let port = 8020;
app.listen(port, () => {
  console.log("服务器开启成功", `http://localhost:${port}/`);
});
