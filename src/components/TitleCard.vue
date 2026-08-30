<template>
  <div
    class="title-card"
    :class="[
      { 'title-card--hoverable': !loading && !external, 'title-card--external': external },
      `title-card--${variant}`,
    ]"
    data-stagger
    @click="handleClick"
  >
    <div class="title-card__poster" :class="{ 'title-card__poster--external': external }">
      <div
        v-if="loading || !posterLoaded"
        class="title-card__skeleton md3-skeleton"
        :style="skeletonStyle"
      />
      <img
        v-if="title && !loading"
        :src="posterUrl"
        :alt="title.name.main"
        class="title-card__image"
        :class="{ loaded: posterLoaded }"
        loading="lazy"
        @load="posterLoaded = true"
      />

      <!-- Ongoing badge -->
      <div v-if="!loading && title?.isOngoing && !external" class="title-card__badge title-card__badge--ongoing">
        <span class="title-card__badge-dot" />
        <span class="title-card__badge-text">Онгоинг</span>
      </div>

      <!-- External badge -->
      <div v-if="external && !loading" class="title-card__badge title-card__badge--external">
        <span class="title-card__badge-text">Нет в Anilibria</span>
      </div>

      <!-- Score badge -->
      <div v-if="title?.score && !loading" class="title-card__score">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{{ Number(title.score).toFixed(1) }}</span>
      </div>

      <!-- Progress bar -->
      <div v-if="progress != null && !loading" class="title-card__progress">
        <div class="title-card__progress-bar" :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }" />
      </div>

      <!-- Watch later button -->
      <button
        v-if="showWatchLater && !loading && !external"
        class="title-card__watch-later"
        :class="{ 'title-card__watch-later--active': isWatchLater }"
        :title="isWatchLater ? 'Убрать из списка' : 'Добавить в список'"
        @click.stop="toggleWatchLater"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <!-- User rating badge -->
      <div v-if="userRating && !loading" class="title-card__user-rating">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{{ userRating }}</span>
      </div>

      <!-- Play overlay -->
      <div v-if="!loading && !external" class="title-card__overlay">
        <div class="title-card__play-btn">
          <svg class="title-card__play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>

    <div class="title-card__info">
      <h3 v-if="!loading" class="title-card__name">{{ title?.name.main }}</h3>
      <div v-else class="title-card__skeleton title-card__skeleton--text md3-skeleton" />

      <p v-if="!loading && subtitle" class="title-card__subtitle">
        {{ subtitle }}
      </p>
      <p v-else-if="!loading && (title?.year || title?.type?.description)" class="title-card__meta">
        <span v-if="title.year">{{ title.year }}</span>
        <span v-if="title.year && title.type?.description" class="title-card__meta-dot">·</span>
        <span v-if="title.type?.description">{{ title.type.description }}</span>
      </p>
      <div
        v-else-if="loading"
        class="title-card__skeleton title-card__skeleton--meta md3-skeleton"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Title } from '@/types'

const props = defineProps<{
  title?: Title
  loading?: boolean
  aspectRatio?: string
  subtitle?: string
  external?: boolean
  progress?: number
  showWatchLater?: boolean
  isWatchLater?: boolean
  userRating?: number
  variant?: 'default' | 'compact'
}>()

const emit = defineEmits<{
  click: [title: Title]
  'watch-later': [title: Title]
}>()

function handleClick() {
  if (!props.loading && props.title && !props.external) {
    emit('click', props.title)
  }
}

function toggleWatchLater() {
  if (props.title) {
    emit('watch-later', props.title)
  }
}

const posterLoaded = ref(false)

const posterUrl = computed(() => {
  if (!props.title?.poster) return ''
  return props.title.poster.preview || props.title.poster.src || props.title.poster.thumbnail || ''
})

const skeletonStyle = computed(() => ({
  aspectRatio: props.aspectRatio || '2/3',
}))
</script>

<style scoped lang="scss">
.title-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-medium);
  user-select: none;

  &--compact {
    gap: 5px;
    .title-card__info { padding: 0; }
    .title-card__name { font-size: 13px; -webkit-line-clamp: 1; }
    .title-card__meta { font-size: 11px; }
  }

  &--hoverable {
    .title-card__poster {
      transition:
        transform 280ms var(--md-sys-motion-easing-spring),
        box-shadow 280ms ease,
        border-color 200ms ease;
    }

    &:hover .title-card__poster {
      transform: translateY(-4px);
      border-color: var(--glass-border-hover);
      box-shadow: var(--md-sys-elevation-3);
    }

    &:hover .title-card__overlay {
      opacity: 1;
    }

    &:hover .title-card__play-btn {
      transform: scale(1);
    }

    &:hover .title-card__image {
      transform: scale(1.04);
    }

    &:active .title-card__poster {
      transform: scale(0.98);
    }
  }

  &__poster {
    position: relative;
    border-radius: var(--md-sys-shape-corner-medium);
    overflow: hidden;
    background-color: var(--md-sys-color-surface-container);
    aspect-ratio: 2/3;
    border: 1px solid var(--glass-border);
    box-shadow: var(--md-sys-elevation-1);

    &--external {
      opacity: 0.65;
      filter: grayscale(0.5);
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition:
      opacity 300ms ease,
      transform 400ms cubic-bezier(0.25, 1, 0.5, 1);

    &.loaded {
      opacity: 1;
    }
  }

  &__skeleton {
    position: absolute;
    inset: 0;

    &--text {
      position: relative;
      height: 16px;
      width: 80%;
      border-radius: var(--md-sys-shape-corner-extra-small);
      margin-top: 4px;
    }

    &--meta {
      position: relative;
      height: 13px;
      width: 50%;
      border-radius: var(--md-sys-shape-corner-extra-small);
      margin-top: 3px;
    }
  }

  &__badge {
    position: absolute;
    top: 8px;
    right: 8px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: var(--md-sys-shape-corner-full);
    background: rgba(18, 19, 26, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2;

    &--ongoing {
      color: #ffffff;
    }

    &--external {
      left: 8px;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(18, 19, 26, 0.9);
      color: var(--md-sys-color-on-surface-variant);
      justify-content: center;
    }
  }

  &__badge-text {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  &__badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--md-sys-color-tertiary);
    animation: pulseDot 2s infinite ease-in-out;
  }

  &__score {
    position: absolute;
    top: 8px;
    left: 8px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: rgba(18, 19, 26, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: var(--color-score-gold);
    padding: 3px 7px;
    border-radius: var(--md-sys-shape-corner-small);
    font-size: 11px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 2;
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.5);
    z-index: 3;
  }

  &__progress-bar {
    height: 100%;
    background: var(--md-sys-color-primary);
    border-radius: 0 2px 2px 0;
  }

  &__watch-later {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 4;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(18, 19, 26, 0.8);
    backdrop-filter: blur(16px);
    color: #ffffff;
    cursor: pointer;
    transition: background 150ms, transform 200ms var(--md-sys-motion-easing-spring), opacity 150ms;
    opacity: 0;

    .title-card--hoverable:hover & {
      opacity: 1;
    }

    &:hover {
      background: var(--md-sys-color-primary);
      transform: scale(1.08);
    }

    &--active {
      opacity: 1;
      background: var(--md-sys-color-primary);
      border-color: transparent;
    }
  }

  &__user-rating {
    position: absolute;
    bottom: 8px;
    left: 8px;
    z-index: 3;
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(18, 19, 26, 0.85);
    backdrop-filter: blur(10px);
    color: var(--color-score-gold);
    padding: 2px 6px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    font-size: 11px;
    font-weight: 700;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.35);
    opacity: 0;
    transition: opacity 250ms ease;
  }

  &__play-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    transform: scale(0.9);
    transition: transform 250ms var(--md-sys-motion-easing-spring);
  }

  &__play-icon {
    width: 20px;
    height: 20px;
    color: #12131a;
    margin-left: 2px;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 2px;
  }

  &__name {
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 13.5px;
    font-weight: 600;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &--external &__name {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12px;
    font-weight: 500;
  }

  &__meta-dot {
    opacity: 0.5;
  }

  &__subtitle {
    color: var(--md-sys-color-primary);
    font-size: 12px;
    font-weight: 500;
  }
}
</style>
