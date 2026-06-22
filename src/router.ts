import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/catalog', name: 'Catalog', component: () => import('@/views/Catalog.vue') },
  { path: '/title/:id', name: 'TitleDetail', component: () => import('@/views/TitleDetail.vue'), props: true },
  { path: '/player/:titleId/:episodeId?', name: 'Player', component: () => import('@/views/Player.vue'), props: true },
  { path: '/schedule', name: 'Schedule', component: () => import('@/views/Schedule.vue') },
  { path: '/library', name: 'Library', component: () => import('@/views/Library.vue') },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue') },
  { path: '/changelog', name: 'Changelog', component: () => import('@/views/Changelog.vue') },
  { path: '/studios', name: 'StudioSearch', component: () => import('@/views/StudioSearch.vue') },
  { path: '/studios/:source/:id', name: 'StudioEpisodes', component: () => import('@/views/StudioEpisodes.vue') },
  { path: '/studios/player/:source/:episodeId', name: 'StudioPlayer', component: () => import('@/views/StudioPlayer.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
