import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  db: {
    getFavorites: () => Promise<any[]>
    addFavorite: (favorite: any) => Promise<void>
    removeFavorite: (titleId: number) => Promise<void>
    getHistory: () => Promise<any[]>
    addHistory: (entry: any) => Promise<void>
    getPlaylists: () => Promise<any[]>
    createPlaylist: (name: string) => Promise<number>
    addToPlaylist: (playlistId: number, item: any) => Promise<void>
    deletePlaylist: (id: number) => Promise<void>
  }
  app: {
    getDataPath: () => Promise<string>
  }
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  notification: {
    show: (options: { title: string; body: string }) => Promise<void>
  }
  player: {
    onTogglePlay: (callback: () => void) => void
    onSeekForward: (callback: () => void) => void
    onSeekBackward: (callback: () => void) => void
    onToggleFullscreen: (callback: () => void) => void
    enterPip: () => Promise<void>
    exitPip: () => Promise<void>
  }
  discord: {
    updatePresence: (presence: any) => Promise<void>
    clearPresence: () => Promise<void>
  }
  torrent: {
    download: (url: string, filename: string, releaseId: number) => Promise<{ success: boolean; filePath?: string; error?: string }>
    getDownloadsDir: () => Promise<string>
  }
  localFiles: {
    scan: () => Promise<Array<{ name: string; path: string; size: number; modifiedAt: number; releaseId?: number }>>
    getMappings: () => Promise<Record<string, number>>
    setMapping: (filename: string, releaseId: number) => Promise<void>
    getMapping: (filename: string) => Promise<number | null>
  }
  navigate: {
    onNavigate: (callback: (path: string) => void) => void
  }
}

const api: ElectronAPI = {
  db: {
    getFavorites: () => ipcRenderer.invoke('db:getFavorites'),
    addFavorite: (favorite) => ipcRenderer.invoke('db:addFavorite', favorite),
    removeFavorite: (titleId) => ipcRenderer.invoke('db:removeFavorite', titleId),
    getHistory: () => ipcRenderer.invoke('db:getHistory'),
    addHistory: (entry) => ipcRenderer.invoke('db:addHistory', entry),
    getPlaylists: () => ipcRenderer.invoke('db:getPlaylists'),
    createPlaylist: (name) => ipcRenderer.invoke('db:createPlaylist', name),
    addToPlaylist: (playlistId, item) => ipcRenderer.invoke('db:addToPlaylist', playlistId, item),
    deletePlaylist: (id) => ipcRenderer.invoke('db:deletePlaylist', id)
  },
  app: {
    getDataPath: () => ipcRenderer.invoke('app:get-data-path')
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:is-maximized')
  },
  notification: {
    show: (options) => ipcRenderer.invoke('notification:show', options)
  },
  player: {
    onTogglePlay: (callback) => ipcRenderer.on('player:toggle-play', callback),
    onSeekForward: (callback) => ipcRenderer.on('player:seek-forward', callback),
    onSeekBackward: (callback) => ipcRenderer.on('player:seek-backward', callback),
    onToggleFullscreen: (callback) => ipcRenderer.on('player:toggle-fullscreen', callback),
    enterPip: () => ipcRenderer.invoke('player:enter-pip'),
    exitPip: () => ipcRenderer.invoke('player:exit-pip')
  },
  discord: {
    updatePresence: (presence) => ipcRenderer.invoke('discord:update-presence', presence),
    clearPresence: () => ipcRenderer.invoke('discord:clear-presence')
  },
  torrent: {
    download: (url, filename, releaseId) => ipcRenderer.invoke('torrent:download', { url, filename, releaseId }),
    getDownloadsDir: () => ipcRenderer.invoke('torrent:get-downloads-dir')
  },
  localFiles: {
    scan: () => ipcRenderer.invoke('local-files:scan'),
    getMappings: () => ipcRenderer.invoke('local-files:get-mappings'),
    setMapping: (filename, releaseId) => ipcRenderer.invoke('local-files:set-mapping', { filename, releaseId }),
    getMapping: (filename) => ipcRenderer.invoke('local-files:get-mapping', filename)
  },
  navigate: {
    onNavigate: (callback) => ipcRenderer.on('app:navigate', (_event, path: string) => callback(path))
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)

// ElectronAPI type is already exported via the interface declaration above
