<template>
  <div class="search-bar glass">
    <svg
      class="search-bar__icon"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <input
      ref="input"
      v-model="query"
      type="text"
      class="search-bar__input md3-body-large"
      :placeholder="placeholder"
      @input="onInput"
      @keydown.enter="onEnter"
    />
    <button v-if="query" class="search-bar__clear" @click="clear">
      <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from '@/utils/helpers'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
}>()

const query = ref(props.modelValue)
const input = ref<HTMLInputElement>()

watch(
  () => props.modelValue,
  (val) => {
    query.value = val
  }
)

const debouncedEmit = debounce((val: string) => {
  emit('update:modelValue', val)
  emit('search', val)
}, 300)

function onInput() {
  debouncedEmit(query.value)
}

function onEnter() {
  // Cancel pending debounce and emit immediately
  debouncedEmit.cancel()
  emit('update:modelValue', query.value)
  emit('search', query.value)
}

function clear() {
  query.value = ''
  emit('update:modelValue', '')
  emit('search', '')
  input.value?.focus()
}
</script>

<style scoped lang="scss">
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--md-sys-shape-corner-small);
  padding: 12px 16px;
  border: 1px solid transparent;
  transition:
    border-color 200ms var(--md-sys-motion-easing-standard),
    box-shadow 200ms var(--md-sys-motion-easing-standard);

  &:focus-within {
    border-color: rgba(184, 165, 232, 0.2);
    box-shadow: var(--glow-primary);
  }

  &__icon {
    width: 18px;
    height: 18px;
    color: var(--md-sys-color-on-surface-variant);
    flex-shrink: 0;
  }

  &__input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface);
    outline: none;
    font-size: 15px;
    letter-spacing: -0.01em;

    &::placeholder {
      color: var(--md-sys-color-on-surface-variant);
    }
  }

  &__clear {
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--md-sys-shape-corner-small);
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 150ms,
      color 150ms;

    &:hover {
      background-color: rgba(255, 255, 255, 0.06);
      color: var(--md-sys-color-on-surface);
    }
  }
}
</style>
