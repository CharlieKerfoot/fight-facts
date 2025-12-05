<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGame = (mode: 'daily' | 'unlimited') => {
  router.push({ name: 'whos-that-fighter', query: { mode } })
}
</script>

<template>
  <main class="game-selector">
    <h1 class="glitch" data-text="SELECT MODE">SELECT MODE</h1>
    <div class="game-modes">
      <div class="game-mode-card daily" @click="navigateToGame('daily')">
        <div class="card-inner">
          <h2>DAILY<br>CHALLENGE</h2>
          <div class="mode-details">
            <p>ONE FIGHT PER DAY</p>
            <p>GLOBAL LEADERBOARD</p>
          </div>
          <div class="select-btn">INSERT COIN</div>
        </div>
      </div>
      <div class="game-mode-card unlimited" @click="navigateToGame('unlimited')">
        <div class="card-inner">
          <h2>FREE<br>PLAY</h2>
          <div class="mode-details">
            <p>UNLIMITED FIGHTS</p>
            <p>PRACTICE MODE</p>
          </div>
          <div class="select-btn">FREE PLAY</div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.game-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-family: var(--font-display);
  font-size: 4rem;
  color: #fff;
  text-transform: uppercase;
  text-shadow: 4px 4px 0 var(--color-primary);
  margin-bottom: 3rem;
  letter-spacing: 2px;
}

.game-modes {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-mode-card {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border);
  padding: 4px;
  width: 320px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 8px 8px 0 rgba(0,0,0,0.5);
}

.game-mode-card:hover {
  transform: scale(1.05);
  border-color: var(--color-accent);
}

.card-inner {
  border: 2px solid var(--color-border);
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #222;
  background-image: radial-gradient(#333 15%, transparent 16%), radial-gradient(#333 15%, transparent 16%);
  background-size: 10px 10px;
  background-position: 0 0, 5px 5px;
}

.game-mode-card h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  line-height: 1;
  text-shadow: 2px 2px 0 #000;
}

.daily h2 { color: var(--color-primary); }
.unlimited h2 { color: var(--color-secondary); }

.mode-details p {
  font-family: var(--font-arcade);
  color: var(--color-text);
  font-size: 0.8rem;
  margin: 0.5rem 0;
  text-transform: uppercase;
}

.select-btn {
  margin-top: 2rem;
  background: transparent;
  color: #fff;
  font-family: var(--font-arcade);
  padding: 0.5rem 1rem;
  border: 2px solid #fff;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.game-mode-card:hover .select-btn {
  background: #fff;
  color: #000;
  animation: none;
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
