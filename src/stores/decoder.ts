import { defineStore } from 'pinia'
import { ref } from 'vue'
import { decoderApi, SOURCES } from '@/api/decoder'
import type { DecoderSearchItem, DecoderAnimeDetail, DecoderVideoItem } from '@/api/decoder'

export const useDecoderStore = defineStore('decoder', () => {
  const searchResults = ref<{ source: string; results: DecoderSearchItem[] }[]>([])
  const currentSource = ref(SOURCES[0].name)
  const loading = ref(false)

  async function searchAll(query: string) {
    loading.value = true
    searchResults.value = []
    try {
      const promises = SOURCES.map(async (s) => {
        try {
          const results = await decoderApi.search(s.name, query)
          return { source: s.name, results }
        } catch {
          return { source: s.name, results: [] as DecoderSearchItem[] }
        }
      })
      searchResults.value = await Promise.all(promises)
    } finally {
      loading.value = false
    }
  }

  return {
    searchResults,
    currentSource,
    loading,
    searchAll,
  }
})
