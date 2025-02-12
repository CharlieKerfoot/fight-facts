<script setup lang="ts">
import { ref } from 'vue'
import type { Fighter } from '../../shared/fighter'
import FighterView from '@/components/FighterView.vue'

let id = 0

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

const fighterList = ref([
  {
    id: id++,
    fighter: fighter1,
  },
  {
    id: id++,
    fighter: fighter1
  },
  {
    id: id++,
    fighter: fighter2
  }
])
</script>

<template>
  <main>
    <ul>
      <FighterView class="fighter" v-for="entry in fighterList" :key="entry.id" :fighter="entry.fighter" />
    </ul>
  </main>
</template>

<style scoped>
  ul {
    display: flex;
    padding-left: 0;
  }

  .fighter:last-child {
    margin-left: auto;
  }
</style>
