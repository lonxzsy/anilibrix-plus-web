<template>
  <Transition name="snackbar">
    <div v-if="store.showUpdate" class="snackbar glass-strong">
      <div class="snackbar__body">
        <svg class="snackbar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
        <div class="snackbar__text">
          <span class="snackbar__title">
            Обновление до {{ store.currentVersion }}
          </span>
          <span v-if="store.latestRelease" class="snackbar__subtitle">
            {{ store.latestRelease.title }}
          </span>
        </div>
      </div>
      <div class="snackbar__actions">
        <router-link to="/changelog" class="snackbar__action" @click="store.markSeen()">
          Что нового
        </router-link>
        <button class="snackbar__close" aria-label="Закрыть" @click="close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useChangelogStore } from '@/stores/changelog'

const store = useChangelogStore()

function close() {
  store.dismiss()
  store.markSeen()
}
</script>

<style scoped lang="scss">
.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: var(--md-sys-shape-corner-full);
  border: 1px solid var(--glass-border);
  z-index: 1000;
  max-width: 540px;
  min-width: 300px;
  box-shadow: var(--md-sys-elevation-4);

  &__body {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  &__icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    color: var(--md-sys-color-primary);
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__title {
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
  }

  &__subtitle {
    font-size: 11.5px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__action {
    padding: 6px 14px;
    border-radius: var(--md-sys-shape-corner-full);
    background: #ffffff;
    color: #09090c;
    text-decoration: none;
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms ease, transform 150ms ease;
    white-space: nowrap;

    &:hover {
      background: #f0f0f2;
      transform: translateY(-1px);
    }
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: background 150ms ease;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface);
    }
  }
}

.snackbar-enter-active {
  animation: snackbarIn 400ms var(--md-sys-motion-easing-spring);
}

.snackbar-leave-active {
  animation: snackbarOut 250ms var(--md-sys-motion-easing-accelerate) forwards;
}

@keyframes snackbarIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(24px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes snackbarOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(12px) scale(0.96);
  }
}

@media (max-width: 599px) {
  .snackbar {
    bottom: 80px;
    left: 16px;
    right: 16px;
    transform: none;
    min-width: 0;
    max-width: none;
  }

  .snackbar-enter-active {
    animation: snackbarInMobile 400ms var(--md-sys-motion-easing-spring);
  }

  .snackbar-leave-active {
    animation: snackbarOutMobile 250ms var(--md-sys-motion-easing-accelerate) forwards;
  }

  @keyframes snackbarInMobile {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes snackbarOutMobile {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
  }
}
</style>
