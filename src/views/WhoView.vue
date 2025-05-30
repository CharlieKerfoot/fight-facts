<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { Fighter, Guess } from '../../shared/types.ts'
import { ref, type Ref, onMounted } from 'vue'
import { Check, X, HelpCircle } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const mode = ref((route.query.mode as string) || 'unlimited')

const getDailyStreak = () => {
  const savedStreak = localStorage.getItem('dailyStreak')
  if (!savedStreak) return { current: 0, longest: 0 }
  return JSON.parse(savedStreak)
}

const updateDailyStreak = (won: boolean) => {
  const { current, longest } = getDailyStreak()
  const today = new Date().toISOString().split('T')[0]
  const lastPlayed = localStorage.getItem('lastPlayedDate')

  if (lastPlayed === today) return // Already played today

  const newCurrent = won ? current + 1 : 0
  const newLongest = Math.max(longest, newCurrent)

  localStorage.setItem(
    'dailyStreak',
    JSON.stringify({
      current: newCurrent,
      longest: newLongest,
    }),
  )
  localStorage.setItem('lastPlayedDate', today)
}

const getUnlimitedStreak = () => {
  const savedStreak = localStorage.getItem('unlimitedStreak')
  if (!savedStreak) return { current: 0, longest: 0 }
  return JSON.parse(savedStreak)
}

const updateUnlimitedStreak = (won: boolean) => {
  const { current, longest } = getUnlimitedStreak()
  const newCurrent = won ? current + 1 : 0
  const newLongest = Math.max(longest, newCurrent)

  localStorage.setItem(
    'unlimitedStreak',
    JSON.stringify({
      current: newCurrent,
      longest: newLongest,
    }),
  )
}

const getDailyGameState = () => {
  const savedState = localStorage.getItem('dailyGameState')
  if (!savedState) return null

  const state = JSON.parse(savedState)
  const today = new Date().toISOString().split('T')[0]

  if (state.date === today) {
    return {
      ...state,
      fighter: {
        ...state.fighter,
        birth_day: new Date(state.fighter.birth_day),
      },
      guesses: state.guesses.map((guess: { fighter: { birth_day: string } }) => ({
        ...guess,
        fighter: {
          ...guess.fighter,
          birth_day: new Date(guess.fighter.birth_day),
        },
      })),
    }
  }
  return null
}

const saveDailyGameState = (guesses: Guess[], fighter: Fighter) => {
  const state = {
    date: new Date().toISOString().split('T')[0],
    guesses: guesses.map((guess) => ({
      ...guess,
      fighter: {
        ...guess.fighter,
        birth_day: guess.fighter.birth_day.toISOString(),
      },
    })),
    fighter: {
      ...fighter,
      birth_day: fighter.birth_day.toISOString(),
    },
  }
  localStorage.setItem('dailyGameState', JSON.stringify(state))
}

const getDailyFighter = async (): Promise<Fighter> => {
  try {
    const response = await fetch('http://localhost:3000/api/daily-fighter')
    if (!response.ok) {
      throw new Error('Failed to fetch daily fighter')
    }
    const data = await response.json()
    return {
      ...data,
      birth_day: new Date(data.birth_day),
    }
  } catch (error) {
    console.error('Error fetching daily fighter:', error)
    throw error
  }
}

const getRandomFighter = async (): Promise<Fighter> => {
  try {
    const response = await fetch('http://localhost:3000/api/random-fighter')
    if (!response.ok) {
      throw new Error('Failed to fetch random fighter')
    }
    const data = await response.json()
    return {
      ...data,
      birth_day: new Date(data.birth_day),
    }
  } catch (error) {
    console.error('Error fetching random fighter:', error)
    throw error
  }
}

const fighter = ref<Fighter | null>(null)
let id = 0
const guesses: Ref<Guess[]> = ref([])

const startingGuesses = 6
const guessCount = ref(startingGuesses)
const gameOver = ref(false)

const input = ref('')

const weightClasses = [
  'Strawweight',
  'Flyweight',
  'Bantamweight',
  'Featherweight',
  'Lightweight',
  'Welterweight',
  'Middleweight',
  'Light Heavyweight',
  'Heavyweight',
]

const weightClassMap: Record<string, string> = {
  '115 lbs.': 'Strawweight',
  '125 lbs.': 'Flyweight',
  '135 lbs.': 'Bantamweight',
  '145 lbs.': 'Featherweight',
  '155 lbs.': 'Lightweight',
  '170 lbs.': 'Welterweight',
  '185 lbs.': 'Middleweight',
  '205 lbs.': 'Light Heavyweight',
  '265 lbs.': 'Heavyweight',
}

const normalizeWeightClass = (weight: string): string => {
  return weightClassMap[weight] || weight
}

const getWeightClassDiff = (guess: string, actual: string): number => {
  const normalizedGuess = normalizeWeightClass(guess)
  const normalizedActual = normalizeWeightClass(actual)
  const guessIndex = weightClasses.indexOf(normalizedGuess)
  const actualIndex = weightClasses.indexOf(normalizedActual)
  if (guessIndex === -1 || actualIndex === -1) {
    return 0
  }
  return actualIndex - guessIndex
}

const getHeightInInches = (height: string): number => {
  const match = height.match(/(\d+)' (\d+)"/)
  if (!match) return 0
  return parseInt(match[1]) * 12 + parseInt(match[2])
}

const isClose = (guess: number, actual: number, threshold: number): boolean => {
  return Math.abs(guess - actual) <= threshold
}

const getStatComparison = (
  guess: string | number | Date,
  actual: string | number | Date | undefined,
  type: string,
): { class: string; indicator: string } => {
  if (!actual) return { class: '', indicator: '' }

  try {
    switch (type) {
      case 'height': {
        const guessInches = getHeightInInches(guess as string)
        const actualInches = getHeightInInches(actual as string)
        if (guessInches === actualInches) return { class: 'exact', indicator: '✓' }
        if (isClose(guessInches, actualInches, 2)) return { class: 'close', indicator: '~' }
        return { class: '', indicator: guessInches < actualInches ? '↑' : '↓' }
      }
      case 'weight': {
        const diff = getWeightClassDiff(guess as string, actual as string)
        if (diff === 0) return { class: 'exact', indicator: '✓' }
        if (Math.abs(diff) === 1) return { class: 'close', indicator: '~' }
        return { class: '', indicator: diff > 0 ? '↑' : '↓' }
      }
      case 'age': {
        if (!(guess instanceof Date) || !(actual instanceof Date)) {
          console.log('Invalid date types for age comparison')
          return { class: '', indicator: '' }
        }
        const guessAge = Math.floor((Date.now() - guess.getTime()) / 31536000000)
        const actualAge = Math.floor((Date.now() - actual.getTime()) / 31536000000)
        if (guessAge === actualAge) return { class: 'exact', indicator: '✓' }
        if (Math.abs(guessAge - actualAge) <= 2) return { class: 'close', indicator: '~' }
        return { class: '', indicator: guessAge > actualAge ? '↓' : '↑' }
      }
      case 'reach': {
        if (typeof guess !== 'number' || typeof actual !== 'number')
          return { class: '', indicator: '' }
        if (guess === actual) return { class: 'exact', indicator: '✓' }
        if (isClose(guess, actual, 2)) return { class: 'close', indicator: '~' }
        return { class: '', indicator: guess < actual ? '↑' : '↓' }
      }
      case 'wins':
      case 'losses':
      case 'draws': {
        if (typeof guess !== 'number' || typeof actual !== 'number')
          return { class: '', indicator: '' }
        if (guess === actual) return { class: 'exact', indicator: '✓' }
        if (isClose(guess, actual, 2)) return { class: 'close', indicator: '~' }
        return { class: '', indicator: guess < actual ? '↑' : '↓' }
      }
      case 'stance': {
        if (guess === actual) return { class: 'exact', indicator: '✓' }
        if (
          (guess === 'Orthodox' && actual === 'Switch') ||
          (guess === 'Switch' && actual === 'Orthodox') ||
          (guess === 'Southpaw' && actual === 'Switch') ||
          (guess === 'Switch' && actual === 'Southpaw')
        ) {
          return { class: 'close', indicator: '~' }
        }
        return { class: '', indicator: '' }
      }
      default:
        return { class: '', indicator: '' }
    }
  } catch (error) {
    console.error('Error comparing stats:', error)
    return { class: '', indicator: '' }
  }
}

const checkFight = async (fighter1: Fighter, fighter2: Fighter): Promise<boolean> => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/connect/check-fight?fighter1FirstName=${encodeURIComponent(
        fighter1.first_name,
      )}&fighter1LastName=${encodeURIComponent(
        fighter1.last_name,
      )}&fighter2FirstName=${encodeURIComponent(
        fighter2.first_name,
      )}&fighter2LastName=${encodeURIComponent(fighter2.last_name)}`,
    )
    if (!response.ok) {
      throw new Error('Failed to check fight')
    }
    const { fought } = await response.json()
    return fought
  } catch (error) {
    console.error('Error checking fight:', error)
    return false
  }
}

onMounted(async () => {
  try {
    if (mode.value === 'daily') {
      const savedState = getDailyGameState()
      if (savedState) {
        fighter.value = savedState.fighter
        guesses.value = savedState.guesses
        gameOver.value = true
        guessCount.value = 0
      } else {
        const dailyFighter = await getDailyFighter()
        fighter.value = {
          ...dailyFighter,
          birth_day: new Date(dailyFighter.birth_day),
        }
      }
    } else {
      const randomFighter = await getRandomFighter()
      fighter.value = {
        ...randomFighter,
        birth_day: new Date(randomFighter.birth_day),
      }
    }
  } catch (error) {
    console.error('Error loading fighter:', error)
  }
})

const guess = async () => {
  if (!input.value || !fighter.value) return

  // Split the input into parts, handling multiple spaces
  const nameParts = input.value.trim().split(/\s+/)
  if (nameParts.length < 1) return

  // Handle single name (like Rongzhu)
  if (nameParts.length === 1) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/fighter?firstName=${encodeURIComponent(nameParts[0])}&lastName=`,
      )

      if (!response.ok) {
        console.error('Error fetching fighter data')
        return
      }

      const fighterData = await response.json()
      if (!fighterData) return

      const birthDay = new Date(fighterData.birth_day)

      const guessedFighter: Fighter = {
        ...fighterData,
        birth_day: birthDay,
      }

      const isCorrect =
        guessedFighter.first_name === fighter.value.first_name &&
        guessedFighter.last_name === fighter.value.last_name

      const hasFought = await checkFight(guessedFighter, fighter.value)

      guessCount.value--
      guesses.value.push({
        id: id++,
        correct: isCorrect,
        fighter: guessedFighter,
        hasFought,
      })

      if (isCorrect) {
        gameOver.value = true
        if (mode.value === 'daily') {
          saveDailyGameState(guesses.value, fighter.value)
          updateDailyStreak(true)
        } else {
          updateUnlimitedStreak(true)
        }
      } else if (guessCount.value === 0) {
        gameOver.value = true
        if (mode.value === 'daily') {
          saveDailyGameState(guesses.value, fighter.value)
          updateDailyStreak(false)
        } else {
          updateUnlimitedStreak(false)
        }
      }

      input.value = ''
      return
    } catch (error) {
      console.error('Error making guess:', error)
      return
    }
  }

  // Handle names with spaces in last name (like "Machado Garry")
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  try {
    const response = await fetch(
      `http://localhost:3000/api/fighter?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`,
    )

    if (!response.ok) {
      console.error('Error fetching fighter data')
      return
    }

    const fighterData = await response.json()
    if (!fighterData) return

    const birthDay = new Date(fighterData.birth_day)

    const guessedFighter: Fighter = {
      ...fighterData,
      birth_day: birthDay,
    }

    const isCorrect =
      guessedFighter.first_name === fighter.value.first_name &&
      guessedFighter.last_name === fighter.value.last_name

    const hasFought = await checkFight(guessedFighter, fighter.value)

    guessCount.value--
    guesses.value.push({
      id: id++,
      correct: isCorrect,
      fighter: guessedFighter,
      hasFought,
    })

    if (isCorrect) {
      gameOver.value = true
      if (mode.value === 'daily') {
        saveDailyGameState(guesses.value, fighter.value)
        updateDailyStreak(true)
      } else {
        updateUnlimitedStreak(true)
      }
    } else if (guessCount.value === 0) {
      gameOver.value = true
      if (mode.value === 'daily') {
        saveDailyGameState(guesses.value, fighter.value)
        updateDailyStreak(false)
      } else {
        updateUnlimitedStreak(false)
      }
    }

    input.value = ''
  } catch (error) {
    console.error('Error making guess:', error)
  }
}

const handleSuggestionSelect = (selectedFighter: { firstName: string; lastName: string }) => {
  input.value = `${selectedFighter.firstName} ${selectedFighter.lastName}`
}

const startNewGame = async () => {
  if (mode.value === 'unlimited') {
    try {
      const randomFighter = await getRandomFighter()
      fighter.value = {
        ...randomFighter,
        birth_day: new Date(randomFighter.birth_day),
      }
      guesses.value = []
      guessCount.value = startingGuesses
      gameOver.value = false
      input.value = ''
      id = 0
    } catch (error) {
      console.error('Error starting new game:', error)
    }
  }
}

const toggleMode = async () => {
  const newMode = mode.value === 'daily' ? 'unlimited' : 'daily'
  mode.value = newMode
  router.push({ query: { mode: newMode } })

  // Reset all game state
  guesses.value = []
  guessCount.value = startingGuesses
  gameOver.value = false
  input.value = ''
  id = 0

  try {
    if (newMode === 'daily') {
      const savedState = getDailyGameState()
      if (savedState) {
        fighter.value = savedState.fighter
        guesses.value = savedState.guesses
        gameOver.value = true
        guessCount.value = 0
      } else {
        const dailyFighter = await getDailyFighter()
        fighter.value = {
          ...dailyFighter,
          birth_day: new Date(dailyFighter.birth_day),
        }
      }
    } else {
      const randomFighter = await getRandomFighter()
      fighter.value = {
        ...randomFighter,
        birth_day: new Date(randomFighter.birth_day),
      }
    }
  } catch (error) {
    console.error('Error resetting game:', error)
  }
}

const giveUp = () => {
  if (!fighter.value) return
  gameOver.value = true
  if (mode.value === 'daily') {
    saveDailyGameState(guesses.value, fighter.value)
    updateDailyStreak(false)
  } else {
    updateUnlimitedStreak(false)
  }
}
</script>

<template>
  <main class="who-view">
    <header class="page-header">
      <h1>Guess The Fighter</h1>
      <div class="help-icon">
        <HelpCircle :size="24" :stroke-width="2" />
        <div class="tooltip">
          <h3>How to Play</h3>
          <p>Guess the UFC fighter in 6 tries!</p>
          <ul>
            <li><span class="exact">Green</span> means exact match</li>
            <li><span class="close">Yellow</span> means close match</li>
            <li>Age: Yellow if within 2 years</li>
            <li>Weight: Yellow if within 1 weight class</li>
            <li>Height: Yellow if within 2 inches</li>
            <li>Reach: Yellow if within 2 inches</li>
            <li>Wins/Losses: Yellow if within 2</li>
            <li>Stance: Yellow if similar (Orthodox/Switch or Southpaw/Switch)</li>
            <li>Fought?: Shows if your guess has fought the target fighter</li>
          </ul>
          <p>Arrows indicate if the target is higher (↑) or lower (↓)</p>
        </div>
      </div>
      <div class="separator"></div>
      <div class="header-buttons">
        <button class="mode-toggle" @click="toggleMode" :class="{ active: mode === 'daily' }">
          {{ mode === 'daily' ? 'Daily Mode' : 'Unlimited Mode' }}
        </button>
        <button class="give-up" @click="giveUp" v-if="!gameOver">Give Up</button>
      </div>
    </header>
    <div v-if="mode === 'daily'" class="streak-info">
      <p>Current Streak: {{ getDailyStreak().current }}</p>
      <p>Longest Streak: {{ getDailyStreak().longest }}</p>
    </div>
    <div v-else class="streak-info">
      <p>Current Streak: {{ getUnlimitedStreak().current }}</p>
      <p>Career Best: {{ getUnlimitedStreak().longest }}</p>
    </div>
    <div v-if="mode === 'daily' && gameOver" class="daily-status">
      <p>You've already played today's game!</p>
      <p v-if="guesses.length > 0">
        You {{ guesses[guesses.length - 1].correct ? 'won' : 'lost' }} in
        {{ guesses.length }} guess{{ guesses.length === 1 ? '' : 'es' }}.
      </p>
    </div>
    <form @submit.prevent="guess" class="search-form" v-if="!gameOver">
      <SearchBar @suggestion-selected="handleSuggestionSelect" />
      <button type="submit">Submit</button>
    </form>
    <div class="guesses-left" v-if="!gameOver || mode === 'unlimited'">
      <p>{{ guessCount }} Guesses Left</p>
    </div>
    <div class="guesses-table">
      <table>
        <thead>
          <tr>
            <th>Guess #</th>
            <th><Check :size="16" :stroke-width="2.5" />/<X :size="16" :stroke-width="2.5" /></th>
            <th>Name</th>
            <th>Age</th>
            <th>Weightclass</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Stance</th>
            <th>Height</th>
            <th>Reach</th>
            <th>Fought?</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guess in guesses" :key="guess.id">
            <td>{{ guess.id + 1 }}</td>
            <td>
              <Check v-if="guess.correct" :size="20" :stroke-width="2.5" color="green" />
              <X v-else :size="20" :stroke-width="2.5" color="red" />
            </td>
            <td :class="{ exact: guess.correct }">
              {{ guess.fighter.first_name }}
              <span v-if="guess.fighter.nickname">"{{ guess.fighter.nickname }}"</span>
              {{ guess.fighter.last_name }}
            </td>
            <td
              :class="getStatComparison(guess.fighter.birth_day, fighter?.birth_day, 'age').class"
            >
              {{ Math.floor((Date.now() - guess.fighter.birth_day.getTime()) / 31536000000) }}
              {{ getStatComparison(guess.fighter.birth_day, fighter?.birth_day, 'age').indicator }}
            </td>
            <td :class="getStatComparison(guess.fighter.weight, fighter?.weight, 'weight').class">
              {{ guess.fighter.weight }}
              {{ getStatComparison(guess.fighter.weight, fighter?.weight, 'weight').indicator }}
            </td>
            <td
              :class="
                getStatComparison(guess.fighter.record.wins, fighter?.record.wins, 'wins').class
              "
            >
              {{ guess.fighter.record.wins }}
              {{
                getStatComparison(guess.fighter.record.wins, fighter?.record.wins, 'wins').indicator
              }}
            </td>
            <td
              :class="
                getStatComparison(guess.fighter.record.losses, fighter?.record.losses, 'losses')
                  .class
              "
            >
              {{ guess.fighter.record.losses }}
              {{
                getStatComparison(guess.fighter.record.losses, fighter?.record.losses, 'losses')
                  .indicator
              }}
            </td>
            <td :class="getStatComparison(guess.fighter.stance, fighter?.stance, 'stance').class">
              {{ guess.fighter.stance }}
              {{ getStatComparison(guess.fighter.stance, fighter?.stance, 'stance').indicator }}
            </td>
            <td :class="getStatComparison(guess.fighter.height, fighter?.height, 'height').class">
              {{ guess.fighter.height }}
              {{ getStatComparison(guess.fighter.height, fighter?.height, 'height').indicator }}
            </td>
            <td :class="getStatComparison(guess.fighter.reach, fighter?.reach, 'reach').class">
              {{ guess.fighter.reach }}"
              {{ getStatComparison(guess.fighter.reach, fighter?.reach, 'reach').indicator }}
            </td>
            <td :class="{ exact: guess.hasFought }">
              <Check v-if="guess.hasFought" :size="20" :stroke-width="2.5" color="green" />
              <X v-else :size="20" :stroke-width="2.5" color="red" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="gameOver && fighter" class="result-container">
      <h2>{{ guesses[guesses.length - 1]?.correct ? 'Correct!' : 'Game Over!' }}</h2>
      <div class="fighter-display">
        <FighterView :fighter="fighter" />
      </div>
      <button v-if="mode === 'unlimited'" @click="startNewGame" class="play-again">
        Play Again
      </button>
    </div>
  </main>
</template>

<style scoped>
.who-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  color: #333;
}

.game-mode {
  margin: 1rem 0;
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-weight: bold;
  font-size: 1.1rem;
}

.search-form {
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
  max-width: 600px;
}

.search-form button {
  padding: 0.5rem 1.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.search-form button:hover {
  background-color: #45a049;
}

.guesses-left {
  margin: 0.5rem 0;
  font-size: 1.2rem;
  font-weight: bold;
}

.guesses-table {
  width: 100%;
  overflow-x: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

th,
td {
  border: 1px solid #dddddd;
  text-align: center;
  padding: 12px;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
  position: sticky;
  top: 0;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.result-container {
  margin-top: 2rem;
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.result-container > h2 {
  font-size: 2rem;
  color: #333;
}

.fighter-display {
  margin: 1.5rem 0;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.play-again {
  margin-top: 1.5rem;
  padding: 0.75rem 2rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.play-again:hover {
  background-color: #45a049;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
  justify-content: center;
}

.separator {
  height: 2rem;
  width: 1px;
  background-color: #ddd;
}

.mode-toggle {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.mode-toggle:hover {
  background-color: #e0e0e0;
}

.mode-toggle.active {
  background-color: #4caf50;
  color: white;
  border-color: #45a049;
}

.exact {
  background-color: #4caf50;
  color: white;
}

.close {
  background-color: #ffeb3b;
  color: #333;
}

td {
  position: relative;
}

td .indicator {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8em;
}

.daily-status {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.daily-status p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.daily-status p:first-child {
  font-weight: bold;
  color: #4caf50;
}

.header-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.give-up {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.give-up:hover {
  background-color: #d32f2f;
}

.help-icon {
  position: relative;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.help-icon:hover {
  color: #333;
}

.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 300px;
  z-index: 1000;
  display: none;
  margin-top: 0.5rem;
}

.help-icon:hover .tooltip {
  display: block;
}

.tooltip h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.tooltip p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.tooltip ul {
  margin: 0.5rem 0;
  padding-left: 1.2rem;
  color: #666;
  font-size: 0.9rem;
}

.tooltip li {
  margin: 0.3rem 0;
}

.tooltip .exact {
  background-color: #4caf50;
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

.tooltip .close {
  background-color: #ffeb3b;
  color: #333;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
}

/* Add a small triangle pointer to the tooltip */
.tooltip::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.streak-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.streak-info p {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  font-weight: bold;
}
</style>
