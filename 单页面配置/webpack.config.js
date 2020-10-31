const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const VueLoaderPlugin = require("vue-loader/lib/plugin");
const resolve = dir => {
  return path.resolve(__dirname, dir);
};
module.exports = {
  entry: resolve("./src/main.js"),
  output: {
    filename: "bundle.js",
    path: resolve("dist")
  },
  resolve: {
    extensions: [".vue", ".js"]
  },
  devServer: {
    contentBase: "./dist"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
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
        test: /.vue$/,
        use: "vue-loader"
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: resolve("./public/index.html")
    })
  ],
  devtool: "source-map" // 输出 source-map 方便直接调试 ES6 源码
};
