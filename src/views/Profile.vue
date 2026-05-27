<template>
  <div class="profile">
    <div class="profile__card glass">
      <div class="profile__header">
        <div class="profile__avatar-wrap">
          <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" class="profile__avatar" alt="" />
          <div v-else class="profile__avatar-fallback">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
        </div>
        <div class="profile__info">
          <h2 class="profile__name md3-headline-medium">{{ authStore.user?.name }}</h2>
          <span class="profile__login md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
            @{{ authStore.user?.login }}
          </span>
          <span v-if="authStore.user?.email" class="profile__email md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
            {{ authStore.user.email }}
          </span>
        </div>
      </div>

      <div class="profile__stats">
        <div class="profile__stat">
          <span class="profile__stat-value md3-headline-small">{{ libraryStore.favorites.length }}</span>
          <span class="profile__stat-label md3-label-medium">Избранное</span>
        </div>
        <div class="profile__stat">
          <span class="profile__stat-value md3-headline-small">{{ libraryStore.history.length }}</span>
          <span class="profile__stat-label md3-label-medium">История</span>
        </div>
        <div class="profile__stat">
          <span class="profile__stat-value md3-headline-small">{{ libraryStore.playlists.length }}</span>
          <span class="profile__stat-label md3-label-medium">Плейлисты</span>
        </div>
      </div>

      <div v-if="authStore.user?.createdAt" class="profile__meta">
        <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
          Аккаунт создан: {{ formatDate(authStore.user.createdAt) }}
        </span>
      </div>

      <div class="profile__actions">
        <button class="profile__logout-btn md3-label-large" @click="logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useLibraryStore } from '@/stores/library'

const router = useRouter()
const authStore = useAuthStore()
const libraryStore = useLibraryStore()

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

function logout() {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  libraryStore.loadFavorites()
  libraryStore.loadHistory()
  libraryStore.loadPlaylists()
})
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  gap: 24px;

  &__card {
    display: flex;
    flex-direction: column;
    gap: 28px;
    padding: 32px;
    border-radius: var(--md-sys-shape-corner-medium);
    max-width: 640px;
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  &__avatar-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--md-sys-color-primary);
    box-shadow: 0 0 20px rgba(184, 165, 232, 0.25);
    flex-shrink: 0;
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    font: var(--md-sys-typescale-headline-small);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__name {
    color: var(--md-sys-color-on-surface);
  }

  &__login {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__email {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__stats {
    display: flex;
    gap: 16px;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 16px 24px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    flex: 1;
    transition: background-color 150ms, transform 150ms;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      transform: translateY(-2px);
    }
  }

  &__stat-value {
    color: var(--md-sys-color-primary);
  }

  &__stat-label {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__meta {
    padding-top: 4px;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__logout-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-error);
    cursor: pointer;
    transition: background-color 150ms var(--md-sys-motion-easing-standard),
                border-color 150ms var(--md-sys-motion-easing-standard),
                box-shadow 150ms var(--md-sys-motion-easing-standard);

    &:hover {
      background: var(--md-sys-color-error-container);
      border-color: var(--md-sys-color-error);
      box-shadow: 0 0 16px rgba(224, 138, 133, 0.15);
    }

    &:active {
      background: var(--md-sys-color-error);
      color: var(--md-sys-color-on-error);
    }
  }
}
</style>
