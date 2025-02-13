<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import type { Fighter } from '../../shared/fighter.ts'
import { ref } from 'vue'
import { Check, X } from 'lucide-vue-next'

const fighter: Fighter = {
  image:
    'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4239928.png&w=350&h=254',
  first_name: 'Brandon',
  last_name: 'Royval',
  nickname: 'Raw Dawg',
  record: {
    wins: 17,
    losses: 7,
    draws: 0,
  },
  weight: 'Flyweight',
  ranked: true,
  ranking: 1,
}

const fighter1: Fighter = {
  image:
    'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3166126.png&w=350&h=254',
  first_name: 'Dricus',
  last_name: 'Du Plessis',
  nickname: '"Stillknocks"',
  weight: 'Middleweight',
  record: {
    wins: 23,
    losses: 2,
    draws: 0,
  },
  ranked: true,
  ranking: 'C',
}

let id = 0
const guesses = ref([
  {
    id: id++,
    correct: false,
    fighter: fighter1,
  },
])

const guessCount = ref(5)
const gameOver = ref(false)
const answer = 'Brandon Royval'

const input = ref('')
const guess = () => {
  if (input.value == answer) {
    gameOver.value = true
    guesses.value.push({
      id: id++,
      correct: true,
      fighter: {
        image:
          'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3166126.png&w=350&h=254',
        first_name: 'Dricus',
        last_name: 'Du Plessis',
        nickname: '"Stillknocks"',
        weight: 'Middleweight',
        record: {
          wins: 23,
          losses: 2,
          draws: 0,
        },
        ranked: true,
        ranking: 'C',
      },
    })
  } else {
    guesses.value.push({
      id: id++,
      correct: false,
      fighter: {
        image:
          'https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3166126.png&w=350&h=254',
        first_name: 'Dricus',
        last_name: 'Du Plessis',
        nickname: '"Stillknocks"',
        weight: 'Middleweight',
        record: {
          wins: 23,
          losses: 2,
          draws: 0,
        },
        ranked: true,
        ranking: 'C',
      },
    })
  }
}
</script>

<template>
  <main>
    <h1>Guess The Fighter</h1>
    <img
      src="data:image/jpeg;base64,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"
      alt="Fighter Photo"
    />
    <form @submit.prevent="guess">
      <input v-model="input" placeholder="Guess The Fighter" />
      <button type="submit">Submit</button>
    </form>
    <div style="display: flex;" class="guesses">
      <h3>Guesses:</h3>
      <p style="margin-left: 1em;">({{ guessCount }} Left)</p>
    </div>
    <table>
      <tr>
        <th>Guess #</th>
        <th><Check :size="16" :stroke-width="2.5" />/<X :size="16" :stroke-width="2.5" /></th>
        <th>Name</th>
        <th>Weightclass</th>
        <th>Wins</th>
        <th>Losses</th>
        <th>Ranking</th>
      </tr>
      <tr v-for="guess in guesses" :key="guess.id">
        <td>{{ guess.id + 1 }}</td>
        <td>
          <Check v-if="guess.correct" :size="20" :stroke-width="2.5" />
          <X v-else :size="20" :stroke-width="2.5"/>
        </td>
        <td>
          {{ guess.fighter.first_name }} {{ guess.fighter.nickname }} {{ guess.fighter.last_name }}
        </td>
        <td>{{ guess.fighter.weight }}</td>
        <td>{{ guess.fighter.record.wins }}</td>
        <td>{{ guess.fighter.record.losses }}</td>
        <td v-if="guess.fighter.ranked">{{ guess.fighter.ranking }}</td>
        <td v-else>Unranked</td>
      </tr>
    </table>
    <div v-if="gameOver">
      <h2>Correct!</h2>
      <FighterView  :fighter="fighter" />
    </div>
  </main>
</template>

<style scoped>
ul {
  display: flex;
  justify-content: left;
}

th,
td {
  border: 1px solid #dddddd;
  text-align: center;
  padding: 8px;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

img {
  margin: 1.5em;
}

h1,.guesses > * {
  margin-bottom: 0;
}


</style>
