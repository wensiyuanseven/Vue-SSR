<template>
  <section class="bar">
    <button @click="click">点击</button>
    <h1>Bar</h1>
    <!-- 此时还是vue实例,此时还是服务端渲染出来的静态页面，
    asyncData中的dispatch也还是服务端改变的，replaceState替换状态是为了客户端mounted()能改变状态-->
    <h1>{{ this.$store.state}}</h1>
  </section>
</template>

<script>
export default {
  name: 'bar',
  data() {
    return {}
  },
  // 刷新浏览器走服务端渲染 执行此方法
  asyncData(store) {
    // nuxt.js中也有此方法。此方法只在服务端执行，并且只在页面组件中执行
    // （页面级别组件指通过路由生成的组件，路由组件中的子组件不执行此方法）
    // 此时无法获取this
    return store.dispatch('changeName') //返回promise
  },
  // 客户端代码调用state
  mounted() {
    this.$store.dispatch('changeEmail')
  },
  components: {},
  watch: {},
  methods: {
    click() {
      alert('click')
    },
  },
}
</script>

<style scoped >
h1 {
  color: royalblue;
}
</style>
