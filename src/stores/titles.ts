import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import { createSearchEngine } from '@/utils/search'
import { searchJikan } from '@/utils/external-search'
import type { Title, ScheduleItem } from '@/types'

export const useTitleStore = defineStore('titles', () => {
  const titles = ref<Title[]>([])
  const titleDetails = ref<Map<number, Title>>(new Map())
  const schedule = ref<ScheduleItem[]>([])
  const loading = ref(false)
  const externalLoading = ref(false)
  const searchQuery = ref('')
  const externalTitles = ref<Title[]>([])
  const paginationMeta = ref<any>(null)

  const searchEngine = createSearchEngine(() => [
    ...titles.value,
    ...externalTitles.value,
  ])

  const filteredTitles = computed(() => {
    if (!searchQuery.value) return titles.value
    const results = searchEngine.search(searchQuery.value)
    return results.map((r) => r.title)
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
    searchJikanExternal(query)
  }

  async function searchJikanExternal(query: string) {
    if (!query || query.length < 2) {
      externalTitles.value = []
      return
    }
    externalLoading.value = true
    try {
      const jikanResults = await searchJikan(query, 10)
      const existingIds = new Set(titles.value.map((t) => t.id))
      externalTitles.value = jikanResults
        .filter((ext) => !existingIds.has(ext.id))
        .filter((ext) => !isDuplicateInTitles(ext, titles.value))
    } catch {
      externalTitles.value = []
    } finally {
      externalLoading.value = false
    }
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
    externalLoading,
    searchQuery,
    externalTitles,
    paginationMeta,
    filteredTitles,
    recentUpdates,
    searchEngine,
    fetchTitles,
    fetchTitle,
    searchTitles,
    searchJikanExternal,
    fetchSchedule,
    setSearchQuery,
  }
})

function normalizeForDedup(name: string): string {
  return name.toLowerCase().replace(/[^a-zа-яё0-9]/g, '').trim()
}

function isDuplicateInTitles(ext: Title, existing: Title[]): boolean {
  const extNames = [
    normalizeForDedup(ext.name.main),
    normalizeForDedup(ext.name.english || ''),
    normalizeForDedup(ext.name.alternative || ''),
  ].filter(Boolean)

  return existing.some((t) => {
    const tNames = [
      normalizeForDedup(t.name.main),
      normalizeForDedup(t.name.english || ''),
      normalizeForDedup(t.name.alternative || ''),
    ].filter(Boolean)

    return tNames.some((tn) => extNames.some((en) => en === tn || en.includes(tn) || tn.includes(en)))
  })
}
