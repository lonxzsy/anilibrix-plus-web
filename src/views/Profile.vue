<template>
  <div class="profile">
    <div v-if="authStore.user" class="profile__card glass">
      <div class="profile__avatar-wrap">
        <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="profile__avatar" alt="" />
        <div v-else class="profile__avatar-fallback">{{ authStore.user.name.charAt(0).toUpperCase() }}</div>
      </div>
      <h2 class="md3-headline-small">{{ authStore.user.name }}</h2>
      <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
        @{{ authStore.user.login }}
      </p>

      <div class="profile__stats">
        <div class="profile__stat">
          <span ref="favCountRef" class="md3-title-medium">0</span>
          <span class="md3-body-small">В избранном</span>
        </div>
        <div class="profile__stat">
          <span ref="histCountRef" class="md3-title-medium">0</span>
          <span class="md3-body-small">В истории</span>
        </div>
      </div>

      <div class="profile__theme-toggle">
        <span class="md3-body-medium">Тема оформления</span>
        <button class="profile__theme-btn" @click="toggleTheme">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <span class="md3-label-large">{{ isDark ? 'Тёмная' : 'Светлая' }}</span>
        </button>
      </div>

      <div class="profile__links">
        <router-link to="/trending" class="profile__link md3-label-large">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          Популярное
        </router-link>
        <router-link to="/changelog" class="profile__link md3-label-large">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          Что нового
        </router-link>
      </div>

      <button class="profile__logout" @click="handleLogout">
        <span class="md3-label-large">Выйти</span>
      </button>
    </div>

    <div v-else class="profile__empty glass">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--md-sys-color-on-surface-variant)">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" />
      </svg>
      <h3 class="md3-title-medium">Войдите в аккаунт</h3>
      <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
        Чтобы синхронизировать избранное и историю между устройствами
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLibraryStore } from '@/stores/library'
import { useGsap } from '@/composables/useGsap'

const router = useRouter()
const authStore = useAuthStore()
const libraryStore = useLibraryStore()
const { animateCount } = useGsap()

const favCountRef = ref<HTMLElement | null>(null)
const histCountRef = ref<HTMLElement | null>(null)

const isDark = ref(localStorage.getItem('anilibrixplus-theme') !== 'light')

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('anilibrixplus-theme', isDark.value ? 'dark' : 'light')
  window.location.reload()
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await libraryStore.loadFavorites()
  await libraryStore.loadHistory()
  nextTick(() => {
    if (favCountRef.value) {
      animateCount(favCountRef.value, 0, libraryStore.favorites.length, { duration: 1.5 })
    }
    if (histCountRef.value) {
      animateCount(histCountRef.value, 0, libraryStore.history.length, { duration: 1.8 })
    }
  })
})
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  justify-content: center;
  padding-top: 32px;

  &__card {
    width: 380px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 32px;
    border-radius: var(--md-sys-shape-corner-medium);
  }

  &__avatar-wrap { width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 2px solid var(--md-sys-color-primary); box-shadow: 0 0 16px rgba(184,165,232,0.25); }
  &__avatar { width: 100%; height: 100%; object-fit: cover; }
  &__avatar-fallback { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); font-size: 28px; border: 2px solid var(--md-sys-color-primary); }

  &__stats { display: flex; gap: 32px; margin: 8px 0; }
  &__stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }

  &__theme-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 8px 0; }
  &__theme-btn { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: var(--md-sys-shape-corner-small); border: 1px solid var(--glass-border); background: transparent; color: var(--md-sys-color-on-surface); cursor: pointer; transition: background 150ms, transform 200ms var(--md-sys-motion-easing-spring); &:hover { background: rgba(255,255,255,0.04); transform: scale(1.02); } }

  &__links {
    display: flex;
    gap: 10px;
    width: 100%;
  }

  &__link {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    text-decoration: none;
    cursor: pointer;
    transition: background 150ms, color 150ms;
    &:hover { background: rgba(255,255,255,0.04); color: var(--md-sys-color-on-surface); }
    svg { color: var(--md-sys-color-primary); flex-shrink: 0; }
  }

  &__logout { width: 100%; padding: 12px; border-radius: var(--md-sys-shape-corner-small); border: 1px solid var(--md-sys-color-error); background: transparent; color: var(--md-sys-color-error); cursor: pointer; transition: background 150ms; &:hover { background: rgba(224,138,133,0.08); } }

  &__empty { width: 380px; max-width: 100%; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 32px; border-radius: var(--md-sys-shape-corner-medium); text-align: center; }
}
</style>
