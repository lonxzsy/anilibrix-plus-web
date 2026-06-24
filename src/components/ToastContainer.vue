<template>
  <Teleport to="body">
    <div class="toast-container" role="status" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-container__list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[`toast--${toast.type}`, { 'toast--exiting': toast.exiting }]"
          @click="remove(toast.id)"
        >
          <div class="toast__icon">
            <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else-if="toast.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <span class="toast__message md3-body-medium">{{ toast.message }}</span>
          <div class="toast__progress" :style="{ animationDuration: `${toast.duration}ms` }" />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: none;
  max-width: 90vw;
  width: 420px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface-container-high);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  box-shadow: var(--md-sys-elevation-3), 0 0 24px rgba(0,0,0,0.3);
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100%;
  transition: transform 200ms var(--md-sys-motion-easing-spring);

  &:hover {
    transform: scale(1.02);
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }

  &__message {
    flex: 1;
    color: var(--md-sys-color-on-surface);
    line-height: 1.3;
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--md-sys-color-primary);
    animation: toastProgress linear forwards;
    border-radius: 0 1px 0 0;
  }

  &--success {
    border-color: rgba(139, 195, 74, 0.2);
    .toast__icon { color: #8bc34a; }
    .toast__progress { background: #8bc34a; }
  }

  &--error {
    border-color: rgba(224, 138, 133, 0.2);
    .toast__icon { color: var(--md-sys-color-error); }
    .toast__progress { background: var(--md-sys-color-error); }
  }

  &--info {
    border-color: rgba(184, 165, 232, 0.15);
    .toast__icon { color: var(--md-sys-color-primary); }
    .toast__progress { background: var(--md-sys-color-primary); }
  }

  &--exiting {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
}

.toast-enter-active {
  transition: all 350ms var(--md-sys-motion-easing-spring);
}
.toast-leave-active {
  transition: all 250ms var(--md-sys-motion-easing-accelerate);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.92);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
