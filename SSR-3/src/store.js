import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
//服务端和客户端都会走此逻辑   服务端先走 客户端再走
export default () => {
  let store = new Vuex.Store({
    state: {
      username: "song",
      email: "123456"
    },
    mutations: {
      changeName(state) {
        state.username = "hello";
      },
      changeEmail(state) {
        state.email = "178382039@qq.com";
      }
    },
    actions: {
      // 此处如果是服务端调用必须返回 promise 否则不生效  因为在service.entry.js的逻辑是Promise.all()
      // 自己有里面的所有数据都获取完之后才会渲染app.vue 所以会等待三秒才渲染数据
      // 只写setTimeout 不生效 因为setTimeout是异步的，在vuex实例渲染完成后才被调用,此时页面已经被当成字符串渲染到浏览器上了。
      changeName({ commit }) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            commit("changeName");
            resolve();
          }, 3000);
        });
      },
      changeEmail({ commit }) {
        setTimeout(() => {
          commit("changeEmail");
        }, 2000);
      }
    }
  });
  return store;
};

// 解释流程

// 刷新页面--先执行服务端渲染-执行vuex-把state挂载到window上
// 客户端(client.bundle.js)执行时,通过store.replaceState()把执行的结果替换掉， 客户端也就是指引入的js逻辑比如 mounted(){}
// 那么此时拿到的我就是最新状态 此时我们再去取值那就是设置好的状态了
