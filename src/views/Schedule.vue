<template>
  <div class="schedule">
    <h1 class="schedule__title md3-headline-medium">Расписание</h1>

    <div ref="tabsRef" class="schedule__tabs">
      <div class="schedule__indicator" :style="indicatorStyle" />
      <button
        v-for="day in days"
        :key="day.value"
        class="schedule__tab"
        :class="{ 'schedule__tab--active': activeDay === day.value }"
        @click="activeDay = day.value"
      >
        <span class="schedule__tab-label md3-label-large">{{ day.label }}</span>
        <span v-if="dayCounts[day.value]" class="schedule__tab-count md3-label-small">{{ dayCounts[day.value] }}</span>
      </button>
    </div>

    <div class="schedule__content">
      <div v-if="currentDayItems.length > 0" class="schedule__grid">
        <TitleCard
          v-for="item in currentDayItems"
          :key="item.release.id"
          :title="item.release"
          @click="goToDetails(item.release)"
        />
      </div>
      <div v-else-if="loading" class="schedule__skeletons">
        <div v-for="n in 6" :key="n" class="md3-skeleton" style="height: 280px; border-radius: 4px;" />
      </div>
      <div v-else class="schedule__empty">
        <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
          На этот день нет запланированных релизов.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTitleStore } from '@/stores/titles'
import TitleCard from '@/components/TitleCard.vue'
import type { Title } from '@/types'

const router = useRouter()
const titleStore = useTitleStore()

const days = [
  { value: 'monday', label: 'Пн' },
  { value: 'tuesday', label: 'Вт' },
  { value: 'wednesday', label: 'Ср' },
  { value: 'thursday', label: 'Чт' },
  { value: 'friday', label: 'Пт' },
  { value: 'saturday', label: 'Сб' },
  { value: 'sunday', label: 'Вс' }
]

const dayMap: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
}

const todayDayValue = () => {
  const today = new Date().getDay()
  const entry = Object.entries(dayMap).find(([, v]) => v === today)
  return entry ? entry[0] : 'monday'
}
const activeDay = ref(todayDayValue())

const loading = computed(() => titleStore.loading)
const currentDayItems = computed(() => {
  return titleStore.schedule.filter(item => item.release.publishDay?.value === activeDay.value)
})

const dayCounts = computed(() => {
  const counts: Record<string, number> = {}
  days.forEach(d => {
    counts[d.value] = titleStore.schedule.filter(
      item => item.release.publishDay?.value === d.value
    ).length
  })
  return counts
})

function goToDetails(title: Title) {
  router.push(`/title/${title.id}`)
}

// Smooth indicator logic
const tabsRef = ref<HTMLElement>()
const indicatorStyle = ref<Record<string, string>>({})

function updateIndicator() {
  if (!tabsRef.value) return
  const activeEl = tabsRef.value.querySelector('.schedule__tab--active') as HTMLElement | null
  if (!activeEl) return
  indicatorStyle.value = {
    transform: `translateX(${activeEl.offsetLeft}px)`,
    width: `${activeEl.offsetWidth}px`
  }
}

watch(activeDay, () => nextTick(updateIndicator), { flush: 'post' })

onMounted(() => {
  if (titleStore.schedule.length === 0) {
    titleStore.fetchSchedule()
  }
  nextTick(updateIndicator)
})
</script>

<style scoped lang="scss">
.schedule {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__title {
    color: var(--md-sys-color-on-surface);
  }

  &__tabs {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    position: relative;
  }

  &__indicator {
    position: absolute;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: var(--md-sys-color-primary);
    border-radius: 2px 2px 0 0;
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.4);
    transition: transform 300ms var(--md-sys-motion-easing-spring),
                width 300ms var(--md-sys-motion-easing-spring);
    pointer-events: none;
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    position: relative;
    transition: color 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      color: var(--md-sys-color-on-surface);
    }

    &--active {
      color: var(--md-sys-color-primary);
    }
  }

  &__tab-label {
    letter-spacing: 0.02em;
  }

  &__tab-count {
    padding: 2px 8px;
    background: var(--md-sys-color-surface-container);
    border-radius: var(--md-sys-shape-corner-small);
    color: var(--md-sys-color-on-surface-variant);
    font-size: 11px;
    transition: background-color 200ms, color 200ms;

    .schedule__tab--active & {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
  }

  &__content {
    min-height: 200px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  &__skeletons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }
}
</style>
