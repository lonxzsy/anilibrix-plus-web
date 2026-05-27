import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  globalShortcut,
  nativeImage,
  shell,
  protocol,
} from 'electron'
import path from 'path'
import fs from 'fs'
import { DatabaseManager } from './database'
import DiscordRPC from 'discord-rpc'

const DISCORD_CLIENT_ID = '1494707905868599487'
let rpcClient: DiscordRPC.Client | null = null

async function initDiscordRPC() {
  if (!DISCORD_CLIENT_ID) return
  rpcClient = new DiscordRPC.Client({ transport: 'ipc' })
  try {
    await rpcClient.login({ clientId: DISCORD_CLIENT_ID })
    console.log('Discord RPC connected')
  } catch (e) {
    console.warn('Discord RPC failed:', e)
  }
}

function updateDiscordPresence(presence: DiscordRPC.Presence) {
  if (rpcClient && rpcClient.user) {
    rpcClient.setActivity(presence).catch(() => {})
  }
}

function clearDiscordPresence() {
  if (rpcClient) {
    rpcClient.clearActivity().catch(() => {})
  }
}

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let dbManager: DatabaseManager | null = null

const isDev = !app.isPackaged

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1c1b1f',
      symbolColor: '#e6e1e5',
      height: 40,
    },
    show: false,
    backgroundColor: '#1c1b1f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    if (process.platform === 'win32') {
      mainWindow?.setAppDetails({
        appId: 'tv.anilibrixplus.desktop',
      })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  setupPlayerShortcuts()
}

function setupPlayerShortcuts() {
  // Local shortcuts via before-input-event so they don't block the OS
  mainWindow?.webContents.on('before-input-event', (_event, input) => {
    if (!mainWindow?.isFocused()) return
    if (input.type !== 'keyDown') return

    switch (input.key) {
      case 'Space':
        if (!input.control && !input.alt && !input.meta && !input.shift) {
          _event.preventDefault()
          mainWindow?.webContents.send('player:toggle-play')
        }
        break
      case 'ArrowRight':
        if (!input.control && !input.alt && !input.meta) {
          _event.preventDefault()
          mainWindow?.webContents.send('player:seek-forward')
        }
        break
      case 'ArrowLeft':
        if (!input.control && !input.alt && !input.meta) {
          _event.preventDefault()
          mainWindow?.webContents.send('player:seek-backward')
        }
        break
      case 'f':
      case 'F':
        if (!input.control && !input.alt && !input.meta && !input.shift) {
          _event.preventDefault()
          mainWindow?.webContents.send('player:toggle-fullscreen')
        }
        break
    }
  })

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow?.webContents.send('player:toggle-play')
  })
}

function createTray() {
  // Create a simple 16x16 transparent PNG from a Buffer if asset is missing
  const emptyIcon = nativeImage.createFromBuffer(
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAABxpRE9UAAAAAgAAAAAAAAAIAAAAKAAAAAgAAAAIAAAABuX8AeYAAAApSURBVDhPY2AYBaNgFIyCUTAKRsEoGAWjYBSMglEwCkYGAgAABgABJAX4VQAAAABJRU5ErkJggg==',
      'base64'
    )
  )
  tray = new Tray(emptyIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Открыть Anilibrix Plus',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Выйти',
      click: () => {
        app.quit()
      },
    },
  ])

  tray.setToolTip('Anilibrix Plus')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('anilibrixplus', (request, callback) => {
    const url = request.url.replace('anilibrixplus://', '')
    const parts = url.split('/')
    if (parts[0] === 'title' && parts[1]) {
      if (mainWindow) {
        mainWindow.webContents.send('app:navigate', `/title/${parts[1]}`)
      }
    }
    callback('')
  })

  protocol.registerFileProtocol('local', (request, callback) => {
    const url = request.url.replace('local://', '')
    const filePath = decodeURIComponent(url)
    callback({ path: filePath })
  })

  dbManager = new DatabaseManager()
  createWindow()
  createTray()
  initDiscordRPC()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    globalShortcut.unregisterAll()
    app.quit()
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// IPC handlers for database (electron-store based)
ipcMain.handle('db:getFavorites', () => {
  if (!dbManager) throw new Error('Database not initialized')
  return dbManager.getFavorites()
})

ipcMain.handle('db:addFavorite', (_event, favorite: any) => {
  if (!dbManager) throw new Error('Database not initialized')
  dbManager.addFavorite(favorite)
})

ipcMain.handle('db:removeFavorite', (_event, titleId: number) => {
  if (!dbManager) throw new Error('Database not initialized')
  dbManager.removeFavorite(titleId)
})

ipcMain.handle('db:getHistory', () => {
  if (!dbManager) throw new Error('Database not initialized')
  return dbManager.getHistory()
})

ipcMain.handle('db:addHistory', (_event, entry: any) => {
  if (!dbManager) throw new Error('Database not initialized')
  dbManager.addHistory(entry)
})

ipcMain.handle('db:getPlaylists', () => {
  if (!dbManager) throw new Error('Database not initialized')
  return dbManager.getPlaylists()
})

ipcMain.handle('db:createPlaylist', (_event, name: string) => {
  if (!dbManager) throw new Error('Database not initialized')
  return dbManager.createPlaylist(name)
})

ipcMain.handle('db:addToPlaylist', (_event, playlistId: number, item: any) => {
  if (!dbManager) throw new Error('Database not initialized')
  dbManager.addToPlaylist(playlistId, item)
})

ipcMain.handle('db:deletePlaylist', (_event, id: number) => {
  if (!dbManager) throw new Error('Database not initialized')
  dbManager.deletePlaylist(id)
})

// App info
ipcMain.handle('app:get-data-path', () => {
  return app.getPath('userData')
})

// Window controls
ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('window:is-maximized', () => {
  return mainWindow?.isMaximized() ?? false
})

// Notifications
ipcMain.handle('notification:show', (_event, options: { title: string; body: string }) => {
  if (mainWindow && !mainWindow.isVisible()) {
    tray?.displayBalloon({
      iconType: 'info',
      title: options.title,
      content: options.body,
    })
  }
})

// Torrent download
import axios from 'axios'
import { pipeline } from 'stream'
import { promisify } from 'util'

const streamPipeline = promisify(pipeline)

async function ensureDownloadsDir(): Promise<string> {
  const downloadsPath = path.join(app.getPath('userData'), 'downloads')
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath, { recursive: true })
  }
  return downloadsPath
}

// File-to-release mapping storage
const MAPPINGS_FILE = path.join(app.getPath('userData'), 'file-mappings.json')

function loadMappings(): Record<string, number> {
  try {
    if (fs.existsSync(MAPPINGS_FILE)) {
      return JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf-8'))
    }
  } catch {
    /* ignore */
  }
  return {}
}

function saveMappings(mappings: Record<string, number>) {
  try {
    fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2))
  } catch {
    /* ignore */
  }
}

ipcMain.handle(
  'torrent:download',
  async (
    _event,
    { url, filename, releaseId }: { url: string; filename: string; releaseId: number }
  ) => {
    try {
      const downloadsPath = await ensureDownloadsDir()
      const safeName = filename.replace(/[<>:"/\\|?*]/g, '_')
      const filePath = path.join(downloadsPath, safeName)

      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 60000,
      })

      const writer = fs.createWriteStream(filePath)
      await streamPipeline(response.data, writer)

      const mappings = loadMappings()
      mappings[safeName] = releaseId
      saveMappings(mappings)

      return { success: true, filePath }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }
)

ipcMain.handle('torrent:get-downloads-dir', async () => {
  return await ensureDownloadsDir()
})

ipcMain.handle('local-files:get-mappings', () => {
  return loadMappings()
})

ipcMain.handle(
  'local-files:set-mapping',
  (_event, { filename, releaseId }: { filename: string; releaseId: number }) => {
    const mappings = loadMappings()
    mappings[filename] = releaseId
    saveMappings(mappings)
  }
)

// Local video files scanner
const VIDEO_EXTS = new Set(['.mp4', '.mkv', '.avi', '.mov', '.webm', '.wmv', '.flv', '.m4v'])

function scanVideoFiles(
  dir: string
): Array<{ name: string; path: string; size: number; modifiedAt: number; releaseId?: number }> {
  const mappings = loadMappings()
  const results: Array<{
    name: string
    path: string
    size: number
    modifiedAt: number
    releaseId?: number
  }> = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...scanVideoFiles(fullPath))
      } else {
        const ext = path.extname(entry.name).toLowerCase()
        if (VIDEO_EXTS.has(ext)) {
          const stat = fs.statSync(fullPath)
          results.push({
            name: entry.name,
            path: fullPath,
            size: stat.size,
            modifiedAt: stat.mtime.getTime(),
            releaseId: mappings[entry.name],
          })
        }
      }
    }
  } catch {
    // ignore inaccessible directories
  }
  return results.sort((a, b) => b.modifiedAt - a.modifiedAt)
}

ipcMain.handle('local-files:scan', () => {
  const downloadsPath = app.getPath('downloads')
  return scanVideoFiles(downloadsPath)
})

ipcMain.handle('local-files:get-mapping', (_event, filename: string) => {
  const mappings = loadMappings()
  return mappings[filename] || null
})

// Picture in Picture
ipcMain.handle('player:enter-pip', () => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(true, 'floating')
    mainWindow.setSize(480, 270)
  }
})

ipcMain.handle('player:exit-pip', () => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(false)
    mainWindow.setSize(1400, 900)
  }
})

// Discord RPC
ipcMain.handle('discord:update-presence', (_event, presence: DiscordRPC.Presence) => {
  updateDiscordPresence(presence)
})

ipcMain.handle('discord:clear-presence', () => {
  clearDiscordPresence()
})
