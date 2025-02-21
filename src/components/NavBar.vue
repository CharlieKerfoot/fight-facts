<template>
  <nav class="navbar">
    <router-link to="/">Home</router-link>
    <router-link to="connect-the-dots">Connect The Dots</router-link>
    <router-link to="guess-the-odds">Guess The Odds</router-link>
    <router-link to="whos-that-fighter">Who's That Fighter</router-link>
    <router-link to="temp">Temp API Test Practice</router-link>
  </nav>
</template>

<style scoped>
.navbar {
  padding: 1rem;
  background-color: rgb(255, 126, 126);
}

.navbar a {
  margin: 0 1rem;
  text-decoration: none;
  color: #333;
}

.navbar a.router-link-active {
  text-decoration: underline;
  text-decoration-color: white;
  text-underline-offset: 9px;
  text-decoration-thickness: 3.5px;
}

.navbar a:hover {
  color: #515151
}
</style>
