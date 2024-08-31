<script>
import AppFooter from './components/AppFooter.vue';

export default {
  name: 'App',
  components: {
    AppFooter
  }
}
</script>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
  <!-- <AppFooter /> -->
</template>

<style scoped>
#app {
  margin-bottom: 75px;
}
</style>
