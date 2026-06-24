<template>
  <nav class="bottom-nav glass-strong">
    <div class="bottom-nav__indicator" :style="indicatorStyle" />
    <router-link
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      class="bottom-nav__item"
      :class="{ 'bottom-nav__item--active': isActive(item.path) }"
      :ref="(el: any) => itemRefs[item.path] = el as HTMLElement"
    >
      <svg class="bottom-nav__item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path :d="item.iconPath" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>
      <span class="bottom-nav__item-label md3-label-small">{{ item.label }}</span>
    </router-link>

    <button v-if="!authStore.user" class="bottom-nav__item" @click="$emit('openAuth')">
      <svg class="bottom-nav__item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
      </svg>
      <span class="bottom-nav__item-label md3-label-small">Войти</span>
    </button>
    <router-link v-else to="/profile" class="bottom-nav__item" :class="{ 'bottom-nav__item--active': isActive('/profile') }">
      <div v-if="authStore.user.avatar" class="bottom-nav__avatar-wrap">
        <img :src="authStore.user.avatar" class="bottom-nav__avatar" alt="" />
      </div>
      <div v-else class="bottom-nav__avatar-fallback">
        {{ authStore.user.name.charAt(0).toUpperCase() }}
      </div>
      <span class="bottom-nav__item-label md3-label-small">{{ authStore.user.name }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

defineEmits<{ openAuth: [] }>()

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
  const activeItem = items.find((item) => isActive(item.path))
  if (!activeItem || !itemRefs.value[activeItem.path]) return
  const el = itemRefs.value[activeItem.path]
  indicatorStyle.value = {
    transform: `translateX(${el.offsetLeft}px)`,
    width: `${el.offsetWidth}px`,
  }
}

watch(() => route.path, () => nextTick(updateIndicator), { flush: 'post' })
onMounted(() => nextTick(updateIndicator))
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 8px;
  z-index: 50;
  border-top: 1px solid var(--glass-border);

  &__indicator {
    position: absolute;
    top: 0;
    height: 2px;
    background: var(--md-sys-color-primary);
    border-radius: 0 0 2px 2px;
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.4);
    transition:
      transform 300ms var(--md-sys-motion-easing-spring),
      width 300ms var(--md-sys-motion-easing-spring);
    pointer-events: none;
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 6px 10px;
    text-decoration: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: var(--md-sys-shape-corner-small);
    transition: color 200ms, background 200ms;
    min-width: 56px;
    position: relative;
    z-index: 1;

    &-icon { width: 22px; height: 22px; transition: filter 300ms; }
    &-label { font-size: 10px; letter-spacing: 0.01em; }

    &:hover { color: var(--md-sys-color-on-surface); background: rgba(255,255,255,0.04); }

    &--active {
      color: var(--md-sys-color-primary);
      .bottom-nav__item-icon { filter: drop-shadow(0 0 4px rgba(184,165,232,0.4)); }
    }
  }

  &__avatar-wrap {
    width: 22px; height: 22px; border-radius: 50%; overflow: hidden;
    border: 1.5px solid var(--md-sys-color-primary);
  }
  &__avatar { width: 100%; height: 100%; object-fit: cover; }
  &__avatar-fallback {
    width: 22px; height: 22px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    font-size: 10px; border: 1.5px solid var(--md-sys-color-primary);
  }
}
</style>
