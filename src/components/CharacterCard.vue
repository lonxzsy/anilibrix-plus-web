<template>
  <div class="character-card">
    <div class="character-card__image-wrap">
      <img
        v-if="entry.character.image"
        class="character-card__image"
        :src="entry.character.image"
        :alt="entry.character.name"
        loading="lazy"
      />
      <div v-else class="character-card__placeholder md3-title-medium">
        {{ entry.character.name.charAt(0) }}
      </div>
      <span
        class="character-card__role md3-label-small"
        :class="{ 'character-card__role--main': entry.role === 'Main' }"
      >
        {{ entry.role === 'Main' ? 'Главная' : entry.role === 'Supporting' ? 'Второстепенная' : entry.role }}
      </span>
    </div>
    <div class="character-card__info">
      <span class="character-card__name md3-label-large">{{ entry.character.name }}</span>
      <div v-if="japaneseVA || englishVA" class="character-card__va">
        <span v-if="japaneseVA" class="character-card__va-item md3-body-small">
          <span class="character-card__va-lang">JP</span>
          {{ japaneseVA.name }}
        </span>
        <span v-if="englishVA" class="character-card__va-item md3-body-small">
          <span class="character-card__va-lang">EN</span>
          {{ englishVA.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JikanCharacterEntry } from '@/types'

const props = defineProps<{ entry: JikanCharacterEntry }>()

const japaneseVA = computed(() =>
  props.entry.voiceActors.find((va) => va.language === 'Japanese')
)
const englishVA = computed(() =>
  props.entry.voiceActors.find((va) => va.language === 'English')
)
</script>

<style scoped lang="scss">
.character-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: var(--md-sys-shape-corner-medium);
  background: var(--md-sys-color-surface-container);
  overflow: hidden;
  transition:
    transform 250ms var(--md-sys-motion-easing-spring),
    box-shadow 250ms var(--md-sys-motion-easing-standard);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--glow-primary), var(--md-sys-elevation-3);
  }

  &__image-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    background: var(--md-sys-color-surface-container-high);
    overflow: hidden;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 400ms var(--md-sys-motion-easing-standard);

    .character-card:hover & {
      transform: scale(1.06);
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-on-surface-variant);
    background: var(--md-sys-color-surface-container-high);
  }

  &__role {
    position: absolute;
    bottom: 6px;
    left: 6px;
    padding: 2px 8px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    color: rgba(255, 255, 255, 0.85);
    font-size: 10px;
    letter-spacing: 0.03em;

    &--main {
      background: rgba(184, 165, 232, 0.25);
      color: var(--md-sys-color-primary);
      border: 1px solid rgba(184, 165, 232, 0.2);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 10px 10px;
  }

  &__name {
    color: var(--md-sys-color-on-surface);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__va {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__va-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.3;
  }

  &__va-lang {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 16px;
    border-radius: 2px;
    background: var(--md-sys-color-surface-container-highest);
    color: var(--md-sys-color-on-surface-variant);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
}
</style>
