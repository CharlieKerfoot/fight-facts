<script setup lang="ts">
import { ref } from 'vue'
import type { Fighter } from '../../shared/types'
import FighterView from '@/components/FighterView.vue'

let id = 0

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

const fighterList = ref([
  {
    id: id++,
    fighter: fighter1,
  },
  {
    id: id++,
    fighter: fighter1,
  },
  {
    id: id++,
    fighter: fighter2,
  },
])
</script>

<template>
  <main>
    <ul>
      <FighterView
        class="fighter"
        v-for="entry in fighterList"
        :key="entry.id"
        :fighter="entry.fighter"
      />
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
