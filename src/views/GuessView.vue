<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import type { Fighter } from '../../shared/fighter'

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
  ranked: true,
  ranking: 'C',
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
  ranked: true,
  ranking: 'C',
}
</script>

<template>
  <div class="game">
    <FighterView :fighter="fighter1" />
    <div class="odds">
      <input type="range" name="" id="" />
      <p>Odds:</p>
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
  margin-top: 10px; /* Ensure text is always 10px below input */
  font-size: 30px;
}

.odds {
  position: absolute;
}

.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
