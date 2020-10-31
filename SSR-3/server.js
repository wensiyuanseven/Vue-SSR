let port = 8059;
const Koa = require("koa");
const Router = require("koa-router");
const static = require("koa-static");
const vueServerRender = require("vue-server-renderer");
const fs = require("fs");
const { pathToFileURL } = require("url");
const app = new Koa();
const router = new Router();
const path = require("path");
const serverBundle = fs.readFileSync("./dist/server.bundle.js", "utf8");
const template = fs.readFileSync("./dist/index.ssr.html", "utf8");
// 渲染打包后的结果
// 此方法会自动去调用client.service.js文件中导出的函数  供rendertostring传参使用
const render = vueServerRender.createBundleRenderer(serverBundle, {
  template
});

// koa只能用promise
router.get("/", async ctx => {
  // 此时打包之后的结果全是字符串，字符串没有任何的事件功能 所以js逻辑不生效(打包之后vue-server-render也会丢弃js逻辑，所以页面中只有css(vue-style-loader的功劳)和html逻辑)
  // 所以需要把客户端打包后的结果挂载到模板上，因为客户端代码包含事件逻辑
  // 此时需要三个个步骤 1.在模板(dist目录)中先手动引入客户端打包后的结果 <script src="./client.bundle.js"></script> (因为js中的事件逻辑不需要被怕成爬取)
  // 2.但此时服务器并没有读取此文件，所以需要koa-static静态服务中间件 去dist查找此文件
  // 3.需要在App.vue中指定id='app' ,客户端激活
  // 这种方法比较笨

  ctx.body = await new Promise((resolve, reject) => {
    // 必须写成回调函数的形式否则css样式不生效
    render.renderToString(
      {
        title: "服务",
        url: "/"
      },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  }); // 返回promise 结果为 '<h1 data-server-rendered="true">hello,ssr</h1>' 会把结果塞给template
});
// 中间件
app.use(router.routes());

// koa静态服务中间件 会去dist目录插查找看是否有client.bundle.js 如果有就从服务器中返回此文件
app.use(static(path.resolve(__dirname, "dist")));
// 中间件 当找不到路由时会走此逻辑
// 如果匹配不到路由就会走此逻辑(当路由不是/时，要跳转到对应的路径,渲染对应的页面)
// 如果服务器没有此路径，会渲染当前的app.vue(首页)文件,在渲染时中又会重新指向/bar路径对应的页面
// 此中间件需要放到最后
app.use(async ctx => {
  // 获取到server.entry.js中配置404逻辑
  try {
    ctx.body = await new Promise((resolve, reject) => {
      // 必须写成回调函数的形式否则css样式不生效
      render.renderToString(
        {
          title: "服务",
          url: ctx.url //比如当前请求的时/bar 那就把/bar传到server.entry.js中的content
        },
        (err, data) => {
          if (err) reject(err);
          resolve(data);
        }
      );
    });
  } catch (error) {
    ctx.body = "404";
  }
});
app.listen(port, () => {
  console.log("服务器开启成功", `http://localhost:${port}/`);
});

