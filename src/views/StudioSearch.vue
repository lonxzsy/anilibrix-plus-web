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
      <div v-for="n in 6" :key="n" class="md3-skeleton" style="height: 80px; border-radius: 12px" />
    </div>

    <div v-else-if="query.length < 2" class="studio-search__placeholder">
      <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <p class="studio-search__placeholder-title">Введите название аниме</p>
      <p class="studio-search__placeholder-desc">Поиск выполняется по всем подключённым студиям</p>
    </div>

    <div v-else class="studio-search__results">
      <div
        v-for="group in store.searchResults"
        :key="group.source"
        class="studio-search__group"
      >
        <div v-if="group.results.length > 0" class="studio-search__group-header">
          <h3 class="studio-search__group-title">{{ sourceLabel(group.source) }}</h3>
          <span class="studio-search__group-count">{{ group.results.length }} результатов</span>
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
              <span class="studio-search__item-name">{{ item.title }}</span>
              <span class="studio-search__item-source">
                {{ sourceLabel(group.source) }}
              </span>
            </div>
            <svg class="studio-search__item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="allEmpty" class="studio-search__empty">
        <p class="studio-search__empty-title">Ничего не найдено</p>
        <p class="studio-search__empty-desc">
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
  padding-bottom: 48px;

  &__header {
    display: flex; flex-direction: column; gap: 14px;
    position: sticky; top: -28px; z-index: 10;
    padding: 18px 24px; margin: -16px -20px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);

    @include mobile {
      top: -12px;
      padding: 12px 16px;
      margin: -12px -16px;
      gap: 10px;
    }
  }

  &__search {
    display: flex; align-items: center; gap: 12px;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-medium);
    padding: 12px 18px;
    color: var(--md-sys-color-on-surface-variant);
    transition: border-color 200ms, box-shadow 200ms;
    &:focus-within {
      border-color: rgba(255, 255, 255, 0.25);
    }
  }

  &__input {
    flex: 1; background: transparent; border: none; outline: none;
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 14.5px;
    &::placeholder { color: var(--md-sys-color-on-surface-variant); opacity: 0.6; }
  }

  &__sources {
    display: flex; gap: 6px; flex-wrap: wrap;
  }

  &__source-tag {
    padding: 5px 12px; border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    font-family: var(--font-family-body);
    font-size: 12px;
    font-weight: 500;
    transition: background 150ms ease, color 150ms ease;
    &:hover { background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface); }
    &--active {
      background: #ffffff;
      color: #09090c;
      border-color: #ffffff;
      font-weight: 600;
    }

    .md3-light &--active {
      background: #1d1d1f;
      color: #ffffff;
      border-color: #1d1d1f;
    }
  }

  &__loading { display: flex; flex-direction: column; gap: 12px; }

  &__placeholder {
    display: flex; flex-direction: column; align-items: center;
    gap: 10px; padding: 70px 16px; text-align: center;
  }

  &__placeholder-title {
    font-family: var(--font-family-display);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--md-sys-color-on-surface);
  }

  &__placeholder-desc {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13.5px;
  }

  &__results { display: flex; flex-direction: column; gap: 20px; }

  &__group { display: flex; flex-direction: column; gap: 10px; }

  &__group-header {
    display: flex; align-items: center; gap: 8px;
    color: var(--md-sys-color-on-surface);
  }

  &__group-title {
    font-family: var(--font-family-body);
    font-size: 15px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
  }

  &__group-count {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12.5px;
  }

  &__group-list { display: flex; flex-direction: column; gap: 8px; }

  &__item {
    display: flex; align-items: center; gap: 14px;
    padding: 10px 14px; border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
    cursor: pointer; transition: transform 150ms ease, border-color 150ms ease;
    &:hover {
      transform: translateX(3px);
      border-color: var(--glass-border-hover);
    }
  }

  &__item-poster {
    width: 44px; height: 62px; object-fit: cover;
    border-radius: var(--md-sys-shape-corner-small);
    flex-shrink: 0;
  }

  &__item-info {
    flex: 1; display: flex; flex-direction: column; gap: 3px;
    min-width: 0;
  }

  &__item-name {
    font-family: var(--font-family-body);
    font-size: 14px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  &__item-source {
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__item-arrow {
    color: var(--md-sys-color-on-surface-variant);
    flex-shrink: 0;
  }

  &__empty {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 48px 16px; text-align: center;
  }

  &__empty-title {
    font-family: var(--font-family-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
  }

  &__empty-desc {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
  }
}
</style>
