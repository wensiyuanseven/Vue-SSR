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
};
