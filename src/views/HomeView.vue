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
    <div class="title-container">
      <h1 class="glitch" data-text="FIGHT FACTS">FIGHT FACTS</h1>
      <p class="subtitle">ARE YOU A CASUAL?</p>
    </div>

    <div class="insert-coin">SELECT YOUR MODE</div>

    <div class="game-cards">
      <div class="game-card" @click="navigateToGame('connect')">
        <div class="card-inner">
          <h2>CONNECT<br>THE DOTS</h2>
          <p>LINK FIGHTERS</p>
          <div class="start-btn">START</div>
        </div>
      </div>
      <div class="game-card" @click="navigateToGame('who')">
        <div class="card-inner">
          <h2>WHO'S THAT<br>FIGHTER?</h2>
          <p>WORDLE-STYLE</p>
          <div class="start-btn">START</div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
}

.title-container {
  margin-bottom: 3rem;
  position: relative;
}

h1 {
  font-family: var(--font-display);
  font-size: 5rem;
  color: var(--color-primary);
  text-transform: uppercase;
  text-shadow:
    4px 4px 0px var(--color-accent),
    8px 8px 0px #000;
  margin: 0;
  letter-spacing: -2px;
  transform: skew(-5deg);
}

.subtitle {
  font-family: var(--font-arcade);
  color: var(--color-secondary);
  font-size: 1.2rem;
  margin-top: 1rem;
  text-shadow: 2px 2px 0px #000;
  letter-spacing: 4px;
}

.insert-coin {
  font-family: var(--font-arcade);
  color: #fff;
  font-size: 1rem;
  margin-bottom: 3rem;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.game-cards {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-card {
  background: var(--color-bg-secondary);
  border: 4px solid var(--color-border);
  padding: 4px;
  width: 320px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 8px 8px 0px rgba(0,0,0,0.5);
}

.game-card:hover {
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
  background:
    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
    linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000);
  background-color: #222;
  background-size: 4px 4px;
  background-position: 0 0, 2px 2px;
}

.game-card h2 {
  font-family: var(--font-display);
  color: var(--color-secondary);
  font-size: 2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  line-height: 1;
  text-shadow: 2px 2px 0 #000;
}

.game-card p {
  font-family: var(--font-arcade);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  margin-bottom: 2rem;
}

.start-btn {
  margin-top: auto;
  background: var(--color-primary);
  color: #fff;
  font-family: var(--font-arcade);
  padding: 0.5rem 1.5rem;
  border: 2px solid #fff;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
}

.game-card:hover .start-btn {
  background: var(--color-accent);
  color: #000;
  animation: blink 0.2s infinite;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
    min-height: 100vh;
    justify-content: flex-start;
    padding-top: 4rem;
  }

  h1 {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 0.9rem;
  }

  .game-cards {
    flex-direction: column;
    gap: 2rem;
    width: 100%;
  }

  .game-card {
    width: 100%;
    max-width: 320px;
  }
}
</style>
