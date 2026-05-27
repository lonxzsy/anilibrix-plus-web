import Store from 'electron-store'

interface Favorite {
  titleId: number
  titleName: string
  posterUrl: string
  addedAt: number
}

interface HistoryEntry {
  titleId: number
  episodeId: string
  episodeNumber: number
  timestamp: number
  duration: number
  watchedAt: number
}

interface Playlist {
  id: number
  name: string
  createdAt: number
  items: { titleId: number; titleName: string }[]
}

interface Schema {
  favorites: Favorite[]
  history: HistoryEntry[]
  playlists: Playlist[]
}

export class DatabaseManager {
  private store: Store<Schema>

  constructor() {
    this.store = new Store<Schema>({
      name: 'anilibrixplus-data',
      schema: {
        favorites: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              titleId: { type: 'number' },
              titleName: { type: 'string' },
              posterUrl: { type: 'string' },
              addedAt: { type: 'number' },
            },
          },
          default: [],
        },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              titleId: { type: 'number' },
              episodeId: { anyOf: [{ type: 'string' }, { type: 'number' }] },
              episodeNumber: { type: 'number' },
              timestamp: { type: 'number' },
              duration: { type: 'number' },
              watchedAt: { type: 'number' },
            },
          },
          default: [],
        },
        playlists: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              createdAt: { type: 'number' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    titleId: { type: 'number' },
                    titleName: { type: 'string' },
                  },
                },
              },
            },
          },
          default: [],
        },
      },
    })
  }

  // Favorites
  getFavorites(): Favorite[] {
    return this.store.get('favorites').sort((a, b) => b.addedAt - a.addedAt)
  }

  addFavorite(favorite: Favorite) {
    const favorites = this.store.get('favorites')
    const idx = favorites.findIndex((f) => f.titleId === favorite.titleId)
    if (idx >= 0) {
      favorites[idx] = favorite
    } else {
      favorites.unshift(favorite)
    }
    this.store.set('favorites', favorites)
  }

  removeFavorite(titleId: number) {
    const favorites = this.store.get('favorites').filter((f) => f.titleId !== titleId)
    this.store.set('favorites', favorites)
  }

  // History
  getHistory(): HistoryEntry[] {
    return this.store.get('history').sort((a, b) => b.watchedAt - a.watchedAt)
  }

  addHistory(entry: HistoryEntry) {
    const history = this.store.get('history')
    const idx = history.findIndex(
      (h) => h.titleId === entry.titleId && h.episodeId === entry.episodeId
    )
    if (idx >= 0) {
      history[idx] = entry
    } else {
      history.unshift(entry)
    }
    // Keep last 500 entries
    if (history.length > 500) {
      history.length = 500
    }
    this.store.set('history', history)
  }

  // Playlists
  getPlaylists(): Playlist[] {
    return this.store.get('playlists').sort((a, b) => b.createdAt - a.createdAt)
  }

  createPlaylist(name: string): number {
    const playlists = this.store.get('playlists')
    const id = Date.now()
    playlists.unshift({ id, name, createdAt: Math.floor(Date.now() / 1000), items: [] })
    this.store.set('playlists', playlists)
    return id
  }

  addToPlaylist(playlistId: number, item: { titleId: number; titleName: string }) {
    const playlists = this.store.get('playlists')
    const playlist = playlists.find((p) => p.id === playlistId)
    if (playlist) {
      if (!playlist.items.find((i) => i.titleId === item.titleId)) {
        playlist.items.push(item)
        this.store.set('playlists', playlists)
      }
    }
  }

  deletePlaylist(id: number) {
    const playlists = this.store.get('playlists').filter((p) => p.id !== id)
    this.store.set('playlists', playlists)
  }
}
