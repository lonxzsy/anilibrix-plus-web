<template>
  <nav class="navigation-rail glass-strong">
    <div class="navigation-rail__header">
      <div class="logo">
        <svg class="logo__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.6" />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.4"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="logo__text md3-label-small">Anilibrix Plus</span>
      </div>
    </div>

    <div class="navigation-rail__items">
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="navigation-rail__item"
        :class="{ 'navigation-rail__item--active': isActive(item.path) }"
      >
        <svg
          class="navigation-rail__item-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="item.iconPath"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class="navigation-rail__item-label md3-label-small">{{ item.label }}</span>
      </router-link>
    </div>

    <div class="navigation-rail__bottom">
      <router-link
        v-if="authStore.user"
        to="/profile"
        class="navigation-rail__item"
        :class="{ 'navigation-rail__item--active': isActive('/profile') }"
        title="Профиль"
      >
        <div v-if="authStore.user.avatar" class="navigation-rail__avatar-wrap">
          <img :src="authStore.user.avatar" class="navigation-rail__avatar" alt="" />
        </div>
        <div v-else class="navigation-rail__avatar-fallback">
          {{ authStore.user.name.charAt(0).toUpperCase() }}
        </div>
        <span class="navigation-rail__item-label md3-label-small">{{ authStore.user.name }}</span>
      </router-link>
      <button v-else class="navigation-rail__item" title="Войти" @click="$emit('openAuth')">
        <svg
          class="navigation-rail__item-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
        </svg>
        <span class="navigation-rail__item-label md3-label-small">Войти</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

defineEmits<{
  openAuth: []
}>()

const items = [
  {
    path: '/',
    label: 'Главная',
    iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  },
  {
    path: '/catalog',
    label: 'Каталог',
    iconPath:
      'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  },
  {
    path: '/schedule',
    label: 'Расписание',
    iconPath:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    path: '/library',
    label: 'Библиотека',
    iconPath: 'M19 21l-7-5-7 5V5a2 2 0 012-2l5 0a2 2 0 012 2v16z M12 7v14',
  },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped lang="scss">
.navigation-rail {
  width: 72px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 8px;
  border-right: 1px solid var(--glass-border);
  flex-shrink: 0;

  &__header {
    padding: 4px 0 20px;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    &__icon {
      width: 24px;
      height: 24px;
      color: var(--md-sys-color-primary);
      filter: drop-shadow(0 0 6px rgba(184, 165, 232, 0.3));
    }

    &__text {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 10px;
      letter-spacing: 0.02em;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 0 10px;
    flex: 1;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 0;
    border-radius: var(--md-sys-shape-corner-small);
    text-decoration: none;
    color: var(--md-sys-color-on-surface-variant);
    transition:
      background-color 200ms var(--md-sys-motion-easing-standard),
      color 200ms var(--md-sys-motion-easing-standard),
      transform 200ms var(--md-sys-motion-easing-spring);
    cursor: pointer;
    position: relative;
    background: transparent;
    border: none;
    width: 100%;

    &-icon {
      width: 20px;
      height: 20px;
      transition: color 200ms var(--md-sys-motion-easing-standard);
    }

    &-label {
      font-size: 10px;
      letter-spacing: 0.01em;
    }

    &:hover {
      color: var(--md-sys-color-on-surface);
      background-color: rgba(255, 255, 255, 0.04);
      transform: scale(1.05);
    }

    &--active {
      color: var(--md-sys-color-primary);
      background: rgba(184, 165, 232, 0.08);
      box-shadow: 0 0 12px rgba(184, 165, 232, 0.1);

      .navigation-rail__item-icon {
        color: var(--md-sys-color-primary);
        filter: drop-shadow(0 0 4px rgba(184, 165, 232, 0.4));
      }
    }
  }

  &__bottom {
    padding: 0 10px 16px;
    margin-top: auto;
  }

  &__avatar-wrap {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid var(--md-sys-color-primary);
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.25);
  }

  &__avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-fallback {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    font: var(--md-sys-typescale-label-medium);
    font-size: 12px;
    border: 1.5px solid var(--md-sys-color-primary);
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.25);
  }
}
</style>
