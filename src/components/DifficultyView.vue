<template>
  <h1>Games:</h1>
  <div class="games">
    <button>Easy</button>
    <button>Medium</button>
    <button>Hard</button>
    <button v-if="props.impossible">Impossible</button>
  </div>
</template>

<script setup lang="ts">
const props  = defineProps({
  impossible: Boolean,
  game: String,
})
</script>
