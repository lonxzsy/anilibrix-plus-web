<template>
  <div class="player-page">
    <div class="player-page__header">
      <button class="player-page__back" @click="goBack">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span class="md3-label-large">Назад</span>
      </button>
      <h2 class="player-page__title md3-title-large">{{ titleName }}</h2>
      <span class="player-page__episode-info md3-body-medium">Эпизод {{ currentOrdinal }}</span>
    </div>

    <div ref="containerRef" class="player-container" @mousemove="showControls" @mouseleave="hideControlsDelayed" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <video ref="videoRef" class="player-container__video" playsinline webkit-playsinline @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @ended="onEnded" @waiting="isBuffering = true" @playing="onVideoPlay" @pause="onVideoPause" @click="togglePlay" />

      <div v-if="isBuffering" class="player-container__buffering">
        <div class="spinner" />
      </div>

      <div class="player-top-actions">
        <transition name="skip">
          <button v-if="skipTargetTime != null" class="player-skip-btn md3-label-large" @click="seekToTime(skipTargetTime!)">
            Пропустить {{ canSkipOpening ? 'опенинг' : 'эндинг' }}
          </button>
        </transition>
        <transition name="skip">
          <button v-if="showNextEpisode" class="player-next-btn md3-label-large" @click="autoNextEpisode">
            <div class="player-next-btn__track">
              <div class="player-next-btn__fill" :style="{ width: `${nextEpisodeProgress}%` }" />
            </div>
            <span>Следующая серия</span>
          </button>
        </transition>
      </div>

      <SubtitleOverlay :current-time="currentTime" :show-settings="showSubtitles" @close-settings="showSubtitles = false" />

      <div class="player-controls" :class="{ 'player-controls--hidden': controlsHidden && isPlaying }">
        <div class="player-controls__top">
          <div class="player-controls__gradient" />
        </div>

        <div class="player-controls__progress-area" @mousemove="onProgressHover" @mouseleave="hoverTime = null">
          <div class="player-controls__progress-wrapper">
            <div ref="progressBarRef" class="player-controls__progress-bar" @click="seekTo">
              <div class="player-controls__progress-track" />
              <div class="player-controls__progress-buffer" :style="{ width: `${bufferedPercent}%` }" />
              <div class="player-controls__progress-fill" :style="{ width: `${progressPercent}%` }" />
              <div class="player-controls__progress-thumb" :style="{ left: `${progressPercent}%` }" />
              <div v-if="hoverTime !== null" class="player-controls__progress-hover" :style="{ left: `${hoverPercent}%` }" />
            </div>
            <div v-if="hoverTime !== null" class="player-controls__time-tooltip" :style="{ left: `${hoverPercent}%` }">
              {{ formatTime(hoverTime) }}
            </div>
          </div>
          <div class="player-controls__time">
            <span class="md3-body-small">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="player-controls__bottom">
          <div class="player-controls__left">
            <button class="player-controls__btn" @click="togglePlay">
              <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <button class="player-controls__btn" @click="skip(-10)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
            </button>
            <button class="player-controls__btn" @click="skip(10)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 17l5-5-5-5M6 17l5-5-5-5" /></svg>
            </button>

            <div class="player-controls__volume">
              <button class="player-controls__btn" @click="toggleMute">
                <svg v-if="volume === 0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                <svg v-else-if="volume < 0.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" /></svg>
              </button>
              <div class="player-controls__volume-slider">
                <input v-model.number="volume" type="range" min="0" max="1" step="0.05" @input="setVolume" />
              </div>
            </div>
          </div>

          <div class="player-controls__right">
            <button class="player-controls__btn" title="Субтитры" @click="showSubtitles = !showSubtitles">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h10M4 17h8" /></svg>
            </button>

            <div ref="qualityDropdownRef" class="player-controls__dropdown">
              <button class="player-controls__btn player-controls__btn--text" @click="showQuality = !showQuality">
                <span class="md3-label-small">{{ currentQualityLabel }}</span>
              </button>
              <div v-if="showQuality" class="player-controls__menu">
                <button v-for="q in qualityOptions" :key="q.value" class="player-controls__menu-item" :class="{ active: currentQuality === q.value }" @click="setQuality(q.value)">
                  {{ q.label }}
                </button>
              </div>
            </div>

            <div ref="speedDropdownRef" class="player-controls__dropdown">
              <button class="player-controls__btn player-controls__btn--text" @click="showSpeed = !showSpeed">
                <span class="md3-label-small">{{ playbackRate }}x</span>
              </button>
              <div v-if="showSpeed" class="player-controls__menu">
                <button v-for="s in [0.5, 0.75, 1, 1.25, 1.5, 2]" :key="s" class="player-controls__menu-item" :class="{ active: playbackRate === s }" @click="setSpeed(s)">{{ s }}x</button>
              </div>
            </div>

            <button class="player-controls__btn" @click="togglePip">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" /><path d="M15 15v-4h4M15 11l4 4" /></svg>
            </button>

            <button class="player-controls__btn" @click="toggleFullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="episodes.length > 0" class="player-page__episodes">
      <h3 class="md3-title-medium">Эпизоды</h3>
      <div class="player-page__episodes-list">
        <button v-for="ep in episodes" :key="ep.id" class="player-page__episode-btn md3-label-large" :class="{ 'player-page__episode-btn--active': ep.id === currentEpisodeId }" @click="selectEpisode(ep)">
          {{ ep.ordinal }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import { useLibraryStore } from '@/stores/library'
import { formatTime } from '@/utils/helpers'
import SubtitleOverlay from '@/components/SubtitleOverlay.vue'
import Hls from 'hls.js'
import type { Episode, Title } from '@/types'

const props = defineProps<{
  titleId?: string
  episodeId?: string
  filePath?: string
}>()

const router = useRouter()
const titleStore = useTitleStore()
const libraryStore = useLibraryStore()

const videoRef = ref<HTMLVideoElement>()
const progressBarRef = ref<HTMLElement>()
const qualityDropdownRef = ref<HTMLElement>()
const speedDropdownRef = ref<HTMLElement>()
const containerRef = ref<HTMLDivElement>()
const title = ref<Title | null>(null)
const episodes = ref<Episode[]>([])
const currentEpisode = ref<Episode | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isBuffering = ref(false)
const volume = ref(1)
const playbackRate = ref(1)
const controlsHidden = ref(false)
const showQuality = ref(false)
const showSpeed = ref(false)
const showSubtitles = ref(false)
const hoverTime = ref<number | null>(null)
const hoverPercent = ref(0)
const bufferedPercent = ref(0)

let hls: Hls | null = null
let controlsTimer: ReturnType<typeof setTimeout>
let saveInterval: ReturnType<typeof setInterval>

// Touch gesture handling
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartTime = ref(0)
const touchMoved = ref(false)

const currentEpisodeId = computed(() => currentEpisode.value?.id || props.episodeId)
const titleName = computed(() => title.value?.name.main || '')
const currentOrdinal = computed(() => currentEpisode.value?.ordinal || 1)
const progressPercent = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0
)

const canSkipOpening = computed(() => {
  const op = currentEpisode.value?.opening
  if (!op || op.start == null || op.stop == null) return false
  return currentTime.value >= op.start && currentTime.value < op.stop
})

const canSkipEnding = computed(() => {
  const ed = currentEpisode.value?.ending
  if (!ed || ed.start == null || ed.stop == null) return false
  return currentTime.value >= ed.start && currentTime.value < ed.stop
})

const skipTargetTime = computed(() => {
  if (canSkipOpening.value) return currentEpisode.value?.opening?.stop ?? null
  if (canSkipEnding.value) return currentEpisode.value?.ending?.stop ?? null
  return null
})

const showNextEpisode = ref(false)
const nextEpisodeProgress = ref(0)
let nextEpisodeTimer: ReturnType<typeof setInterval> | null = null

const qualityOptions = [
  { value: 'hls1080', label: '1080p' },
  { value: 'hls720', label: '720p' },
  { value: 'hls480', label: '480p' },
]
const currentQuality = ref('hls720')
const currentQualityLabel = computed(
  () => qualityOptions.find((q) => q.value === currentQuality.value)?.label || 'Auto'
)

function getHlsUrl(ep: Episode, quality: string): string {
  if (quality === 'hls1080' && ep.hls1080) return ep.hls1080
  if (quality === 'hls720' && ep.hls720) return ep.hls720
  if (quality === 'hls480' && ep.hls480) return ep.hls480
  return ep.hls720 || ep.hls480 || ep.hls1080 || ''
}

async function loadData() {
  const id = props.titleId
  if (!id) return
  const cached = titleStore.titleDetails.get(Number(id))
  title.value = cached || (await titleStore.fetchTitle(id))
  episodes.value = title.value?.episodes || []

  if (props.episodeId) {
    currentEpisode.value = episodes.value.find((e) => e.id === props.episodeId) || episodes.value[0]
  } else {
    currentEpisode.value = episodes.value[0]
  }

  await nextTick()
  loadVideo()
}

function loadVideo() {
  if (!videoRef.value || !currentEpisode.value) return
  const url = getHlsUrl(currentEpisode.value, currentQuality.value)
  if (!url) return

  if (hls) {
    hls.destroy()
    hls = null
  }

  if (Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90,
    })
    hls.attachMedia(videoRef.value)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => {
      hls!.loadSource(url)
    })
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.value!.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls!.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls!.recoverMediaError()
            break
        }
      }
    })
  } else if (videoRef.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoRef.value.src = url
    videoRef.value.play().catch(() => {})
  }

  if (currentEpisode.value) {
    const entry = libraryStore.history.find(
      (h) => h.titleId === Number(props.titleId) && h.episodeId === currentEpisode.value!.id
    )
    if (entry) {
      videoRef.value.currentTime = entry.timestamp
    }
  }
}

function selectEpisode(ep: Episode) {
  resetNextEpisodeTimer()
  currentEpisode.value = ep
  loadVideo()
  router.replace(`/player/${props.titleId}/${ep.id}`)
}

function onTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    updateBuffered()

    if (duration.value > 0 && duration.value - currentTime.value <= 5 && !showNextEpisode.value) {
      const idx = episodes.value.findIndex((e) => e.id === currentEpisode.value?.id)
      if (idx >= 0 && idx < episodes.value.length - 1) {
        startNextEpisodeTimer()
      }
    }
  }
}

function startNextEpisodeTimer() {
  if (nextEpisodeTimer) return
  showNextEpisode.value = true
  nextEpisodeProgress.value = 0
  nextEpisodeTimer = setInterval(() => {
    nextEpisodeProgress.value += 2
    if (nextEpisodeProgress.value >= 100) {
      clearInterval(nextEpisodeTimer!)
      nextEpisodeTimer = null
      autoNextEpisode()
    }
  }, 100)
}

function resetNextEpisodeTimer() {
  if (nextEpisodeTimer) {
    clearInterval(nextEpisodeTimer)
    nextEpisodeTimer = null
  }
  showNextEpisode.value = false
  nextEpisodeProgress.value = 0
}

function autoNextEpisode() {
  resetNextEpisodeTimer()
  const idx = episodes.value.findIndex((e) => e.id === currentEpisode.value?.id)
  if (idx < 0) return
  for (let i = idx + 1; i < episodes.value.length; i++) {
    selectEpisode(episodes.value[i])
    return
  }
}

function updateBuffered() {
  if (!videoRef.value || !duration.value) return
  const buffered = videoRef.value.buffered
  if (buffered.length > 0) {
    bufferedPercent.value = (buffered.end(buffered.length - 1) / duration.value) * 100
  }
}

function onLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
    videoRef.value.playbackRate = playbackRate.value
    videoRef.value.volume = volume.value
  }
}

function onVideoPlay() {
  isBuffering.value = false
  isPlaying.value = true
}

function onVideoPause() {
  isPlaying.value = false
}

function onEnded() {
  saveProgress()
  const idx = episodes.value.findIndex((e) => e.id === currentEpisode.value?.id)
  if (idx >= 0 && idx < episodes.value.length - 1) {
    selectEpisode(episodes.value[idx + 1])
  }
}

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

function skip(seconds: number) {
  if (videoRef.value) {
    videoRef.value.currentTime += seconds
  }
}

function seekTo(e: MouseEvent) {
  if (!progressBarRef.value || !videoRef.value || !duration.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  videoRef.value.currentTime = percent * duration.value
}

function seekToTime(time: number) {
  if (videoRef.value) {
    videoRef.value.currentTime = time
  }
}

function onProgressHover(e: MouseEvent) {
  if (!progressBarRef.value || !duration.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = Math.max(0, Math.min(1, x / rect.width))
  hoverPercent.value = percent * 100
  hoverTime.value = percent * duration.value
}

function setVolume() {
  if (videoRef.value) {
    videoRef.value.volume = volume.value
    videoRef.value.muted = volume.value === 0
  }
}

function toggleMute() {
  if (!videoRef.value) return
  if (videoRef.value.muted || volume.value === 0) {
    volume.value = 1
    videoRef.value.muted = false
    videoRef.value.volume = 1
  } else {
    volume.value = 0
    videoRef.value.muted = true
    videoRef.value.volume = 0
  }
}

function setSpeed(rate: number) {
  playbackRate.value = rate
  if (videoRef.value) {
    videoRef.value.playbackRate = rate
  }
  showSpeed.value = false
}

function setQuality(quality: string) {
  currentQuality.value = quality
  const currentTime = videoRef.value?.currentTime || 0
  loadVideo()
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.currentTime = currentTime
    }
  })
  showQuality.value = false
}

function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      containerRef.value?.requestFullscreen?.().catch(() => {})
    }
  } catch {}
}

function onFullscreenChange() {
  if (document.fullscreenElement) {
    showControls()
  }
}

async function togglePip() {
  if (!videoRef.value) return
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture()
  } else {
    try {
      await videoRef.value.requestPictureInPicture()
    } catch {}
  }
}

function showControls() {
  controlsHidden.value = false
  clearTimeout(controlsTimer)
  if (isPlaying.value) {
    controlsTimer = setTimeout(() => {
      controlsHidden.value = true
    }, 3000)
  }
}

function hideControlsDelayed() {
  if (isPlaying.value) {
    controlsTimer = setTimeout(() => {
      controlsHidden.value = true
    }, 3000)
  }
}

function saveProgress() {
  if (title.value && currentEpisode.value && duration.value > 0) {
    libraryStore.addToHistory(
      title.value.id,
      currentEpisode.value.id,
      currentEpisode.value.ordinal,
      currentTime.value,
      duration.value
    )
  }
}

function goBack() {
  router.back()
}

function onKeyDown(e: KeyboardEvent) {
  if (!videoRef.value) return
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return

  switch (e.key) {
    case ' ':
    case 'k':
      e.preventDefault()
      togglePlay()
      break
    case 'ArrowRight':
      e.preventDefault()
      skip(10)
      break
    case 'ArrowLeft':
      e.preventDefault()
      skip(-10)
      break
    case 'ArrowUp':
      e.preventDefault()
      volume.value = Math.min(1, Math.round((volume.value + 0.05) * 100) / 100)
      setVolume()
      break
    case 'ArrowDown':
      e.preventDefault()
      volume.value = Math.max(0, Math.round((volume.value - 0.05) * 100) / 100)
      setVolume()
      break
    case 'f':
    case 'F':
      e.preventDefault()
      toggleFullscreen()
      break
    case 'm':
    case 'M':
      e.preventDefault()
      toggleMute()
      break
    case 'n':
    case 'N':
      e.preventDefault()
      autoNextEpisode()
      break
  }
}

// Touch gestures for mobile
function onTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
  touchStartTime.value = Date.now()
  touchMoved.value = false
}

function onTouchMove(e: TouchEvent) {
  const dx = e.touches[0].clientX - touchStartX.value
  const dy = e.touches[0].clientY - touchStartY.value
  if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
    touchMoved.value = true
  }

  // Horizontal swipe on left/right edge for seek
  if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
    const seekAmount = Math.sign(dx) * 10
    skip(seekAmount)
    touchStartX.value = e.touches[0].clientX
  }
}

function onTouchEnd() {
  if (!touchMoved.value && Date.now() - touchStartTime.value < 300) {
    togglePlay()
  }
}

watch(volume, setVolume)

function onDocumentClick(e: MouseEvent) {
  if (showQuality.value && qualityDropdownRef.value && !qualityDropdownRef.value.contains(e.target as Node)) {
    showQuality.value = false
  }
  if (showSpeed.value && speedDropdownRef.value && !speedDropdownRef.value.contains(e.target as Node)) {
    showSpeed.value = false
  }
}

onMounted(() => {
  loadData()
  saveInterval = setInterval(saveProgress, 5000)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onUnmounted(() => {
  saveProgress()
  clearInterval(saveInterval)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (hls) {
    hls.destroy()
    hls = null
  }
})
</script>

<style scoped lang="scss">
.player-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin: -24px -32px;
  padding: 24px 32px;
  background: var(--md-sys-color-background);

  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    padding: 6px 0;
    transition: color 150ms var(--md-sys-motion-easing-standard);
    &:hover { color: var(--md-sys-color-on-surface); }
  }

  &__title { color: var(--md-sys-color-on-surface); flex: 1; }
  &__episode-info { color: var(--md-sys-color-on-surface-variant); }
}

.player-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  max-height: calc(100vh - 240px);
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden;
  box-shadow: var(--md-sys-elevation-3);
  user-select: none;

  &:fullscreen {
    max-height: 100vh;
    border-radius: 0;
    .player-container__video { border-radius: 0; }
  }

  &__video {
    width: 100%;
    height: 100%;
    object-fit: contain;
    cursor: pointer;
  }

  &__buffering {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.3); z-index: 2;
  }
}

.spinner {
  width: 40px; height: 40px;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: var(--md-sys-color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.player-controls {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  display: flex; flex-direction: column; justify-content: flex-end;
  transition: opacity 300ms var(--md-sys-motion-easing-standard);
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 100%);
  padding-top: 60px;

  &--hidden { opacity: 0; pointer-events: none; }

  &__progress-area { padding: 0 16px; position: relative; }
  &__progress-wrapper { position: relative; padding: 16px 0 6px; }

  &__progress-bar {
    position: relative; height: 3px; cursor: pointer; border-radius: 2px;
  }
  &__progress-track { position: absolute; inset: 0; background: rgba(255,255,255,0.12); border-radius: 2px; }
  &__progress-buffer { position: absolute; top: 0; left: 0; height: 100%; background: rgba(255,255,255,0.18); border-radius: 2px; transition: width 100ms linear; }
  &__progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--md-sys-color-primary); border-radius: 2px; transition: width 100ms linear; box-shadow: 0 0 6px rgba(184,165,232,0.4); }
  &__progress-thumb { position: absolute; top: 50%; width: 14px; height: 14px; background: var(--md-sys-color-primary); border: 2px solid #fff; border-radius: 50%; transform: translate(-50%,-50%) scale(0); transition: transform 200ms var(--md-sys-motion-easing-spring); box-shadow: 0 0 12px rgba(184,165,232,0.5); }
  &__progress-bar:hover &__progress-thumb { transform: translate(-50%,-50%) scale(1); }
  &__progress-hover { position: absolute; top: 0; width: 2px; height: 100%; background: rgba(255,255,255,0.7); transform: translateX(-50%); }
  &__time-tooltip { position: absolute; bottom: 18px; transform: translateX(-50%); background: rgba(0,0,0,0.9); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 12px; white-space: nowrap; pointer-events: none; border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(8px); }
  &__time { padding: 2px 0 10px; color: rgba(255,255,255,0.6); font-size: 12px; letter-spacing: 0.02em; }
  &__bottom { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 16px; gap: 8px; }
  &__left, &__right { display: flex; align-items: center; gap: 4px; }

  &__btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; background: transparent; border: none;
    color: rgba(255,255,255,0.85); cursor: pointer;
    border-radius: var(--md-sys-shape-corner-small);
    transition: background 150ms, color 150ms, transform 150ms;
    &:hover { background: rgba(255,255,255,0.1); color: #fff; transform: scale(1.08); }
    &--text { width: auto; padding: 0 10px; font-weight: 500; letter-spacing: 0.02em; }
  }

  &__volume { display: flex; align-items: center; gap: 4px; position: relative; }
  &__volume-slider {
    width: 0; opacity: 0; overflow: hidden;
    transition: width 200ms, opacity 200ms;
    input[type='range'] { -webkit-appearance: none; width: 80px; height: 3px; background: rgba(255,255,255,0.15); border-radius: 2px; outline: none; }
    input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; width: 10px; height: 10px; background: #fff; border-radius: 50%; cursor: pointer; box-shadow: 0 0 6px rgba(255,255,255,0.3); }
    input[type='range']::-moz-range-thumb { width: 10px; height: 10px; background: #fff; border-radius: 50%; cursor: pointer; border: none; }
  }
  &__volume:hover &__volume-slider { width: 80px; opacity: 1; }

  &__dropdown { position: relative; }
  &__menu {
    position: absolute; bottom: 44px; right: 0;
    background: rgba(15,14,18,0.92); backdrop-filter: blur(24px) saturate(1.3);
    border: 1px solid rgba(255,255,255,0.06); border-radius: var(--md-sys-shape-corner-small);
    padding: 4px; min-width: 100px; display: flex; flex-direction: column; gap: 2px; z-index: 10;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }
  &__menu-item {
    padding: 8px 12px; border-radius: var(--md-sys-shape-corner-extra-small);
    border: none; background: transparent; color: rgba(255,255,255,0.75);
    cursor: pointer; font-size: 13px; text-align: left; transition: background 150ms, color 150ms;
    &:hover { background: rgba(255,255,255,0.06); color: #fff; }
    &.active { color: var(--md-sys-color-primary); background: rgba(184,165,232,0.08); }
  }
}

.player-page__episodes {
  display: flex; flex-direction: column; gap: 12px;
  h3 { color: var(--md-sys-color-on-surface); }
}

.player-page__episodes-list {
  display: flex; gap: 8px; flex-wrap: wrap;
}

.player-page__episode-btn {
  width: 44px; height: 44px; border-radius: var(--md-sys-shape-corner-small);
  border: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface);
  cursor: pointer; font: var(--md-sys-typescale-label-large);
  transition: background-color 150ms, border-color 150ms;
  &:hover { background: var(--md-sys-color-surface-container-high); }
  &--active { background: var(--md-sys-color-primary-container); border-color: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary-container); }
}

.player-top-actions {
  position: absolute; top: 16px; right: 16px; z-index: 4;
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
}

.player-skip-btn {
  padding: 8px 16px; border-radius: var(--md-sys-shape-corner-small);
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,14,18,0.85); backdrop-filter: blur(12px);
  color: var(--md-sys-color-primary); cursor: pointer; font: var(--md-sys-typescale-label-large);
  transition: background-color 150ms, color 150ms, transform 200ms var(--md-sys-motion-easing-spring);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  &:hover { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); transform: translateY(-2px); }
}

.player-next-btn {
  position: relative; overflow: hidden; padding: 10px 18px;
  border-radius: var(--md-sys-shape-corner-small);
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(15,14,18,0.85); backdrop-filter: blur(12px);
  color: var(--md-sys-color-primary); cursor: pointer; font: var(--md-sys-typescale-label-large);
  transition: background-color 150ms, color 150ms, transform 200ms var(--md-sys-motion-easing-spring);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4); min-width: 170px;
  &:hover { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); transform: translateY(-2px); }
  &__track { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.06); }
  &__fill { height: 100%; background: var(--md-sys-color-primary); box-shadow: 0 0 6px rgba(184,165,232,0.5); transition: width 100ms linear; }
}

.skip-enter-active { animation: skipIn 250ms var(--md-sys-motion-easing-spring) backwards; }
.skip-leave-active { animation: skipOut 200ms var(--md-sys-motion-easing-accelerate) forwards; }
@keyframes skipIn { from { opacity: 0; transform: translateY(8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes skipOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(8px) scale(0.96); } }
</style>
