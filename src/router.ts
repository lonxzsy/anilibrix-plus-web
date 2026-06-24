import { createRouter, createWebHashHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    transition?: string
    backwardTransition?: string
  }
}

const routes = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue'), meta: { transition: 'page-home' } },
  { path: '/catalog', name: 'Catalog', component: () => import('@/views/Catalog.vue'), meta: { transition: 'page-slide' } },
  { path: '/title/:id', name: 'TitleDetail', component: () => import('@/views/TitleDetail.vue'), props: true, meta: { transition: 'page-zoom' } },
  { path: '/player/:titleId/:episodeId?', name: 'Player', component: () => import('@/views/Player.vue'), props: true, meta: { transition: 'page-fade' } },
  { path: '/schedule', name: 'Schedule', component: () => import('@/views/Schedule.vue'), meta: { transition: 'page-slide' } },
  { path: '/library', name: 'Library', component: () => import('@/views/Library.vue'), meta: { transition: 'page-slide' } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/Profile.vue'), meta: { transition: 'page-fade' } },
  { path: '/changelog', name: 'Changelog', component: () => import('@/views/Changelog.vue'), meta: { transition: 'page-fade' } },
  { path: '/studios', name: 'StudioSearch', component: () => import('@/views/StudioSearch.vue'), meta: { transition: 'page-slide' } },
  { path: '/studios/:source/:id', name: 'StudioEpisodes', component: () => import('@/views/StudioEpisodes.vue'), meta: { transition: 'page-slide' } },
  { path: '/studios/player/:source/:episodeId', name: 'StudioPlayer', component: () => import('@/views/StudioPlayer.vue'), meta: { transition: 'page-fade' } },
  { path: '/trending', name: 'Trending', component: () => import('@/views/Trending.vue'), meta: { transition: 'page-slide' } },
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
