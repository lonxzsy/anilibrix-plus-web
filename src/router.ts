import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Catalog from '@/views/Catalog.vue'
import TitleDetail from '@/views/TitleDetail.vue'
import Player from '@/views/Player.vue'
import Schedule from '@/views/Schedule.vue'
import Library from '@/views/Library.vue'
import Profile from '@/views/Profile.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/catalog', name: 'Catalog', component: Catalog },
  { path: '/title/:id', name: 'TitleDetail', component: TitleDetail, props: true },
  { path: '/player/:titleId/:episodeId?', name: 'Player', component: Player, props: true },
  { path: '/player/local/:filePath', name: 'LocalPlayer', component: Player, props: true },
  { path: '/schedule', name: 'Schedule', component: Schedule },
  { path: '/library', name: 'Library', component: Library },
  { path: '/profile', name: 'Profile', component: Profile },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
