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

const getFighterOpponents = async (fighter: Fighter) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/connect/get-opponents?firstName=${encodeURIComponent(
        fighter.first_name,
      )}&lastName=${encodeURIComponent(fighter.last_name)}`,
    )
    if (!response.ok) {
      throw new Error('Failed to fetch opponents')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching opponents:', error)
    return []
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
  input.value = ''
}

onMounted(async () => {
  await getRandomFighterPair()
})
</script>

<template>
  <main class="connect-view">
    <header class="page-header">
      <h1>Connect The Dots</h1>
      <div class="separator"></div>
      <button class="new-game" @click="startNewGame">New Game</button>
    </header>

    <div class="game-container">
      <div class="fighters">
        <div class="fighter-card">
          <h2>Start</h2>
          <FighterView v-if="startFighter" :fighter="startFighter" />
        </div>
        <div class="path">
          <div v-for="(fighter, index) in path" :key="index" class="path-item">
            <FighterView :fighter="fighter" />
            <ArrowRight v-if="index < path.length - 1" :size="24" />
          </div>
        </div>
        <div class="fighter-card">
          <h2>Target</h2>
          <FighterView v-if="targetFighter" :fighter="targetFighter" />
        </div>
      </div>

      <div v-if="!gameOver" class="search-container">
        <h3>
          Find someone {{ currentFighter?.first_name }} {{ currentFighter?.last_name }} has fought
        </h3>
        <SearchBar @suggestion-selected="handleSuggestionSelect" />
      </div>

      <div v-if="gameOver" class="result-container">
        <h2>You Win!</h2>
        <p>You connected the fighters in {{ path.length - 1 }} steps!</p>
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
  max-width: 1200px;
  margin: 0 auto;
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

.new-game {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.new-game:hover {
  background-color: #45a049;
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
  justify-content: space-between;
  width: 100%;
  gap: 2rem;
}

.fighter-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
}

.path {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  overflow-x: auto;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.result-container {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
}

.result-container h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2.5rem;
  color: #333;
}

h2 {
  font-size: 1.5rem;
  color: #2c3e50;
}

h3 {
  font-size: 1.2rem;
  color: #2c3e50;
  text-align: center;
}
</style>
