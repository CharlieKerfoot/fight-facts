<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import type { Fighter } from '../../shared/types'
import { ref } from 'vue'

const oddsGuess = ref(0)

const fighter1: Fighter = {
  first_name: 'Brandon',
  last_name: 'Royval',
  nickname: 'Raw Dawg',
  female: false,
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: 'Flyweight',
  stance: 'Orthodox',
  birth_day: new Date('Feb 09, 1987'),
  reach: 78,
  height: `5' 8"`,
}

const fighter2: Fighter = {
  first_name: 'Brandon',
  last_name: 'Royval',
  nickname: 'Raw Dawg',
  female: false,
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: 'Flyweight',
  stance: 'Orthodox',
  birth_day: new Date('Feb 09, 1987'),
  reach: 78,
  height: `5' 8"`,
}

</script>

<template>
  <div class="game">
    <FighterView :fighter="fighter1" />
    <div class="odds">
      <input v-model="oddsGuess" type="range" min="-2500" max="2500" step="10" />
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

.odds > p,
.odds > button {
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
