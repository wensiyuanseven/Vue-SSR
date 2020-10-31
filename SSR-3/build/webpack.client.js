const Merge = require("webpack-merge");
const base = require("./webpack.base");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const utils = require("./utils");
module.exports = Merge.merge(base, {
  entry: {
    client: utils.resolve("./../src/client-entry.js")
  },
  module: {
    rules: [
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
        test: /.vue$/,
        use: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "index",
      filename: "index.html",
      template: utils.resolve("./../public/index.html")
    })
  ]
});
