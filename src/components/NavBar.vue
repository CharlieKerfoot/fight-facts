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
  background-color: #1a1a1a;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-logo:hover {
  color: #ff6b6b;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #ff6b6b;
  transition: all 0.2s;
  transform: translateX(-50%);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.router-link-active {
  color: #ff6b6b;
}

.nav-link.router-link-active::after {
  width: 100%;
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

  .nav-link {
    padding: 0.5rem;
  }
}
</style>
