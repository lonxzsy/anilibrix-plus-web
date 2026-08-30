<template>
  <Teleport to="body">
    <div class="toast-container" role="status" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-container__list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast glass-strong"
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
          <span class="toast__message">{{ toast.message }}</span>
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
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  pointer-events: none;
  max-width: 90vw;
  width: 420px;

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--md-sys-shape-corner-medium);
  border: 1px solid var(--glass-border);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
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
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  &__message {
    flex: 1;
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.3;
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2.5px;
    background: var(--md-sys-color-primary);
    animation: toastProgress linear forwards;
  }

  &--success {
    border-color: rgba(48, 209, 88, 0.3);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    .toast__icon { color: #30D158; background: rgba(48, 209, 88, 0.12); }
    .toast__progress { background: #30D158; }
  }

  &--error {
    border-color: rgba(255, 69, 58, 0.3);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    .toast__icon { color: #FF453A; background: rgba(255, 69, 58, 0.12); }
    .toast__progress { background: #FF453A; }
  }

  &--info {
    border-color: rgba(10, 132, 255, 0.3);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    .toast__icon { color: #0A84FF; background: rgba(10, 132, 255, 0.12); }
    .toast__progress { background: #0A84FF; }
  }

  &--exiting {
    opacity: 0;
    transform: translateY(10px) scale(0.96);
  }
}

.toast-enter-active {
  transition: all 250ms var(--md-sys-motion-easing-spring);
}
.toast-leave-active {
  transition: all 180ms var(--md-sys-motion-easing-accelerate);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@keyframes toastProgress {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
