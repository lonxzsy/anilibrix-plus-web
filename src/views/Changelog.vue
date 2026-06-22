<template>
  <div class="changelog">
    <h1 class="changelog__title md3-headline-medium">История обновлений</h1>

    <div v-if="store.loading" class="changelog__loading">
      <div v-for="n in 3" :key="n" class="changelog__skeleton md3-skeleton" />
    </div>

    <div v-else-if="store.releases.length === 0" class="changelog__empty">
      <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
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
            <span class="changelog__version md3-title-medium">v{{ release.version }}</span>
            <span class="changelog__date md3-body-small">{{ release.date }}</span>
            <span v-if="i === 0" class="changelog__badge md3-label-small">Текущая</span>
          </div>

          <p v-if="release.title" class="changelog__card-title md3-body-large">
            {{ release.title }}
          </p>

          <ul class="changelog__changes">
            <li
              v-for="(change, ci) in release.changes"
              :key="ci"
              class="changelog__change md3-body-medium"
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
    color: var(--md-sys-color-on-surface);
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
    padding-bottom: 32px;

    &--current {
      padding-bottom: 16px;
    }
  }

  &__dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--md-sys-color-surface-container-highest);
    border: 2px solid var(--md-sys-color-outline-variant);
    flex-shrink: 0;
    margin-top: 6px;
    z-index: 1;

    &--current {
      width: 16px;
      height: 16px;
      margin-top: 4px;
      background: var(--md-sys-color-primary);
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 12px rgba(184, 165, 232, 0.4);
    }
  }

  &__line {
    position: absolute;
    left: 5px;
    top: 20px;
    width: 2px;
    bottom: 0;
    background: var(--md-sys-color-outline-variant);
  }

  &__card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px 24px;
    border-radius: var(--md-sys-shape-corner-large);
    border: 1px solid rgba(255, 255, 255, 0.05);

    &--current {
      border-color: rgba(184, 165, 232, 0.2);
      box-shadow: var(--glow-primary);
    }
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__version {
    color: var(--md-sys-color-primary);
  }

  &__date {
    color: var(--md-sys-color-on-surface-variant);
  }

  &__badge {
    padding: 2px 8px;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    border-radius: var(--md-sys-shape-corner-small);
  }

  &__card-title {
    color: var(--md-sys-color-on-surface);
  }

  &__changes {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 20px;
  }

  &__change {
    color: var(--md-sys-color-on-surface-variant);
    line-height: 1.5;

    &::marker {
      color: var(--md-sys-color-primary);
    }
  }
}

@media (max-width: 599px) {
  .changelog {
    &__card {
      padding: 16px;
    }

    &__card-header {
      flex-wrap: wrap;
    }
  }
}
</style>
