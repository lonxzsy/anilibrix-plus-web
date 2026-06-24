<template>
  <div class="catalog">
    <div class="catalog__header glass-strong">
      <SearchBar v-model="searchQuery" placeholder="Поиск аниме... (Ctrl+K)" @search="onSearch" @select="onSelectSuggestion" />
      <div class="catalog__filters">
        <div class="catalog__filter-chips">
          <button
            v-for="genre in genreChips"
            :key="genre.name"
            class="catalog__chip md3-label-medium"
            :class="{ 'catalog__chip--active': activeGenre === genre.name }"
            @click="toggleGenre(genre.name)"
          >
            {{ genre.name }}
          </button>
          <button
            v-if="activeGenre"
            class="catalog__chip catalog__chip--clear"
            @click="activeGenre = ''"
          >
            ✕
          </button>
        </div>
        <div class="catalog__filter-selects">
          <select v-model="filters.year" class="catalog__filter md3-body-medium" @change="applyFilters">
            <option value="">Все года</option>
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="filters.type" class="catalog__filter md3-body-medium" @change="applyFilters">
            <option value="">Все типы</option>
            <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>
      <div class="catalog__toggle">
        <button
          class="catalog__toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          @click="viewMode = 'grid'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button
          class="catalog__toggle-btn"
          :class="{ active: viewMode === 'list' }"
          @click="viewMode = 'list'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'grid'" class="catalog__grid" data-stagger-container>
      <TitleCard
        v-for="title in filteredTitles"
        :key="title.id"
        :title="title"
        data-stagger
        :progress="getTitleProgress(title)"
        @click="goToDetails(title)"
      />
      <template v-for="n in 12" :key="`sk-${n}`">
        <TitleCard v-if="loading" loading />
      </template>
    </div>

    <div v-else class="catalog__list" data-stagger-container>
      <div
        v-for="title in filteredTitles"
        :key="title.id"
        class="catalog__list-item glass"
        data-stagger
        @click="goToDetails(title)"
      >
        <img class="catalog__list-poster" :src="posterUrl(title)" loading="lazy" alt="" />
        <div class="catalog__list-info">
          <h3 class="md3-title-medium">{{ title.name.main }}</h3>
          <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
            {{ title.year }} · {{ title.type?.description }} ·
            {{ title.isOngoing ? 'Онгоинг' : 'Завершён' }}
          </p>
          <p
            v-if="title.description"
            class="md3-body-small"
            style="color: var(--md-sys-color-on-surface-variant); margin-top: 4px"
          >
            {{ truncate(title.description, 180) }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="searchQuery && filteredTitles.length === 0 && decoderGroups.length === 0 && externalResults.length === 0 && !loading" class="catalog__no-results">
      <p class="md3-title-medium">Ничего не найдено</p>
      <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
        Попробуйте изменить запрос, проверить опечатки или использовать ключевые слова
      </p>
      <div class="catalog__tips">
        <span class="md3-label-small">Примеры: </span>
        <span class="catalog__tip md3-body-small" @click="trySearch('жанр:комедия')">жанр:комедия</span>
        <span class="catalog__tip md3-body-small" @click="trySearch('год:2024')">год:2024</span>
        <span class="catalog__tip md3-body-small" @click="trySearch('статус:онгоинг')">статус:онгоинг</span>
        <span class="catalog__tip md3-body-small" @click="trySearch('тип:тв')">тип:тв</span>
      </div>
    </div>

    <div v-if="searchQuery && decoderGroups.length > 0" class="catalog__decoder">
      <div class="catalog__decoder-header">
        <h3 class="md3-title-small">Другие студии</h3>
        <span v-if="decoderLoading" class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">загрузка...</span>
      </div>
      <div v-for="group in decoderGroups" :key="group.source" class="catalog__decoder-group">
        <div class="catalog__decoder-subheader">
          <span class="md3-label-large">{{ sourceLabel(group.source) }}</span>
          <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">{{ group.results.length }}</span>
        </div>
        <div v-if="viewMode === 'grid'" class="catalog__grid">
          <div
            v-for="item in group.results"
            :key="item.id"
            class="catalog__decoder-card"
            @click="goToDecoderItem(group.source, item)"
          >
            <img class="catalog__decoder-card-img" :src="item.thumbnail" loading="lazy" alt="" />
            <div class="catalog__decoder-card-info">
              <span class="md3-label-small">{{ item.title }}</span>
            </div>
          </div>
        </div>
        <div v-else class="catalog__list">
          <div
            v-for="item in group.results"
            :key="item.id"
            class="catalog__list-item glass"
            @click="goToDecoderItem(group.source, item)"
          >
            <img class="catalog__list-poster" :src="item.thumbnail" loading="lazy" alt="" />
            <div class="catalog__list-info">
              <h3 class="md3-title-medium">{{ item.title }}</h3>
              <p class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
                {{ sourceLabel(group.source) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="externalResults.length > 0 && searchQuery" class="catalog__external">
      <div class="catalog__external-header">
        <h3 class="md3-title-small">Другие результаты с MyAnimeList</h3>
        <span v-if="externalLoading" class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">загрузка...</span>
      </div>
      <div v-if="viewMode === 'grid'" class="catalog__grid">
        <TitleCard
          v-for="title in externalResults"
          :key="title.id"
          :title="title"
          :external="true"
          @click="onExternalTitleClick(title)"
        />
      </div>
      <div v-else class="catalog__list">
        <div
          v-for="title in externalResults"
          :key="title.id"
          class="catalog__list-item glass catalog__list-item--external"
          @click="onExternalTitleClick(title)"
        >
          <img class="catalog__list-poster catalog__list-poster--external" :src="posterUrl(title)" loading="lazy" alt="" />
          <div class="catalog__list-info">
            <h3 class="md3-title-medium" style="color: var(--md-sys-color-on-surface-variant)">{{ title.name.main }}</h3>
            <p class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant); opacity: 0.6">
              {{ title.year }} · {{ title.type?.description }} ·
              <span v-if="title.score">⭐ {{ title.score.toFixed(1) }}</span>
            </p>
            <p
              v-if="title.description"
              class="md3-body-small"
              style="color: var(--md-sys-color-on-surface-variant); opacity: 0.5; margin-top: 4px"
            >
              {{ truncate(title.description, 180) }}
            </p>
            <span class="catalog__external-label">Нет в Anilibria</span>
          </div>
        </div>
      </div>
    </div>

    <div ref="loadMoreTrigger" class="catalog__loader" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import { useDecoderStore } from '@/stores/decoder'
import { useGsap } from '@/composables/useGsap'
import SearchBar from '@/components/SearchBar.vue'
import TitleCard from '@/components/TitleCard.vue'
import { debounce } from '@/utils/helpers'
import { addSearchHistory } from '@/utils/search'
import { SOURCES } from '@/api/decoder'
import type { Title } from '@/types'
import type { DecoderSearchItem } from '@/api/decoder'

const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()
const decoderStore = useDecoderStore()
const { staggerCards } = useGsap()

const decoderLoading = computed(() => decoderStore.loading)

const decoderGroups = computed(() =>
  decoderStore.searchResults.filter((g) => g.results.length > 0)
)

function sourceLabel(name: string) {
  return SOURCES.find((s) => s.name === name)?.label || name
}

function goToDecoderItem(source: string, item: DecoderSearchItem) {
  router.push(`/studios/${source}/${encodeURIComponent(item.id)}?title=${encodeURIComponent(item.title)}`)
}

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const filters = ref({ year: '', type: '' })
const activeGenre = ref('')
const currentPage = ref(1)
const loadMoreTrigger = ref<HTMLElement>()

const loading = computed(() => titleStore.loading)
const externalLoading = computed(() => titleStore.externalLoading)
const filteredTitles = computed(() => {
  let result = titleStore.filteredTitles
  if (activeGenre.value) {
    result = result.filter((t) => t.genres?.some((g) => g.name === activeGenre.value))
  }
  if (filters.value.year) {
    result = result.filter((t) => String(t.year) === filters.value.year)
  }
  if (filters.value.type) {
    result = result.filter((t) => t.type?.description === filters.value.type)
  }
  return result
})

const genreChips = computed(() => {
  const map = new Map<number, { id: number; name: string }>()
  titleStore.titles.forEach((t) => t.genres?.forEach((g) => map.set(g.id, g)))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name)).slice(0, 12)
})

function toggleGenre(name: string) {
  activeGenre.value = activeGenre.value === name ? '' : name
}

const externalResults = computed(() => titleStore.externalTitles)

const availableYears = computed(() => {
  const set = new Set<string>()
  titleStore.titles.forEach((t) => {
    if (t.year) set.add(String(t.year))
  })
  return Array.from(set).sort((a, b) => Number(b) - Number(a))
})

const availableTypes = computed(() => {
  const set = new Set<string>()
  titleStore.titles.forEach((t) => {
    if (t.type?.description) set.add(t.type.description)
  })
  return Array.from(set).sort()
})

function posterUrl(title: Title) {
  return title.poster?.preview || title.poster?.src || title.poster?.thumbnail || ''
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '...' : str
}

function goToDetails(title: Title) {
  router.push(`/title/${title.id}`)
}

function getTitleProgress(title: Title) {
  const hist = libraryStore.history.find((h) => h.titleId === title.id)
  if (!hist?.duration) return undefined
  return Math.round((hist.timestamp / hist.duration) * 100)
}

function onSelectSuggestion(title: Title) {
  goToDetails(title)
}

function trySearch(q: string) {
  searchQuery.value = q
  onSearch(q)
}

function onExternalTitleClick(title: Title) {
  window.open(`https://myanimelist.net/anime/${title.malId}`, '_blank')
}

function applyFilters() {
  currentPage.value = 1
  titleStore.fetchTitles(1, 20)
}

function onSearch(q: string) {
  currentPage.value = 1
  if (q.length >= 2) {
    addSearchHistory(q)
    titleStore.searchTitles(q)
    decoderStore.searchAll(q)
  } else if (q.length === 0) {
    titleStore.fetchTitles(1, 20)
  }
}

function loadMore() {
  if (loading.value) return
  currentPage.value++
  if (searchQuery.value.length >= 2) {
    titleStore.fetchTitles(currentPage.value, 20, searchQuery.value)
  } else {
    titleStore.fetchTitles(currentPage.value, 20)
  }
}

watch(searchQuery, (val) => {
  titleStore.setSearchQuery(val)
})

let titleWatchSkipped = true

function triggerStagger() {
  nextTick(() => {
    const grid = document.querySelector('.catalog__grid') || document.querySelector('.catalog__list')
    if (grid) staggerCards(grid as HTMLElement)
  })
}

watch(filteredTitles, () => {
  if (titleWatchSkipped) { titleWatchSkipped = false; return }
  triggerStagger()
})
watch(viewMode, triggerStagger)

onMounted(() => {
  titleStore.fetchTitles(1, 20)
  libraryStore.loadHistory()
  if (loadMoreTrigger.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    observer.observe(loadMoreTrigger.value)
  }
})
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.catalog {
  display: flex;
  flex-direction: column;
  gap: 24px;

  @include mobile {
    gap: 16px;
  }

  &__header {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: -28px;
    z-index: 10;
    padding: 16px 20px;
    margin: -16px -20px;
    border-radius: var(--md-sys-shape-corner-small);

    @include mobile {
      top: -12px;
      padding: 12px 16px;
      margin: -12px -16px;
      gap: 10px;
    }
  }

  &__filters {
    display: flex;
    flex-direction: column;
    gap: 10px;

    @include mobile {
      gap: 8px;
    }
  }

  &__filter-chips {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  &__chip {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    font-size: 12px;
    transition: background 150ms, color 150ms, border-color 150ms, box-shadow 150ms;
    white-space: nowrap;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface);
    }

    &--active {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 8px rgba(184, 165, 232, 0.15);
    }

    &--clear {
      color: var(--md-sys-color-on-surface-variant);
      padding: 6px 10px;
      font-size: 11px;
      &:hover {
        background: rgba(224, 138, 133, 0.1);
        color: var(--md-sys-color-error);
        border-color: rgba(224, 138, 133, 0.2);
      }
    }

    @include mobile {
      font-size: 11px;
      padding: 4px 12px;
    }
  }

  &__filter-selects {
    display: flex;
    gap: 10px;

    @include mobile {
      gap: 8px;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }

  &__filter {
    -webkit-appearance: none;
    appearance: none;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    padding: 8px 32px 8px 14px;
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    outline: none;
    min-width: 140px;
    font-size: 13px;
    transition:
      border-color 200ms,
      background 200ms;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a8a3ad' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;

    &:focus {
      border-color: rgba(184, 165, 232, 0.3);
      background-color: var(--md-sys-color-surface-container-high);
    }

    option {
      background: var(--md-sys-color-surface-container);
      color: var(--md-sys-color-on-surface);
      padding: 8px 12px;
    }

    @include mobile {
      min-width: 0;
      width: 100%;
      font-size: 12px;
      padding: 8px 28px 8px 10px;
    }
  }

  &__toggle {
    display: flex;
    gap: 6px;
    align-self: flex-end;

    @include mobile {
      align-self: flex-start;
    }
  }

  &__toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    padding: 6px;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition:
      background 150ms,
      color 150ms,
      border-color 150ms;

    &.active {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-color: rgba(184, 165, 232, 0.2);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;

    @include mobile {
      gap: 8px;
    }
  }

  &__list-item {
    display: flex;
    gap: 16px;
    padding: 12px;
    border-radius: var(--md-sys-shape-corner-small);
    cursor: pointer;
    transition:
      transform 200ms var(--md-sys-motion-easing-standard),
      box-shadow 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      transform: translateX(4px);
      box-shadow: var(--glow-primary);
    }

    @include mobile {
      gap: 10px;
      padding: 10px;
    }
  }

  &__list-poster {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-extra-small);
    flex-shrink: 0;

    @include mobile {
      width: 60px;
      height: 90px;
    }
  }

  &__list-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  &__loader {
    height: 40px;
  }

  &__no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 48px 16px;
    text-align: center;
  }

  &__tips {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 8px;
  }

  &__tip {
    background: var(--md-sys-color-surface-container);
    padding: 4px 10px;
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-primary);
    cursor: pointer;
    transition: background 150ms;

    &:hover {
      background: var(--md-sys-color-primary-container);
    }
  }

  &__decoder {
    display: flex; flex-direction: column; gap: 20px;
    padding-top: 8px; border-top: 1px solid var(--glass-border);
  }

  &__decoder-header {
    display: flex; align-items: center; gap: 8px;
    color: var(--md-sys-color-on-surface);
  }

  &__decoder-group { display: flex; flex-direction: column; gap: 10px; }

  &__decoder-subheader {
    display: flex; align-items: center; gap: 8px;
    color: var(--md-sys-color-on-surface-variant);
    padding-left: 4px;
  }

  &__decoder-card {
    display: flex; flex-direction: column; gap: 6px;
    cursor: pointer; border-radius: var(--md-sys-shape-corner-small);
    overflow: hidden; background: var(--md-sys-color-surface-container);
    transition: transform 250ms var(--md-sys-motion-easing-spring), box-shadow 250ms;
    &:hover { transform: translateY(-4px); box-shadow: var(--glow-primary), 0 8px 24px rgba(0,0,0,0.4); }
  }

  &__decoder-card-img {
    width: 100%; aspect-ratio: 3/4; object-fit: cover;
    background: var(--md-sys-color-surface-container-high);
  }

  &__decoder-card-info {
    padding: 4px 10px 10px;
    span { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  }

  &__external {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 8px;
    border-top: 1px solid var(--glass-border);
  }

  &__external-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__external-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    color: var(--md-sys-color-on-surface-variant);
    background: var(--md-sys-color-surface-container);
    padding: 2px 8px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    margin-top: 6px;
    align-self: flex-start;
  }

  &__list-item--external {
    opacity: 0.7;
    cursor: pointer;

    &:hover {
      transform: translateX(4px);
      box-shadow: var(--glow-primary);
    }
  }

  &__list-poster--external {
    filter: grayscale(0.6);
    opacity: 0.6;
  }
}
</style>
