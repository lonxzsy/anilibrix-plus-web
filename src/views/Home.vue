<template>
  <div class="home">
    <HeroCarousel
      v-if="heroTitles.length > 0"
      :titles="heroTitles"
      @play="playTitle"
      @details="goToDetails"
    />

    <div class="home__quick-actions">
      <button class="home__quick-btn" @click="surpriseMe">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        <span class="md3-label-large">Случайное аниме</span>
      </button>
      <router-link to="/trending" class="home__quick-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span class="md3-label-large">Популярное</span>
      </router-link>
    </div>

    <section v-if="continueWatching.length > 0" class="home__section">
      <h2 class="home__section-title md3-title-large">Продолжить просмотр</h2>
      <div class="home__grid home__grid--compact">
        <TitleCard
          v-for="entry in continueWatching"
          :key="`${entry.titleId}-${entry.episodeId}`"
          :title="getTitleFromHistory(entry)"
          :subtitle="`Серия ${entry.episodeNumber}`"
          :progress="getProgressPercent(entry)"
          @click="continuePlay(entry)"
        />
      </div>
    </section>

    <!-- Recommendations -->
    <section v-if="recommendations.length > 0" class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title md3-title-large">Рекомендуем</h2>
      </div>
      <div class="home__grid">
        <TitleCard
          v-for="title in recommendations"
          :key="title.id"
          :title="title"
          @click="goToDetails(title)"
        />
      </div>
    </section>

    <section class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title md3-title-large">Новые эпизоды</h2>
        <router-link to="/catalog" class="home__section-link md3-label-large"> Все → </router-link>
      </div>
      <div class="home__grid">
        <TitleCard
          v-for="title in recentUpdates"
          :key="title.id"
          :title="title"
          :progress="getTitleProgress(title)"
          @click="goToDetails(title)"
        />
        <TitleCard v-for="n in 6" v-if="loading" :key="`sk-${n}`" loading />
      </div>
    </section>

    <section v-if="scheduleToday.length > 0" class="home__section">
      <h2 class="home__section-title md3-title-large">Сегодня в расписании</h2>
      <div class="home__scroll">
        <TitleCard
          v-for="item in scheduleToday"
          :key="item.release.id"
          :title="item.release"
          @click="goToDetails(item.release)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import { useToast } from '@/composables/useToast'
import { useGsap } from '@/composables/useGsap'
import HeroCarousel from '@/components/HeroCarousel.vue'
import TitleCard from '@/components/TitleCard.vue'
import type { Title, HistoryEntry } from '@/types'

const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()
const { info } = useToast()
const { staggerCards } = useGsap()

function triggerStagger() {
  nextTick(() => {
    document.querySelectorAll('.home__grid, .home__scroll, .home__grid--compact').forEach((grid) => {
      staggerCards(grid as HTMLElement, { stagger: 0.05 })
    })
  })
}

const loading = computed(() => titleStore.loading)
const recentUpdates = computed(() => titleStore.recentUpdates)
const continueWatching = computed(() => libraryStore.continueWatching)
const heroTitles = computed(() => recentUpdates.value.slice(0, 5))

const scheduleToday = computed(() => {
  const today = new Date().getDay()
  const dayMap: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 }
  return titleStore.schedule.filter((item) => {
    const day = item.release.publishDay?.value
    if (!day) return false
    return dayMap[day] === today
  })
})

const recommendations = computed(() => {
  if (libraryStore.history.length === 0) return []
  const watchedGenreIds = new Set<number>()
  libraryStore.history.forEach((entry) => {
    const t = titleStore.titles.find((tt) => tt.id === entry.titleId)
    t?.genres?.forEach((g) => watchedGenreIds.add(g.id))
  })
  if (watchedGenreIds.size === 0) return []
  const watchedIds = new Set(libraryStore.history.map((h) => h.titleId))
  const scored = titleStore.titles
    .filter((t) => !watchedIds.has(t.id))
    .map((t) => ({
      title: t,
      score: t.genres?.reduce((acc, g) => acc + (watchedGenreIds.has(g.id) ? 1 : 0), 0) ?? 0,
    }))
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score)
  return scored.slice(0, 12).map((s) => s.title)
})

function getTitleFromHistory(entry: HistoryEntry): Title {
  const t = titleStore.titles.find((tt) => tt.id === entry.titleId)
  if (t) return t
  return { id: entry.titleId, alias: '', name: { main: `Тайтл #${entry.titleId}`, english: '', alternative: '' }, year: 0, episodesTotal: 0, isOngoing: false, isInProduction: false, updatedAt: 0, freshAt: 0 }
}

function getProgressPercent(entry: HistoryEntry) {
  if (!entry.duration) return 0
  return Math.round((entry.timestamp / entry.duration) * 100)
}

function getTitleProgress(title: Title) {
  const hist = libraryStore.history.find((h) => h.titleId === title.id)
  if (!hist?.duration) return undefined
  return Math.round((hist.timestamp / hist.duration) * 100)
}

function goToDetails(title: Title) {
  router.push(`/title/${title.id}`)
}

function playTitle(title: Title) {
  router.push(`/player/${title.id}`)
}

function continuePlay(entry: HistoryEntry) {
  router.push(`/player/${entry.titleId}/${entry.episodeId}`)
}

function surpriseMe() {
  const all = titleStore.titles
  if (all.length === 0) return
  const pick = all[Math.floor(Math.random() * all.length)]
  info(`🎲 ${pick.name.main}`)
  router.push(`/title/${pick.id}`)
}

let watchSkipped = true

watch([recentUpdates, continueWatching, recommendations, scheduleToday], () => {
  if (watchSkipped) { watchSkipped = false; return }
  triggerStagger()
})

onMounted(() => {
  titleStore.fetchTitles(1, 20)
  titleStore.fetchSchedule()
  libraryStore.loadHistory()
  libraryStore.loadFavorites()
})
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.home {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 48px;

  @include mobile { gap: 24px; padding-bottom: 24px; }

  &__quick-actions {
    display: flex;
    gap: 10px;

    @include mobile { gap: 8px; }
  }

  &__quick-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    text-decoration: none;
    font: var(--md-sys-typescale-label-large);
    transition: background 150ms, transform 200ms var(--md-sys-motion-easing-spring), box-shadow 200ms;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      transform: translateY(-2px);
      box-shadow: var(--glow-primary);
    }

    &:active { transform: scale(0.97); }

    svg { color: var(--md-sys-color-primary); flex-shrink: 0; }

    @include mobile {
      flex: 1;
      justify-content: center;
      padding: 10px 14px;
      font-size: 12px;
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;

    &:nth-child(1) { animation: fadeUp 500ms backwards; }
    &:nth-child(2) { animation: fadeUp 500ms 80ms backwards; }
    &:nth-child(3) { animation: fadeUp 500ms 160ms backwards; }
    &:nth-child(4) { animation: fadeUp 500ms 240ms backwards; }
    &:nth-child(5) { animation: fadeUp 500ms 320ms backwards; }
    &:nth-child(6) { animation: fadeUp 500ms 400ms backwards; }

    @include mobile { gap: 12px; }
  }

  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  &__section-title { color: var(--md-sys-color-on-surface); }

  &__section-link {
    color: var(--md-sys-color-primary);
    text-decoration: none;
    transition: opacity 150ms;
    &:hover { opacity: 0.8; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;

    &--compact {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      &--compact { grid-template-columns: repeat(2, 1fr); }
    }
  }

  &__scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 8px;

    > * { flex-shrink: 0; width: 160px; }

    @include mobile {
      gap: 10px;
      > * { width: 140px; }
    }
  }
}
</style>
