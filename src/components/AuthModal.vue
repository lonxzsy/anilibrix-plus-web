<template>
  <div v-if="visible" class="auth-modal" @click.self="close">
    <div class="auth-modal__content glass">
      <div class="auth-modal__header">
        <h3 class="md3-headline-small">{{ isRegister ? 'Регистрация' : 'Вход' }}</h3>
        <button class="auth-modal__close" @click="close">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form class="auth-modal__form" @submit.prevent="submit">
        <div class="auth-modal__field">
          <label class="md3-label-medium">Логин</label>
          <input
            v-model="login"
            type="text"
            class="auth-modal__input md3-body-large"
            placeholder="your_login"
            required
          />
        </div>

        <div v-if="isRegister" class="auth-modal__field">
          <label class="md3-label-medium">Email</label>
          <input
            v-model="email"
            type="email"
            class="auth-modal__input md3-body-large"
            placeholder="email@example.com"
            required
          />
        </div>

        <div class="auth-modal__field">
          <label class="md3-label-medium">Пароль</label>
          <input
            v-model="password"
            type="password"
            class="auth-modal__input md3-body-large"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="auth-modal__error md3-body-small">{{ error }}</div>

        <button type="submit" class="auth-modal__submit glow-hover" :disabled="loading">
          <span class="md3-label-large">{{
            loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'
          }}</span>
        </button>
      </form>

      <div class="auth-modal__footer">
        <button class="auth-modal__switch md3-body-medium" @click="isRegister = !isRegister">
          {{ isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const login = ref('')
const email = ref('')
const password = ref('')
const isRegister = ref(false)
const loading = ref(false)
const error = ref('')

watch(
  () => props.visible,
  (v) => {
    if (v) {
      error.value = ''
      login.value = ''
      email.value = ''
      password.value = ''
    }
  }
)

async function submit() {
  loading.value = true
  error.value = ''

  if (isRegister.value) {
    // Registration not available via public API docs easily; fallback to login
    error.value = 'Регистрация временно недоступна'
    loading.value = false
    return
  }

  const success = await authStore.login(login.value, password.value)
  if (success) {
    close()
  } else {
    error.value = authStore.error || 'Ошибка входа'
  }
  loading.value = false
}

function close() {
  emit('close')
}
</script>

<style scoped lang="scss">
.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn 200ms var(--md-sys-motion-easing-standard);

  &__content {
    width: 380px;
    max-width: 90vw;
    border-radius: var(--md-sys-shape-corner-small);
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: scaleIn 300ms var(--md-sys-motion-easing-spring) backwards;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__close {
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    padding: 4px;
    transition: color 150ms;

    &:hover {
      color: var(--md-sys-color-on-surface);
    }
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      color: var(--md-sys-color-on-surface-variant);
    }
  }

  &__input {
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-on-surface);
    font-size: 15px;
    outline: none;
    transition:
      border-color 200ms,
      box-shadow 200ms;

    &:focus {
      border-color: rgba(184, 165, 232, 0.3);
      box-shadow: 0 0 0 3px rgba(184, 165, 232, 0.08);
    }

    &::placeholder {
      color: var(--md-sys-color-on-surface-variant);
    }
  }

  &__error {
    color: var(--md-sys-color-error);
    padding: 4px 0;
  }

  &__submit {
    padding: 12px;
    background: var(--md-sys-color-primary);
    color: var(--md-sys-color-on-primary);
    border: none;
    border-radius: var(--md-sys-shape-corner-small);
    cursor: pointer;
    transition:
      transform 200ms var(--md-sys-motion-easing-spring),
      box-shadow 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__footer {
    text-align: center;
  }

  &__switch {
    background: transparent;
    border: none;
    color: var(--md-sys-color-primary);
    cursor: pointer;
    transition: opacity 150ms;

    &:hover {
      opacity: 0.8;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
