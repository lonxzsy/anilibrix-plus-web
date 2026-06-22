import type { Title, Genre } from '@/types'

const CACHE_KEY = 'anilibrix-jikan-search'
const CACHE_TTL = 24 * 60 * 60 * 1000

interface CacheEntry {
  query: string
  results: ExternalTitle[]
  timestamp: number
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

export interface ExternalTitle {
  id: number
  alias: string
  name: { main: string; english: string; alternative: string }
  description: string
  poster?: { src: string; preview: string; thumbnail: string }
  genres?: Genre[]
  type?: { value: string; description: string }
  year: number
  episodesTotal: number
  isOngoing: boolean
  isInProduction: boolean
  ageRating?: undefined
  publishDay?: undefined
  externalPlayer?: undefined
  updatedAt: number
  freshAt: number
  episodes?: undefined
  torrents?: undefined
  score?: number
  isExternal: true
  externalSource: 'jikan'
  malId: number
}

function loadCache(): Map<string, CacheEntry> {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return new Map()
    const parsed = JSON.parse(raw)
    return new Map(Object.entries(parsed))
  } catch {
    return new Map()
  }
}

function saveCache(map: Map<string, CacheEntry>) {
  try {
    const obj = Object.fromEntries(map.entries())
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj))
  } catch {}
}

const RC_TYPE_MAP: Record<string, string> = {
  TV: 'tv', OVA: 'ova', ONA: 'ona', Movie: 'movie',
  Special: 'special', Music: 'music',
}

export async function searchJikan(query: string, limit = 10): Promise<ExternalTitle[]> {
  if (!query || query.length < 2) return []

  const cache = loadCache()
  const cached = cache.get(query.toLowerCase())
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.results
  }

  try {
    const json = await throttledFetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=${limit}&sfw&order_by=popularity&sort=asc`
    )

    if (!json.data?.length) {
      cache.set(query.toLowerCase(), { query, results: [], timestamp: Date.now() })
      saveCache(cache)
      return []
    }

    const results: ExternalTitle[] = json.data.map(mapJikanItem).filter(Boolean)

    cache.set(query.toLowerCase(), { query, results, timestamp: Date.now() })
    saveCache(cache)

    return results
  } catch {
    return []
  }
}

function mapJikanItem(item: any): ExternalTitle | null {
  if (!item?.mal_id) return null

  const nameMain = item.title || ''
  const nameEnglish = item.title_english || ''
  const nameAlternative = item.title_japanese || ''

  const image = item.images?.webp?.image_url || item.images?.jpg?.image_url || ''
  const smallImage = item.images?.webp?.small_image_url || item.images?.jpg?.small_image_url || ''
  const largeImage = item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || ''

  const genres: Genre[] = (item.genres || []).map((g: any) => ({
    id: g.mal_id,
    name: g.name,
  }))

  const typeValue = RC_TYPE_MAP[item.type] || ''
  const typeDesc = item.type || ''

  const status = item.status || ''
  const isOngoing = status === 'Currently Airing' || status === 'Not yet aired'

  return {
    id: item.mal_id * -1,
    alias: nameMain.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: { main: nameMain, english: nameEnglish, alternative: nameAlternative },
    description: item.synopsis || '',
    poster: image
      ? { src: largeImage || image, preview: image, thumbnail: smallImage || image }
      : undefined,
    genres,
    type: typeValue ? { value: typeValue, description: typeDesc } : undefined,
    year: item.year || 0,
    episodesTotal: item.episodes || 0,
    isOngoing,
    isInProduction: isOngoing,
    updatedAt: 0,
    freshAt: 0,
    score: item.score || 0,
    isExternal: true as const,
    externalSource: 'jikan' as const,
    malId: item.mal_id,
  }
}

export function isExternalTitle(title: Title | ExternalTitle): title is ExternalTitle {
  return (title as ExternalTitle).isExternal === true
}
