<template>
  <section id="app">
    <h1>我是App哈哈哈</h1>
    <router-link to="/">Foo</router-link>
    <router-link to="/bar">Bar</router-link>
    <router-view></router-view>
  </section>
</template>

<script>
import Bar from './components/Bar'
import Foo from './components/Foo'
export default {
  name: 'app',
  data() {
    return {}
  },
  components: {
    Foo,
    Bar,
  },
  watch: {},
  mounted() {},
  methods: {},
}
</script>

