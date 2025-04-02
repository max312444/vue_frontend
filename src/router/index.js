import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Callback from '../views/Callback.vue'
import Main from '../views/Main.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/oauth-callback', component: Callback },
  { path: '/main', component: Main },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
