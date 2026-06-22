<template>
  <Transition name="snackbar">
    <div v-if="store.showUpdate" class="snackbar glass-strong">
      <div class="snackbar__body">
        <span class="snackbar__icon">🎉</span>
        <div class="snackbar__text">
          <span class="snackbar__title md3-label-large">
            Обновление до {{ store.currentVersion }}
          </span>
          <span v-if="store.latestRelease" class="snackbar__subtitle md3-body-small">
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
  gap: 16px;
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-large);
  border: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 1000;
  max-width: 600px;
  min-width: 320px;
  box-shadow: var(--md-sys-elevation-3), 0 0 32px rgba(0, 0, 0, 0.3);

  &__body {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  &__icon {
    font-size: 20px;
    line-height: 1;
  }

  &__text {
    display: flex;
    flex-direction: column;
  }

  &__title {
    color: var(--md-sys-color-on-surface);
  }

  &__subtitle {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__action {
    padding: 6px 12px;
    border-radius: var(--md-sys-shape-corner-small);
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    text-decoration: none;
    font: var(--md-sys-typescale-label-large);
    cursor: pointer;
    transition:
      background 200ms var(--md-sys-motion-easing-standard),
      box-shadow 200ms var(--md-sys-motion-easing-standard);
    white-space: nowrap;

    &:hover {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      box-shadow: var(--glow-primary);
    }
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition:
      background 200ms var(--md-sys-motion-easing-standard),
      color 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      background: var(--md-sys-color-surface-container-highest);
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
