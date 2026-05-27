<template>
  <div class="home">
    <HeroCarousel
      v-if="heroTitles.length > 0"
      :titles="heroTitles"
      @play="playTitle"
      @details="goToDetails"
    />

    <section v-if="continueWatching.length > 0" class="home__section">
      <h2 class="home__section-title md3-title-large">Продолжить просмотр</h2>
      <div class="home__grid home__grid--compact">
        <TitleCard
          v-for="entry in continueWatching"
          :key="`${entry.titleId}-${entry.episodeId}`"
          :title="getTitleFromHistory(entry)"
          :subtitle="`Серия ${entry.episodeNumber}`"
          @click="continuePlay(entry)"
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
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import HeroCarousel from '@/components/HeroCarousel.vue'
import TitleCard from '@/components/TitleCard.vue'
import type { Title, HistoryEntry } from '@/types'

const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()

const loading = computed(() => titleStore.loading)
const recentUpdates = computed(() => titleStore.recentUpdates)
const continueWatching = computed(() => libraryStore.continueWatching)
const heroTitles = computed(() => recentUpdates.value.slice(0, 5))

const scheduleToday = computed(() => {
  const today = new Date().getDay()
  const dayMap: Record<string, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  }
  return titleStore.schedule.filter((item) => {
    const day = item.release.publishDay?.value
    if (!day) return false
    return dayMap[day] === today
  })
})

function getTitleFromHistory(entry: HistoryEntry): Title {
  const title = titleStore.titles.find((t) => t.id === entry.titleId)
  if (title) return title
  return {
    id: entry.titleId,
    alias: '',
    name: { main: `Тайтл #${entry.titleId}`, english: '', alternative: '' },
    year: 0,
    episodesTotal: 0,
    isOngoing: false,
    isInProduction: false,
    updatedAt: 0,
    freshAt: 0,
  }
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

onMounted(() => {
  titleStore.fetchTitles(1, 20)
  titleStore.fetchSchedule()
  libraryStore.loadHistory()
  libraryStore.loadFavorites()
})
</script>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding-bottom: 48px;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fadeUp 500ms var(--md-sys-motion-easing-decelerate) backwards;

    @for $i from 1 through 5 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 80ms;
      }
    }
  }

  &__section-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  &__section-title {
    color: var(--md-sys-color-on-surface);
  }

  &__section-link {
    color: var(--md-sys-color-primary);
    text-decoration: none;
    transition: opacity 150ms;

    &:hover {
      opacity: 0.8;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;

    &--compact {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }

  &__scroll {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 8px;

    > * {
      flex-shrink: 0;
      width: 160px;
    }
  }
}
</style>
