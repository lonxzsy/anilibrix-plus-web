import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '@/utils/db-bridge'
import { api } from '@/api/client'
import { useAuthStore } from '@/stores/auth'
import type { Title, HistoryEntry, Playlist } from '@/types'

export const useLibraryStore = defineStore('library', () => {
  const favorites = ref<Title[]>([])
  const history = ref<HistoryEntry[]>([])
  const playlists = ref<Playlist[]>([])
  const favoritesIds = ref<Set<number>>(new Set())
  const collections = ref<{ releaseId: number; type: string }[]>([])
  const apiLoading = ref(false)

  const continueWatching = computed(() => {
    return history.value
      .filter((h) => h.timestamp > 0 && h.timestamp < h.duration * 0.9)
      .sort((a, b) => b.watchedAt - a.watchedAt)
      .slice(0, 3)
  })

  async function loadFavorites() {
    // Always load local favorites first
    const rows = await db.getFavorites()
    favorites.value = rows.map(
      (r: any) =>
        ({
          id: r.titleId,
          alias: '',
          name: { main: r.titleName, english: '', alternative: '' },
          poster: r.posterUrl
            ? { src: r.posterUrl, preview: r.posterUrl, thumbnail: r.posterUrl }
            : undefined,
          year: 0,
          episodesTotal: 0,
          isOngoing: false,
          isInProduction: false,
          updatedAt: 0,
          freshAt: 0,
        }) as Title
    )
    favoritesIds.value = new Set(favorites.value.map((t) => t.id))

    // If logged in, sync with API favorites
    const authStore = useAuthStore()
    if (authStore.token) {
      try {
        apiLoading.value = true
        const apiFavs = await api.getFavoritesReleases(1, 20)
        if (apiFavs.data?.length) {
          favorites.value = apiFavs.data
          favoritesIds.value = new Set(apiFavs.data.map((t: Title) => t.id))
        }
      } catch (e) {
        console.warn('Failed to sync API favorites:', e)
      } finally {
        apiLoading.value = false
      }
    }
  }

  async function addToFavorites(title: Title) {
    const posterUrl = title.poster?.preview || title.poster?.src || ''
    await db.addFavorite({
      titleId: title.id,
      titleName: title.name.main,
      posterUrl,
      addedAt: Math.floor(Date.now() / 1000),
    })
    if (!favoritesIds.value.has(title.id)) {
      favorites.value.unshift(title)
      favoritesIds.value.add(title.id)
    }

    const authStore = useAuthStore()
    if (authStore.token) {
      try {
        await api.addToFavorites([title.id])
      } catch (e) {
        console.warn('Failed to add favorite to API:', e)
      }
    }
  }

  async function removeFromFavorites(titleId: number) {
    await db.removeFavorite(titleId)
    favorites.value = favorites.value.filter((t) => t.id !== titleId)
    favoritesIds.value.delete(titleId)

    const authStore = useAuthStore()
    if (authStore.token) {
      try {
        await api.removeFromFavorites([titleId])
      } catch (e) {
        console.warn('Failed to remove favorite from API:', e)
      }
    }
  }

  function isFavorite(titleId: number) {
    return favoritesIds.value.has(titleId)
  }

  async function loadHistory() {
    const rows = await db.getHistory()
    history.value = rows.map(
      (r: any) =>
        ({
          titleId: r.titleId,
          episodeId: r.episodeId,
          episodeNumber: r.episodeNumber,
          timestamp: r.timestamp,
          duration: r.duration,
          watchedAt: r.watchedAt,
        }) as HistoryEntry
    )

    // If logged in, try to sync API history (timecodes)
    const authStore = useAuthStore()
    if (authStore.token) {
      try {
        apiLoading.value = true
        const timecodes = await api.getTimecodes()
        if (timecodes?.data?.length) {
          // Merge API timecodes with local history
          const apiHistory = timecodes.data.map(
            (tc: any) =>
              ({
                titleId: tc.release?.id || 0,
                episodeId: tc.release_episode?.id || '',
                episodeNumber: tc.release_episode?.ordinal || 0,
                timestamp: tc.time || 0,
                duration: tc.release_episode?.duration || 0,
                watchedAt: tc.updated_at
                  ? Math.floor(new Date(tc.updated_at).getTime() / 1000)
                  : Math.floor(Date.now() / 1000),
              }) as HistoryEntry
          )

          // Merge: API entries override local for same episode
          const merged = new Map<string, HistoryEntry>()
          for (const h of history.value) {
            merged.set(`${h.titleId}-${h.episodeId}`, h)
          }
          for (const h of apiHistory) {
            const key = `${h.titleId}-${h.episodeId}`
            const existing = merged.get(key)
            if (!existing || h.watchedAt > existing.watchedAt) {
              merged.set(key, h)
            }
          }
          history.value = Array.from(merged.values()).sort((a, b) => b.watchedAt - a.watchedAt)
        }
      } catch (e) {
        console.warn('Failed to sync API history:', e)
      } finally {
        apiLoading.value = false
      }
    }
  }

  async function addToHistory(
    titleId: number,
    episodeId: string,
    episodeNumber: number,
    timestamp: number,
    duration: number
  ) {
    await db.addHistory({
      titleId,
      episodeId,
      episodeNumber,
      timestamp,
      duration,
      watchedAt: Math.floor(Date.now() / 1000),
    })
    await loadHistory()

    // Sync to API if logged in
    const authStore = useAuthStore()
    if (authStore.token && episodeId) {
      try {
        await api.updateTimecodes([
          {
            time: Math.floor(timestamp),
            is_watched: timestamp > duration * 0.9,
            release_episode_id: episodeId,
          },
        ])
      } catch (e) {
        console.warn('Failed to sync timecode to API:', e)
      }
    }
  }

  async function loadPlaylists() {
    const rows = await db.getPlaylists()
    playlists.value = rows.map(
      (r: any) =>
        ({
          id: r.id,
          name: r.name,
          createdAt: r.createdAt,
          items: r.items || [],
        }) as Playlist
    )
  }

  async function createPlaylist(name: string) {
    const id = await db.createPlaylist(name)
    playlists.value.unshift({ id, name, createdAt: Math.floor(Date.now() / 1000), items: [] })
    return id
  }

  async function addToPlaylist(playlistId: number, title: Title) {
    await db.addToPlaylist(playlistId, {
      titleId: title.id,
      titleName: title.name.main,
    })
    const playlist = playlists.value.find((p) => p.id === playlistId)
    if (playlist) {
      playlist.items.push({ titleId: title.id, titleName: title.name.main })
    }
  }

  async function syncWithApi() {
    const authStore = useAuthStore()
    if (!authStore.token) return
    await Promise.all([loadFavorites(), loadHistory()])
  }

  return {
    favorites,
    history,
    playlists,
    favoritesIds,
    collections,
    apiLoading,
    continueWatching,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loadHistory,
    addToHistory,
    loadPlaylists,
    createPlaylist,
    addToPlaylist,
    syncWithApi,
  }
})
