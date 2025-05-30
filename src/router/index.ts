import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConnectView from '../views/ConnectView.vue'
import WhoView from '../views/WhoView.vue'
import GameSelector from '../views/GameSelector.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/connect-the-dots',
      name: 'connect-the-dots',
      component: ConnectView,
    },
    {
      path: '/whos-that-fighter',
      name: 'whos-that-fighter',
      component: WhoView,
      props: (route) => ({ mode: route.query.mode || 'unlimited' }),
    },
    {
      path: '/game-selector',
      name: 'game-selector',
      component: GameSelector,
    },
  ],
})

export default router
