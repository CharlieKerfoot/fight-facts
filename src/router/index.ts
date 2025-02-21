import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ConnectView from '../views/ConnectView.vue'
import GuessView from '../views/GuessView.vue'
import WhoView from '../views/WhoView.vue'
import TempView from '../views/TempView.vue'

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
      component: ConnectView
    },
    {
      path: '/guess-the-odds',
      name: 'guess-the-odds',
      component: GuessView
    },
    {
      path: '/whos-that-fighter',
      name: 'whos-that-fighter',
      component: WhoView
    },
    {
      path: '/temp',
      name: 'temp',
      component: TempView
    },
  ],
})

export default router
