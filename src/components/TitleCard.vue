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
      <div v-if="!loading && title?.isOngoing && !external" class="title-card__badge">
        <span class="md3-label-small">Онгоинг</span>
      </div>
      <div v-if="external && !loading" class="title-card__badge title-card__badge--external">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span class="md3-label-small">Нет в Anilibria</span>
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </button>

      <div v-if="!loading && !external" class="title-card__overlay">
        <svg class="title-card__play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>
    <div v-if="external && title?.score" class="title-card__score">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span>{{ title.score.toFixed(1) }}</span>
    </div>

    <!-- User rating badge -->
    <div v-if="userRating && !loading" class="title-card__user-rating">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
      <span>{{ userRating }}</span>
    </div>

    <div class="title-card__info">
      <h3 v-if="!loading" class="title-card__name md3-body-medium">{{ title?.name.main }}</h3>
      <div v-else class="title-card__skeleton title-card__skeleton--text md3-skeleton" />
      <p v-if="!loading && subtitle" class="title-card__subtitle md3-body-small">
        {{ subtitle }}
      </p>
      <p v-else-if="!loading && title?.year" class="title-card__meta md3-body-small">
        {{ title.year }}<span v-if="title.type?.description"> · {{ title.type.description }}</span>
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
  gap: 10px;
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-small);

  &--compact {
    gap: 6px;
    .title-card__info { padding: 0; }
    .title-card__name { font-size: 12px; -webkit-line-clamp: 1; }
    .title-card__meta { font-size: 11px; }
  }

  &--hoverable {
    .title-card__poster {
      transition:
        transform 350ms var(--md-sys-motion-easing-spring),
        box-shadow 350ms var(--md-sys-motion-easing-standard);
    }

    &:hover .title-card__poster {
      transform: translateY(-4px) scale(1.01);
      box-shadow:
        var(--glow-primary),
        0 12px 40px rgba(0, 0, 0, 0.5);
    }

    &:hover .title-card__overlay {
      opacity: 1;
    }

    &:hover .title-card__image {
      transform: scale(1.05);
    }

    &:active .title-card__poster {
      transform: scale(0.98);
    }
  }

  &__poster {
    position: relative;
    border-radius: var(--md-sys-shape-corner-small);
    overflow: hidden;
    background-color: var(--md-sys-color-surface-container);
    aspect-ratio: 2/3;

    &--external {
      opacity: 0.6;
      filter: grayscale(0.65);
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition:
      opacity 400ms var(--md-sys-motion-easing-standard),
      transform 500ms var(--md-sys-motion-easing-standard);

    &.loaded {
      opacity: 1;
    }
  }

  &__skeleton {
    position: absolute;
    inset: 0;

    &--text {
      position: relative;
      height: 18px;
      width: 75%;
      margin-top: 4px;
    }

    &--meta {
      position: relative;
      height: 14px;
      width: 45%;
      margin-top: 4px;
    }
  }

  &__badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.55);
    color: var(--md-sys-color-tertiary);
    padding: 3px 10px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    letter-spacing: 0.03em;

    &--external {
      display: flex;
      align-items: center;
      gap: 4px;
      left: 10px;
      right: 10px;
      width: auto;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: var(--md-sys-color-on-surface-variant);
      border-color: rgba(255, 255, 255, 0.08);
      justify-content: center;
      backdrop-filter: blur(12px);
    }
  }

  &__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.25);
    z-index: 2;
  }

  &__progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--md-sys-color-primary), var(--md-sys-color-tertiary));
    border-radius: 0 2px 0 0;
    transition: width 400ms var(--md-sys-motion-easing-spring);
    box-shadow: 0 0 6px rgba(184, 165, 232, 0.3);
  }

  &__watch-later {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 3;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: none;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: background 150ms, color 150ms, transform 200ms var(--md-sys-motion-easing-spring);
    opacity: 0;

    .title-card--hoverable:hover & {
      opacity: 1;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.75);
      color: #fff;
      transform: scale(1.1);
    }

    &--active {
      opacity: 1;
      color: var(--md-sys-color-primary);
      background: rgba(184, 165, 232, 0.2);
    }
  }

  &__score {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(0, 0, 0, 0.6);
    color: #ffc107;
    padding: 2px 7px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    font-size: 11px;
    letter-spacing: 0.02em;
    backdrop-filter: blur(8px);
  }

  &__user-rating {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    color: var(--md-sys-color-primary);
    padding: 2px 7px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    opacity: 0;
    transition: opacity 300ms var(--md-sys-motion-easing-standard);
  }

  &__play {
    width: 44px;
    height: 44px;
    color: #fff;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
    transition: transform 300ms var(--md-sys-motion-easing-spring);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 2px;
  }

  &__name {
    color: var(--md-sys-color-on-surface);
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    letter-spacing: -0.01em;
  }

  &--external &__name {
    color: var(--md-sys-color-on-surface-variant);
  }

  &--external &__meta {
    color: var(--md-sys-color-on-surface-variant);
    opacity: 0.6;
  }

  &__meta {
    color: var(--md-sys-color-on-surface-variant);
    letter-spacing: 0.01em;
  }

  &__subtitle {
    color: var(--md-sys-color-primary);
    letter-spacing: 0.01em;
    font-weight: 500;
  }
}
</style>
