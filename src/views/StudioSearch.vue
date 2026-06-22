<template>
  <div class="studio-search">
    <div class="studio-search__header glass-strong">
      <div class="studio-search__search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          v-model="query"
          class="studio-search__input"
          placeholder="Поиск аниме по всем студиям..."
          @input="onSearch"
        />
      </div>
      <div class="studio-search__sources">
        <button
          v-for="s in SOURCES"
          :key="s.name"
          class="studio-search__source-tag"
          :class="{ 'studio-search__source-tag--active': store.currentSource === s.name }"
          @click="store.currentSource = s.name"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="studio-search__loading">
      <div v-for="n in 6" :key="n" class="md3-skeleton" style="height: 80px; border-radius: 8px" />
    </div>

    <div v-else-if="query.length < 2" class="studio-search__placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <p class="md3-title-medium">Введите название аниме</p>
      <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">Поиск выполняется по всем подключённым студиям</p>
    </div>

    <div v-else class="studio-search__results">
      <div
        v-for="group in store.searchResults"
        :key="group.source"
        class="studio-search__group"
      >
        <div v-if="group.results.length > 0" class="studio-search__group-header">
          <h3 class="md3-title-small">{{ sourceLabel(group.source) }}</h3>
          <span class="md3-body-small">{{ group.results.length }} результатов</span>
        </div>
        <div v-if="group.results.length > 0" class="studio-search__group-list">
          <div
            v-for="item in group.results"
            :key="item.id"
            class="studio-search__item glass"
            @click="goToEpisodes(group.source, item)"
          >
            <img class="studio-search__item-poster" :src="item.thumbnail" loading="lazy" alt="" />
            <div class="studio-search__item-info">
              <span class="md3-label-large">{{ item.title }}</span>
              <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
                {{ sourceLabel(group.source) }}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="allEmpty" class="studio-search__empty">
        <p class="md3-body-large">Ничего не найдено</p>
        <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
          Попробуйте другой запрос
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDecoderStore } from '@/stores/decoder'
import { SOURCES } from '@/api/decoder'

const router = useRouter()
const store = useDecoderStore()
const query = ref('')

let debounceTimer: ReturnType<typeof setTimeout>

function onSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (query.value.length >= 2) {
      store.searchAll(query.value)
    }
  }, 400)
}

const allEmpty = computed(() =>
  store.searchResults.length > 0 && store.searchResults.every((g) => g.results.length === 0)
)

function sourceLabel(name: string) {
  return SOURCES.find((s) => s.name === name)?.label || name
}

function goToEpisodes(source: string, item: { id: string; title: string }) {
  router.push(`/studios/${source}/${encodeURIComponent(item.id)}?title=${encodeURIComponent(item.title)}`)
}
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.studio-search {
  display: flex; flex-direction: column; gap: 24px;

  &__header {
    display: flex; flex-direction: column; gap: 14px;
    position: sticky; top: -28px; z-index: 10;
    padding: 16px 20px; margin: -16px -20px;
    border-radius: var(--md-sys-shape-corner-small);
  }

  &__search {
    display: flex; align-items: center; gap: 12px;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    padding: 10px 16px;
    color: var(--md-sys-color-on-surface-variant);
    transition: border-color 200ms;
    &:focus-within { border-color: var(--md-sys-color-primary); }
  }

  &__input {
    flex: 1; background: transparent; border: none; outline: none;
    color: var(--md-sys-color-on-surface);
    font: var(--md-sys-typescale-body-large);
    &::placeholder { color: var(--md-sys-color-on-surface-variant); }
  }

  &__sources {
    display: flex; gap: 8px; flex-wrap: wrap;
  }

  &__source-tag {
    padding: 6px 14px; border-radius: var(--md-sys-shape-corner-extra-small);
    border: 1px solid var(--glass-border);
    background: transparent; color: var(--md-sys-color-on-surface-variant);
    cursor: pointer; font: var(--md-sys-typescale-label-large);
    transition: background 150ms, color 150ms, border-color 150ms;
    &:hover { background: var(--md-sys-color-surface-container); }
    &--active {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-color: var(--md-sys-color-primary);
    }
  }

  &__loading { display: flex; flex-direction: column; gap: 12px; }

  &__placeholder {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 80px 16px; text-align: center;
  }

  &__results { display: flex; flex-direction: column; gap: 24px; }

  &__group { display: flex; flex-direction: column; gap: 10px; }

  &__group-header {
    display: flex; align-items: center; gap: 10px;
    color: var(--md-sys-color-on-surface);
  }

  &__group-list { display: flex; flex-direction: column; gap: 8px; }

  &__item {
    display: flex; align-items: center; gap: 14px;
    padding: 10px; border-radius: var(--md-sys-shape-corner-small);
    cursor: pointer; transition: transform 200ms, box-shadow 200ms;
    &:hover { transform: translateX(4px); box-shadow: var(--glow-primary); }
  }

  &__item-poster {
    width: 48px; height: 68px; object-fit: cover;
    border-radius: var(--md-sys-shape-corner-extra-small);
    flex-shrink: 0;
  }

  &__item-info {
    flex: 1; display: flex; flex-direction: column; gap: 4px;
    min-width: 0;
    span:first-child {
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
  }

  &__empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 48px 16px; text-align: center;
  }
}
</style>
