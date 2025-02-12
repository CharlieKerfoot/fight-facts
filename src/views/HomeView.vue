<script setup lang="ts">
</script>

<template>
  <h1>Games:</h1>
  <div class="games">
    <router-link to="connect-the-dots">Connect The Dots</router-link>
    <router-link to="guess-the-odds">Guess The Odds</router-link>
    <router-link to="whos-that-fighter">Who's That Fighter</router-link>
  </div>
</template>

<style scoped>

.games {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
}

a {
  display: flex;
  justify-content: center;
  padding-top: 1em;
  border: 1px solid black;
  border-radius: 1em;
  height: 20em;
  width: 20em;
}

</style>
