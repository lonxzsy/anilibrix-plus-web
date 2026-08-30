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
      <div v-else class="character-card__placeholder">
        {{ entry.character.name.charAt(0) }}
      </div>
      <span
        class="character-card__role"
        :class="{ 'character-card__role--main': entry.role === 'Main' }"
      >
        {{ entry.role === 'Main' ? 'Главная' : entry.role === 'Supporting' ? 'Второстепенная' : entry.role }}
      </span>
    </div>
    <div class="character-card__info">
      <span class="character-card__name">{{ entry.character.name }}</span>
      <div v-if="japaneseVA || englishVA" class="character-card__va">
        <span v-if="japaneseVA" class="character-card__va-item">
          <span class="character-card__va-lang">JP</span>
          {{ japaneseVA.name }}
        </span>
        <span v-if="englishVA" class="character-card__va-item">
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
  border: 1px solid var(--glass-border);
  overflow: hidden;
  transition:
    transform 180ms ease,
    border-color 150ms ease;

  &:hover {
    transform: translateY(-3px);
    border-color: var(--glass-border-hover);
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
    transition: transform 300ms ease;

    .character-card:hover & {
      transform: scale(1.04);
    }
  }

  &__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-on-surface-variant);
    font-family: var(--font-family-body);
    font-size: 20px;
    font-weight: 700;
    background: var(--md-sys-color-surface-container-high);
  }

  &__role {
    position: absolute;
    bottom: 6px;
    left: 6px;
    padding: 2px 7px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    background: rgba(18, 19, 26, 0.8);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.85);
    font-size: 10px;
    font-weight: 600;

    &--main {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
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
    font-family: var(--font-family-display);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__va {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__va-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--md-sys-color-on-surface-variant);
    font-size: 11px;
    line-height: 1.3;
  }

  &__va-lang {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 16px;
    border-radius: 4px;
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-primary);
    font-family: var(--font-family-display);
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }
}
</style>
