<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGame = (mode: 'daily' | 'unlimited') => {
  router.push({ name: 'WhoView', query: { mode } })
}
</script>

<template>
  <main class="game-selector">
    <h1>Select Game Mode</h1>
    <div class="game-modes">
      <div class="game-mode-card" @click="navigateToGame('daily')">
        <h2>Daily Mode</h2>
        <p>Play once per day</p>
        <p>Same fighter for everyone</p>
        <p>New fighter every day</p>
      </div>
      <div class="game-mode-card" @click="navigateToGame('unlimited')">
        <h2>Unlimited Mode</h2>
        <p>Play as much as you want</p>
        <p>New fighter every game</p>
        <p>Practice and improve</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2.5rem;
  color: #333;
}

.game-modes {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-mode-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 300px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.game-mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.game-mode-card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.game-mode-card p {
  color: #666;
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .game-modes {
    flex-direction: column;
  }

  .game-mode-card {
    width: 100%;
  }
}
</style>
