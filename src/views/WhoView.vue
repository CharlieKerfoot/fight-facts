<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FighterView from '@/components/FighterView.vue'
import SearchBar from '@/components/SearchBar.vue'
import { Check, X, HelpCircle, Trophy, Flame } from 'lucide-vue-next'
import type { Fighter } from '../../shared/types'

const route = useRoute()
const router = useRouter()
const mode = ref(route.query.mode || 'unlimited')

const fighter = ref<Fighter | null>(null)
const guesses = ref<any[]>([])
const startingGuesses = 6
const guessCount = ref(startingGuesses)
const gameOver = ref(false)
const id = ref(0)

const getDailyStreak = () => {
  const saved = localStorage.getItem('dailyStreak')
  return saved ? JSON.parse(saved) : { current: 0, longest: 0 }
}

const updateDailyStreak = (won: boolean) => {
  const { current, longest } = getDailyStreak()
  const today = new Date().toISOString().split('T')[0]
  const lastPlayed = localStorage.getItem('lastPlayedDate')

  if (lastPlayed === today) return

  const newCurrent = won ? current + 1 : 0
  const newLongest = Math.max(longest, newCurrent)

  localStorage.setItem('dailyStreak', JSON.stringify({ current: newCurrent, longest: newLongest }))
  localStorage.setItem('lastPlayedDate', today)
}

const getUnlimitedStreak = () => {
  const saved = localStorage.getItem('unlimitedStreak')
  return saved ? JSON.parse(saved) : { current: 0, longest: 0 }
}

const updateUnlimitedStreak = (won: boolean) => {
  const { current, longest } = getUnlimitedStreak()
  const newCurrent = won ? current + 1 : 0
  const newLongest = Math.max(longest, newCurrent)
  localStorage.setItem('unlimitedStreak', JSON.stringify({ current: newCurrent, longest: newLongest }))
}

const getRandomFighter = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/random-fighter')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return { ...data, birth_day: new Date(data.birth_day) }
  } catch (e) {
    console.error(e)
  }
}

const getDailyFighter = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/daily-fighter')
    if (!res.ok) throw new Error('Failed to fetch')
    const data = await res.json()
    return { ...data, birth_day: new Date(data.birth_day) }
  } catch (e) {
    console.error(e)
  }
}

const checkFight = async (f1: Fighter, f2: Fighter) => {
  try {
    const res = await fetch(`http://localhost:3000/api/connect/check-fight?fighter1FirstName=${f1.first_name}&fighter1LastName=${f1.last_name}&fighter2FirstName=${f2.first_name}&fighter2LastName=${f2.last_name}`)
    const data = await res.json()
    return data.fought
  } catch (e) {
    return false
  }
}

const startNewGame = async () => {
  if (mode.value === 'daily') {
    const saved = localStorage.getItem('dailyGameState')
    if (saved) {
      const state = JSON.parse(saved)
      if (state.date === new Date().toISOString().split('T')[0]) {
        fighter.value = { ...state.fighter, birth_day: new Date(state.fighter.birth_day) }
        guesses.value = state.guesses.map((g: any) => ({
          ...g,
          fighter: { ...g.fighter, birth_day: new Date(g.fighter.birth_day) }
        }))
        gameOver.value = true
        guessCount.value = 0
        return
      }
    }
    fighter.value = await getDailyFighter()
  } else {
    fighter.value = await getRandomFighter()
  }

  if (mode.value === 'unlimited') {
    guesses.value = []
    guessCount.value = startingGuesses
    gameOver.value = false
    id.value = 0
  }
}

const handleSuggestionSelect = async (selected: { firstName: string, lastName: string }) => {
  if (gameOver.value || !fighter.value) return

  try {
    const res = await fetch(`http://localhost:3000/api/fighter?firstName=${selected.firstName}&lastName=${selected.lastName}`)
    const data = await res.json()
    const guessedFighter = { ...data, birth_day: new Date(data.birth_day) }

    const isCorrect = guessedFighter.first_name === fighter.value.first_name && guessedFighter.last_name === fighter.value.last_name
    const hasFought = await checkFight(guessedFighter, fighter.value)

    guesses.value.push({
      id: id.value++,
      correct: isCorrect,
      fighter: guessedFighter,
      hasFought
    })

    guessCount.value--

    if (isCorrect) {
      gameOver.value = true
      if (mode.value === 'daily') updateDailyStreak(true)
      else updateUnlimitedStreak(true)
    } else if (guessCount.value === 0) {
      gameOver.value = true
      if (mode.value === 'daily') updateDailyStreak(false)
      else updateUnlimitedStreak(false)
    }

    if (mode.value === 'daily') {
      localStorage.setItem('dailyGameState', JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        guesses: guesses.value,
        fighter: fighter.value
      }))
    }
  } catch (e) {
    console.error(e)
  }
}

const giveUp = () => {
  if (!fighter.value) return
  gameOver.value = true
  guessCount.value = 0
  if (mode.value === 'daily') updateDailyStreak(false)
  else updateUnlimitedStreak(false)
}

const toggleMode = () => {
  const newMode = mode.value === 'daily' ? 'unlimited' : 'daily'
  mode.value = newMode
  router.push({ query: { mode: newMode } })
  startNewGame()
}

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

onMounted(() => {
  startNewGame()
})

watch(() => route.query.mode, (newMode) => {
  if (newMode) mode.value = newMode as string
})

watch(gameOver, (isOver) => {
  if (isOver) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <main class="who-view">
    <header class="page-header">
      <h1>WHO'S THAT FIGHTER?</h1>
      <div class="header-info">
        <div class="stats-bar">
          <div class="streak-info">
            <span class="label">STREAK:</span>
            <span class="value">{{ mode === 'daily' ? getDailyStreak().current : getUnlimitedStreak().current }}</span>
          </div>
          <div class="guesses-left" v-if="!gameOver">
            <span class="label">CREDITS:</span>
            <span class="value">{{ guessCount }}</span>
          </div>
        </div>
        <div class="mode-controls">
          <button @click="toggleMode" class="btn-arcade mode-btn">
            {{ mode === 'daily' ? 'FREE PLAY' : 'DAILY MODE' }}
          </button>
          <div class="info-icon-container">
            <HelpCircle class="info-icon" />
            <div class="info-tooltip">
              <p>Rules:</p>
              <ul>
                <li><span class="text-success">Green</span> = Correct Match</li>
                <li><span class="text-warning">Yellow</span> = Close</li>
                <li>↑ = Higher</li>
                <li>↓ = Lower</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="game-area">
      <div v-if="!gameOver" class="search-section">
        <SearchBar @suggestion-selected="handleSuggestionSelect" />
        <button @click="giveUp" class="btn-arcade btn-danger">GIVE UP</button>
      </div>

      <div class="guesses-container">
        <table class="guesses-table">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>AGE</th>
              <th>WEIGHT</th>
              <th>WINS</th>
              <th>LOSS</th>
              <th>STANCE</th>
              <th>HEIGHT</th>
              <th>REACH</th>
              <th>FOUGHT?</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in guesses" :key="g.id">
              <td>{{ i + 1 }}</td>
              <td :class="{ 'text-success': g.correct }">
                {{ g.fighter.first_name }} {{ g.fighter.last_name }}
              </td>
              <td :class="getStatComparison(g.fighter.birth_day, fighter?.birth_day, 'age').class">
                {{ new Date().getFullYear() - new Date(g.fighter.birth_day).getFullYear() }}
                {{ getStatComparison(g.fighter.birth_day, fighter?.birth_day, 'age').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.weight, fighter?.weight, 'weight').class">
                {{ g.fighter.weight }}
                {{ getStatComparison(g.fighter.weight, fighter?.weight, 'weight').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.record.wins, fighter?.record.wins, 'wins').class">
                {{ g.fighter.record.wins }}
                {{ getStatComparison(g.fighter.record.wins, fighter?.record.wins, 'wins').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.record.losses, fighter?.record.losses, 'losses').class">
                {{ g.fighter.record.losses }}
                {{ getStatComparison(g.fighter.record.losses, fighter?.record.losses, 'losses').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.stance, fighter?.stance, 'stance').class">
                {{ g.fighter.stance }}
                {{ getStatComparison(g.fighter.stance, fighter?.stance, 'stance').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.height, fighter?.height, 'height').class">
                {{ g.fighter.height }}
                {{ getStatComparison(g.fighter.height, fighter?.height, 'height').indicator }}
              </td>
              <td :class="getStatComparison(g.fighter.reach, fighter?.reach, 'reach').class">
                {{ g.fighter.reach }}
                {{ getStatComparison(g.fighter.reach, fighter?.reach, 'reach').indicator }}
              </td>
              <td :class="g.hasFought ? 'exact' : ''">{{ g.hasFought ? 'YES' : 'NO' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="gameOver && fighter" class="result-overlay">
        <div class="result-content">
          <h2 class="win-text">{{ guesses[guesses.length - 1]?.correct ? 'YOU WIN!' : 'GAME OVER' }}</h2>
          <FighterView :fighter="fighter" />
          <button @click="startNewGame" class="btn-arcade" v-if="mode === 'unlimited'">PLAY AGAIN</button>
          <div v-else class="daily-controls">
            <button @click="router.push('/')" class="btn-arcade mode-btn">BACK TO HOME</button>
            <button @click="toggleMode" class="btn-arcade mode-btn">PLAY UNLIMITED</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.who-view {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  width: 100%;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.header-info {
  display: flex;
  width: 80%;
  justify-content: center;
  gap: 2rem;
}

h1 {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--color-primary);
  text-transform: uppercase;
  text-shadow: 4px 4px 0 #000;
  margin: 0;
}

.mode-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  cursor: help;
}

.info-icon {
  width: 24px;
  height: 24px;
  color: var(--color-secondary);
}

.info-tooltip {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid var(--color-border);
  padding: 1rem;
  width: 200px;
  z-index: 100;
  margin-top: 10px;
  text-align: left;
}

.info-icon-container:hover .info-tooltip {
  display: block;
}

.info-tooltip ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-tooltip li {
  color: #fff;
  font-family: var(--font-arcade);
  font-size: 0.8rem;
  line-height: 1.4;
  margin-bottom: 0.25rem;
}

.stats-bar {
  display: flex;
  gap: 2rem;
  background: #000;
  padding: 10px 20px;
  border: 2px solid var(--color-border);
}

.stats-bar > div {
  display: flex;
  align-items: center;
}

.label {
  color: var(--color-secondary);
  font-family: var(--font-arcade);
  margin-right: 10px;
}

.value {
  color: #fff;
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.game-area {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.search-section {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  padding: 0 3rem;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-danger {
  background: #ff0000;
  border-color: #ff0000;
}

.guesses-container {
  width: 100%;
  overflow-x: auto;
  background: rgba(0,0,0,0.8);
  border: 4px solid var(--color-border);
  padding: 1rem;
}

.guesses-table {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
  font-family: var(--font-arcade);
  font-size: 0.8rem;
}

th {
  color: var(--color-secondary);
  padding: 10px;
  border-bottom: 2px solid var(--color-border);
  text-align: left;
}

td {
  padding: 10px;
  border-bottom: 1px solid #333;
}

.exact { color: #00ff00; }
.close { color: #ffff00; }
.text-success { color: #00ff00; }
.text-warning { color: #ffff00; }

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.win-text {
  font-family: var(--font-display);
  font-size: 4rem;
  color: var(--color-accent);
  text-shadow: 4px 4px 0 #000;
  animation: blink 1s infinite;
}

.daily-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .who-view {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
  }

  .header-info {
    flex-direction: column;
    width: 100%;
    align-items: center;
    gap: 1rem;
  }

  .stats-bar {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .search-section {
    padding: 0 1rem;
  }

  .guesses-container {
    padding: 0.5rem;
  }

  .guesses-table {
    font-size: 0.7rem;
  }

  th, td {
    padding: 5px;
  }
}
</style>
