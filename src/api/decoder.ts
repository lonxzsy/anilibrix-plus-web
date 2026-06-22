const API_URL = 'https://anime-cr-production.up.railway.app'

export interface DecoderSearchItem {
  id: string
  title: string
  thumbnail: string
}

export interface DecoderAnimeDetail {
  title: string
  description: string
  thumbnail: string
  episodes: DecoderEpisodeItem[]
}

export interface DecoderEpisodeItem {
  id: string
  title: string
  ordinal: number
}

export interface DecoderVideoItem {
  type: string
  quality: number
  url: string
  headers: Record<string, string>
}

export interface DecoderSource {
  name: string
  label: string
}

export const SOURCES: DecoderSource[] = [
  { name: 'animevost', label: 'AnimeVost' },
  { name: 'anilib', label: 'AniLib' },
  { name: 'yummyanime', label: 'YummyAnime' },
  { name: 'dreamcast', label: 'Dream Cast' },
]

export const decoderApi = {
  async search(source: string, query: string): Promise<DecoderSearchItem[]> {
    const res = await fetch(`${API_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, query }),
    })
    if (!res.ok) throw new Error(`Search failed: ${res.status}`)
    const data = await res.json()
    return data.results || []
  },

  async getAnime(source: string, id: string): Promise<DecoderAnimeDetail> {
    const res = await fetch(`${API_URL}/api/anime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, id }),
    })
    if (!res.ok) throw new Error(`Anime detail failed: ${res.status}`)
    return res.json()
  },

  async getEpisodeVideos(source: string, id: string): Promise<DecoderVideoItem[]> {
    const res = await fetch(`${API_URL}/api/episode/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, id }),
    })
    if (!res.ok) throw new Error(`Get videos failed: ${res.status}`)
    const data = await res.json()
    return data.videos || []
  },
}
