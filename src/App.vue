<template>
  <div id="app" class="flex flex-col items-center h-screen bg-base-200">
    <!-- Contenitore del mockup -->
    <div class="mockup-container">
      <div class="mockup-phone">
        <div class="camera"></div>
        <div class="display">
          <div class="artboard artboard-demo phone-1">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenitore del contenuto principale -->
    <div class="main-content artboard">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {}
}
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

/* Nascondi il contenitore del mockup su viewport più piccoli di 1024px */
.mockup-container {
  display: none;
}

@media (min-width: 1024px) {
  .mockup-container {
    display: block;
  }
}

.mockup-phone {
  width: 390px;
  height: 740px;
  position: relative;
}

.display {
  height: 100%;
}

.artboard {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  background-color: #fff;
}

.main-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
}

@media (min-width: 1024px) {
  .main-content {
    display: none;
  }
}
</style>
