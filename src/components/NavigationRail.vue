<template>
  <nav class="navigation-rail glass">
    <div class="navigation-rail__header">
      <router-link to="/" class="logo">
        <div class="logo__icon-wrap">
          <svg class="logo__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="20" height="20" rx="6" fill="currentColor" fill-opacity="0.12" stroke="currentColor" stroke-width="1.8" />
            <path d="M10 8L16 12L10 16V8Z" fill="currentColor" />
          </svg>
        </div>
        <span class="logo__text">Anilibrix</span>
      </router-link>
    </div>

    <div class="navigation-rail__items" ref="itemsRef">
      <div class="navigation-rail__active-indicator" :style="indicatorStyle" />
      <router-link
        v-for="item in items"
        :key="item.path"
        :to="item.path"
        class="navigation-rail__item"
        :class="{ 'navigation-rail__item--active': isActive(item.path) }"
        :ref="(el: any) => itemRefs[item.path] = el as HTMLElement"
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
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
        <span class="navigation-rail__item-label">{{ item.label }}</span>
      </router-link>
    </div>

    <div class="navigation-rail__bottom">
      <router-link
        v-if="authStore.user"
        to="/profile"
        class="navigation-rail__item navigation-rail__item--profile"
        :class="{ 'navigation-rail__item--active': isActive('/profile') }"
        title="Профиль"
      >
        <div v-if="authStore.user.avatar" class="navigation-rail__avatar-wrap">
          <img :src="authStore.user.avatar" class="navigation-rail__avatar" alt="" />
        </div>
        <div v-else class="navigation-rail__avatar-fallback">
          {{ authStore.user.name.charAt(0).toUpperCase() }}
        </div>
        <span class="navigation-rail__item-label">{{ authStore.user.name }}</span>
      </router-link>
      <button v-else class="navigation-rail__item navigation-rail__item--login" title="Войти" @click="$emit('openAuth')">
        <div class="navigation-rail__login-icon-wrap">
          <svg
            class="navigation-rail__item-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
          </svg>
        </div>
        <span class="navigation-rail__item-label">Войти</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

defineEmits<{
  openAuth: []
}>()

const itemsRef = ref<HTMLElement | null>(null)
const itemRefs = ref<Record<string, HTMLElement>>({})
const indicatorStyle = ref<Record<string, string>>({})

const items = [
  {
    path: '/',
    label: 'Главная',
    iconPath: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  },
  {
    path: '/catalog',
    label: 'Каталог',
    iconPath: 'M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z',
  },
  {
    path: '/studios',
    label: 'Студии',
    iconPath: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z',
  },
  {
    path: '/schedule',
    label: 'Расписание',
    iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    path: '/library',
    label: 'Библиотека',
    iconPath: 'M19 21l-7-5-7 5V5a2 2 0 012-2l5 0a2 2 0 012 2v16z M12 7v14',
  },
  {
    path: '/trending',
    label: 'Популярное',
    iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function updateIndicator() {
  const activePath = items.find((item) => isActive(item.path))
  if (!activePath || !itemRefs.value[activePath.path] || !itemsRef.value) return
  const el = itemRefs.value[activePath.path]
  indicatorStyle.value = {
    transform: `translateY(${el.offsetTop}px)`,
    height: `${el.offsetHeight}px`,
  }
}

watch(() => route.path, () => nextTick(updateIndicator), { flush: 'post' })
onMounted(() => nextTick(updateIndicator))
</script>

<style scoped lang="scss">
.navigation-rail {
  width: 74px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  gap: 8px;
  border-right: 1px solid var(--glass-border);
  flex-shrink: 0;
  z-index: 20;

  &__header {
    padding: 0 0 14px;
  }

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    cursor: pointer;

    &__icon-wrap {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--md-sys-shape-corner-small);
      color: var(--md-sys-color-primary);
      transition: transform 200ms var(--md-sys-motion-easing-spring);

      &:hover {
        transform: scale(1.06);
      }
    }

    &__icon {
      width: 26px;
      height: 26px;
    }

    &__text {
      color: var(--md-sys-color-on-surface);
      font-family: var(--font-family-display);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 0 6px;
    flex: 1;
    position: relative;
  }

  &__active-indicator {
    position: absolute;
    left: 6px;
    width: calc(100% - 12px);
    background: rgba(255, 255, 255, 0.07);
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
      transform 280ms var(--md-sys-motion-easing-spring),
      height 280ms var(--md-sys-motion-easing-spring);
    pointer-events: none;
    z-index: 0;
  }

  .md3-light &__active-indicator {
    background: rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 9px 0;
    border-radius: var(--md-sys-shape-corner-small);
    text-decoration: none;
    color: var(--md-sys-color-on-surface-variant);
    transition:
      color 150ms ease,
      transform 150ms var(--md-sys-motion-easing-spring);
    cursor: pointer;
    position: relative;
    background: transparent;
    border: none;
    width: 100%;
    z-index: 1;

    &-icon {
      width: 19px;
      height: 19px;
      transition: color 150ms ease;
    }

    &-label {
      font-family: var(--font-family-body);
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: -0.01em;
    }

    &:hover {
      color: var(--md-sys-color-on-surface);
    }

    &--active {
      color: var(--md-sys-color-primary);

      .navigation-rail__item-label {
        font-weight: 600;
      }
    }
  }

  &__bottom {
    padding: 0 6px 6px;
    margin-top: auto;
    width: 100%;
  }

  &__avatar-wrap {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid var(--md-sys-color-primary);
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
    background: var(--md-sys-color-primary);
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
  }

  &__login-icon-wrap {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    transition: background 150ms ease;

    .navigation-rail__item--login:hover & {
      background: rgba(255, 255, 255, 0.1);
      color: var(--md-sys-color-on-surface);
    }
  }
}
</style>
