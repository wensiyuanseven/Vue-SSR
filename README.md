
## 使用

- 在SSR-3目录中 npm install 安装依赖
- 打包服务端 npm  run  server:build
- 打包客户端  npm  run   client:build

- 在dist目录index.ssr.html中引入客户端代码`<script src="./client.bundle.js"></script>`

- 执行服务端脚本 `node server.js`

# webpack5.0尝鲜 SSR+Vue+Koa+vue-router+vuex【排坑记录】

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0eb6c4b857fe413bb2038e6601722155~tplv-k3u1fbpfcp-watermark.image)

## 一些包

### webpack相关

- webpack
- webpack-cli  命令行解析工具 4.0之前是一起的 4.0之后拆开了 需要安装
- webpack-dev-server
- html-webpack-plugin
- webpack-merge

### es6转es5

- babel-loader   es6=>es5 webpack中接入babel
- @babel/core    babel-loader依赖
- @babel/preset-env  加入新的语法特性 比如2015年加入的新特性  Env包括所有的新特性
- @babel/plugin-transform-runtime 减少冗余代码  默认的polifill属性已经被废除掉了
- @babel/runtime    @babel/plugin-transform-runtime依赖

### 解析css的包

- vue-style-loader  支持服务端渲染 和style-loader功能一样
- css-loader

### vue相关

- vue-loader 处理.vue文件
- vue-template-loader  处理模板编译

----------------------------
npx webpack   ===  node_modules/bin/webpack  打包

## webpack5.0 bug记录

### 问题一

webpack5.0与webpack-dev-server不兼容

npm script 需把 "run"："webpack-dev-server --open"改成
"run":"webpack serve"

### 问题2

vue-style-loader与css-loader 在服务端打包时style样式不生效问题解决方案

{
test: /\.css$/,
use: [
    "vue-style-loader",
    {
    loader: "css-loader",
        options: {
            esModule: false  //默认为true 需要设置为false
        }
    }
]
}

### 问题三

build目录中 webpack.server.js
 const ServerRenderPlugin = require("vue-server-renderer/server-plugin") 报错

解决方案 修改vue-server-renderer包中的代码

<https://github.com/vuejs/vue/issues/11718#issuecomment-717786088>

### 问题四

使用 const ClientRenderPlugin = require("vue-server-renderer/client-plugin");
const ServerRenderPlugin = require("vue-server-renderer/server-plugin");
自动引入js文件时服务端会报错 展示没有解决办法 需要手动引入js文件

npm run client:build -- --watch 文件变动执行打包编译

为什么服务端vue vuex vueRouter 都需要调用一个函数，从函数中获取实例？

因为Node.js 服务器是一个长期运行的进程 当代码进入进程时，它将进行一次取值并留存在内存中。也就是会把vue实例保存到内存中
假如说不用函数返回新的实例，那么每个人访问同一个页面时都会共用同一个实例，那么就会造成数据的污染。

<https://ssr.vuejs.org/zh/guide/structure.html>

## 路由集成

  首屏只渲染一个路由，但是其他路由的逻辑混淆再js文件中。如果需要分开 可以使用路由懒加载。
  每个路由需要返回一个函数 每个服务器都要返回一个路由实例

此时的问题
此时在服务器中执行构建,
访问localhose:3000/    应该渲染出对应的组件Foo 但是没有渲染出来
并且控制台会报错 Failed to execute 'appendChild' on 'Node': This node type does not support this method.at Object.appendChild

解造成此问题的原因：
服务器访问根目录时 router.get("/") 渲染出来的时字符串 它并不知道哪个页面对应哪个路由 所以只会渲染app.vue

解决方案:

server.js中
  `render.renderToString({url:'/' })`

server.enter.js中

```js
export default context => {
    // 服务端需要调用当前这个文件 去产生一个vue实例
    const { app, router } = createApp();
    // context.url  服务端要把对应的路由和此url相匹配
    router.push(context.url); // 渲染当前页面对应的路由
    return app; //拿这个实例去服务端查找渲染结果
};
```

切换到其他路由localhose:3000/bar然后刷新浏览器会报404错误  Not Fount

**重点**：如果此时是点击切换 那就只是客户端切换 并不是服务端切换。并不会造成服务端重新渲染。
也可以理解为服务端不认识router-link,解析不出对应的组件, localhose:3000/bar 只有刷新页面时才会走服务端渲染。
但是此时会报404 因为器服务器根本没有此路径。
解决方法：
所以在服务器中还得再配其他路径，使用中间件，使得每个路径渲染对应的页面

**中间件**
当找不到路由时会走此逻辑
如果匹配不到路由就会走此逻辑(当路由不是跟路径时，要跳转到对应的路径,渲染对应的页面)
如果服务器没有此路径，会渲染当前的app.vue(首页)文件,在渲染时又会重新指向/bar路径对应的页面
然后 server.entry.js 中router.push(context.url)找对应的组件

```js
 app.use(async ctx => {
    ctx.body = await new Promise((resolve, reject) => {
        // 必须写成回调函数的形式否则css样式不生效
        render.renderToString(
        {
            title: "服务",
            url: ctx.url  //比如当前请求的/bar 那就把/bar传到server.entry.js中的content
        },
        (err, data) => {
            if (err) reject(err);
            resolve(data);
        }
        );
    });
    });
```

也就是先渲染app.vue---->找其他路由对应的组件

这也是history模式需要后端支持的原理

## Vuex集成

为什么vuex需要此判断？

```js
if (typeof window !== "undefined" && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__);
}
```

因为客户端和服务端各自生成一个vuex实例 而他们两个需要共用一个状态，因此需要服务端状态改变之后传给客户端

服务端与客户端各自的用处？

服务端用于渲染html 有利于seo
客户端用于处理js逻辑比如 点击事件 client.bundle.js

服务端调用在组件中调用asyncDate() vuex必须返回promise才能生效，并且只有等resolve()执行完成之后才会返回结果

    如果是服务端调用必须返回 promise 否则不生效  因为在service.entry.js的逻辑是Promise.all()
    自己有里面的所有数据都获取完之后才会渲染app.vue 所以会等待三秒才渲染数据
    只写setTimeout 不生效 因为setTimeout是异步的，在vuex实例渲染完成后才被调用,此时页面已经被当成字符串渲染到浏览器上了。

哪些请求放在ajax哪些放在服务端请求？

被爬虫爬取，比如新闻列表的数据 由服务端返回

## 流程大致总结

主入口文件

- 服务端入口文件
- 客户端入口文件

webpack

- base.js
- 服务端配置
- 客户端配置
- merge-webpack

vue-server-renderer

- createRender() createBundleRender()

- renderTostring()  renderToStream()

### 主流程

- webpack.server.js -> 入口文件 server.entry.js(函数生成每个实例)-> npm run server:build->服务端文件打包到dist目录

- webpack.client.js->入口文件 server.entry.js ->npm run client:build->客户端打包到dist目录

- Koa-> vue-server-renderer->render.createBundleRender()引入打包好的服务端文件和模板->render.renderToStream()配置模板属性+生成html字符串->koa中间件监听dist目录->在模板中手动引入客户端打包好的bundle.js文件->挂载#app激活事件->返回给客户端。

css->vue-style-loader

-配置meta标签

- 在option中设置title
- 客户端:document.title=this.$options.title
- 服务端：this.$ssrContext=title

### 配置路由

引入路由->每个路由都已函数的形式返回->koa中间件捕获到history路径->把url传给render.renderToString->server.entry.js接受到路径
router.push(context.url)渲染当前页面对应的路由

 router.onReady()  router.getMatchedComponents()

### 配置vuex

引入vuex->每个路由都已函数的形式返回->在匹配到的每个组件中调用asyncData方法动态传入store->
改变store的状态->更新(此时会等待promise执行完成再渲染页面)->
再拿到状态->context.state = store.state->把vuex的状态挂载到上下文中，会将状态挂载到window上->
当客户端执行vuex时把状态替换掉store.replaceState(window.__INITIAL_STATE__);
