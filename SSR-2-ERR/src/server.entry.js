// 服务端打包
import createApp from "./main";
export default () => {
  // 服务端需要调用当前这个文件 去产生一个vue实例
  const { app } = createApp();
  return app; //拿这个实例去服务端渲染结果
};
// 服务端配置好后 【打包后】给node来使用