<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
  
<script>
export default {
  name: 'App',
}
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Trebuchet MS';
  font-weight: normal;
  font-style: normal;
}

body {
    background-color: rgb(34,34,34);
    color: white;
    margin: 0 auto;
    padding: 15px;
    position: relative;
  }

  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    position: relative;
    top: 0;
    left: 0;
  }

  #title {
    flex-direction: column;
    line-height: 15px;
    text-align: left;
  }

  h1 {
    font-weight: 200;
  }

  main {
    display: flex;
    margin: 0 auto;
    padding: 15px;
    position: relative;
    flex-direction: row;
    margin-top: 50px;
    max-width: 1200px;
  }

  h2 {
    font-size: 56px;
    line-height: 50px;
    min-width: 500px;
  }

  h4 {
    line-height: 30px;
    margin: 15px;
  }

  ::-webkit-scrollbar {
  width: 5px;
  }

  ::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px grey; 
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgb(114, 114, 114); 
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #525252; 
  }
</style>