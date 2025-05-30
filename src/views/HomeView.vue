<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGame = (game: string) => {
  if (game === 'connect') {
    router.push({ name: 'connect-the-dots' })
  } else if (game === 'who') {
    router.push({ name: 'game-selector', query: { game: 'who' } })
  }
}
</script>

<template>
  <main class="home">
    <h1>Fight Facts</h1>
    <div class="game-cards">
      <div class="game-card" @click="navigateToGame('connect')">
        <h2>Connect The Dots</h2>
        <p>Connect the dots between two fighters</p>
      </div>
      <div class="game-card" @click="navigateToGame('who')">
        <h2>Who's That Fighter?</h2>
        <p>Guess the UFC fighter based on their stats</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home {
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

.game-cards {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-card {
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

.game-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.game-card h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.game-card p {
  color: #666;
  margin: 0.5rem 0;
}

@media (max-width: 768px) {
  .game-cards {
    flex-direction: column;
  }

  .game-card {
    width: 100%;
  }
}
</style>
