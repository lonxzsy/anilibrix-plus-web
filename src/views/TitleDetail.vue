<template>
  <div v-if="title" ref="detailRef" class="title-detail">
    <div ref="headerRef" class="title-detail__header" :style="headerBgStyle">
      <div class="title-detail__overlay" />
      <div class="title-detail__header-content">
        <img ref="posterRef" class="title-detail__poster" :src="posterUrl" :alt="title.name.main" />
        <div class="title-detail__info">
          <div class="title-detail__metadata">
            <span v-if="title.year" class="title-detail__meta-tag md3-label-large">{{ title.year }}</span>
            <span v-if="title.type?.description" class="title-detail__meta-tag md3-label-large">{{ title.type.description }}</span>
            <span v-if="title.isOngoing" class="title-detail__meta-tag title-detail__meta-tag--ongoing md3-label-large">Онгоинг</span>
            <a v-if="jikanData?.anime.score" :href="jikanData.anime.url" target="_blank" rel="noopener noreferrer" class="title-detail__meta-tag title-detail__mal-score md3-label-large" :title="`MAL рейтинг на основе ${jikanData.anime.scoredBy.toLocaleString('ru')} голосов`">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              {{ jikanData.anime.score.toFixed(2) }}
            </a>
          </div>
          <h1 class="title-detail__name md3-display-small">{{ title.name.main }}</h1>
          <p v-if="title.name.english" class="title-detail__english md3-title-medium">{{ title.name.english }}</p>
          <div v-if="title.genres?.length" class="title-detail__genres">
            <span v-for="genre in title.genres" :key="genre.id" class="title-detail__genre md3-label-medium">{{ genre.name }}</span>
          </div>
          <div class="title-detail__actions">
            <button class="title-detail__fab" @click="play">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              <span class="md3-label-large">Смотреть</span>
            </button>
            <button class="title-detail__fab title-detail__fab--secondary" :class="{ 'title-detail__fab--active': isFav }" @click="toggleFavorite">
              <svg class="title-detail__star" width="18" height="18" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              <span class="title-detail__label-wrap">
                <span class="title-detail__label title-detail__label--off">В избранное</span>
                <span class="title-detail__label title-detail__label--on">В избранном</span>
              </span>
            </button>
            <button class="title-detail__fab title-detail__fab--secondary" @click="shareTitle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              <span class="md3-label-large">Поделиться</span>
            </button>
          </div>
          <!-- User rating -->
          <div class="title-detail__user-rating">
            <span class="md3-label-medium">Моя оценка</span>
            <div class="title-detail__stars">
              <button
                v-for="star in 10"
                :key="star"
                class="title-detail__star-btn"
                :class="{ 'title-detail__star-btn--active': userRating >= star }"
                :title="`${star}/10`"
                @click="setRating(star)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" :fill="userRating >= star ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="title-detail__tabs" ref="tabsRef">
      <button v-for="tab in tabs" :key="tab.id" class="title-detail__tab md3-label-large" :class="{ 'title-detail__tab--active': activeTab === tab.id }" @click="activeTab = tab.id">{{ tab.label }}</button>
    </div>

    <div class="title-detail__content">
      <Transition name="tab-fade" mode="out-in">
        <div :key="activeTab">
          <div v-if="activeTab === 'description'" class="title-detail__description">
            <p class="md3-body-large" style="line-height: 1.7; color: var(--md-sys-color-on-surface-variant)">
              {{ title.description || 'Описание отсутствует.' }}
            </p>

            <div v-if="jikanData" class="title-detail__mal-section">
              <div v-if="jikanData.anime.trailer.embedUrl" class="title-detail__trailer">
                <h3 class="md3-title-medium" style="margin-bottom: 12px; color: var(--md-sys-color-on-surface)">Трейлер</h3>
                <div class="title-detail__trailer-embed">
                  <iframe :src="jikanData.anime.trailer.embedUrl" allow="autoplay; fullscreen" allowfullscreen loading="lazy" title="Трейлер" />
                </div>
              </div>

              <div v-if="jikanData.stats" class="title-detail__stats">
                <h3 class="md3-title-medium" style="margin-bottom: 12px; color: var(--md-sys-color-on-surface)">Распределение оценок MAL</h3>
                <div class="title-detail__stats-bar">
                  <div v-for="s in jikanData.stats.scores" :key="s.score" class="title-detail__stats-item" :title="`${s.score} — ${s.votes.toLocaleString('ru')} голосов (${s.percentage}%)`">
                    <span class="title-detail__stats-label md3-label-small">{{ s.score }}</span>
                    <div class="title-detail__stats-track">
                      <div class="title-detail__stats-fill" :style="{ height: `${s.percentage * 1.8}%` }" :class="{ 'title-detail__stats-fill--high': s.score >= 8, 'title-detail__stats-fill--mid': s.score >= 5 && s.score < 8 }" />
                    </div>
                  </div>
                </div>
                <div class="title-detail__stats-total md3-body-small">
                  На основе {{ jikanData.stats.total.toLocaleString('ru') }} оценок
                </div>
              </div>
            </div>
            <div v-if="jikanLoading" class="title-detail__mal-loading">
              <div class="md3-skeleton" style="height: 60px; border-radius: 8px; max-width: 400px" />
            </div>
          </div>

          <div v-else-if="activeTab === 'episodes'" class="title-detail__episodes">
            <div v-for="ep in episodes" :key="ep.id" class="title-detail__episode" @click="playEpisode(ep)">
              <div class="title-detail__episode-thumb">
                <img v-if="ep.preview?.src" :src="ep.preview.src" loading="lazy" alt="" />
                <div v-else class="title-detail__episode-placeholder"><span class="md3-headline-small">{{ ep.ordinal }}</span></div>
                <div class="title-detail__episode-progress"><div class="title-detail__episode-progress-bar" :style="{ width: `${getProgress(ep)}%` }" /></div>
                <div class="title-detail__episode-overlay"><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></div>
              </div>
              <div class="title-detail__episode-info">
                <span class="md3-title-medium">{{ ep.name }}</span>
                <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">Серия {{ ep.ordinal }}</span>
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'characters'" class="title-detail__characters">
            <div v-if="jikanData?.characters.length" class="title-detail__character-grid">
              <CharacterCard v-for="(entry, i) in jikanData.characters" :key="entry.character.malId" :entry="entry" :style="{ animationDelay: `${i * 40}ms` }" />
            </div>
            <div v-else-if="jikanLoading" class="title-detail__character-skeletons">
              <div v-for="n in 8" :key="n" class="md3-skeleton" style="height: 280px; border-radius: 6px" />
            </div>
            <p v-else class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
              {{ jikanStore.error || 'Информация о персонажах не найдена.' }}
            </p>
          </div>

          <div v-else-if="activeTab === 'related'" class="title-detail__related">
            <div v-if="relatedTitles.length > 0" class="title-detail__grid">
              <TitleCard v-for="t in relatedTitles" :key="t.id" :title="t" @click="goToDetails(t)" />
            </div>
            <div v-else-if="relatedLoading" class="title-detail__grid">
              <div v-for="n in 6" :key="n" class="md3-skeleton" style="height: 260px; border-radius: 4px" />
            </div>
            <p v-else class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">Похожие тайтлы не найдены.</p>
          </div>

          <div v-else-if="activeTab === 'torrents'" class="title-detail__torrents">
            <div v-if="torrents.length > 0" class="title-detail__torrent-list">
              <div v-for="t in torrents" :key="t.id" class="title-detail__torrent-item">
                <div class="title-detail__torrent-info">
                  <div class="title-detail__torrent-header">
                    <span class="title-detail__torrent-quality md3-label-large">{{ t.quality.value }}</span>
                    <span v-if="bestTorrent?.id === t.id" class="title-detail__torrent-best md3-label-small">Лучшее</span>
                  </div>
                  <span class="title-detail__torrent-meta md3-body-small">{{ t.type.value }} · {{ t.codec.value }} · {{ t.color.value }} · {{ formatBytes(t.size) }}</span>
                  <span class="title-detail__torrent-seeders md3-body-small">{{ t.seeders }} сидов · {{ t.leechers }} личей</span>
                  <span v-if="t.description" class="title-detail__torrent-desc md3-body-small">{{ t.description }}</span>
                </div>
                <div class="title-detail__torrent-actions">
                  <button class="title-detail__torrent-btn md3-label-large" @click="openTorrent(t)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    .torrent
                  </button>
                  <button class="title-detail__torrent-btn title-detail__torrent-btn--magnet md3-label-large" @click="openMagnet(t)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                    Magnet
                  </button>
                </div>
              </div>
            </div>
            <div v-else-if="torrentsLoading" class="title-detail__torrent-skeletons">
              <div v-for="n in 4" :key="n" class="md3-skeleton" style="height: 80px; border-radius: 8px" />
            </div>
            <p v-else class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">Торренты для этого релиза не найдены.</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
  <div v-else-if="loading" class="title-detail__skeleton">
    <div class="md3-skeleton" style="height: 420px; border-radius: 0" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import { useJikanStore } from '@/stores/jikan'
import { api } from '@/api/client'
import { useGsap } from '@/composables/useGsap'
import { useToast } from '@/composables/useToast'
import TitleCard from '@/components/TitleCard.vue'
import CharacterCard from '@/components/CharacterCard.vue'
import type { Title, Episode, Torrent, JikanFullData } from '@/types'

const props = defineProps<{ id: string }>()
const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()
const { parallax, animateCount } = useGsap()
const { success, info } = useToast()

const title = ref<Title | null>(null)
const loading = ref(true)
const activeTab = ref<'description' | 'episodes' | 'characters' | 'related' | 'torrents'>('description')
const jikanStore = useJikanStore()
const jikanData = ref<JikanFullData | null>(null)
const jikanLoading = ref(false)
const relatedTitles = ref<Title[]>([])
const relatedLoading = ref(false)
const torrents = ref<Torrent[]>([])
const torrentsLoading = ref(false)
const detailRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const posterRef = ref<HTMLElement | null>(null)
const userRating = ref(libraryStore.getUserRating(Number(props.id)))

const isFav = computed(() => (title.value ? libraryStore.isFavorite(title.value.id) : false))

const tabs = [
  { id: 'description' as const, label: 'Описание' },
  { id: 'episodes' as const, label: 'Эпизоды' },
  { id: 'characters' as const, label: 'Персонажи' },
  { id: 'related' as const, label: 'Похожие' },
  { id: 'torrents' as const, label: 'Торренты' },
]

const episodes = computed(() => title.value?.episodes || [])

const posterUrl = computed(() => {
  if (!title.value?.poster) return ''
  return title.value.poster.preview || title.value.poster.src || ''
})

const headerBgStyle = computed(() => ({
  backgroundImage: `url(${posterUrl.value})`,
}))

function play() {
  if (title.value) router.push(`/player/${title.value.id}`)
}

function playEpisode(ep: Episode) {
  router.push(`/player/${props.id}/${ep.id}`)
}

function goToDetails(t: Title) {
  router.push(`/title/${t.id}`)
}

function toggleFavorite() {
  if (!title.value) return
  if (isFav.value) {
    libraryStore.removeFromFavorites(title.value.id)
    info('Удалено из избранного')
  } else {
    libraryStore.addToFavorites(title.value)
    success('Добавлено в избранное')
  }
}

function setRating(star: number) {
  userRating.value = star
  libraryStore.setUserRating(Number(props.id), star)
  success(`Оценка ${star}/10 сохранена`)
}

async function shareTitle() {
  if (!title.value) return
  const url = window.location.href
  const shareData = { title: title.value.name.main, text: `Смотри аниме "${title.value.name.main}" на Anilibrix Plus`, url }

  if (navigator.share) {
    try { await navigator.share(shareData); return }
    catch (err) { if (err instanceof DOMException && err.name === 'AbortError') return }
  }

  try {
    await navigator.clipboard.writeText(url)
    success('Ссылка скопирована в буфер обмена!')
  } catch {
    info('Скопируйте ссылку вручную: ' + url)
  }
}

function getProgress(ep: Episode) {
  const entry = libraryStore.history.find((h) => h.titleId === Number(props.id) && h.episodeId === ep.id)
  if (!entry || !entry.duration) return 0
  return Math.round((entry.timestamp / entry.duration) * 100)
}

async function loadRelated() {
  if (relatedLoading.value) return
  relatedLoading.value = true
  try {
    const id = Number(props.id)
    const [franchise, recommended] = await Promise.allSettled([
      api.getFranchiseByRelease(id),
      api.getRecommendedReleases(id, 12),
    ])
    const results = new Map<number, Title>()
    if (franchise.status === 'fulfilled') franchise.value.forEach((t) => results.set(t.id, t))
    if (recommended.status === 'fulfilled') (recommended.value as Title[]).forEach((t: Title) => results.set(t.id, t))
    relatedTitles.value = Array.from(results.values()).filter((t) => t.id !== id)
  } finally { relatedLoading.value = false }
}

const QUALITY_RANK: Record<string, number> = { '360p': 1, '480p': 2, '576p': 3, '720p': 4, '1080p': 5, '2k': 6, '4k': 7, '8k': 8 }

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
  display: flex; flex-direction: column; gap: 24px; margin: -28px -36px;
  will-change: transform;

  @include mobile {
    margin: -12px -16px;
    gap: 16px;
  }

  &__header {
    position: relative; min-height: 440px; background-size: cover; background-position: center;
    display: flex; align-items: flex-end; overflow: hidden;
    &::before { content: ''; position: absolute; inset: 0; background-image: inherit; background-size: cover; background-position: center; filter: blur(10px) saturate(0.7); transform: scale(1.08); z-index: 0; }
    @include mobile { min-height: 280px; }
  }
  &__overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--md-sys-color-background) 0%, transparent 50%), linear-gradient(to right, rgba(0,0,0,0.75) 0%, transparent 50%); backdrop-filter: blur(1px); z-index: 1; }
  &__header-content { position: relative; z-index: 2; display: flex; gap: 28px; padding: 36px; width: 100%; align-items: flex-end; will-change: transform; @include mobile { flex-direction: column; gap: 12px; padding: 16px; align-items: flex-start; } }
  &__poster { width: 190px; height: 285px; object-fit: cover; border-radius: var(--md-sys-shape-corner-small); box-shadow: var(--md-sys-elevation-4); flex-shrink: 0; transition: transform 300ms var(--md-sys-motion-easing-spring); &:hover { transform: translateY(-4px) scale(1.02); } @include mobile { width: 100px; height: 150px; } }
  &__info { display: flex; flex-direction: column; gap: 8px; flex: 1; padding-bottom: 4px; @include mobile { width: 100%; } }
  &__metadata { display: flex; gap: 10px; align-items: center; @include mobile { flex-wrap: wrap; gap: 6px; } }
  &__meta-tag { padding: 4px 12px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--md-sys-shape-corner-extra-small); color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 0.02em; text-shadow: 0 1px 4px rgba(0,0,0,0.4); &--ongoing { color: #e8a5b8; border-color: rgba(232,165,184,0.3); background: rgba(232,165,184,0.12); } @include mobile { font-size: 11px; padding: 3px 8px; } }
  &__name { color: var(--md-sys-color-on-background); text-shadow: 0 2px 16px rgba(0,0,0,0.5); @include mobile { font-size: 20px; line-height: 1.1; } }
  &__english { color: var(--md-sys-color-on-surface-variant); @include mobile { font-size: 13px; } }
  &__genres { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; @include mobile { gap: 6px; } }
  &__genre { padding: 3px 12px; border-radius: var(--md-sys-shape-corner-extra-small); background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface-variant); border: 1px solid var(--md-sys-color-outline-variant); font-size: 12px; transition: background 150ms, color 150ms; &:hover { background: var(--md-sys-color-surface-container-high); color: var(--md-sys-color-on-surface); } @include mobile { font-size: 11px; padding: 2px 10px; } }
  &__actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; @include mobile { flex-direction: column; gap: 8px; } }

  &__user-rating {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 12px;
    padding: 10px 16px;
    background: rgba(0,0,0,0.2);
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid rgba(255,255,255,0.04);
    backdrop-filter: blur(8px);
    align-self: flex-start;

    span { color: rgba(255,255,255,0.6); }
    @include mobile { align-self: stretch; }
  }

  &__stars {
    display: flex;
    gap: 3px;
  }

  &__star-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: rgba(255,255,255,0.15);
    cursor: pointer;
    transition: color 150ms, transform 200ms var(--md-sys-motion-easing-spring);
    padding: 0;

    &:hover { transform: scale(1.2); color: rgba(255,255,255,0.4); }
    &--active { color: #ffc107; }
    &--active:hover { color: #ffd54f; }
  }

  &__fab { display: flex; align-items: center; gap: 8px; padding: 11px 24px; border-radius: var(--md-sys-shape-corner-small); border: none; background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); cursor: pointer; font: var(--md-sys-typescale-label-large); transition: transform 200ms var(--md-sys-motion-easing-spring), box-shadow 200ms, color 300ms; position: relative; overflow: hidden; &::after { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; background: rgba(255,255,255,0.18); transform: translate(-50%,-50%); transition: width 350ms, height 350ms, border-radius 350ms; pointer-events: none; z-index: 0; } & > * { position: relative; z-index: 1; } &:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(184,165,232,0.3); } &:active { transform: scale(0.97); } &--secondary { background: rgba(255,255,255,0.06); color: var(--md-sys-color-on-surface); border: 1px solid rgba(255,255,255,0.08); &:hover { box-shadow: none; } &.title-detail__fab--active { border-color: rgba(255,255,255,0.3); &::after { background: rgba(255,255,255,0.28); width: 120%; height: 250%; border-radius: var(--md-sys-shape-corner-small); } } } @include mobile { width: 100%; justify-content: center; padding: 12px 20px; } }
  &__star { fill: transparent; stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; transition: fill 300ms, stroke 300ms, transform 300ms var(--md-sys-motion-easing-spring); transform-origin: center; }
  &__fab--active &__star { fill: currentColor; stroke: currentColor; transform: scale(1.25); }
  &__label-wrap { position: relative; display: inline-flex; align-items: center; min-width: 105px; height: 20px; }
  &__label { position: absolute; left: 0; white-space: nowrap; transition: opacity 200ms, transform 200ms; &--off { opacity: 1; transform: translateY(0); } &--on { opacity: 0; transform: translateY(5px); } }
  &__fab--active &__label--off { opacity: 0; transform: translateY(-5px); }
  &__fab--active &__label--on { opacity: 1; transform: translateY(0); }
  &__tabs { display: flex; gap: 0; padding: 0 36px; border-bottom: 1px solid var(--md-sys-color-outline-variant); overflow-x: auto; @include mobile { padding: 0 16px; } }
  &__tab { padding: 14px 24px; background: transparent; border: none; color: var(--md-sys-color-on-surface-variant); cursor: pointer; position: relative; font: var(--md-sys-typescale-label-large); white-space: nowrap; transition: color 200ms; &::after { content: ''; position: absolute; bottom: 0; left: 24px; right: 24px; height: 2px; background: var(--md-sys-color-primary); border-radius: 2px 2px 0 0; transform: scaleX(0); transition: transform 250ms var(--md-sys-motion-easing-spring); box-shadow: 0 0 8px rgba(184,165,232,0.3); } &:hover { color: var(--md-sys-color-on-surface); } &--active { color: var(--md-sys-color-primary); &::after { transform: scaleX(1); } } @include mobile { padding: 12px 14px; font-size: 13px; } }
  &__content { padding: 28px 36px; @include mobile { padding: 16px; } }
  &__episodes { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; @include mobile { grid-template-columns: 1fr; gap: 12px; } }
  &__episode { display: flex; flex-direction: column; gap: 8px; cursor: pointer; border-radius: var(--md-sys-shape-corner-small); overflow: hidden; background: var(--md-sys-color-surface-container); transition: transform 250ms var(--md-sys-motion-easing-spring), box-shadow 250ms; &:hover { transform: translateY(-4px); box-shadow: var(--glow-primary), 0 8px 24px rgba(0,0,0,0.4); } &:hover .title-detail__episode-overlay { opacity: 1; } }
  &__episode-thumb { position: relative; aspect-ratio: 16/9; background: var(--md-sys-color-surface-container-high); overflow: hidden; img { width: 100%; height: 100%; object-fit: cover; transition: transform 400ms; } &:hover img { transform: scale(1.06); } }
  &__episode-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: var(--md-sys-color-on-surface-variant); }
  &__episode-progress { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(0,0,0,0.3); }
  &__episode-progress-bar { height: 100%; background: var(--md-sys-color-primary); transition: width 300ms; box-shadow: 0 0 4px rgba(184,165,232,0.4); }
  &__episode-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 250ms; svg { color: #fff; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4)); } }
  &__episode-info { padding: 8px 14px 14px; display: flex; flex-direction: column; gap: 4px; @include mobile { padding: 8px 12px 12px; } }
  &__skeleton { margin: -28px -36px; @include mobile { margin: -12px -16px; } }
  &__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; @include mobile { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  &__torrents { display: flex; flex-direction: column; gap: 12px; }
  &__torrent-list { display: flex; flex-direction: column; gap: 12px; }
  &__torrent-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border-radius: var(--md-sys-shape-corner-medium); background: var(--md-sys-color-surface-container); transition: background-color 200ms, transform 200ms; &:hover { background: var(--md-sys-color-surface-container-high); transform: translateX(4px); } @include mobile { flex-direction: column; align-items: flex-start; gap: 10px; padding: 12px 16px; } }
  &__torrent-info { display: flex; flex-direction: column; gap: 4px; }
  &__torrent-quality { color: var(--md-sys-color-primary); }
  &__torrent-meta { color: var(--md-sys-color-on-surface-variant); }
  &__torrent-seeders { color: var(--md-sys-color-on-surface-variant); }
  &__torrent-desc { color: var(--md-sys-color-on-surface-variant); margin-top: 2px; }
  &__torrent-actions { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; @include mobile { width: 100%; } }
  &__torrent-btn { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: var(--md-sys-shape-corner-small); border: 1px solid var(--md-sys-color-outline); background: var(--md-sys-color-surface-container); color: var(--md-sys-color-primary); cursor: pointer; font: var(--md-sys-typescale-label-large); transition: background-color 150ms, border-color 150ms, box-shadow 150ms; &:hover { background: var(--md-sys-color-primary-container); border-color: var(--md-sys-color-primary); box-shadow: var(--glow-primary); } &:active { background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary); } &--magnet { color: var(--md-sys-color-tertiary); border-color: rgba(232,165,184,0.2); &:hover { background: rgba(232,165,184,0.08); border-color: rgba(232,165,184,0.3); box-shadow: 0 0 12px rgba(232,165,184,0.15); } } @include mobile { flex: 1; justify-content: center; } }
  &__torrent-header { display: flex; align-items: center; gap: 10px; }
  &__torrent-best { padding: 2px 8px; border-radius: var(--md-sys-shape-corner-extra-small); background: rgba(139,195,74,0.15); color: #8bc34a; border: 1px solid rgba(139,195,74,0.25); font-size: 11px; letter-spacing: 0.02em; }
  &__torrent-skeletons { display: flex; flex-direction: column; gap: 12px; }
  &__mal-score { display: inline-flex; align-items: center; gap: 4px; color: #ffb300 !important; border-color: rgba(255, 179, 0, 0.3) !important; background: rgba(255, 179, 0, 0.12) !important; text-decoration: none; cursor: pointer; transition: box-shadow 200ms; &:hover { box-shadow: 0 0 12px rgba(255, 179, 0, 0.2); } }

  &__mal-section {
    display: flex; flex-direction: column; gap: 28px; margin-top: 32px;
    padding-top: 28px; border-top: 1px solid var(--md-sys-color-outline-variant);
    @include mobile { gap: 20px; margin-top: 24px; padding-top: 20px; }
  }
  &__mal-loading { margin-top: 24px; }
  &__trailer { display: flex; flex-direction: column; }
  &__trailer-embed { position: relative; width: 100%; max-width: 640px; aspect-ratio: 16 / 9; border-radius: var(--md-sys-shape-corner-medium); overflow: hidden; box-shadow: var(--md-sys-elevation-2); iframe { width: 100%; height: 100%; border: none; } }
  &__stats { display: flex; flex-direction: column; }
  &__stats-bar { display: flex; align-items: flex-end; gap: 4px; height: 140px; padding-bottom: 4px; @include mobile { height: 100px; } }
  &__stats-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
  &__stats-label { color: var(--md-sys-color-on-surface-variant); font-size: 10px; line-height: 1; order: 2; }
  &__stats-track { flex: 1; width: 100%; max-width: 24px; background: var(--md-sys-color-surface-container-high); border-radius: 2px 2px 0 0; position: relative; order: 1; @include mobile { max-width: 16px; } }
  &__stats-fill { position: absolute; bottom: 0; left: 0; right: 0; border-radius: 2px 2px 0 0; background: var(--md-sys-color-on-surface-variant); transition: height 600ms var(--md-sys-motion-easing-spring); &--high { background: var(--md-sys-color-primary); } &--mid { background: var(--md-sys-color-tertiary); } }
  &__stats-total { color: var(--md-sys-color-on-surface-variant); }
  &__characters { min-height: 200px; }
  &__character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; > * { animation: fadeUp 400ms var(--md-sys-motion-easing-decelerate) backwards; } @include mobile { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
  &__character-skeletons { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 16px; @include mobile { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
}

.tab-fade-enter-active { transition: all 250ms var(--md-sys-motion-easing-decelerate); }
.tab-fade-leave-active { transition: all 150ms var(--md-sys-motion-easing-accelerate); }
.tab-fade-enter-from { opacity: 0; transform: translateY(8px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
