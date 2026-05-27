import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.scss'

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
