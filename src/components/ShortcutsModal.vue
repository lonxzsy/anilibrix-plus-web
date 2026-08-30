<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="visible" class="shortcuts-overlay" @click.self="close" @keydown.escape="close">
        <Transition name="modal-content" appear>
          <div v-if="visible" class="shortcuts-modal glass-strong">
            <div class="shortcuts-modal__header">
              <h2 class="shortcuts-modal__title">Горячие клавиши</h2>
              <button class="shortcuts-modal__close" @click="close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div class="shortcuts-modal__content">
              <div class="shortcuts-group">
                <h3 class="shortcuts-group__title">Глобальные</h3>
                <div class="shortcuts-group__items">
                  <div v-for="s in globalShortcuts" :key="s.key" class="shortcut-row">
                    <kbd class="shortcut-key">{{ s.key }}</kbd>
                    <span class="shortcut-desc">{{ s.desc }}</span>
                  </div>
                </div>
              </div>

              <div class="shortcuts-group">
                <h3 class="shortcuts-group__title">Плеер</h3>
                <div class="shortcuts-group__items">
                  <div v-for="s in playerShortcuts" :key="s.key" class="shortcut-row">
                    <kbd class="shortcut-key">{{ s.key }}</kbd>
                    <span class="shortcut-desc">{{ s.desc }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const globalShortcuts = [
  { key: '?', desc: 'Показать это окно' },
  { key: 'Ctrl+K / ⌘K', desc: 'Фокус поиска' },
  { key: '/', desc: 'Фокус поиска' },
]

const playerShortcuts = [
  { key: 'Space / K', desc: 'Воспроизвести / Пауза' },
  { key: '← / →', desc: 'Перемотка -10 / +10 сек' },
  { key: '↑ / ↓', desc: 'Громкость + / -' },
  { key: 'F', desc: 'Полноэкранный режим' },
  { key: 'M', desc: 'Выключить звук' },
  { key: 'N', desc: 'Следующая серия' },
]

function close() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.visible) {
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.shortcuts-overlay {
  position: fixed;
  inset: 0;
  background: rgba(7, 7, 10, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99998;
}

.shortcuts-modal {
  width: 500px;
  max-width: 92vw;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: var(--md-sys-shape-corner-large);
  border: 1px solid var(--glass-border);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--glass-border);
  }

  &__title {
    font-family: var(--font-family-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--md-sys-color-on-surface);
  }

  &__close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: background 150ms, color 150ms;
    &:hover { background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface); }
  }

  &__content {
    padding: 20px 24px 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.shortcuts-group {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-family: var(--font-family-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--md-sys-color-primary);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  border-radius: var(--md-sys-shape-corner-small);
  background: var(--md-sys-color-surface-container);
  border: 1px solid var(--glass-border);
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 26px;
  padding: 0 8px;
  border-radius: var(--md-sys-shape-corner-extra-small);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-family: var(--font-family-body);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
  letter-spacing: -0.01em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.shortcut-desc {
  font-size: 13px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}

.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 250ms var(--md-sys-motion-easing-standard);
}
.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}
.modal-content-enter-active {
  transition: all 300ms var(--md-sys-motion-easing-spring);
}
.modal-content-leave-active {
  transition: all 200ms var(--md-sys-motion-easing-accelerate);
}
.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
