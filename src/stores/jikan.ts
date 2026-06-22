import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Title, JikanFullData, JikanCharacterEntry } from '@/types'

const MAL_MAP_KEY = 'anilibrixplus-mal-map'

function loadMapping(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem(MAL_MAP_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveMapping(map: Record<number, number>) {
  localStorage.setItem(MAL_MAP_KEY, JSON.stringify(map))
}

let lastRequest = 0
async function throttledFetch(url: string): Promise<any> {
  const now = Date.now()
  const wait = Math.max(0, 400 - (now - lastRequest))
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  lastRequest = Date.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Jikan error: ${res.status}`)
  return res.json()
}

export const useJikanStore = defineStore('jikan', () => {
  const cache = ref<Map<number, JikanFullData>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchForTitle(title: Title): Promise<JikanFullData | null> {
    const id = title.id
    if (cache.value.has(id)) return cache.value.get(id)!

    loading.value = true
    error.value = null

    try {
      const mapping = loadMapping()
      let malId = mapping[id]

      if (!malId) {
        const queries = [
          title.alias?.replace(/-/g, ' '),
          title.name.english,
          title.name.main,
        ].filter((q): q is string => Boolean(q))

        for (const q of queries) {
          try {
            const json = await throttledFetch(
              `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1&sfw`
            )
            if (json.data?.length > 0) {
              malId = json.data[0].mal_id
              mapping[id] = malId
              saveMapping(mapping)
              break
            }
          } catch {}
        }
      }

      if (!malId) {
        error.value = 'Не найдено на MAL'
        return null
      }

      const [animeJson, charsJson, statsJson] = await Promise.allSettled([
        throttledFetch(`https://api.jikan.moe/v4/anime/${malId}`),
        throttledFetch(`https://api.jikan.moe/v4/anime/${malId}/characters`),
        throttledFetch(`https://api.jikan.moe/v4/anime/${malId}/statistics`),
      ])

      const a = animeJson.status === 'fulfilled' ? animeJson.value.data : null
      const c = charsJson.status === 'fulfilled' ? charsJson.value.data : []
      const s = statsJson.status === 'fulfilled' ? statsJson.value.data : null

      if (!a) {
        error.value = 'Ошибка загрузки данных с MAL'
        return null
      }

      const result: JikanFullData = {
        anime: {
          malId: a.mal_id,
          title: a.title,
          titleEnglish: a.title_english || '',
          score: a.score || 0,
          scoredBy: a.scored_by || 0,
          rank: a.rank || null,
          popularity: a.popularity || 0,
          synopsis: a.synopsis || '',
          trailer: {
            youtubeId: a.trailer?.youtube_id || null,
            url: a.trailer?.url || null,
            embedUrl: a.trailer?.embed_url || null,
          },
          episodes: a.episodes || null,
          status: a.status || '',
          rating: a.rating || '',
          url: a.url || '',
        },
        characters: (c || []).map((entry: any): JikanCharacterEntry => ({
          character: {
            malId: entry.character.mal_id,
            name: entry.character.name,
            image: entry.character.images?.jpg?.image_url || '',
          },
          role: entry.role || '',
          voiceActors: (entry.voice_actors || []).map((va: any) => ({
            name: va.person?.name || '',
            image: va.person?.images?.jpg?.image_url || '',
            language: va.language || '',
          })),
        })),
        stats: s
          ? {
              watching: s.watching || 0,
              completed: s.completed || 0,
              onHold: s.on_hold || 0,
              dropped: s.dropped || 0,
              planToWatch: s.plan_to_watch || 0,
              total: s.total || 0,
              scores: (s.scores || []).map((sc: any) => ({
                score: sc.score,
                votes: sc.votes,
                percentage: sc.percentage,
              })),
            }
          : null,
      }

      cache.value.set(id, result)
      return result
    } catch {
      error.value = 'Ошибка загрузки данных MAL'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearCache() {
    cache.value = new Map()
    localStorage.removeItem(MAL_MAP_KEY)
  }

  return { cache, loading, error, fetchForTitle, clearCache }
})
