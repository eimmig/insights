<template>
  <div id="app">
    <HomePage/>
  </div>
</template>
  
<script>
import HomePage from './components/pages/home-page/HomePage.vue';
export default {
  name: 'App',
  components: {
    HomePage
  }
}
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
  font-weight: normal;
  font-style: normal;
}
</style>