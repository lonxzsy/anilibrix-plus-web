<template>
  <div class="app" :class="themeClass">
    <NavigationRail v-if="!isMobile" @open-auth="showAuth = true" />
    <main ref="mainRef" class="app-content" :class="{ 'app-content--mobile': isMobile }">
      <router-view v-slot="{ Component, route: r }">
        <transition
          :css="false"
          mode="out-in"
          @before-enter="onBeforeEnter"
          @enter="onEnter"
          @after-enter="onAfterEnter"
          @before-leave="onBeforeLeave"
          @leave="onLeave"
          @after-leave="onAfterLeave"
        >
          <component :is="Component" :key="r.path" />
        </transition>
      </router-view>
    </main>
    <BottomNav v-if="isMobile" @open-auth="showAuth = true" />
    <AuthModal :visible="showAuth" @close="showAuth = false" />
    <UpdateSnackbar />
    <ToastContainer />
    <ShortcutsModal :visible="showShortcuts" @close="showShortcuts = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import NavigationRail from '@/components/NavigationRail.vue'
import BottomNav from '@/components/BottomNav.vue'
import AuthModal from '@/components/AuthModal.vue'
import UpdateSnackbar from '@/components/UpdateSnackbar.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import ShortcutsModal from '@/components/ShortcutsModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useChangelogStore } from '@/stores/changelog'
import { gsap } from 'gsap'

const router = useRouter()

const showAuth = ref(false)
const showShortcuts = ref(false)
const authStore = useAuthStore()
const mainRef = ref<HTMLElement | null>(null)
const isMobile = ref(window.innerWidth < 600)
const isDark = ref(localStorage.getItem('anilibrixplus-theme') !== 'light')
let navigationHistory: string[] = []
let isBackward = false

function checkMobile() {
  isMobile.value = window.innerWidth < 600
}

const themeClass = computed(() => ({
  'md3-dark': isDark.value,
  'md3-light': !isDark.value,
}))

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('anilibrixplus-theme', isDark.value ? 'dark' : 'light')
  document.documentElement.style.setProperty('--transition-flash', '0.3s')
  setTimeout(() => document.documentElement.style.removeProperty('--transition-flash'), 300)
}

defineExpose({ toggleTheme, isDark })

let enterTween: gsap.core.Tween | null = null
let leaveTween: gsap.core.Tween | null = null

function onBeforeEnter(el: Element) {
  gsap.set(el, { opacity: 0 })
}

function onEnter(el: Element, done: () => void) {
  if (isBackward) {
    enterTween = gsap.to(el, {
      opacity: 1, x: 0,
      duration: 0.3, ease: 'power2.out',
      clearProps: 'opacity,transform',
      onComplete: done,
    })
  } else {
    enterTween = gsap.to(el, {
      opacity: 1, x: 0, scale: 1,
      duration: 0.4, ease: 'power2.out',
      clearProps: 'opacity,transform',
      onComplete: done,
    })
  }
}

function onAfterEnter() {
  enterTween = null
  isBackward = false
}

function onBeforeLeave(el: Element) {
  gsap.set(el, { opacity: 1 })
}

function onLeave(el: Element, done: () => void) {
  if (isBackward) {
    leaveTween = gsap.to(el, {
      opacity: 0, x: 20,
      duration: 0.2, ease: 'power2.in',
      onComplete: done,
    })
  } else {
    leaveTween = gsap.to(el, {
      opacity: 0, scale: 0.99,
      duration: 0.2, ease: 'power2.in',
      onComplete: done,
    })
  }
}

function onAfterLeave() {
  leaveTween = null
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
    showShortcuts.value = !showShortcuts.value
  }
  if (e.key === 'Escape') {
    showShortcuts.value = false
  }
}

router.beforeEach((to, from) => {
  if (from.path && to.path !== from.path) {
    const fromDepth = from.path.split('/').length
    const toDepth = to.path.split('/').length
    isBackward = toDepth < fromDepth || (toDepth === fromDepth && navigationHistory.length > 0 && navigationHistory[navigationHistory.length - 1] === from.path)
    navigationHistory.push(from.path)
    if (navigationHistory.length > 20) navigationHistory.shift()
  }
})

onMounted(() => {
  authStore.init()
  const changelogStore = useChangelogStore()
  changelogStore.fetchChangelog()
  window.addEventListener('resize', checkMobile)
  document.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.app {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: var(--md-sys-color-background);
  color: var(--md-sys-color-on-background);
  overflow: hidden;

  &-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 28px 36px;

    &--mobile {
      padding: 12px 12px 80px;
    }
  }
}
</style>
