<template>
  <div class="profile">
    <div v-if="authStore.user" class="profile__card glass-strong">
      <div class="profile__avatar-wrap">
        <img v-if="authStore.user.avatar" :src="authStore.user.avatar" class="profile__avatar" alt="" />
        <div v-else class="profile__avatar-fallback">{{ authStore.user.name.charAt(0).toUpperCase() }}</div>
      </div>
      <h2 class="profile__name">{{ authStore.user.name }}</h2>
      <p class="profile__login">
        @{{ authStore.user.login }}
      </p>

      <div class="profile__stats">
        <div class="profile__stat">
          <span ref="favCountRef" class="profile__stat-num">0</span>
          <span class="profile__stat-label">В избранном</span>
        </div>
        <div class="profile__stat">
          <span ref="histCountRef" class="profile__stat-num">0</span>
          <span class="profile__stat-label">В истории</span>
        </div>
      </div>

      <div class="profile__theme-toggle">
        <span class="profile__theme-label">Тема оформления</span>
        <button class="profile__theme-btn" @click="toggleTheme">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
          <span>{{ isDark ? 'Тёмная' : 'Светлая' }}</span>
        </button>
      </div>

      <div class="profile__links">
        <router-link to="/trending" class="profile__link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          Популярное
        </router-link>
        <router-link to="/changelog" class="profile__link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
          Что нового
        </router-link>
      </div>

      <button class="profile__logout" @click="handleLogout">
        <span>Выйти из аккаунта</span>
      </button>
    </div>

    <div v-else class="profile__empty glass-strong">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color: var(--md-sys-color-primary)">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" />
      </svg>
      <h3 class="profile__empty-title">Войдите в аккаунт</h3>
      <p class="profile__empty-desc">
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
@use "@/styles/responsive.scss" as *;

.profile {
  display: flex;
  justify-content: center;
  padding-top: 32px;
  padding-bottom: 48px;

  &__card {
    width: 400px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 36px 28px;
    border-radius: var(--md-sys-shape-corner-large);
    border: 1px solid var(--glass-border);
    box-shadow: var(--md-sys-elevation-3);
  }

  &__avatar-wrap {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.15);
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-fallback {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-primary);
    color: #ffffff;
    font-family: var(--font-family-body);
    font-size: 28px;
    font-weight: 700;
  }

  &__name {
    font-family: var(--font-family-display);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--md-sys-color-on-surface);
  }

  &__login {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13.5px;
    margin-top: -8px;
  }

  &__stats {
    display: flex;
    gap: 32px;
    margin: 8px 0;
    padding: 12px 24px;
    background: var(--md-sys-color-surface-container);
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  &__stat-num {
    font-family: var(--font-family-body);
    font-size: 20px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
  }

  &__stat-label {
    font-size: 11.5px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__theme-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 0;
    border-top: 1px solid var(--glass-border);
    border-bottom: 1px solid var(--glass-border);
  }

  &__theme-label {
    font-size: 13.5px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface);
  }

  &__theme-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background 150ms ease;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
    }
  }

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
    gap: 6px;
    padding: 10px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: background 150ms ease, border-color 150ms ease;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      border-color: var(--glass-border-hover);
    }

    svg {
      color: var(--md-sys-color-on-surface-variant);
      flex-shrink: 0;
    }
  }

  &__logout {
    width: 100%;
    padding: 10px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid rgba(255, 69, 58, 0.3);
    background: rgba(255, 69, 58, 0.08);
    color: var(--md-sys-color-error);
    font-family: var(--font-family-body);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms ease;

    &:hover {
      background: rgba(255, 69, 58, 0.16);
    }
  }

  &__empty {
    width: 400px;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 44px 28px;
    border-radius: var(--md-sys-shape-corner-large);
    text-align: center;
    border: 1px solid var(--glass-border);
    box-shadow: var(--md-sys-elevation-3);
  }

  &__empty-title {
    font-family: var(--font-family-display);
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--md-sys-color-on-surface);
  }

  &__empty-desc {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13.5px;
    line-height: 1.4;
  }
}
</style>
