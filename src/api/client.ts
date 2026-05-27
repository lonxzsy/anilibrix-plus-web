import axios from 'axios'
import type { Title } from '@/types'

const BASE_URL = 'https://aniliberty.top'
const API_URL = `${BASE_URL}/api/v1`

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Auth interceptor: inject Bearer token when available
let authToken: string | null = null
export function setAuthToken(token: string | null) {
  authToken = token
}

client.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`
  }
  return config
})

// Simple in-memory LRU cache
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number
  private ttl: number

  constructor(maxSize = 100, ttlMs = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttlMs
  }

  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  set(key: K, value: V) {
    if (this.cache.size >= this.maxSize) {
      const first = this.cache.keys().next().value
      if (first !== undefined) {
        this.cache.delete(first)
      }
    }
    this.cache.set(key, value)
    setTimeout(() => this.cache.delete(key), this.ttl)
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new LRUCache<string, unknown>()

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)))
      }
    }
  }
  throw lastError
}

function toAbsolutePosterUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${BASE_URL}${path}`
}

export const api = {
  async getCatalogReleases(page = 1, limit = 20, search?: string) {
    const cacheKey = `catalog_${page}_${limit}_${search || ''}`
    const cached = cache.get(cacheKey) as { data: any[]; meta: any } | undefined
    if (cached) return cached

    return withRetry(async () => {
      const params: Record<string, any> = { page, limit }
      if (search) {
        params['f[search]'] = search
      }
      const { data } = await client.get('/anime/catalog/releases', { params })
      const result = {
        data: (data.data || []).map(mapRelease),
        meta: data.meta || null
      }
      cache.set(cacheKey, result)
      return result
    })
  },

  async getRelease(idOrAlias: string | number) {
    const cacheKey = `release_${idOrAlias}`
    const cached = cache.get(cacheKey) as any
    if (cached) return cached

    return withRetry(async () => {
      const { data } = await client.get(`/anime/releases/${idOrAlias}`)
      const mapped = mapRelease(data)
      // Episodes are nested inside the release on detail
      if (data.episodes) {
        mapped.episodes = data.episodes.map(mapEpisode)
      }
      cache.set(cacheKey, mapped)
      return mapped
    })
  },

  async getSchedule() {
    const cacheKey = 'schedule'
    const cached = cache.get(cacheKey) as any[]
    if (cached) return cached

    return withRetry(async () => {
      const { data } = await client.get('/anime/schedule/week')
      const mapped = (data || []).map((item: any) => ({
        release: mapRelease(item.release),
        publishedEpisode: item.published_release_episode ? mapEpisode(item.published_release_episode) : null,
        nextEpisodeNumber: item.next_release_episode_number
      }))
      cache.set(cacheKey, mapped)
      return mapped
    })
  },

  async getFranchiseByRelease(releaseId: number) {
    const cacheKey = `franchise_release_${releaseId}`
    const cached = cache.get(cacheKey) as Title[] | undefined
    if (cached) return cached

    return withRetry(async () => {
      const { data } = await client.get(`/anime/franchises/release/${releaseId}`)
      const items = Array.isArray(data) ? data : [data]
      const releases: Title[] = []
      items.forEach((franchise: any) => {
        const frs = franchise.franchise_releases || []
        frs.forEach((fr: any) => {
          if (fr.release && fr.release.id !== releaseId) {
            releases.push(mapRelease(fr.release))
          }
        })
      })
      cache.set(cacheKey, releases)
      return releases
    })
  },

  async getRecommendedReleases(releaseId?: number, limit = 12) {
    const cacheKey = `recommended_${releaseId || 'random'}_${limit}`
    const cached = cache.get(cacheKey) as Title[] | undefined
    if (cached) return cached

    return withRetry(async () => {
      const params: Record<string, any> = { limit }
      if (releaseId) params.release_id = releaseId
      const { data } = await client.get('/anime/releases/recommended', { params })
      const releases = (data.data || data || []).map(mapRelease)
      cache.set(cacheKey, releases)
      return releases
    })
  },

  async getTorrentsByRelease(releaseId: number) {
    const cacheKey = `torrents_${releaseId}`
    const cached = cache.get(cacheKey) as any[]
    if (cached) return cached

    return withRetry(async () => {
      const { data } = await client.get(`/anime/torrents/release/${releaseId}`)
      const result = (data || []).map((t: any) => ({
        id: t.id,
        hash: t.hash,
        size: t.size,
        type: t.type,
        color: t.color,
        codec: t.codec,
        label: t.label,
        quality: t.quality,
        magnet: t.magnet,
        filename: t.filename,
        seeders: t.seeders,
        leechers: t.leechers,
        bitrate: t.bitrate,
        isHardsub: !!t.is_hardsub,
        description: t.description,
        updatedAt: t.updated_at
      }))
      cache.set(cacheKey, result)
      return result
    })
  },

  // Auth
  async login(login: string, password: string) {
    const { data } = await client.post('/accounts/users/auth/login', { login, password })
    return data
  },

  // User profile
  async getMeProfile() {
    return withRetry(async () => {
      const { data } = await client.get('/accounts/users/me/profile')
      return data
    })
  },

  // Favorites
  async getFavoritesIds() {
    return withRetry(async () => {
      const { data } = await client.get('/accounts/users/me/favorites/ids')
      return data
    })
  },

  async getFavoritesReleases(page = 1, limit = 20, filters?: Record<string, any>) {
    return withRetry(async () => {
      const params: Record<string, any> = { page, limit, 'f[sorting]': 'FRESH_AT_DESC' }
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { params[k] = v })
      }
      const { data } = await client.get('/accounts/users/me/favorites/releases', { params })
      return {
        data: (data.data || []).map(mapRelease),
        meta: data.meta || null
      }
    })
  },

  async addToFavorites(releaseIds: number[]) {
    const { data } = await client.post('/accounts/users/me/favorites', releaseIds.map(id => ({ release_id: id })))
    return data
  },

  async removeFromFavorites(releaseIds: number[]) {
    const { data } = await client.delete('/accounts/users/me/favorites', { data: releaseIds.map(id => ({ release_id: id })) })
    return data
  },

  // Collections
  async getCollectionsIds() {
    return withRetry(async () => {
      const { data } = await client.get('/accounts/users/me/collections/ids')
      return data
    })
  },

  async getCollectionsReleases(typeOfCollection: string, page = 1, limit = 20, filters?: Record<string, any>) {
    return withRetry(async () => {
      const params: Record<string, any> = { page, limit, type_of_collection: typeOfCollection }
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => { params[k] = v })
      }
      const { data } = await client.get('/accounts/users/me/collections/releases', { params })
      return {
        data: (data.data || []).map(mapRelease),
        meta: data.meta || null
      }
    })
  },

  async addToCollections(items: { release_id: number; type_of_collection: string }[]) {
    const { data } = await client.post('/accounts/users/me/collections', items)
    return data
  },

  async removeFromCollections(releaseIds: number[]) {
    const { data } = await client.delete('/accounts/users/me/collections', { data: releaseIds.map(id => ({ release_id: id })) })
    return data
  },

  // Views / History / Timecodes
  async getViewsHistory(page = 1, limit = 20) {
    return withRetry(async () => {
      const { data } = await client.get('/accounts/users/me/views/history', { params: { page, limit } })
      return data
    })
  },

  async getTimecodes(since?: string) {
    return withRetry(async () => {
      const params: Record<string, any> = {}
      if (since) params.since = since
      const { data } = await client.get('/accounts/users/me/views/timecodes', { params })
      return data
    })
  },

  async updateTimecodes(entries: { time: number; is_watched: boolean; release_episode_id: string }[]) {
    const { data } = await client.post('/accounts/users/me/views/timecodes', entries)
    return data
  },

  async deleteTimecodes(episodeIds: string[]) {
    const { data } = await client.delete('/accounts/users/me/views/timecodes', { data: episodeIds.map(id => ({ release_episode_id: id })) })
    return data
  },

  clearCache() {
    cache.clear()
  }
}

function mapRelease(raw: any) {
  return {
    id: raw.id,
    alias: raw.alias || '',
    name: {
      main: raw.name?.main || 'Без названия',
      english: raw.name?.english || '',
      alternative: raw.name?.alternative || ''
    },
    description: raw.description || '',
    poster: raw.poster ? {
      src: toAbsolutePosterUrl(raw.poster.src || ''),
      preview: toAbsolutePosterUrl(raw.poster.preview || ''),
      thumbnail: toAbsolutePosterUrl(raw.poster.thumbnail || ''),
      optimized: raw.poster.optimized ? {
        src: toAbsolutePosterUrl(raw.poster.optimized.src || ''),
        preview: toAbsolutePosterUrl(raw.poster.optimized.preview || ''),
        thumbnail: toAbsolutePosterUrl(raw.poster.optimized.thumbnail || '')
      } : undefined
    } : undefined,
    genres: (raw.genres || []).map((g: any) => ({ id: g.id, name: g.name })),
    type: raw.type ? { value: raw.type.value, description: raw.type.description } : undefined,
    season: raw.season ? { value: raw.season.value, description: raw.season.description } : undefined,
    year: raw.year || 0,
    episodesTotal: raw.episodes_total || 0,
    isOngoing: !!raw.is_ongoing,
    isInProduction: !!raw.is_in_production,
    ageRating: raw.age_rating ? { value: raw.age_rating.value, label: raw.age_rating.label } : undefined,
    publishDay: mapPublishDay(raw.publish_day),
    externalPlayer: raw.external_player || '',
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() / 1000 : 0,
    freshAt: raw.fresh_at ? new Date(raw.fresh_at).getTime() / 1000 : 0,
    // Episodes populated only on detail endpoint
    episodes: undefined as any[] | undefined,
    torrents: raw.torrents || []
  }
}

const DAY_NUMBER_TO_VALUE: Record<number, string> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday'
}

function mapPublishDay(raw: any) {
  if (!raw) return undefined
  if (typeof raw === 'string') {
    return { value: raw, description: '' }
  }
  const value = DAY_NUMBER_TO_VALUE[raw.value] || String(raw.value)
  return { value, description: raw.description || '' }
}

function mapEpisode(raw: any) {
  return {
    id: raw.id,
    name: raw.name || `Серия ${raw.ordinal}`,
    nameEnglish: raw.name_english || '',
    ordinal: raw.ordinal,
    duration: raw.duration || 0,
    hls480: raw.hls_480 || '',
    hls720: raw.hls_720 || '',
    hls1080: raw.hls_1080 || '',
    preview: raw.preview ? {
      src: toAbsolutePosterUrl(raw.preview.src || ''),
      preview: toAbsolutePosterUrl(raw.preview.preview || ''),
      thumbnail: toAbsolutePosterUrl(raw.preview.thumbnail || '')
    } : undefined,
    opening: raw.opening,
    ending: raw.ending,
    rutubeId: raw.rutube_id,
    youtubeId: raw.youtube_id,
    releaseId: raw.release_id,
    updatedAt: raw.updated_at ? new Date(raw.updated_at).getTime() / 1000 : 0,
    sortOrder: raw.sort_order || 0
  }
}
