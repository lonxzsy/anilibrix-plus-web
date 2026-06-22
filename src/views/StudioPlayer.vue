<template>
  <div class="studio-player">
    <div class="studio-player__header">
      <button class="studio-player__back" @click="$router.back()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span class="md3-label-large">Назад</span>
      </button>
      <h2 class="studio-player__title md3-title-small">{{ titleName }}</h2>
    </div>

    <div class="player-container" @mousemove="showControls" @mouseleave="hideControlsDelayed">
      <video ref="videoRef" class="player-container__video" playsinline webkit-playsinline
        @timeupdate="onTimeUpdate"
        @loadedmetadata="onLoadedMetadata"
        @waiting="isBuffering = true" @playing="isBuffering = false; isPlaying = true"
        @pause="isPlaying = false" @ended="onEnded"
      />
      <div v-if="isBuffering" class="player-container__buffering">
        <div class="spinner" />
      </div>

      <div class="player-controls" :class="{ 'player-controls--hidden': controlsHidden && isPlaying }">
        <div class="player-controls__progress-area">
          <div class="player-controls__progress-wrapper">
            <div ref="progressBarRef" class="player-controls__progress-bar" @click="seekTo">
              <div class="player-controls__progress-track" />
              <div class="player-controls__progress-fill" :style="{ width: `${progressPercent}%` }" />
              <div class="player-controls__progress-thumb" :style="{ left: `${progressPercent}%` }" />
            </div>
            <div class="player-controls__time">
              <span class="md3-body-small">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
            </div>
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
            <button class="player-controls__btn" @click="isMuted = !isMuted; if(videoRef) videoRef.muted = isMuted">
              <svg v-if="isMuted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
            </button>
          </div>
          <div class="player-controls__right">
            <div class="player-controls__dropdown">
              <button class="player-controls__btn player-controls__btn--text" @click="showQuality = !showQuality">
                <span class="md3-label-small">{{ currentQualityLabel }}</span>
              </button>
              <div v-if="showQuality" class="player-controls__menu">
                <button v-for="v in videos" :key="v.quality" class="player-controls__menu-item"
                  :class="{ active: selectedUrl === v.url }"
                  @click="setVideo(v)"
                >
                  {{ v.quality }}p · {{ v.type }}
                </button>
              </div>
            </div>
            <button class="player-controls__btn" @click="toggleFullscreen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { decoderApi } from '@/api/decoder'
import type { DecoderVideoItem } from '@/api/decoder'
import Hls from 'hls.js'

const route = useRoute()
const source = route.params.source as string
const episodeId = route.params.episodeId as string
const titleName = (route.query.title as string) || ''

const videoRef = ref<HTMLVideoElement>()
const progressBarRef = ref<HTMLElement>()

const videos = ref<DecoderVideoItem[]>([])
const selectedUrl = ref('')
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const isBuffering = ref(true)
const isMuted = ref(false)
const controlsHidden = ref(false)
const showQuality = ref(false)

let hls: Hls | null = null
let controlsTimer: ReturnType<typeof setTimeout>

const progressPercent = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0
)

const currentQualityLabel = computed(() => {
  const v = videos.value.find((v) => v.url === selectedUrl.value)
  return v ? `${v.quality}p` : ''
})

function formatTime(t: number) {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

async function load() {
  try {
    const result = await decoderApi.getEpisodeVideos(source, episodeId)
    videos.value = result.sort((a, b) => b.quality - a.quality)
    if (videos.value.length > 0) {
      setVideo(videos.value[0])
    }
  } catch (e) {
    console.error('Failed to load video', e)
  }
}

function setVideo(v: DecoderVideoItem) {
  selectedUrl.value = v.url
  showQuality.value = false
  if (!videoRef.value) return

  if (hls) { hls.destroy(); hls = null }

  const isM3u8 = v.url.includes('.m3u8') || v.type === 'm3u8' || v.type === 'hls'
  if (isM3u8 && Hls.isSupported()) {
    hls = new Hls({ enableWorker: true, lowLatencyMode: false })
    hls.attachMedia(videoRef.value)
    hls.on(Hls.Events.MEDIA_ATTACHED, () => hls!.loadSource(v.url))
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoRef.value!.play().catch(() => {})
    })
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) {
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hls!.startLoad()
        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hls!.recoverMediaError()
      }
    })
  } else {
    videoRef.value.src = v.url
    videoRef.value.play().catch(() => {})
  }
}

function togglePlay() {
  if (!videoRef.value) return
  if (videoRef.value.paused) { videoRef.value.play(); isPlaying.value = true }
  else { videoRef.value.pause(); isPlaying.value = false }
}

function skip(seconds: number) {
  if (videoRef.value) videoRef.value.currentTime += seconds
}

function seekTo(e: MouseEvent) {
  if (!progressBarRef.value || !videoRef.value || !duration.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  videoRef.value.currentTime = (x / rect.width) * duration.value
}

function onTimeUpdate(e: Event) {
  const target = e.target as HTMLVideoElement
  if (target) currentTime.value = target.currentTime
}

function onLoadedMetadata(e: Event) {
  const target = e.target as HTMLVideoElement
  if (target) {
    duration.value = target.duration
    target.play().catch(() => {})
  }
}

function onEnded() {
  isPlaying.value = false
}

function toggleFullscreen() {
  const el = document.querySelector('.player-container') as HTMLElement
  if (!el) return
  if (document.fullscreenElement) { document.exitFullscreen() }
  else { el.requestFullscreen() }
}

function showControls() {
  controlsHidden.value = false
  clearTimeout(controlsTimer)
  if (isPlaying.value) controlsTimer = setTimeout(() => { controlsHidden.value = true }, 3000)
}

function hideControlsDelayed() {
  if (isPlaying.value) controlsTimer = setTimeout(() => { controlsHidden.value = true }, 3000)
}

onMounted(() => { load() })
onUnmounted(() => { if (hls) hls.destroy() })
</script>

<style scoped lang="scss">
.studio-player {
  display: flex; flex-direction: column; gap: 16px;
  margin: -28px -36px; padding: 28px 36px;
  background: var(--md-sys-color-background);

  &__header {
    display: flex; align-items: center; gap: 16px;
  }

  &__back {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; border: none;
    color: var(--md-sys-color-on-surface-variant); cursor: pointer; padding: 6px 0;
    &:hover { color: var(--md-sys-color-on-surface); }
    span { @media (max-width: 599px) { display: none; } }
  }

  &__title { color: var(--md-sys-color-on-surface); flex: 1; }
}

.player-container {
  position: relative; width: 100%; aspect-ratio: 16/9;
  max-height: calc(100vh - 180px);
  background: var(--md-sys-color-surface-container);
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden; box-shadow: var(--md-sys-elevation-3);

  &:fullscreen { max-height: 100vh; border-radius: 0; }

  &__video { width: 100%; height: 100%; object-fit: contain; }
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
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.player-controls {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 3;
  display: flex; flex-direction: column; justify-content: flex-end;
  transition: opacity 300ms;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
  padding-top: 40px;
  &--hidden { opacity: 0; pointer-events: none; }

  &__progress-area { padding: 0 16px; }
  &__progress-wrapper { padding: 16px 0 6px; }
  &__progress-bar { position: relative; height: 3px; cursor: pointer; }
  &__progress-track { position: absolute; inset: 0; background: rgba(255,255,255,0.12); border-radius: 2px; }
  &__progress-fill { position: absolute; top: 0; left: 0; height: 100%; background: var(--md-sys-color-primary); border-radius: 2px; }
  &__progress-thumb { position: absolute; top: 50%; width: 14px; height: 14px; background: var(--md-sys-color-primary); border: 2px solid #fff; border-radius: 50%; transform: translate(-50%,-50%) scale(0); }
  &__progress-bar:hover &__progress-thumb { transform: translate(-50%,-50%) scale(1); }
  &__time { padding: 2px 0 10px; color: rgba(255,255,255,0.6); font-size: 12px; }

  &__bottom { display: flex; justify-content: space-between; align-items: center; padding: 0 16px 16px; gap: 8px; }
  &__left, &__right { display: flex; align-items: center; gap: 4px; }

  &__btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; background: transparent; border: none;
    color: rgba(255,255,255,0.85); cursor: pointer;
    border-radius: var(--md-sys-shape-corner-small);
    transition: background 150ms, color 150ms;
    &:hover { background: rgba(255,255,255,0.1); color: #fff; }
    &--text { width: auto; padding: 0 10px; font-weight: 500; }
  }

  &__dropdown { position: relative; }

  &__menu {
    position: absolute; bottom: 44px; right: 0;
    background: rgba(15,14,18,0.92); backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.06); border-radius: var(--md-sys-shape-corner-small);
    padding: 4px; min-width: 120px;
    display: flex; flex-direction: column; gap: 2px; z-index: 10;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  }

  &__menu-item {
    padding: 8px 12px; border-radius: var(--md-sys-shape-corner-extra-small);
    border: none; background: transparent; color: rgba(255,255,255,0.75);
    cursor: pointer; font-size: 13px; text-align: left;
    &:hover { background: rgba(255,255,255,0.06); color: #fff; }
    &.active { color: var(--md-sys-color-primary); background: rgba(184,165,232,0.08); }
  }
}
</style>
