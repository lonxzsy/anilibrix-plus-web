<template>
  <div class="app" :class="themeClass">
    <NavigationRail v-if="!isMobile" @open-auth="showAuth = true" />
    <main class="app-content" :class="{ 'app-content--mobile': isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BottomNav v-if="isMobile" @open-auth="showAuth = true" />
    <AuthModal :visible="showAuth" @close="showAuth = false" />
    <UpdateSnackbar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NavigationRail from '@/components/NavigationRail.vue'
import BottomNav from '@/components/BottomNav.vue'
import AuthModal from '@/components/AuthModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useChangelogStore } from '@/stores/changelog'
import UpdateSnackbar from '@/components/UpdateSnackbar.vue'

const showAuth = ref(false)
const authStore = useAuthStore()
const isMobile = ref(window.innerWidth < 600)
const isDark = ref(localStorage.getItem('anilibrixplus-theme') !== 'light')

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
}

defineExpose({ toggleTheme, isDark })

onMounted(() => {
  authStore.init()
  const changelogStore = useChangelogStore()
  changelogStore.fetchChangelog()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
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
      padding: 16px;
      margin-bottom: 64px;
    }
  }
}

.page-enter-active {
  animation: pageEnter 400ms var(--md-sys-motion-easing-decelerate);
}
.page-leave-active {
  animation: pageLeave 250ms var(--md-sys-motion-easing-accelerate);
}

@keyframes pageEnter {
  from { opacity: 0; transform: translateX(16px) scale(0.985); filter: blur(2px); }
  to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
}
@keyframes pageLeave {
  from { opacity: 1; transform: scale(1); filter: blur(0); }
  to { opacity: 0; transform: scale(0.99); filter: blur(1px); }
}
</style>
