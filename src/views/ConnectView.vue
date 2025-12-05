<script setup lang="ts">
import FighterView from '@/components/FighterView.vue'
import SearchBar from '@/components/SearchBar.vue'
import type { Fighter } from '../../shared/types.ts'
import { ref, onMounted } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

const startFighter = ref<Fighter | null>(null)
const targetFighter = ref<Fighter | null>(null)
const currentFighter = ref<Fighter | null>(null)
const path = ref<Fighter[]>([])
const shortestPath = ref<Fighter[]>([])
const gameOver = ref(false)
const input = ref('')

const getRandomFighterPair = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/connect/random-pair')
    if (!response.ok) {
      throw new Error('Failed to fetch fighter pair')
    }
    const [fighter1, fighter2] = await response.json()
    startFighter.value = {
      ...fighter1,
      birth_day: new Date(fighter1.birth_day),
    }
    targetFighter.value = {
      ...fighter2,
      birth_day: new Date(fighter2.birth_day),
    }
    currentFighter.value = startFighter.value
    path.value = [startFighter.value]
  } catch (error) {
    console.error('Error loading fighter pair:', error)
  }
}

const checkFight = async (fighter1: Fighter, fighter2: Fighter) => {
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

const handleSuggestionSelect = async (selectedFighter: { firstName: string; lastName: string }) => {
  if (!currentFighter.value) return

  try {
    const response = await fetch(
      `http://localhost:3000/api/fighter?firstName=${encodeURIComponent(
        selectedFighter.firstName,
      )}&lastName=${encodeURIComponent(selectedFighter.lastName)}`,
    )
    if (!response.ok) {
      console.error('Error fetching fighter data')
      return
    }

    const fighterData = await response.json()
    const newFighter: Fighter = {
      ...fighterData,
      birth_day: new Date(fighterData.birth_day),
    }

    const fought = await checkFight(currentFighter.value, newFighter)
    if (!fought) {
      alert('These fighters have never fought each other!')
      return
    }

    path.value.push(newFighter)
    currentFighter.value = newFighter

    if (
      newFighter.first_name === targetFighter.value?.first_name &&
      newFighter.last_name === targetFighter.value?.last_name
    ) {
      gameOver.value = true
      fetchShortestPath()
    }

    input.value = ''
  } catch (error) {
    console.error('Error making guess:', error)
  }
}

const startNewGame = async () => {
  await getRandomFighterPair()
  gameOver.value = false
  path.value = []
  shortestPath.value = []
  input.value = ''
}

const fetchShortestPath = async () => {
  if (!startFighter.value || !targetFighter.value) return

  try {
    const startName = `${startFighter.value.first_name} ${startFighter.value.last_name}`
    const endName = `${targetFighter.value.first_name} ${targetFighter.value.last_name}`

    const res = await fetch(`http://localhost:3000/api/connect/shortest-path?start=${encodeURIComponent(startName)}&end=${encodeURIComponent(endName)}`)
    if (!res.ok) throw new Error('Failed to fetch shortest path')

    shortestPath.value = await res.json()
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  await getRandomFighterPair()
})
</script>

<template>
  <main class="connect-view">
    <header class="page-header">
      <h1>CONNECT THE DOTS</h1>
      <button class="new-game btn-arcade" @click="startNewGame">NEW ROUND</button>
    </header>

    <div class="game-container">
      <div class="fighters">
        <div class="fighter-column">
          <h2 class="player-label">PLAYER 1</h2>
          <div class="fighter-card-wrapper">
            <FighterView v-if="startFighter" :fighter="startFighter" />
          </div>
        </div>

        <div class="path-container">
          <div class="path">
            <div v-for="(fighter, index) in path" :key="index" class="path-item">
              <div v-if="index > 0" class="vs-badge">VS</div>
              <FighterView :fighter="fighter" />
            </div>
          </div>
        </div>

        <div class="fighter-column">
          <h2 class="player-label">TARGET</h2>
          <div class="fighter-card-wrapper">
            <FighterView v-if="targetFighter" :fighter="targetFighter" />
          </div>
        </div>
      </div>

      <div v-if="!gameOver" class="search-container">
        <h3 class="instruction-text">
          FIND OPPONENT FOR <span class="highlight">{{ currentFighter?.first_name }} {{ currentFighter?.last_name }}</span>
        </h3>
        <SearchBar @suggestion-selected="handleSuggestionSelect" />
      </div>

      <div v-if="gameOver" class="result-container">
        <h2 class="win-text">K.O.!</h2>
        <p class="win-subtext">PATH COMPLETED IN {{ path.length - 1 }} ROUNDS</p>

        <div v-if="shortestPath.length > 0" class="shortest-path-section">
          <h3>OPTIMAL PATH ({{ shortestPath.length - 1 }} ROUNDS)</h3>
          <div class="path-container">
            <div class="path">
              <div v-for="(fighter, index) in shortestPath" :key="index" class="path-item">
                <div v-if="index > 0" class="vs-badge">VS</div>
                <FighterView :fighter="fighter" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.connect-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  width: 100%;
}

h1 {
  font-family: var(--font-display);
  font-size: 3rem;
  color: var(--color-primary);
  text-transform: uppercase;
  text-shadow: 4px 4px 0 #000;
  margin: 0;
}

.game-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.fighters {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 2rem;
  margin-bottom: 2rem;
  padding-bottom: 20px;
}

.fighter-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 250px;
}

.player-label {
  font-family: var(--font-arcade);
  color: var(--color-secondary);
  margin-bottom: 1rem;
  font-size: 1rem;
  text-shadow: 2px 2px 0 #000;
}

.fighter-card-wrapper {
  width: 100%;
}

.path-container {
  flex: 1;
  display: flex;
  overflow-x: scroll;
  padding: 0 1rem;
}

.path {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
  flex-shrink: 0;
}

.vs-badge {
  font-family: var(--font-display);
  color: var(--color-accent);
  font-size: 2rem;
  font-style: italic;
  text-shadow: 2px 2px 0 #000;
  margin: 0 10px;
}

.search-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: rgba(0,0,0,0.5);
  padding: 2rem;
  border: 4px solid var(--color-border);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
}

.instruction-text {
  font-family: var(--font-arcade);
  color: #fff;
  font-size: 0.8rem;
  text-align: center;
  line-height: 1.5;
}

.highlight {
  color: var(--color-primary);
  text-transform: uppercase;
}

.result-container {
  text-align: center;
  padding: 3rem;
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-accent);
  box-shadow: 0 0 20px var(--color-accent);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 20px var(--color-accent); }
  50% { box-shadow: 0 0 40px var(--color-accent); }
  100% { box-shadow: 0 0 20px var(--color-accent); }
}

.win-text {
  font-family: var(--font-display);
  font-size: 5rem;
  color: var(--color-accent);
  text-shadow: 4px 4px 0 #000;
  margin: 0;
  transform: rotate(-5deg);
}

.win-subtext {
  font-family: var(--font-arcade);
  color: #fff;
  margin-top: 1rem;
}

.shortest-path-section {
  margin-top: 3rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shortest-path-section h3 {
  font-family: var(--font-arcade);
  color: var(--color-secondary);
  margin-bottom: 1rem;
}

/* Scrollbar */
.fighters::-webkit-scrollbar {
  height: 10px;
}

.fighters::-webkit-scrollbar-track {
  background: #000;
}

.fighters::-webkit-scrollbar-thumb {
  background: var(--color-primary);
  border: 2px solid #000;
}

@media (max-width: 768px) {
  .connect-view {
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    text-align: center;
  }

  .fighters {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .fighter-column {
    width: 100%;
    min-width: auto;
  }

  .path-container {
    width: 100%;
    margin: 1rem 0;
  }

  .path-item {
    min-width: 200px;
  }

  .search-container {
    padding: 1rem;
  }
}
</style>
