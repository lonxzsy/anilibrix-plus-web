import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { Title, ScheduleItem } from '@/types'

export const useTitleStore = defineStore('titles', () => {
  const titles = ref<Title[]>([])
  const titleDetails = ref<Map<number, Title>>(new Map())
  const schedule = ref<ScheduleItem[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const paginationMeta = ref<any>(null)

  const filteredTitles = computed(() => {
    let result = titles.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.main.toLowerCase().includes(q) ||
          t.name.english?.toLowerCase().includes(q) ||
          t.name.alternative?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      )
    }
    return result
  })

  const recentUpdates = computed(() => {
    return [...titles.value].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 12)
  })

  async function fetchTitles(page = 1, limit = 20, search?: string) {
    loading.value = true
    try {
      const result = await api.getCatalogReleases(page, limit, search)
      if (page === 1) titles.value = result.data
      else titles.value.push(...result.data)
      paginationMeta.value = result.meta
    } finally {
      loading.value = false
    }
  }

  async function fetchTitle(idOrAlias: string | number) {
    loading.value = true
    try {
      const data = await api.getRelease(idOrAlias)
      titleDetails.value.set(data.id, data)
      return data
    } finally {
      loading.value = false
    }
  }

  async function searchTitles(query: string) {
    searchQuery.value = query
    await fetchTitles(1, 20, query)
  }

  async function fetchSchedule() {
    loading.value = true
    try {
      schedule.value = await api.getSchedule()
    } finally {
      loading.value = false
    }
  }

  function setSearchQuery(q: string) {
    searchQuery.value = q
  }

  return {
    titles,
    titleDetails,
    schedule,
    loading,
    searchQuery,
    paginationMeta,
    filteredTitles,
    recentUpdates,
    fetchTitles,
    fetchTitle,
    searchTitles,
    fetchSchedule,
    setSearchQuery,
  }
})
