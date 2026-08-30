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
            <span v-if="title.year" class="hero-carousel__tag">{{ title.year }}</span>
            <span v-if="title.type?.description" class="hero-carousel__tag">{{
              title.type.description
            }}</span>
            <span v-if="title.isOngoing" class="hero-carousel__tag hero-carousel__tag--ongoing">
              <span class="hero-carousel__dot" />
              Онгоинг
            </span>
          </div>
          <h2 class="hero-carousel__title">{{ title.name.main }}</h2>
          <p v-if="title.description" class="hero-carousel__desc">
            {{ truncate(title.description, 180) }}
          </p>
          <div class="hero-carousel__actions">
            <button
              class="hero-carousel__btn hero-carousel__btn--primary"
              @click="$emit('play', title)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Смотреть</span>
            </button>
            <button
              class="hero-carousel__btn hero-carousel__btn--secondary"
              @click="$emit('details', title)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Подробнее</span>
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
          :title="`Слайд ${index + 1}`"
          @click="goTo(index)"
        >
          <div
            v-if="index === activeIndex"
            class="hero-carousel__indicator-fill"
            :style="{ width: `${progress}%` }"
          />
        </button>
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

const SLIDE_DURATION = 7500

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
    progress.value += 100 / (SLIDE_DURATION / 40)
  }, 40)
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
  height: 440px;
  border-radius: var(--md-sys-shape-corner-large);
  overflow: hidden;
  background-color: var(--md-sys-color-surface-container);
  box-shadow: var(--md-sys-elevation-3);
  border: 1px solid var(--glass-border);

  @include mobile {
    height: 270px;
    border-radius: var(--md-sys-shape-corner-medium);
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
    transition: opacity 700ms cubic-bezier(0.25, 1, 0.5, 1);
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
    object-position: center 25%;
    filter: brightness(0.42) saturate(1.05);
    transform: scale(1.03);
    transition: transform 8s cubic-bezier(0.1, 0, 0.2, 1);

    .hero-carousel__slide--active & {
      transform: scale(1);
    }
  }

  &__vignette {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to top, var(--md-sys-color-background) 0%, rgba(9, 9, 12, 0.65) 45%, transparent 85%),
      linear-gradient(to right, rgba(9, 9, 12, 0.85) 0%, rgba(9, 9, 12, 0.35) 55%, transparent 85%);
    z-index: 1;
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 44px 48px;
    width: 100%;
    max-width: 660px;

    .hero-carousel__slide--active & {
      animation: fadeUp 450ms var(--md-sys-motion-easing-decelerate) backwards;
    }

    @include mobile {
      padding: 16px;
      gap: 8px;
      max-width: 100%;
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

  &__tag {
    font-size: 11.5px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 3px 9px;
    border-radius: var(--md-sys-shape-corner-full);
    border: 1px solid rgba(255, 255, 255, 0.1);
    letter-spacing: -0.01em;

    &--ongoing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.12);
    }

    @include mobile {
      font-size: 10px;
      padding: 2px 7px;
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--md-sys-color-tertiary);
  }

  &__title {
    font-family: var(--font-family-display);
    font-size: 32px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.025em;
    line-height: 1.15;

    @include mobile {
      font-size: 18px;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  &__desc {
    color: rgba(245, 245, 247, 0.7);
    font-size: 14px;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 520px;

    @include mobile {
      display: none;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    margin-top: 6px;

    @include mobile {
      gap: 8px;
      margin-top: 2px;
    }
  }

  &__btn {
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
    transition:
      transform 200ms var(--md-sys-motion-easing-spring),
      background 150ms ease;

    &:hover {
      transform: translateY(-2px);
    }

    &:active {
      transform: scale(0.97);
    }

    &--primary {
      background: #ffffff;
      color: #09090c;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);

      &:hover {
        background: #f0f0f2;
      }
    }

    &--secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);

      &:hover {
        background: rgba(255, 255, 255, 0.16);
      }
    }

    @include mobile {
      padding: 7px 15px;
      font-size: 12px;
      gap: 6px;
    }
  }

  &__controls {
    position: absolute;
    bottom: 24px;
    right: 48px;
    z-index: 3;

    @include mobile {
      bottom: 12px;
      right: 16px;
    }
  }

  &__indicators {
    display: flex;
    gap: 6px;
  }

  &__indicator {
    position: relative;
    width: 28px;
    height: 3.5px;
    border-radius: 999px;
    border: none;
    background: rgba(255, 255, 255, 0.18);
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    transition: width 300ms var(--md-sys-motion-easing-spring);

    &--active {
      width: 48px;
      background: rgba(255, 255, 255, 0.28);
    }

    @include mobile {
      width: 18px;
      height: 3px;
      &--active {
        width: 32px;
      }
    }
  }

  &__indicator-fill {
    height: 100%;
    background: #ffffff;
    border-radius: 999px;
  }
}
</style>
