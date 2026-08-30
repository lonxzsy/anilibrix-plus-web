<template>
  <Teleport to="body">
    <Transition name="auth-backdrop">
      <div v-if="visible" class="auth-modal" @click.self="close">
        <Transition name="auth-content" appear>
          <div v-if="visible" class="auth-modal__content glass-strong">
            <div class="auth-modal__header">
              <h3 class="auth-modal__title">{{ isRegister ? 'Регистрация' : 'Вход' }}</h3>
              <button class="auth-modal__close" @click="close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form class="auth-modal__form" @submit.prevent="submit">
              <div class="auth-modal__field">
                <label class="auth-modal__label">Логин</label>
                <input v-model="login" type="text" class="auth-modal__input" placeholder="your_login" required />
              </div>

              <div v-if="isRegister" class="auth-modal__field">
                <label class="auth-modal__label">Email</label>
                <input v-model="email" type="email" class="auth-modal__input" placeholder="email@example.com" required />
              </div>

              <div class="auth-modal__field">
                <label class="auth-modal__label">Пароль</label>
                <input v-model="password" type="password" class="auth-modal__input" placeholder="••••••••" required />
              </div>

              <div v-if="error" class="auth-modal__error">{{ error }}</div>

              <button type="submit" class="auth-modal__submit" :disabled="loading">
                <span>{{ loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти' }}</span>
              </button>
            </form>

            <div class="auth-modal__footer">
              <button class="auth-modal__switch" @click="isRegister = !isRegister">
                {{ isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const login = ref('')
const email = ref('')
const password = ref('')
const isRegister = ref(false)
const loading = ref(false)
const error = ref('')

watch(() => props.visible, (v) => {
  if (v) { error.value = ''; login.value = ''; email.value = ''; password.value = '' }
})

async function submit() {
  loading.value = true; error.value = ''
  if (isRegister.value) { error.value = 'Регистрация временно недоступна'; loading.value = false; return }
  const success = await authStore.login(login.value, password.value)
  if (success) close()
  else error.value = authStore.error || 'Ошибка входа'
  loading.value = false
}

function close() { emit('close') }
</script>

<style scoped lang="scss">
.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  &__content {
    width: 380px;
    max-width: 90vw;
    border-radius: var(--md-sys-shape-corner-large);
    border: 1px solid var(--glass-border);
    box-shadow: var(--md-sys-elevation-4);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__title {
    font-family: var(--font-family-display);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--md-sys-color-on-surface);
  }

  &__close {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    border-radius: 50%;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: background 150ms ease;
    &:hover { color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface-container-high); }
  }

  &__form { display: flex; flex-direction: column; gap: 14px; }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__label {
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 500;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__input {
    padding: 10px 14px;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 13.5px;
    outline: none;
    transition: border-color 150ms ease;
    &:focus { border-color: rgba(255, 255, 255, 0.25); }
    &::placeholder { color: var(--md-sys-color-on-surface-variant); opacity: 0.5; }
  }

  &__error {
    color: var(--md-sys-color-error);
    font-size: 12.5px;
    padding: 2px 0;
    font-weight: 500;
  }

  &__submit {
    padding: 11px;
    background: #ffffff;
    color: #09090c;
    border: none;
    border-radius: var(--md-sys-shape-corner-full);
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    transition: background 150ms ease, transform 150ms ease;
    &:hover { background: #f0f0f2; transform: translateY(-1px); }
    &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  }

  &__footer { text-align: center; }

  &__switch {
    background: transparent; border: none; color: var(--md-sys-color-primary);
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer; transition: opacity 150ms;
    &:hover { opacity: 0.8; }
  }
}

.auth-backdrop-enter-active, .auth-backdrop-leave-active {
  transition: opacity 200ms var(--md-sys-motion-easing-standard);
}
.auth-backdrop-enter-from, .auth-backdrop-leave-to { opacity: 0; }
.auth-content-enter-active { transition: all 250ms var(--md-sys-motion-easing-spring); }
.auth-content-leave-active { transition: all 180ms var(--md-sys-motion-easing-accelerate); }
.auth-content-enter-from { opacity: 0; transform: scale(0.95) translateY(8px); }
.auth-content-leave-to { opacity: 0; transform: scale(0.97); }
</style>
