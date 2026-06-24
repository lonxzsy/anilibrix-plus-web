import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.scss'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(ScrollTrigger, Flip, CustomEase)

CustomEase.create('md3-spring', 'M0,0 C0.34,1.56 0.64,1 1,1')
CustomEase.create('md3-standard', 'M0,0 C0.4,0 0.2,1 1,1')
CustomEase.create('md3-decelerate', 'M0,0 C0,0 0.2,1 1,1')

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Dismiss splash screen after animation completes
setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) splash.classList.add('splash--done')
}, 5000)

setTimeout(() => {
  const splash = document.getElementById('splash')
  if (splash) splash.remove()
}, 6200)
