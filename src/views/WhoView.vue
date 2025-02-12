<script setup lang="ts">
import FighterView from '@/components/FighterView.vue';
import type { Fighter } from '../../shared/fighter.ts'
import { ref } from 'vue'

const fighter: Fighter = {
  image: "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4239928.png&w=350&h=254",
  first_name: "Brandon",
  last_name: "Royval",
  nickname: "Raw Dawg",
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: "Flyweight",
  ranked: true,
  ranking: 1
}

const gameOver = ref(false)

const click = () => {
  gameOver.value = !gameOver.value
}
</script>

<template>
  <main>
    <p>Guess the fighter</p>
    <img src="" alt="Fighter Photo">
    <form>
      <input type="text" placeholder="Guess the fighter">
      <button type="submit" @click="click"></button>
    </form>
    <FighterView v-if="gameOver" :fighter="fighter"/>
  </main>
</template>
