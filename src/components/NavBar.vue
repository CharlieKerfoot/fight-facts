<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToRoute = (route: string) => {
  if (route === 'connect') {
    router.push({ name: 'connect-the-dots' })
  } else if (route === 'who') {
    router.push({ name: 'game-selector', query: { game: 'who' } })
  }
}

const navigateHome = () => {
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="navbar">
    <div class="nav-content">
      <div class="nav-logo" @click="navigateHome">Fight Facts</div>
      <div class="nav-links">
        <button @click="navigateToRoute('connect')" class="nav-link">Connect The Dots</button>
        <button @click="navigateToRoute('who')" class="nav-link">Who's That Fighter</button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: var(--color-bg-secondary);
  padding: 1rem 2rem;
  border-bottom: 4px solid var(--color-border);
  box-shadow: 0 4px 0 rgba(0,0,0,0.5);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  color: var(--color-primary);
  font-family: var(--font-arcade);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  text-shadow: 2px 2px 0px #fff;
  transition: transform 0.1s;
}

.nav-logo:hover {
  transform: scale(1.05);
  color: var(--color-accent);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: var(--font-arcade);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  text-transform: uppercase;
  transition: all 0.1s;
  position: relative;
}

.nav-link:hover {
  color: var(--color-secondary);
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
  transform: translateX(-2px);
}

.nav-link::before {
  content: '>';
  position: absolute;
  left: 0;
  opacity: 0;
  color: var(--color-primary);
  transition: opacity 0.1s;
}

.nav-link:hover::before {
  opacity: 1;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
