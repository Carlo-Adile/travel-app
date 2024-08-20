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

<style scoped></style>
