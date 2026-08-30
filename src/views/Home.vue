<template>
  <div class="home">
    <HeroCarousel
      v-if="heroTitles.length > 0"
      :titles="heroTitles"
      @play="playTitle"
      @details="goToDetails"
    />

    <div class="home__quick-actions">
      <button class="home__quick-btn home__quick-btn--random glow-hover" @click="surpriseMe">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
        <span>Случайное аниме</span>
      </button>
      <router-link to="/trending" class="home__quick-btn home__quick-btn--trending glow-hover-cyan">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>Популярное</span>
      </router-link>
    </div>

    <!-- Continue Watching -->
    <section v-if="continueWatching.length > 0" class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title">
          <span class="home__section-accent" />
          Продолжить просмотр
        </h2>
        <router-link to="/library" class="home__section-link">Вся история →</router-link>
      </div>
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
        <h2 class="home__section-title">
          <span class="home__section-accent" />
          Рекомендуем вам
        </h2>
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

    <!-- Recent Updates -->
    <section class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title">
          <span class="home__section-accent" />
          Новые эпизоды
        </h2>
        <router-link to="/catalog" class="home__section-link">Смотреть все →</router-link>
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

    <!-- Today's Schedule -->
    <section v-if="scheduleToday.length > 0" class="home__section">
      <div class="home__section-header">
        <h2 class="home__section-title">
          <span class="home__section-accent" />
          Сегодня в расписании
        </h2>
        <router-link to="/schedule" class="home__section-link">Расписание недели →</router-link>
      </div>
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
const { staggerNodes } = useGsap()

const animatedNodes = new WeakSet<Element>()

function triggerStagger() {
  nextTick(() => {
    const newNodes: HTMLElement[] = []
    document
      .querySelectorAll('.home__grid, .home__scroll, .home__grid--compact')
      .forEach((grid) => {
        grid.querySelectorAll('[data-stagger]').forEach((node) => {
          const el = node as HTMLElement
          if (!animatedNodes.has(el) && el.querySelector('.title-card__name')) {
            animatedNodes.add(el)
            newNodes.push(el)
          }
        })
      })
    if (newNodes.length) staggerNodes(newNodes, { stagger: 0.05 })
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

watch([recentUpdates, continueWatching, recommendations, scheduleToday], triggerStagger)

onMounted(() => {
  titleStore.fetchTitles(1, 20).then(() => triggerStagger())
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
  gap: 36px;
  padding-bottom: 48px;

  @include mobile {
    gap: 22px;
    padding-bottom: 24px;
  }

  &__quick-actions {
    display: flex;
    gap: 10px;

    @include mobile {
      gap: 8px;
    }
  }

  &__quick-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    text-decoration: none;
    font-family: var(--font-family-body);
    font-size: 13px;
    font-weight: 600;
    transition:
      background 150ms ease,
      border-color 150ms ease,
      transform 180ms var(--md-sys-motion-easing-spring);

    svg {
      flex-shrink: 0;
      color: var(--md-sys-color-on-surface-variant);
      transition: color 150ms ease;
    }

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      border-color: var(--glass-border-hover);
      transform: translateY(-2px);

      svg {
        color: var(--md-sys-color-primary);
      }
    }

    &:active {
      transform: scale(0.97);
    }

    @include mobile {
      flex: 1;
      justify-content: center;
      padding: 9px 12px;
      font-size: 12px;
      gap: 6px;
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 14px;

    @include mobile {
      gap: 10px;
    }
  }

  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  &__section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-family-display);
    font-size: 19px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
    letter-spacing: -0.02em;

    @include mobile {
      font-size: 16px;
    }
  }

  &__section-accent {
    width: 3.5px;
    height: 16px;
    border-radius: 999px;
    background: var(--md-sys-color-primary);
  }

  &__section-link {
    color: var(--md-sys-color-primary);
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 150ms ease;

    &:hover {
      opacity: 0.75;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;

    &--compact {
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    }

    @include mobile {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      &--compact {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__scroll {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    padding-bottom: 8px;

    > * {
      flex-shrink: 0;
      width: 170px;
    }

    @include mobile {
      gap: 10px;
      > * {
        width: 135px;
      }
    }
  }
}
</style>
