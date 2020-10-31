// 基础的webapck配置 服务端和客户端打包都基于它
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const utils = require("./utils");
module.exports = {
  output: {
    filename: "[name].bundle.js",
    path: utils.resolve("../dist")
  },
  resolve: {
    extensions: [".vue", ".js"]
  },
  devServer: {
    port: Math.floor(Math.random().toFixed(2) * 10000)
  },

  plugins: [new VueLoaderPlugin()]
  //   devtool: "source-map" // 输出 source-map 方便直接调试 ES6 源码
};
