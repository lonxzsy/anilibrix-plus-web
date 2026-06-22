export interface TitleName {
  main: string
  english?: string
  alternative?: string
}

export interface Poster {
  src: string
  preview: string
  thumbnail: string
  optimized?: {
    src: string
    preview: string
    thumbnail: string
  }
}

export interface Genre {
  id: number
  name: string
}

export interface ReleaseType {
  value: string
  description: string
}

export interface Season {
  value: string
  description: string
}

export interface AgeRating {
  value: string
  label: string
}

export interface Episode {
  id: string
  name: string
  nameEnglish?: string
  ordinal: number
  duration: number
  hls480: string
  hls720: string
  hls1080: string
  preview?: Poster
  opening?: { start: number | null; stop: number | null }
  ending?: { start: number | null; stop: number | null }
  rutubeId?: string
  youtubeId?: string
  releaseId: number
  updatedAt: number
  sortOrder: number
}

export interface Torrent {
  id: number
  hash: string
  size: number
  type: { value: string }
  color: { value: string }
  codec: { value: string }
  label: string
  quality: { value: string }
  magnet: string
  filename: string
  seeders: number
  leechers: number
  bitrate?: number
  isHardsub: boolean
  description?: string
  updatedAt: string
}

export interface Title {
  id: number
  alias: string
  name: TitleName
  description?: string
  poster?: Poster
  genres?: Genre[]
  type?: ReleaseType
  season?: Season
  year: number
  episodesTotal: number
  isOngoing: boolean
  isInProduction: boolean
  ageRating?: AgeRating
  publishDay?: any
  externalPlayer?: string
  updatedAt: number
  freshAt: number
  episodes?: Episode[]
  torrents?: Torrent[]
}

export interface ScheduleItem {
  release: Title
  publishedEpisode: Episode | null
  nextEpisodeNumber: number | null
}

export interface HistoryEntry {
  titleId: number
  episodeId: string
  episodeNumber: number
  timestamp: number
  duration: number
  watchedAt: number
}

export interface Playlist {
  id: number
  name: string
  createdAt: number
  items: PlaylistItem[]
}

export interface PlaylistItem {
  titleId: number
  titleName: string
}

export interface PaginationMeta {
  pagination: {
    total: number
    count: number
    per_page: number
    current_page: number
    total_pages: number
    links: {
      previous: string | null
      next: string | null
    }
  }
}

export interface JikanAnime {
  malId: number
  title: string
  titleEnglish: string
  score: number
  scoredBy: number
  rank: number | null
  popularity: number
  synopsis: string
  trailer: { youtubeId: string | null; url: string | null; embedUrl: string | null }
  episodes: number | null
  status: string
  rating: string
  url: string
}

export interface JikanCharacterEntry {
  character: { malId: number; name: string; image: string }
  role: string
  voiceActors: { name: string; image: string; language: string }[]
}

export interface JikanScore {
  score: number
  votes: number
  percentage: number
}

export interface JikanStats {
  watching: number
  completed: number
  onHold: number
  dropped: number
  planToWatch: number
  total: number
  scores: JikanScore[]
}

export interface JikanFullData {
  anime: JikanAnime
  characters: JikanCharacterEntry[]
  stats: JikanStats | null
}
