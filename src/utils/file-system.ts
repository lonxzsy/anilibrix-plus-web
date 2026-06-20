export interface LocalVideoFile {
  name: string
  path: string
  size: number
  modifiedAt: number
}

// File System Access API types
interface FileSystemDirectoryHandle {
  name: string
  kind: 'directory'
  entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>
  getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>
  getFileHandle(name: string): Promise<FileSystemFileHandle>
  requestPermission(descriptor?: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
}

interface FileSystemFileHandle {
  name: string
  kind: 'file'
  getFile(): Promise<File>
}

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>
}

const VIDEO_EXTS = new Set([
  '.mp4', '.mkv', '.avi', '.mov', '.webm', '.wmv', '.flv', '.m4v',
])

async function requestDirectoryPermission(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const w = window as any
    const handle = await w.showDirectoryPicker()
    return handle
  } catch {
    return null
  }
}

async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  recursive = true
): Promise<LocalVideoFile[]> {
  const results: LocalVideoFile[] = []

  async function scan(handle: FileSystemDirectoryHandle, depth = 0) {
    if (depth > 5) return
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === 'file') {
        const ext = name.toLowerCase().match(/\.[^.]+$/)?.[0]
        if (ext && VIDEO_EXTS.has(ext)) {
          const file = await (entry as FileSystemFileHandle).getFile()
          results.push({
            name,
            path: name,
            size: file.size,
            modifiedAt: file.lastModified,
          })
        }
      } else if (recursive && entry.kind === 'directory' && depth < 5) {
        await scan(entry as FileSystemDirectoryHandle, depth + 1)
      }
    }
  }

  await scan(dirHandle)
  return results.sort((a, b) => b.modifiedAt - a.modifiedAt)
}

const FILE_MAPPINGS_KEY = 'anilibrixplus-file-mappings'

function loadMappings(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(FILE_MAPPINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveMappings(mappings: Record<string, number>) {
  localStorage.setItem(FILE_MAPPINGS_KEY, JSON.stringify(mappings))
}

export const localFiles = {
  async requestAccess() {
    return requestDirectoryPermission()
  },

  async scan(handle: FileSystemDirectoryHandle) {
    return scanDirectory(handle)
  },

  getMapping(filename: string): number | null {
    const mappings = loadMappings()
    return mappings[filename] || null
  },

  setMapping(filename: string, releaseId: number) {
    const mappings = loadMappings()
    mappings[filename] = releaseId
    saveMappings(mappings)
  },

  getMappings(): Record<string, number> {
    return loadMappings()
  },

  async getFileAsBlob(handle: FileSystemFileHandle): Promise<Blob> {
    const file = await handle.getFile()
    return file
  },

  async getFileUrl(handle: FileSystemFileHandle): Promise<string> {
    const file = await handle.getFile()
    return URL.createObjectURL(file)
  },
}
