<template>
  <div class="changelog">
    <h1 class="changelog__title">История обновлений</h1>

    <div v-if="store.loading" class="changelog__loading">
      <div v-for="n in 3" :key="n" class="changelog__skeleton md3-skeleton" />
    </div>

    <div v-else-if="store.releases.length === 0" class="changelog__empty">
      <span class="changelog__empty-text">
        Нет данных об обновлениях.
      </span>
    </div>

    <div v-else class="changelog__timeline">
      <div
        v-for="(release, i) in store.releases"
        :key="release.version"
        class="changelog__release"
        :class="{ 'changelog__release--current': i === 0 }"
      >
        <div class="changelog__dot" :class="{ 'changelog__dot--current': i === 0 }" />
        <div v-if="i < store.releases.length - 1" class="changelog__line" />

        <div class="changelog__card glass-strong" :class="{ 'changelog__card--current': i === 0 }">
          <div class="changelog__card-header">
            <span class="changelog__version">v{{ release.version }}</span>
            <span class="changelog__date">{{ release.date }}</span>
            <span v-if="i === 0" class="changelog__badge">Текущая</span>
          </div>

          <p v-if="release.title" class="changelog__card-title">
            {{ release.title }}
          </p>

          <ul class="changelog__changes">
            <li
              v-for="(change, ci) in release.changes"
              :key="ci"
              class="changelog__change"
            >
              {{ change }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useChangelogStore } from '@/stores/changelog'

const store = useChangelogStore()

onMounted(() => {
  if (!store.data) {
    store.fetchChangelog()
  }
})
</script>

<style scoped lang="scss">
.changelog {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 48px;

  &__title {
    font-family: var(--font-family-display);
    font-size: 28px;
    font-weight: 800;
    color: var(--md-sys-color-on-surface);
    letter-spacing: -0.02em;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__skeleton {
    height: 160px;
    border-radius: var(--md-sys-shape-corner-large);
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  &__empty-text {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 14px;
  }

  &__timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
  }

  &__release {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    position: relative;
    padding-bottom: 28px;

    &--current {
      padding-bottom: 20px;
    }
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--md-sys-color-surface-container-high);
    border: 2px solid var(--glass-border);
    flex-shrink: 0;
    margin-top: 6px;
    z-index: 1;

    &--current {
      width: 14px;
      height: 14px;
      margin-top: 5px;
      background: var(--md-sys-color-primary);
      border: 2px solid #ffffff;
    }
  }

  &__line {
    position: absolute;
    left: 7px;
    top: 24px;
    width: 2px;
    bottom: 0;
    background: var(--glass-border);
  }

  &__card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px 24px;
    border-radius: var(--md-sys-shape-corner-large);
    border: 1px solid var(--glass-border);
    background: var(--md-sys-color-surface-container);

    &--current {
      border-color: rgba(255, 255, 255, 0.18);
      box-shadow: var(--md-sys-elevation-2);
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__version {
    font-family: var(--font-family-body);
    font-size: 16px;
    font-weight: 700;
    color: var(--md-sys-color-on-surface);
  }

  &__date {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 12.5px;
    font-weight: 500;
  }

  &__badge {
    padding: 2px 8px;
    background: var(--md-sys-color-primary-container);
    color: #ffffff;
    border-radius: var(--md-sys-shape-corner-full);
    font-family: var(--font-family-body);
    font-size: 11px;
    font-weight: 600;
  }

  &__card-title {
    color: var(--md-sys-color-on-surface);
    font-family: var(--font-family-body);
    font-size: 15px;
    font-weight: 600;
  }

  &__changes {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-left: 18px;
  }

  &__change {
    color: var(--md-sys-color-on-surface-variant);
    font-size: 13.5px;
    line-height: 1.45;

    &::marker {
      color: var(--md-sys-color-primary);
    }
  }
}

@media (max-width: 599px) {
  .changelog {
    &__release {
      gap: 12px;
    }

    &__dot {
      margin-top: 6px;
    }

    &__line {
      left: 6px;
    }

    &__card {
      padding: 14px;
    }

    &__card-header {
      flex-wrap: wrap;
    }
  }
}
</style>
