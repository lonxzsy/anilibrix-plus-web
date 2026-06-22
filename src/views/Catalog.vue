<template>
  <div class="catalog">
    <div class="catalog__header glass-strong">
      <SearchBar v-model="searchQuery" placeholder="Поиск аниме..." @search="onSearch" />
      <div class="catalog__filters">
        <select
          v-model="filters.genre"
          class="catalog__filter md3-body-medium"
          @change="applyFilters"
        >
          <option value="">Все жанры</option>
          <option v-for="genre in availableGenres" :key="genre.id" :value="genre.name">
            {{ genre.name }}
          </option>
        </select>
        <select
          v-model="filters.year"
          class="catalog__filter md3-body-medium"
          @change="applyFilters"
        >
          <option value="">Все года</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
        <select
          v-model="filters.type"
          class="catalog__filter md3-body-medium"
          @change="applyFilters"
        >
          <option value="">Все типы</option>
          <option v-for="t in availableTypes" :key="t" :value="t">{{ t }}</option>
        </select>
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

    <div v-if="viewMode === 'grid'" class="catalog__grid">
      <TitleCard
        v-for="title in filteredTitles"
        :key="title.id"
        :title="title"
        @click="goToDetails(title)"
      />
      <TitleCard v-for="n in 12" v-if="loading" :key="`sk-${n}`" loading />
    </div>

    <div v-else class="catalog__list">
      <div
        v-for="title in filteredTitles"
        :key="title.id"
        class="catalog__list-item glass"
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

    <div ref="loadMoreTrigger" class="catalog__loader" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import SearchBar from '@/components/SearchBar.vue'
import TitleCard from '@/components/TitleCard.vue'
import { debounce } from '@/utils/helpers'
import type { Title } from '@/types'

const router = useRouter()
const titleStore = useTitleStore()

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const filters = ref({ genre: '', year: '', type: '' })
const currentPage = ref(1)
const loadMoreTrigger = ref<HTMLElement>()

const loading = computed(() => titleStore.loading)
const filteredTitles = computed(() => {
  let result = titleStore.filteredTitles
  if (filters.value.genre) {
    result = result.filter((t) => t.genres?.some((g) => g.name === filters.value.genre))
  }
  if (filters.value.year) {
    result = result.filter((t) => String(t.year) === filters.value.year)
  }
  if (filters.value.type) {
    result = result.filter((t) => t.type?.description === filters.value.type)
  }
  return result
})

const availableGenres = computed(() => {
  const map = new Map<number, { id: number; name: string }>()
  titleStore.titles.forEach((t) => t.genres?.forEach((g) => map.set(g.id, g)))
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

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

const applyFilters = debounce(() => {}, 100)

function onSearch(q: string) {
  currentPage.value = 1
  if (q.length >= 2) {
    titleStore.searchTitles(q)
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

onMounted(() => {
  titleStore.fetchTitles(1, 20)
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
.catalog {
  display: flex;
  flex-direction: column;
  gap: 24px;

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
  }

  &__filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
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
  }

  &__toggle {
    display: flex;
    gap: 6px;
    align-self: flex-end;
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
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
  }

  &__list-poster {
    width: 80px;
    height: 120px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-extra-small);
    flex-shrink: 0;
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
}
</style>
