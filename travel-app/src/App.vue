<script>
/* import Profile from '../components/Profile.vue'; */
import Profile from './components/Profile.vue'

export default {
  name: 'App',
  components: {
    Profile,
  }
}
</script>

<template>
  <div id="app">
    <Profile />
    <router-view></router-view>
  </div>
</template>

<style scoped>
/* #app {
  min-height: 100vh;
  background-color: rgb(243, 241, 241);
} */
</style>
