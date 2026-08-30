<template>
  <div v-if="title" ref="detailRef" class="title-detail">
    <div ref="headerRef" class="title-detail__header" :style="headerBgStyle">
      <div class="title-detail__glow" />
      <div class="title-detail__overlay" />
      <div class="title-detail__header-content">
        <div class="title-detail__poster-wrap">
          <img ref="posterRef" class="title-detail__poster" :src="posterUrl" :alt="title.name.main" />
        </div>
        <div class="title-detail__info">
          <div class="title-detail__metadata">
            <span v-if="title.year" class="title-detail__meta-tag">{{ title.year }}</span>
            <span v-if="title.type?.description" class="title-detail__meta-tag">{{ title.type.description }}</span>
            <span v-if="title.isOngoing" class="title-detail__meta-tag title-detail__meta-tag--ongoing">
              <span class="title-detail__dot" />
              Онгоинг
            </span>
            <a
              v-if="jikanData?.anime.score"
              :href="jikanData.anime.url"
              target="_blank"
              rel="noopener noreferrer"
              class="title-detail__meta-tag title-detail__mal-score"
              :title="`MAL рейтинг на основе ${jikanData.anime.scoredBy.toLocaleString('ru')} голосов`"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span>{{ jikanData.anime.score.toFixed(2) }}</span>
            </a>
          </div>
          <h1 class="title-detail__name">{{ title.name.main }}</h1>
          <p v-if="title.name.english" class="title-detail__english">{{ title.name.english }}</p>
          <div v-if="title.genres?.length" class="title-detail__genres">
            <span v-for="genre in title.genres" :key="genre.id" class="title-detail__genre">{{ genre.name }}</span>
          </div>
          <div class="title-detail__actions">
            <button class="title-detail__fab title-detail__fab--primary" @click="play">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              <span>Смотреть</span>
            </button>
            <button class="title-detail__fab title-detail__fab--secondary" :class="{ 'title-detail__fab--active': isFav }" @click="toggleFavorite">
              <svg class="title-detail__star" width="18" height="18" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              <span class="title-detail__label-wrap">
                <span class="title-detail__label title-detail__label--off">В избранное</span>
                <span class="title-detail__label title-detail__label--on">В избранном</span>
              </span>
            </button>
            <button class="title-detail__fab title-detail__fab--secondary" @click="shareTitle">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              <span>Поделиться</span>
            </button>
          </div>
          <!-- User rating -->
          <div class="title-detail__user-rating">
            <span class="title-detail__rating-label">Моя оценка</span>
            <div class="title-detail__stars">
              <button
                v-for="star in 10"
                :key="star"
                class="title-detail__star-btn"
                :class="{ 'title-detail__star-btn--active': userRating >= star }"
                :title="`${star}/10`"
                @click="setRating(star)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="userRating >= star ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </button>
            </div>
            <span v-if="userRating" class="title-detail__rating-val">{{ userRating }}/10</span>
          </div>
        </div>
      </div>
    </div>

    <div class="title-detail__tabs-wrapper">
      <div class="title-detail__tabs" ref="tabsRef">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="title-detail__tab"
          :class="{ 'title-detail__tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="title-detail__content">
      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab">
          <div v-if="activeTab === 'description'" class="title-detail__description">
            <p class="title-detail__desc-text">
              {{ title.description || 'Описание отсутствует.' }}
            </p>

            <div v-if="jikanData" class="title-detail__mal-section">
              <div v-if="jikanData.anime.trailer.embedUrl" class="title-detail__trailer">
                <h3 class="title-detail__section-title">Трейлер</h3>
                <div class="title-detail__trailer-embed">
                  <iframe :src="jikanData.anime.trailer.embedUrl" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Трейлер" />
                </div>
              </div>

              <div v-if="jikanData.stats" class="title-detail__stats">
                <h3 class="title-detail__section-title">Распределение оценок MAL</h3>
                <div class="title-detail__stats-bar">
                  <div v-for="s in jikanData.stats.scores" :key="s.score" class="title-detail__stats-item" :title="`${s.score} — ${s.votes.toLocaleString('ru')} голосов (${s.percentage}%)`">
                    <span class="title-detail__stats-label">{{ s.score }}</span>
                    <div class="title-detail__stats-track">
                      <div class="title-detail__stats-fill" :style="{ height: `${s.percentage * 1.8}%` }" :class="{ 'title-detail__stats-fill--high': s.score >= 8, 'title-detail__stats-fill--mid': s.score >= 5 && s.score < 8 }" />
                    </div>
                  </div>
                </div>
                <div class="title-detail__stats-total">
                  На основе {{ jikanData.stats.total.toLocaleString('ru') }} оценок
                </div>
              </div>
            </div>
            <div v-if="jikanLoading" class="title-detail__mal-loading">
              <div class="md3-skeleton" style="height: 60px; border-radius: 12px; max-width: 400px" />
            </div>
          </div>

          <div v-else-if="activeTab === 'episodes'" class="title-detail__episodes">
            <div v-for="ep in episodes" :key="ep.id" class="title-detail__episode" @click="playEpisode(ep)">
              <div class="title-detail__episode-thumb">
                <img v-if="ep.preview?.src" :src="ep.preview.src" loading="lazy" alt="" />
                <div v-else class="title-detail__episode-placeholder"><span>{{ ep.ordinal }}</span></div>
                <div class="title-detail__episode-progress"><div class="title-detail__episode-progress-bar" :style="{ width: `${getProgress(ep)}%` }" /></div>
                <div class="title-detail__episode-overlay"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
              </div>
              <div class="title-detail__episode-info">
                <span class="title-detail__episode-name">{{ ep.name }}</span>
                <span class="title-detail__episode-meta">Серия {{ ep.ordinal }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'characters'" class="title-detail__characters">
            <div v-if="jikanData?.characters.length" class="title-detail__character-grid">
              <CharacterCard v-for="(entry, i) in jikanData.characters" :key="entry.character.malId" :entry="entry" :style="{ animationDelay: `${i * 40}ms` }" />
            </div>
            <div v-else-if="jikanLoading" class="title-detail__character-skeletons">
              <div v-for="n in 8" :key="n" class="md3-skeleton" style="height: 280px; border-radius: 14px" />
            </div>
            <p v-else class="title-detail__desc-text">
              {{ jikanStore.error || 'Информация о персонажах не найдена.' }}
            </p>
          </div>

          <div v-else-if="activeTab === 'related'" class="title-detail__related">
            <div v-if="relatedTitles.length > 0" class="title-detail__grid">
              <TitleCard v-for="t in relatedTitles" :key="t.id" :title="t" @click="goToDetails(t)" />
            </div>
            <div v-else-if="relatedLoading" class="title-detail__grid">
              <div v-for="n in 6" :key="n" class="md3-skeleton" style="height: 260px; border-radius: 14px" />
            </div>
            <p v-else class="title-detail__desc-text">Похожие тайтлы не найдены.</p>
          </div>

          <div v-else-if="activeTab === 'torrents'" class="title-detail__torrents">
            <div v-if="torrents.length > 0" class="title-detail__torrent-list">
              <div v-for="t in torrents" :key="t.id" class="title-detail__torrent-item">
                <div class="title-detail__torrent-info">
                  <div class="title-detail__torrent-header">
                    <span class="title-detail__torrent-quality">{{ t.quality.value }}</span>
                    <span v-if="bestTorrent?.id === t.id" class="title-detail__torrent-best">Лучшее качество</span>
                  </div>
                  <span class="title-detail__torrent-meta">{{ t.type.value }} · {{ t.codec.value }} · {{ t.color.value }} · {{ formatBytes(t.size) }}</span>
                  <span class="title-detail__torrent-seeders">{{ t.seeders }} сидов · {{ t.leechers }} личей</span>
                  <span v-if="t.description" class="title-detail__torrent-desc">{{ t.description }}</span>
                </div>
                <div class="title-detail__torrent-actions">
                  <button class="title-detail__torrent-btn" @click="openTorrent(t)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    .torrent
                  </button>
                  <button class="title-detail__torrent-btn title-detail__torrent-btn--magnet" @click="openMagnet(t)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    Magnet
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="torrentsLoading" class="title-detail__torrent-skeletons">
              <div v-for="n in 3" :key="n" class="md3-skeleton" style="height: 90px; border-radius: 12px; margin-bottom: 12px" />
            </div>
            <p v-else class="title-detail__desc-text">Торренты не найдены.</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import { useJikanStore } from '@/stores/jikan'
import { useToast } from '@/composables/useToast'
import { useGsap } from '@/composables/useGsap'
import { api } from '@/api/client'
import TitleCard from '@/components/TitleCard.vue'
import CharacterCard from '@/components/CharacterCard.vue'
import type { Title, Episode, Torrent, JikanFullData } from '@/types'

const props = defineProps<{ id: string }>()
const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()
const jikanStore = useJikanStore()
const { success } = useToast()
const { parallax } = useGsap()

const title = ref<Title | null>(null)
const loading = ref(true)
const activeTab = ref('description')
const userRating = ref(0)
const jikanData = ref<JikanFullData | null>(null)
const jikanLoading = ref(false)
const relatedTitles = ref<Title[]>([])
const relatedLoading = ref(false)
const torrents = ref<Torrent[]>([])
const torrentsLoading = ref(false)

const detailRef = ref<HTMLElement>()
const headerRef = ref<HTMLElement>()
const posterRef = ref<HTMLElement>()
const tabsRef = ref<HTMLElement>()

const isFav = computed(() => {
  if (!title.value) return false
  return libraryStore.isFavorite(title.value.id)
})

const episodes = computed<Episode[]>(() => title.value?.episodes || [])

const posterUrl = computed(() => {
  if (!title.value?.poster) return ''
  return title.value.poster.src || title.value.poster.preview || ''
})

const headerBgStyle = computed(() => {
  if (!posterUrl.value) return {}
  return { backgroundImage: `url(${posterUrl.value})` }
})

const tabs = [
  { id: 'description', label: 'О тайтле' },
  { id: 'episodes', label: 'Эпизоды' },
  { id: 'characters', label: 'Персонажи' },
  { id: 'related', label: 'Похожие' },
  { id: 'torrents', label: 'Торренты' },
]

function getProgress(ep: Episode) {
  if (!title.value) return 0
  const hist = libraryStore.history.find(h => h.titleId === title.value!.id && h.episodeId === ep.id)
  if (!hist?.duration) return 0
  return Math.round((hist.timestamp / hist.duration) * 100)
}

function play() {
  if (title.value) router.push(`/player/${title.value.id}`)
}

function playEpisode(ep: Episode) {
  if (title.value) router.push(`/player/${title.value.id}/${ep.id}`)
}

function toggleFavorite() {
  if (!title.value) return
  if (isFav.value) {
    libraryStore.removeFromFavorites(title.value.id)
    success('Удалено из избранного')
  } else {
    libraryStore.addToFavorites(title.value)
    success('Добавлено в избранное')
  }
}

function shareTitle() {
  if (navigator.share && title.value) {
    navigator.share({ title: title.value.name.main, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
    success('Ссылка скопирована')
  }
}

function setRating(val: number) {
  if (!title.value) return
  userRating.value = val === userRating.value ? 0 : val
  libraryStore.setUserRating(title.value.id, userRating.value)
}

function goToDetails(t: Title) {
  router.push(`/title/${t.id}`)
}

async function loadRelated() {
  if (!title.value?.genres?.length) return
  relatedLoading.value = true
  try {
    const genreNames = title.value.genres.map(g => g.name)
    const all = titleStore.titles.filter(t => t.id !== title.value!.id && t.genres?.some(g => genreNames.includes(g.name)))
    relatedTitles.value = all.slice(0, 12)
  } finally { relatedLoading.value = false }
}

const QUALITY_RANK: Record<string, number> = { '480p': 1, '720p': 2, '1080p': 3, '2160p': 4, '4K': 4 }

const bestTorrent = computed(() => {
  if (!torrents.value.length) return null
  return [...torrents.value].sort((a, b) => (QUALITY_RANK[a.quality.value] || 0) - (QUALITY_RANK[b.quality.value] || 0)).pop()!
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

async function loadTorrents() {
  if (torrentsLoading.value || torrents.value.length) return
  torrentsLoading.value = true
  try {
    const data = await api.getTorrentsByRelease(Number(props.id))
    torrents.value = data.sort((a: Torrent, b: Torrent) => (QUALITY_RANK[b.quality.value] || 0) - (QUALITY_RANK[a.quality.value] || 0))
  } finally { torrentsLoading.value = false }
}

function openTorrent(t: Torrent) {
  window.open(`https://aniliberty.top/api/v1/anime/torrents/${t.hash}/file`, '_blank')
}

function openMagnet(t: Torrent) {
  window.open(t.magnet, '_blank')
}

async function loadData() {
  loading.value = true
  const cached = titleStore.titleDetails.get(Number(props.id))
  if (cached) {
    title.value = cached
  } else {
    title.value = await titleStore.fetchTitle(props.id)
  }
  loading.value = false
  await libraryStore.loadHistory()
  await libraryStore.loadFavorites()
  relatedTitles.value = []
  loadRelated()
  loadJikanData()

  await nextTick()
  if (headerRef.value) {
    parallax(headerRef.value, { speed: 0.25, trigger: detailRef.value! })
  }
}

async function loadJikanData() {
  if (!title.value) return
  jikanLoading.value = true
  try { jikanData.value = await jikanStore.fetchForTitle(title.value) }
  finally { jikanLoading.value = false }
}

watch(() => props.id, () => {
  activeTab.value = 'description'
  torrents.value = []
  userRating.value = libraryStore.getUserRating(Number(props.id))
  loadData()
})

watch(activeTab, (tab) => {
  if (tab === 'torrents') loadTorrents()
  if (tab === 'characters' && !jikanData.value && !jikanLoading.value && title.value) loadJikanData()
})

onMounted(() => loadData())
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.title-detail {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin: -28px -36px;
  padding-bottom: 48px;

  @include mobile {
    margin: -12px -12px;
    gap: 20px;
    padding-bottom: 32px;
  }

  &__header {
    position: relative;
    min-height: 460px;
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: flex-end;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: -20px;
      background-image: inherit;
      background-size: cover;
      background-position: center;
      filter: blur(36px) brightness(0.32) saturate(1.1);
      transform: scale(1.1);
      z-index: 0;
    }

    @include mobile {
      min-height: 300px;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, var(--md-sys-color-background) 0%, rgba(9, 9, 12, 0.7) 50%, rgba(9, 9, 12, 0.25) 100%),
      linear-gradient(to right, rgba(9, 9, 12, 0.85) 0%, rgba(9, 9, 12, 0.4) 60%, transparent 100%);
    z-index: 1;
  }

  &__header-content {
    position: relative;
    z-index: 2;
    display: flex;
    gap: 32px;
    padding: 36px 48px;
    width: 100%;
    align-items: flex-end;

    @include mobile {
      flex-direction: column;
      gap: 14px;
      padding: 16px;
      align-items: flex-start;
    }
  }

  &__poster-wrap {
    flex-shrink: 0;
  }

  &__poster {
    width: 200px;
    height: 300px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-medium);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.12);
    transition: transform 250ms var(--md-sys-motion-easing-spring);

    &:hover {
      transform: translateY(-4px);
    }

    @include mobile {
      width: 110px;
      height: 165px;
      border-radius: var(--md-sys-shape-corner-small);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1;
    padding-bottom: 4px;

    @include mobile {
      width: 100%;
      gap: 8px;
    }
  }

  &__metadata {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;

    @include mobile {
      gap: 6px;
    }
  }

  &__meta-tag {
    padding: 3px 10px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--md-sys-shape-corner-full);
    color: rgba(255, 255, 255, 0.85);
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: -0.01em;

    &--ongoing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
    }

    @include mobile {
      font-size: 11px;
      padding: 2px 7px;
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--md-sys-color-tertiary);
  }

  &__mal-score {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--color-score-gold);
    border-color: rgba(255, 184, 0, 0.25);
    background: rgba(255, 184, 0, 0.1);
    text-decoration: none;
  }

  &__name {
    color: #ffffff;
    font-family: var(--font-family-display);
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.15;

    @include mobile {
      font-size: 20px;
      line-height: 1.2;
    }
  }

  &__english {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
    font-weight: 500;

    @include mobile {
      font-size: 12.5px;
    }
  }

  &__genres {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 2px;
  }

  &__genre {
    padding: 3px 10px;
    border-radius: var(--md-sys-shape-corner-full);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.75);
    border: 1px solid var(--glass-border);
    font-size: 11.5px;
    font-weight: 500;
    transition: background 150ms ease, color 150ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    @include mobile {
      font-size: 11px;
      padding: 2px 7px;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;

    @include mobile {
      flex-direction: column;
      gap: 8px;
      width: 100%;
    }
  }

  &__fab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: var(--md-sys-shape-corner-full);
    border: none;
    cursor: pointer;
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 600;
    transition: transform 180ms var(--md-sys-motion-easing-spring), background 150ms ease;

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.97);
    }

    &--primary {
      background: #ffffff;
      color: #09090c;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

      &:hover {
        background: #f0f0f2;
      }
    }

    &--secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(16px);

      &:hover {
        background: rgba(255, 255, 255, 0.16);
      }
    }

    &--active {
      background: rgba(94, 92, 230, 0.25);
      border-color: rgba(94, 92, 230, 0.4);
      color: #ffffff;
    }

    @include mobile {
      width: 100%;
      justify-content: center;
      padding: 10px 18px;
    }
  }

  &__star {
    fill: transparent;
    stroke: currentColor;
    stroke-width: 1.8;
    transition: fill 200ms, stroke 200ms;
  }

  &__fab--active &__star {
    fill: #ffb800;
    stroke: #ffb800;
  }

  &__label-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 95px;
    height: 20px;
  }

  &__label {
    position: absolute;
    left: 0;
    white-space: nowrap;
    transition: opacity 180ms, transform 180ms;

    &--off { opacity: 1; transform: translateY(0); }
    &--on { opacity: 0; transform: translateY(4px); }
  }

  &__fab--active &__label--off { opacity: 0; transform: translateY(-4px); }
  &__fab--active &__label--on { opacity: 1; transform: translateY(0); }

  &__user-rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 6px;
    padding: 8px 14px;
    background: rgba(18, 19, 26, 0.7);
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
    backdrop-filter: blur(14px);
    align-self: flex-start;

    @include mobile {
      align-self: stretch;
      justify-content: space-between;
    }
  }

  &__rating-label {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12.5px;
    font-weight: 500;
  }

  &__stars {
    display: flex;
    gap: 3px;
  }

  &__star-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    transition: color 150ms ease;
    padding: 0;

    &:hover {
      color: rgba(255, 255, 255, 0.6);
    }

    &--active {
      color: var(--color-score-gold);
    }
  }

  &__rating-val {
    color: var(--color-score-gold);
    font-family: var(--font-family-body);
    font-weight: 700;
    font-size: 12px;
  }

  &__tabs-wrapper {
    padding: 0 48px;
    border-bottom: 1px solid var(--glass-border);

    @include mobile {
      padding: 0 16px;
    }
  }

  &__tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
  }

  &__tab {
    padding: 12px 18px;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    transition: color 150ms ease;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 14px;
      right: 14px;
      height: 2.5px;
      background: var(--md-sys-color-primary);
      border-radius: 4px 4px 0 0;
      transform: scaleX(0);
      transition: transform 200ms var(--md-sys-motion-easing-spring);
    }

    &:hover {
      color: var(--md-sys-color-on-surface);
    }

    &--active {
      color: var(--md-sys-color-on-surface);
      font-weight: 600;

      &::after {
        transform: scaleX(1);
      }
    }

    @include mobile {
      padding: 10px 12px;
      font-size: 13px;
    }
  }

  &__content {
    padding: 0 48px;

    @include mobile {
      padding: 0 16px;
    }
  }

  &__desc-text {
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--md-sys-color-on-surface-variant);
    max-width: 880px;
  }

  &__mal-section {
    margin-top: 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  &__section-title {
    font-family: var(--font-family-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
    margin-bottom: 12px;
  }

  &__trailer-embed {
    position: relative;
    width: 100%;
    max-width: 640px;
    aspect-ratio: 16/9;
    border-radius: var(--md-sys-shape-corner-medium);
    overflow: hidden;
    box-shadow: var(--md-sys-elevation-2);
    border: 1px solid var(--glass-border);

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  }

  &__stats {
    max-width: 640px;
  }

  &__stats-bar {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 130px;
    padding: 16px;
    background: var(--md-sys-color-surface-container);
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--glass-border);
  }

  &__stats-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    height: 100%;
    justify-content: flex-end;
  }

  &__stats-track {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
  }

  &__stats-fill {
    width: 100%;
    border-radius: 3px 3px 0 0;
    background: rgba(255, 255, 255, 0.18);
    min-height: 4px;
    transition: height 400ms ease;

    &--high {
      background: var(--md-sys-color-primary);
    }

    &--mid {
      background: var(--md-sys-color-secondary);
    }
  }

  &__stats-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__stats-total {
    font-size: 12.5px;
    color: var(--md-sys-color-on-surface-variant);
    margin-top: 8px;
  }

  &__episodes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;

    @include mobile {
      grid-template-columns: 1fr;
    }
  }

  &__episode {
    display: flex;
    gap: 12px;
    padding: 8px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);
    cursor: pointer;
    transition: transform 180ms ease, border-color 150ms ease;

    &:hover {
      transform: translateY(-2px);
      border-color: var(--glass-border-hover);

      .title-detail__episode-overlay { opacity: 1; }
    }
  }

  &__episode-thumb {
    position: relative;
    width: 115px;
    height: 72px;
    border-radius: var(--md-sys-shape-corner-small);
    overflow: hidden;
    background: var(--md-sys-color-surface-container-high);
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__episode-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface-variant);
    font-family: var(--font-family-body);
    font-size: 18px;
    font-weight: 600;
  }

  &__episode-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.5);
  }

  &__episode-progress-bar {
    height: 100%;
    background: var(--md-sys-color-primary);
  }

  &__episode-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 150ms ease;
    color: #ffffff;
  }

  &__episode-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    min-width: 0;
  }

  &__episode-name {
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--md-sys-color-on-surface);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__episode-meta {
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__character-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }

  &__character-skeletons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
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

  &__torrent-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__torrent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    border: 1px solid var(--glass-border);

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }

  &__torrent-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
  }

  &__torrent-quality {
    font-family: var(--font-family-body);
    font-size: 15px;
    font-weight: 700;
    color: var(--md-sys-color-primary);
  }

  &__torrent-best {
    padding: 2px 7px;
    border-radius: var(--md-sys-shape-corner-full);
    background: rgba(48, 209, 88, 0.15);
    color: var(--md-sys-color-tertiary);
    border: 1px solid rgba(48, 209, 88, 0.25);
    font-size: 11px;
    font-weight: 600;
  }

  &__torrent-meta {
    display: block;
    font-size: 12.5px;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__torrent-seeders {
    display: block;
    font-size: 12px;
    color: var(--md-sys-color-tertiary);
    margin-top: 2px;
  }

  &__torrent-desc {
    display: block;
    font-size: 12px;
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.8;
  }

  &__torrent-actions {
    display: flex;
    gap: 8px;
  }

  &__torrent-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &--magnet {
      border-color: rgba(94, 92, 230, 0.25);
      color: var(--md-sys-color-primary);
      background: var(--md-sys-color-primary-container);

      &:hover {
        background: rgba(94, 92, 230, 0.2);
      }
    }
  }
}
</style>
