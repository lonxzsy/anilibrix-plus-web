<template>
  <div
    class="title-card"
    :class="{ 'title-card--hoverable': !loading }"
    @click="handleClick"
  >
    <div class="title-card__poster">
      <div v-if="loading || !posterLoaded" class="title-card__skeleton md3-skeleton" :style="skeletonStyle" />
      <img
        v-if="title && !loading"
        :src="posterUrl"
        :alt="title.name.main"
        class="title-card__image"
        :class="{ 'loaded': posterLoaded }"
        loading="lazy"
        @load="posterLoaded = true"
      />
      <div v-if="!loading && title?.isOngoing" class="title-card__badge">
        <span class="md3-label-small">Онгоинг</span>
      </div>
      <div v-if="!loading" class="title-card__overlay">
        <svg class="title-card__play" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
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
      <div v-else-if="loading" class="title-card__skeleton title-card__skeleton--meta md3-skeleton" />
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
}>()

const emit = defineEmits<{
  click: [title: Title]
}>()

function handleClick() {
  if (!props.loading && props.title) {
    emit('click', props.title)
  }
}

const posterLoaded = ref(false)

const posterUrl = computed(() => {
  if (!props.title?.poster) return ''
  return props.title.poster.preview || props.title.poster.src || props.title.poster.thumbnail || ''
})

const skeletonStyle = computed(() => ({
  aspectRatio: props.aspectRatio || '2/3'
}))
</script>

<style scoped lang="scss">
.title-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  border-radius: var(--md-sys-shape-corner-small);
  animation: scaleIn 400ms var(--md-sys-motion-easing-decelerate) backwards;

  @for $i from 1 through 20 {
    &:nth-child(#{$i}) {
      animation-delay: $i * 40ms;
    }
  }

  &--hoverable {
    .title-card__poster {
      transition: transform 350ms var(--md-sys-motion-easing-spring),
                  box-shadow 350ms var(--md-sys-motion-easing-standard);
    }

    &:hover .title-card__poster {
      transform: translateY(-4px) scale(1.01);
      box-shadow: var(--glow-primary), 0 12px 40px rgba(0,0,0,0.5);
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
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 400ms var(--md-sys-motion-easing-standard),
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
    border: 1px solid rgba(255,255,255,0.05);
    letter-spacing: 0.03em;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0.45);
    opacity: 0;
    transition: opacity 300ms var(--md-sys-motion-easing-standard);
  }

  &__play {
    width: 44px;
    height: 44px;
    color: #fff;
    filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
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
