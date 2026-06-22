<template>
  <div class="hero-carousel" @mouseenter="pauseAutoPlay" @mouseleave="startAutoPlay">
    <div class="hero-carousel__slides">
      <div
        v-for="(title, index) in titles"
        :key="title.id"
        class="hero-carousel__slide"
        :class="{ 'hero-carousel__slide--active': index === activeIndex }"
      >
        <img class="hero-carousel__bg" :src="bgUrl(title)" :alt="title.name.main" loading="eager" />
        <div class="hero-carousel__vignette" />
        <div class="hero-carousel__content">
          <div class="hero-carousel__metadata">
            <span v-if="title.year" class="hero-carousel__year">{{ title.year }}</span>
            <span v-if="title.type?.description" class="hero-carousel__type">{{
              title.type.description
            }}</span>
            <span v-if="title.isOngoing" class="hero-carousel__ongoing">Онгоинг</span>
          </div>
          <h2 class="hero-carousel__title md3-headline-large">{{ title.name.main }}</h2>
          <p v-if="title.description" class="hero-carousel__desc md3-body-large">
            {{ truncate(title.description, 180) }}
          </p>
          <div class="hero-carousel__actions">
            <button
              class="hero-carousel__btn hero-carousel__btn--primary glow-hover"
              @click="$emit('play', title)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span class="md3-label-large">Смотреть</span>
            </button>
            <button
              class="hero-carousel__btn hero-carousel__btn--secondary"
              @click="$emit('details', title)"
            >
              <span class="md3-label-large">Подробнее</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="hero-carousel__controls">
      <div class="hero-carousel__indicators">
        <button
          v-for="(_, index) in titles"
          :key="index"
          class="hero-carousel__indicator"
          :class="{ 'hero-carousel__indicator--active': index === activeIndex }"
          @click="goTo(index)"
        />
      </div>
      <div class="hero-carousel__progress">
        <div class="hero-carousel__progress-bar" :style="{ width: `${progress}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Title } from '@/types'

const props = defineProps<{
  titles: Title[]
}>()

defineEmits<{
  play: [title: Title]
  details: [title: Title]
}>()

const activeIndex = ref(0)
const progress = ref(0)
let autoPlayInterval: ReturnType<typeof setInterval> | null = null
let progressInterval: ReturnType<typeof setInterval> | null = null

const SLIDE_DURATION = 8000

function bgUrl(title: Title) {
  return title.poster?.src || title.poster?.preview || ''
}

function goTo(index: number) {
  activeIndex.value = index
  resetProgress()
}

function startAutoPlay() {
  if (autoPlayInterval) clearInterval(autoPlayInterval)
  if (progressInterval) clearInterval(progressInterval)
  resetProgress()
  progressInterval = setInterval(() => {
    progress.value += 100 / (SLIDE_DURATION / 50)
  }, 50)
  autoPlayInterval = setInterval(() => {
    activeIndex.value = (activeIndex.value + 1) % props.titles.length
    resetProgress()
  }, SLIDE_DURATION)
}

function resetProgress() {
  progress.value = 0
}

function pauseAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

function truncate(str: string, len: number) {
  if (str.length <= len) return str
  return str.slice(0, len) + '...'
}

onMounted(() => startAutoPlay())
onUnmounted(() => pauseAutoPlay())
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.hero-carousel {
  position: relative;
  width: 100%;
  height: 480px;
  border-radius: var(--md-sys-shape-corner-small);
  overflow: hidden;
  background-color: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-3);

  @include mobile {
    height: 240px;
    border-radius: var(--md-sys-shape-corner-extra-small);
  }

  &__slides {
    position: relative;
    width: 100%;
    height: 100%;
  }

  &__slide {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 800ms cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: flex-end;
    overflow: hidden;

    &--active {
      opacity: 1;
      z-index: 1;
    }
  }

  &__bg {
    position: absolute;
    inset: -10px;
    width: calc(100% + 20px);
    height: calc(100% + 20px);
    object-fit: cover;
    filter: blur(10px) brightness(0.35) saturate(0.7);
    transform: scale(1.08);
    transition: transform 12s ease-out;

    .hero-carousel__slide--active & {
      transform: scale(1);
    }
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, var(--md-sys-color-background) 0%, transparent 50%),
      linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, transparent 40%);
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 48px;
    width: 100%;
    max-width: 650px;
    animation: fadeUp 600ms var(--md-sys-motion-easing-decelerate) backwards;

    .hero-carousel__slide--active & {
      animation: fadeUp 600ms var(--md-sys-motion-easing-decelerate) backwards;
    }

    @include mobile {
      padding: 16px;
      gap: 6px;
      max-width: 100%;
    }
  }

  &__metadata {
    display: flex;
    gap: 12px;
    align-items: center;

    @include mobile {
      gap: 8px;
    }
  }

  &__year,
  &__type {
    font: var(--md-sys-typescale-label-large);
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 11px;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);

    @include mobile {
      font-size: 10px;
    }
  }

  &__ongoing {
    font: var(--md-sys-typescale-label-medium);
    color: var(--md-sys-color-tertiary);
    background: rgba(232, 165, 184, 0.1);
    padding: 3px 10px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    letter-spacing: 0.03em;
    font-size: 11px;
    border: 1px solid rgba(232, 165, 184, 0.15);

    @include mobile {
      padding: 2px 8px;
      font-size: 10px;
    }
  }

  &__title {
    color: var(--md-sys-color-on-background);
    letter-spacing: -0.03em;
    line-height: 1.05;
    text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5);

    @include mobile {
      font-size: 16px;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__desc {
    color: rgba(226, 224, 230, 0.65);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.5;
    max-width: 520px;

    @include mobile {
      display: none;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;

    @include mobile {
      gap: 8px;
      margin-top: 4px;
    }
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    border-radius: var(--md-sys-shape-corner-small);
    border: none;
    cursor: pointer;
    font: var(--md-sys-typescale-label-large);
    letter-spacing: 0.01em;
    transition:
      transform 200ms var(--md-sys-motion-easing-spring),
      box-shadow 200ms var(--md-sys-motion-easing-standard),
      opacity 150ms var(--md-sys-motion-easing-standard);

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.96);
    }

    &--primary {
      background-color: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
      box-shadow: 0 2px 12px rgba(184, 165, 232, 0.25);
    }

    &--secondary {
      background: rgba(255, 255, 255, 0.06);
      color: var(--md-sys-color-on-surface);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
    }

    @include mobile {
      padding: 6px 14px;
      font-size: 12px;
      gap: 6px;
    }
  }

  &__controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 3;
    padding: 0 48px 28px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    @include mobile {
      padding: 0 16px 16px;
      gap: 8px;
    }
  }

  &__indicators {
    display: flex;
    gap: 10px;

    @include mobile {
      gap: 6px;
    }
  }

  &__indicator {
    width: 28px;
    height: 3px;
    border-radius: 2px;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    cursor: pointer;
    transition:
      background 300ms var(--md-sys-motion-easing-standard),
      width 300ms var(--md-sys-motion-easing-spring);

    &--active {
      background: var(--md-sys-color-primary);
      width: 48px;
      box-shadow: 0 0 8px rgba(184, 165, 232, 0.3);
    }

    @include mobile {
      width: 20px;
      height: 2px;
      &--active {
        width: 32px;
      }
    }
  }

  &__progress {
    height: 2px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 1px;
    overflow: hidden;

    @include mobile {
      display: none;
    }
  }

  &__progress-bar {
    height: 100%;
    background: var(--md-sys-color-primary);
    transition: width 50ms linear;
    border-radius: 1px;
    box-shadow: 0 0 6px rgba(184, 165, 232, 0.3);
  }
}
</style>
