<template>
  <div class="trending">
    <div class="trending__header">
      <h1 class="trending__title md3-headline-medium">Популярное</h1>
      <p class="trending__subtitle md3-body-large">Топ аниме по рейтингу MyAnimeList</p>
    </div>

    <div class="trending__controls">
      <div class="trending__sort">
        <button
          v-for="opt in sortOptions"
          :key="opt.value"
          class="trending__sort-btn md3-label-large"
          :class="{ 'trending__sort-btn--active': sortBy === opt.value }"
          @click="sortBy = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
      <div class="trending__view-toggle">
        <button class="trending__toggle-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <button class="trending__toggle-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <div v-if="loading" class="trending__skeletons">
      <div v-for="n in 12" :key="n" class="md3-skeleton" style="height: 280px; border-radius: 6px" />
    </div>

    <div v-else-if="sortedTitles.length === 0" class="trending__empty">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--md-sys-color-on-surface-variant)">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">Нет данных для отображения</span>
    </div>

    <template v-else>
      <div v-if="viewMode === 'grid'" class="trending__grid">
        <div
          v-for="(title, i) in sortedTitles"
          :key="title.id"
          ref="cardRefs"
          class="trending__card"
          :data-stagger="true"
          @click="goToDetails(title)"
        >
          <div class="trending__card-poster">
            <span class="trending__card-rank">#{{ i + 1 + (currentPage - 1) * perPage }}</span>
            <img :src="posterUrl(title)" :alt="title.name.main" loading="lazy" />
            <div class="trending__card-overlay">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
          <div class="trending__card-info">
            <h3 class="trending__card-name md3-body-medium">{{ title.name.main }}</h3>
            <div class="trending__card-meta">
              <span class="trending__card-score">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                {{ (title as any).score?.toFixed(1) || '—' }}
              </span>
              <span v-if="title.year" class="trending__card-year">{{ title.year }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="trending__list">
        <div
          v-for="(title, i) in sortedTitles"
          :key="title.id"
          class="trending__list-item"
          :data-stagger="true"
          @click="goToDetails(title)"
        >
          <span class="trending__list-rank">#{{ i + 1 + (currentPage - 1) * perPage }}</span>
          <img class="trending__list-poster" :src="posterUrl(title)" loading="lazy" alt="" />
          <div class="trending__list-info">
            <h3 class="md3-title-medium">{{ title.name.main }}</h3>
            <p class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
              {{ title.year }} · {{ (title as any).type?.description || '' }}
              <span v-if="(title as any).score"> · ⭐ {{ (title as any).score.toFixed(1) }}</span>
            </p>
            <p v-if="(title as any).description" class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant); margin-top: 4px">
              {{ truncate((title as any).description, 160) }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="trending__pagination">
        <button class="trending__page-btn" :disabled="currentPage <= 1" @click="currentPage--">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <span class="md3-body-medium">{{ currentPage }} / {{ totalPages }}</span>
        <button class="trending__page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useGsap } from '@/composables/useGsap'
import type { Title } from '@/types'

const router = useRouter()
const titleStore = useTitleStore()
const { staggerCards } = useGsap()

const sortBy = ref<'score' | 'year' | 'title'>('score')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const perPage = 24

const loading = ref(false)

const sortOptions = [
  { value: 'score' as const, label: 'По рейтингу' },
  { value: 'year' as const, label: 'По году' },
  { value: 'title' as const, label: 'По названию' },
]

const scoredTitles = computed(() =>
  titleStore.titles
    .filter((t) => (t as any).score != null)
    .map((t) => ({
      ...t,
      score: (t as any).score ?? 0,
    }))
)

const sortedTitles = computed(() => {
  let list = [...scoredTitles.value]
  if (sortBy.value === 'score') {
    list.sort((a, b) => b.score - a.score)
  } else if (sortBy.value === 'year') {
    list.sort((a, b) => (b.year || 0) - (a.year || 0))
  } else {
    list.sort((a, b) => a.name.main.localeCompare(b.name.main))
  }
  const start = (currentPage.value - 1) * perPage
  return list.slice(start, start + perPage)
})

const totalPages = computed(() => Math.ceil(scoredTitles.value.length / perPage))

const cardRefs = ref<HTMLElement[]>([])

function posterUrl(title: Title) {
  return title.poster?.preview || title.poster?.src || title.poster?.thumbnail || ''
}

function truncate(str: string, len: number) {
  return str.length > len ? str.slice(0, len) + '...' : str
}

function goToDetails(title: Title) {
  router.push(`/title/${title.id}`)
}

watch([sortedTitles, viewMode], async () => {
  await nextTick()
  const el = document.querySelector('.trending__grid') || document.querySelector('.trending__list')
  if (el) staggerCards(el as HTMLElement)
})

onMounted(async () => {
  loading.value = true
  if (titleStore.titles.length === 0) {
    await titleStore.fetchTitles(1, 50)
  }
  loading.value = false
  await nextTick()
  const el = document.querySelector('.trending__grid') || document.querySelector('.trending__list')
  if (el) staggerCards(el as HTMLElement)
})
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.trending {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 36px;

  &__header {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__title {
    font-family: var(--font-family-display);
    font-size: 26px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
    letter-spacing: -0.025em;
  }

  &__subtitle {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13.5px;
    font-weight: 400;
  }

  &__controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    @include mobile {
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
  }

  &__sort {
    display: flex;
    gap: 6px;
  }

  &__sort-btn {
    padding: 6px 14px;
    border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 500;
    transition: background 150ms ease, color 150ms ease;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      color: var(--md-sys-color-on-surface);
    }

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

  &__view-toggle {
    display: flex;
    gap: 4px;

    @include mobile {
      align-self: flex-end;
    }
  }

  &__toggle-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--glass-border);
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    transition: background 150ms ease, color 150ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      color: var(--md-sys-color-on-surface);
    }

    &.active {
      background: rgba(255, 255, 255, 0.14);
      color: var(--md-sys-color-on-surface);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  &__card {
    cursor: pointer;
    border-radius: var(--md-sys-shape-corner-medium);
    overflow: hidden;
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    transition: transform 180ms ease, border-color 150ms ease;

    &:hover {
      transform: translateY(-4px);
      border-color: var(--glass-border-hover);
      .trending__card-overlay { opacity: 1; }
    }

    &-poster {
      position: relative;
      aspect-ratio: 2/3;
      overflow: hidden;
      background: var(--md-sys-color-surface-container-high);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    &-rank {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 2;
      padding: 2px 7px;
      border-radius: var(--md-sys-shape-corner-small);
      background: rgba(18, 19, 26, 0.85);
      backdrop-filter: blur(12px);
      color: #ffffff;
      font-family: var(--font-family-body);
      font-size: 11px;
      font-weight: 700;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    &:nth-child(1) &-rank {
      color: #ffb800;
      border-color: rgba(255, 184, 0, 0.35);
    }

    &:nth-child(2) &-rank {
      color: #e0e0e0;
    }

    &:nth-child(3) &-rank {
      color: #cd7f32;
    }

    &-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.35);
      opacity: 0;
      transition: opacity 150ms ease;

      svg {
        color: #ffffff;
      }
    }

    &-info {
      padding: 8px 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    &-name {
      color: var(--md-sys-color-on-surface);
      font-family: var(--font-family-body);
      font-size: 13.5px;
      font-weight: 600;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.35;
    }

    &-meta {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &-score {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      color: var(--color-score-gold);
      font-family: var(--font-family-body);
      font-size: 11.5px;
      font-weight: 700;
    }

    &-year {
      color: var(--md-sys-color-on-surface-variant);
      font-size: 11.5px;
      font-weight: 500;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__list-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    transition: transform 150ms ease, border-color 150ms ease;

    &:hover {
      transform: translateX(3px);
      border-color: var(--glass-border-hover);
    }
  }

  &__list-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-weight: 700;
    font-size: 13px;
    flex-shrink: 0;
  }

  &__list-item:nth-child(1) &__list-rank {
    background: rgba(255, 184, 0, 0.15);
    color: #ffb800;
  }

  &__list-item:nth-child(2) &__list-rank {
    background: rgba(255, 255, 255, 0.15);
    color: #e0e0e0;
  }

  &__list-item:nth-child(3) &__list-rank {
    background: rgba(205, 127, 50, 0.15);
    color: #cd7f32;
  }

  &__list-poster {
    width: 54px;
    height: 80px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-small);
    flex-shrink: 0;

    @include mobile {
      width: 46px;
      height: 68px;
    }
  }

  &__list-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;

    h3 {
      font-family: var(--font-family-body);
      font-size: 14.5px;
      font-weight: 600;
      color: var(--md-sys-color-on-surface);
    }
  }

  &__skeletons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 48px 16px;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 20px 0;
  }

  &__page-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    transition: background 150ms ease;

    &:hover:not(:disabled) {
      background: var(--md-sys-color-surface-container-high);
    }

    &:disabled {
      opacity: 0.35;
      cursor: default;
    }
  }
}
</style>
