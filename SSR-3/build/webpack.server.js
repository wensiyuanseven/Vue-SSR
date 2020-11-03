const Merge = require("webpack-merge");
const base = require("./webpack.base");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const utils = require("./utils");
const { node } = require("webpack");
module.exports = Merge.merge(base, {
  entry: {
    server: utils.resolve("./../src/server.entry.js")
  },
  target: "node", //打包后的结果给node来使用 node中会使用const path=require('path') 如果不指定为node环境 打包后的结果会包含path模块
  output: {
    libraryTarget: "commonjs2" // 打包后的结果给node来使用 把最终执行的结果放到module.exports上
    /**  node执行原理
    (function(){
     //自己的代码
      function(){}
     })()
    */
  },
  module: {
    rules: [
      {
        test: /.vue$/,
        use: "vue-loader"
        // options: {
        //   // enable CSS extraction
        //   extractCSS: true
        // }
      },
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"] //新的语法特性 如果需要生效还需要再。babelsrc中配置
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: [
          "vue-style-loader",
          {
            loader: "css-loader",
            options: {
              esModule: false
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "{{title}}",
      minify: {
        collapseWhitespace: true, //压缩代码
        removeComments: false //不移除注释
      },
      filename: "index.ssr.html",
      template: utils.resolve("./../public/index.ssr.html"),
      excludeChunks: ["server"] //排除在模板中引用打包之后的server.js
    })
  ]
});
