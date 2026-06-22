<template>
  <div class="studio-episodes">
    <button class="studio-episodes__back" @click="$router.back()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span class="md3-label-large">Назад</span>
    </button>

    <div v-if="loading" class="studio-episodes__loading">
      <div v-for="n in 3" :key="n" class="md3-skeleton" style="height: 120px; border-radius: 8px" />
    </div>

    <template v-else-if="anime">
      <div class="studio-episodes__header">
        <img class="studio-episodes__poster" :src="anime.thumbnail" alt="" />
        <div class="studio-episodes__info">
          <h2 class="md3-title-large">{{ anime.title }}</h2>
          <p class="md3-body-medium" style="color: var(--md-sys-color-on-surface-variant)">
            {{ sourceLabel }} · {{ anime.episodes.length }} эпизодов
          </p>
        </div>
      </div>

      <div class="studio-episodes__list">
        <button
          v-for="ep in anime.episodes"
          :key="ep.id"
          class="studio-episodes__item glass"
          @click="play(ep)"
        >
          <div class="studio-episodes__item-num">{{ ep.ordinal }}</div>
          <div class="studio-episodes__item-info">
            <span class="md3-label-large">{{ ep.title }}</span>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;color:var(--md-sys-color-primary)">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { decoderApi, SOURCES } from '@/api/decoder'
import type { DecoderAnimeDetail } from '@/api/decoder'

const route = useRoute()
const router = useRouter()
const source = route.params.source as string
const id = route.params.id as string
const titleName = (route.query.title as string) || ''

const anime = ref<DecoderAnimeDetail | null>(null)
const loading = ref(true)

const sourceLabel = computed(() => SOURCES.find((s) => s.name === source)?.label || source)

async function load() {
  loading.value = true
  try {
    anime.value = await decoderApi.getAnime(source, id)
  } catch (e) {
    console.error('Failed to load episodes', e)
  } finally {
    loading.value = false
  }
}

function play(ep: { id: string }) {
  router.push(`/studios/player/${source}/${ep.id}?title=${encodeURIComponent(anime.value?.title || titleName)}`)
}

onMounted(load)
</script>

<style scoped lang="scss">
@use "@/styles/responsive.scss" as *;

.studio-episodes {
  display: flex; flex-direction: column; gap: 20px;

  &__back {
    display: inline-flex; align-items: center; gap: 8px;
    background: transparent; border: none; color: var(--md-sys-color-on-surface-variant);
    cursor: pointer; padding: 4px 0; width: fit-content;
    &:hover { color: var(--md-sys-color-on-surface); }
  }

  &__loading { display: flex; flex-direction: column; gap: 12px; }

  &__header {
    display: flex; gap: 20px; align-items: flex-start;
    img { width: 120px; height: 170px; object-fit: cover; border-radius: var(--md-sys-shape-corner-small); flex-shrink: 0; }
  }

  &__info { display: flex; flex-direction: column; gap: 6px; }

  &__list { display: flex; flex-direction: column; gap: 8px; }

  &__item {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px; border-radius: var(--md-sys-shape-corner-small);
    border: none; background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface); cursor: pointer; width: 100%; text-align: left;
    transition: transform 200ms, box-shadow 200ms;
    &:hover { transform: translateX(4px); box-shadow: var(--glow-primary); }
  }

  &__item-num {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: var(--md-sys-color-surface-container-high);
    color: var(--md-sys-color-primary);
    font: var(--md-sys-typescale-title-medium); flex-shrink: 0;
  }

  &__item-info { flex: 1; min-width: 0; }
}
</style>
