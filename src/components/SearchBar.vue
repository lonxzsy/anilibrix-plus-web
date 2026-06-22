<template>
  <div class="search-bar-wrapper" ref="wrapperRef">
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
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-bar__input md3-body-large"
        :placeholder="placeholder"
        @input="onInput"
        @keydown.enter="onEnter"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.escape="closeSuggestions"
      />
      <button v-if="query" class="search-bar__clear" @click="clear" title="Очистить">
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

    <Transition name="dropdown">
      <div v-if="showDropdown" class="search-dropdown glass-strong">
        <div v-if="suggestions.length > 0" class="search-dropdown__group">
          <div
            v-for="(item, index) in suggestions"
            :key="item.id"
            class="search-dropdown__item"
            :class="{ 'search-dropdown__item--active': index === activeIndex }"
            @mousedown.prevent="selectSuggestion(item)"
            @mouseenter="activeIndex = index"
          >
            <img
              v-if="item.poster?.thumbnail"
              class="search-dropdown__poster"
              :src="item.poster.thumbnail"
              alt=""
              loading="lazy"
            />
            <div class="search-dropdown__info">
              <span class="search-dropdown__title md3-body-medium">{{ item.name.main }}</span>
              <span v-if="item.name.english" class="search-dropdown__sub md3-body-small">{{
                item.name.english
              }}</span>
            </div>
          </div>
          <div
            v-if="query.length >= 2"
            class="search-dropdown__item search-dropdown__show-all"
            :class="{ 'search-dropdown__item--active': activeIndex === suggestions.length }"
            @mousedown.prevent="submitSearch"
            @mouseenter="activeIndex = suggestions.length"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Поиск «{{ query }}»</span>
          </div>
        </div>

        <div v-if="externalSuggestions.length > 0" class="search-dropdown__group">
          <div class="search-dropdown__header">
            <span class="md3-label-small">Нет в Anilibria</span>
          </div>
          <div
            v-for="(item, index) in externalSuggestions"
            :key="'ext-' + item.id"
            class="search-dropdown__item search-dropdown__item--external"
            :class="{ 'search-dropdown__item--active': index + suggestionsBaseCount === activeIndex }"
            @mousedown.prevent="openExternalMAL(item)"
            @mouseenter="activeIndex = index + suggestionsBaseCount"
          >
            <img
              v-if="item.poster?.thumbnail"
              class="search-dropdown__poster search-dropdown__poster--external"
              :src="item.poster.thumbnail"
              alt=""
              loading="lazy"
            />
            <div class="search-dropdown__info">
              <span class="search-dropdown__title" style="color: var(--md-sys-color-on-surface-variant)">{{ item.name.main }}</span>
              <span v-if="item.score" class="search-dropdown__sub md3-body-small">⭐ {{ item.score.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="historyItems.length > 0 && !query" class="search-dropdown__group">
          <div class="search-dropdown__header">
            <span class="md3-label-small">Недавние запросы</span>
            <button class="search-dropdown__clear-btn md3-label-small" @click="clearSearchHistory">
              Очистить
            </button>
          </div>
          <div
            v-for="(item, index) in historyItems"
            :key="item"
            class="search-dropdown__item search-dropdown__history-item"
            :class="{ 'search-dropdown__item--active': index === activeIndex }"
            @mousedown.prevent="selectHistory(item)"
            @mouseenter="activeIndex = index"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{{ item }}</span>
          </div>
        </div>

        <div
          v-else-if="query.length >= 2 && suggestions.length === 0"
          class="search-dropdown__empty md3-body-medium"
        >
          Нет результатов для «{{ query }}»
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useTitleStore } from '@/stores/titles'
import { debounce } from '@/utils/helpers'
import { getSearchHistory, clearSearchHistory } from '@/utils/search'
import type { Title } from '@/types'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [query: string]
  select: [title: Title]
}>()

const titleStore = useTitleStore()
const query = ref(props.modelValue)
const inputRef = ref<HTMLInputElement>()
const wrapperRef = ref<HTMLElement>()
const showDropdown = ref(false)
const activeIndex = ref(-1)
const suggestions = ref<Title[]>([])

const historyItems = computed(() => getSearchHistory())

const externalSuggestions = computed(() =>
  titleStore.externalTitles.filter((t) => {
    if (!query.value) return false
    const q = query.value.toLowerCase()
    return (
      t.name.main.toLowerCase().includes(q) ||
      t.name.english?.toLowerCase().includes(q)
    )
  }).slice(0, 4)
)

const suggestionsBaseCount = computed(() =>
  suggestions.value.length + (query.value.length >= 2 ? 1 : 0)
)

watch(
  () => props.modelValue,
  (val) => {
    query.value = val
  }
)

const debouncedSuggest = debounce((val: string) => {
  if (val.length >= 1) {
    suggestions.value = titleStore.searchEngine.suggest(val, 6)
    showDropdown.value = true
    activeIndex.value = -1
  } else {
    suggestions.value = []
    if (!val) {
      showDropdown.value = historyItems.value.length > 0
      activeIndex.value = -1
    }
  }
}, 150)

function onInput() {
  debouncedSuggest(query.value)
  debouncedEmit(query.value)
}

const debouncedEmit = debounce((val: string) => {
  emit('update:modelValue', val)
  emit('search', val)
}, 300)

function onEnter() {
  if (activeIndex.value >= 0 && activeIndex.value < suggestions.value.length) {
    selectSuggestion(suggestions.value[activeIndex.value])
    return
  }
  const extIndex = activeIndex.value - suggestionsBaseCount.value
  if (activeIndex.value >= suggestionsBaseCount.value && extIndex >= 0 && extIndex < externalSuggestions.value.length) {
    openExternalMAL(externalSuggestions.value[extIndex])
    return
  }
  debouncedEmit.cancel()
  submitSearch()
}

function onArrowDown() {
  if (!showDropdown.value) return
  const maxIndex = suggestionsBaseCount.value + externalSuggestions.value.length
  activeIndex.value = Math.min(activeIndex.value + 1, maxIndex)
}

function onArrowUp() {
  if (!showDropdown.value) return
  activeIndex.value = Math.max(activeIndex.value - 1, -1)
}

function selectSuggestion(title: Title) {
  query.value = title.name.main
  showDropdown.value = false
  emit('select', title)
  emit('update:modelValue', title.name.main)
  emit('search', title.name.main)
}

function openExternalMAL(title: Title) {
  closeSuggestions()
  if (title.malId) {
    window.open(`https://myanimelist.net/anime/${title.malId}`, '_blank')
  }
}

function selectHistory(item: string) {
  query.value = item
  showDropdown.value = false
  emit('update:modelValue', item)
  emit('search', item)
}

function submitSearch() {
  showDropdown.value = false
  emit('update:modelValue', query.value)
  emit('search', query.value)
}

function closeSuggestions() {
  showDropdown.value = false
  activeIndex.value = -1
}

function clear() {
  query.value = ''
  showDropdown.value = false
  emit('update:modelValue', '')
  emit('search', '')
  inputRef.value?.focus()
}

function onHistoryClick() {
  if (!query.value) {
    showDropdown.value = !showDropdown.value
  }
}

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    closeSuggestions()
  }
}

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped lang="scss">
.search-bar-wrapper {
  position: relative;
  width: 100%;
}

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

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden;
  z-index: 100;
  padding: 6px 0;

  &__group {
    display: flex;
    flex-direction: column;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px 4px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__clear-btn {
    background: none;
    border: none;
    color: var(--md-sys-color-primary);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    transition: background 150ms;

    &:hover {
      background: rgba(184, 165, 232, 0.1);
    }
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: background 100ms;
    user-select: none;

    &:hover,
    &--active {
      background: rgba(184, 165, 232, 0.12);
    }
  }

  &__show-all {
    gap: 8px;
    color: var(--md-sys-color-primary);
    border-top: 1px solid var(--glass-border);
    margin-top: 2px;
    padding-top: 10px;
  }

  &__history-item {
    gap: 10px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13px;
  }

  &__item--external {
    opacity: 0.6;
  }

  &__poster {
    width: 36px;
    height: 52px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-extra-small);
    flex-shrink: 0;

    &--external {
      filter: grayscale(0.6);
      opacity: 0.6;
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  &__title {
    color: var(--md-sys-color-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__sub {
    color: var(--md-sys-color-on-surface-variant);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__empty {
    padding: 16px;
    text-align: center;
    color: var(--md-sys-color-on-surface-variant);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 150ms,
    transform 150ms var(--md-sys-motion-easing-standard);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
