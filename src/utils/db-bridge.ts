import type { ElectronAPI } from '@electron/preload'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

const electronAPI = window.electronAPI

export const db = {
  async getFavorites() {
    return electronAPI.db.getFavorites()
  },
  async addFavorite(favorite: any) {
    return electronAPI.db.addFavorite(favorite)
  },
  async removeFavorite(titleId: number) {
    return electronAPI.db.removeFavorite(titleId)
  },
  async getHistory() {
    return electronAPI.db.getHistory()
  },
  async addHistory(entry: any) {
    return electronAPI.db.addHistory(entry)
  },
  async getPlaylists() {
    return electronAPI.db.getPlaylists()
  },
  async createPlaylist(name: string) {
    return electronAPI.db.createPlaylist(name)
  },
  async addToPlaylist(playlistId: number, item: any) {
    return electronAPI.db.addToPlaylist(playlistId, item)
  },
  async deletePlaylist(id: number) {
    return electronAPI.db.deletePlaylist(id)
  },
}

export const appBridge = {
  getDataPath: () => electronAPI.app.getDataPath(),
}

export const windowBridge = {
  minimize: () => electronAPI.window.minimize(),
  maximize: () => electronAPI.window.maximize(),
  close: () => electronAPI.window.close(),
  isMaximized: () => electronAPI.window.isMaximized(),
}

export const notificationBridge = {
  show: (options: { title: string; body: string }) => electronAPI.notification.show(options),
}

export const playerBridge = {
  onTogglePlay: (cb: () => void) => electronAPI.player.onTogglePlay(cb),
  onSeekForward: (cb: () => void) => electronAPI.player.onSeekForward(cb),
  onSeekBackward: (cb: () => void) => electronAPI.player.onSeekBackward(cb),
  onToggleFullscreen: (cb: () => void) => electronAPI.player.onToggleFullscreen(cb),
  enterPip: () => electronAPI.player.enterPip(),
  exitPip: () => electronAPI.player.exitPip(),
}

export const discordBridge = {
  updatePresence: (presence: any) => electronAPI.discord.updatePresence(presence),
  clearPresence: () => electronAPI.discord.clearPresence(),
}

export const torrentBridge = {
  download: (url: string, filename: string, releaseId: number) =>
    electronAPI.torrent.download(url, filename, releaseId),
  getDownloadsDir: () => electronAPI.torrent.getDownloadsDir(),
}

export const localFilesBridge = {
  scan: () => electronAPI.localFiles.scan(),
  getMappings: () => electronAPI.localFiles.getMappings(),
  setMapping: (filename: string, releaseId: number) =>
    electronAPI.localFiles.setMapping(filename, releaseId),
  getMapping: (filename: string) => electronAPI.localFiles.getMapping(filename),
}
