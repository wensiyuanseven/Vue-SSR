const Koa = require("koa");
const Router = require("koa-router");
const Vue = require("Vue");
const vueServerRender = require("vue-server-renderer");

const app = new Koa();
const router = new Router();
const vm = new Vue({
  data: {
    msg: "hello,ssr"
  },
  template: `<h1>{{msg}}</h1>`
});

// 创建一个渲染器 为了把vue渲染成字符串
// vueServerRender身上有两个方法 renderToString ,renderToStream 把生成的字符串插入到body中
const render = vueServerRender.createRenderer({
  template: require("fs").readFileSync("./template.html", "utf-8") //把渲染出来的字符串塞到html模板的body中，再由服务端吐出来 模板中必须带有 <!--vue-ssr-outlet-->
});
router.get("/", async ctx => {
  // ctx.body='hello,ssr'
  ctx.body = await render.renderToString(vm, { title: "base-ssr" }); //返回promise 结果为 '<h1 data-server-rendered="true">hello,ssr</h1>' 会把结果塞给template
});

app.use(router.routes());

app.listen(300, () => {
  console.log("服务器开启成功");
});
