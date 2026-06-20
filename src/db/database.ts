import Dexie, { type EntityTable } from 'dexie'

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

export class AppDatabase extends Dexie {
  favorites!: EntityTable<Favorite, 'titleId'>
  history!: EntityTable<HistoryEntry, 'episodeId'>
  playlists!: EntityTable<Playlist, 'id'>

  constructor() {
    super('anilibrix-plus')
    this.version(1).stores({
      favorites: 'titleId, titleName, addedAt',
      history: '[titleId+episodeId], watchedAt, timestamp',
      playlists: 'id, name, createdAt',
    })
  }
}

export const db = new AppDatabase()

export const favoritesRepo = {
  async getAll() {
    return db.favorites.orderBy('addedAt').reverse().toArray()
  },
  async add(favorite: Favorite) {
    await db.favorites.put(favorite)
  },
  async remove(titleId: number) {
    await db.favorites.delete(titleId)
  },
}

export const historyRepo = {
  async getAll() {
    return db.history.orderBy('watchedAt').reverse().toArray()
  },
  async add(entry: HistoryEntry) {
    const key = [entry.titleId, entry.episodeId]
    const existing = await db.history.get(key as any)
    if (existing && existing.watchedAt >= entry.watchedAt) {
      return
    }
    await db.history.put(entry)
    const count = await db.history.count()
    if (count > 500) {
      const oldest = await db.history.orderBy('watchedAt').first()
      if (oldest) {
        await db.history.delete([oldest.titleId, oldest.episodeId] as any)
      }
    }
  },
}

export const playlistsRepo = {
  async getAll() {
    return db.playlists.orderBy('createdAt').reverse().toArray()
  },
  async create(name: string) {
    const id = Date.now()
    await db.playlists.add({ id, name, createdAt: Math.floor(Date.now() / 1000), items: [] })
    return id
  },
  async addItem(playlistId: number, item: { titleId: number; titleName: string }) {
    const playlist = await db.playlists.get(playlistId)
    if (playlist && !playlist.items.find((i) => i.titleId === item.titleId)) {
      playlist.items.push(item)
      await db.playlists.put(playlist)
    }
  },
  async delete(id: number) {
    await db.playlists.delete(id)
  },
}
