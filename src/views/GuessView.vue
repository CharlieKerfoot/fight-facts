<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import type { Fighter } from '../../shared/fighter'
import { ref } from 'vue'

const oddsGuess = ref(0)

const fighter1: Fighter = {
  image:
    'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3166126.png&w=350&h=254',
  first_name: 'Dricus',
  last_name: 'Du Plessis',
  nickname: 'Stillknocks',
  weight: 'Middleweight',
  record: {
    wins: 23,
    losses: 2,
    draws: 0,
  },
}

const fighter2: Fighter = {
  image:
    'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3166126.png&w=350&h=254',
  first_name: 'Dricus',
  last_name: 'Du Plessis',
  nickname: 'Stillknocks',
  weight: 'Middleweight',
  record: {
    wins: 23,
    losses: 2,
    draws: 0,
  },
}
</script>

<template>
  <div class="game">
    <FighterView :fighter="fighter1" />
    <div class="odds">
      <input v-model="oddsGuess" type="range" min="-2500" max="2500" step="10"/>
      <p>Odds: {{ oddsGuess }}</p>
      <button type="submit">Guess</button>
    </div>
    <div class="middle">
      <p>{{ fighter1.weight }} Bout</p>
      <p>Event Name</p>
      <p>Date</p>
      <p>Place</p>
    </div>
    <FighterView :fighter="fighter2" />
  </div>
</template>

<style scoped>
.game {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 90vh;
}

.middle > p {
  margin: 5px 0;
}


.odds > p {
  margin-top: 5px;
  font-size: 30px;
  margin-bottom: 10px;
}

.odds > p, .odds > button {
  margin-left: 3px;
}

.odds {
  position: absolute;
  top: 70vh;
}

.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

input {
  width: 20em;
}
</style>
