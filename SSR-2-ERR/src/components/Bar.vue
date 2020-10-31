<template>
  <section class="bar">
    <button @click="click">点击</button>
    <h1>Bar</h1>
  </section>
</template>

<script>
export default {
  name: 'bar',
  data() {
    return {}
  },
  components: {},
  watch: {},
  mounted() {},
  methods: {
    click() {
      alert('click')
    },
  },
}
</script>

<style scoped >
h1 {
  color: yellow;
}
</style>
