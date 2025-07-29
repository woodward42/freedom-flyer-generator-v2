import { createRouter, createWebHistory } from 'vue-router'
import FlyerGenerator from '../views/FlyerGenerator.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FlyerGenerator
    }
  ],
})

export default router
