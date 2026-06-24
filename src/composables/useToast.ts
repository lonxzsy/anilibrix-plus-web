import { ref, type Ref } from 'vue'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration: number
  exiting: boolean
}

const toasts = ref<Toast[]>([])
const TOAST_LIMIT = 5

function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function addToast(message: string, type: Toast['type'] = 'info', duration = 3500) {
  if (toasts.value.length >= TOAST_LIMIT) {
    const oldest = toasts.value[0]
    if (oldest && !oldest.exiting) {
      oldest.exiting = true
      setTimeout(() => {
        const idx = toasts.value.indexOf(oldest)
        if (idx > -1) toasts.value.splice(idx, 1)
      }, 300)
    }
  }

  const toast: Toast = {
    id: generateId(),
    message,
    type,
    duration,
    exiting: false,
  }

  toasts.value.push(toast)

  setTimeout(() => {
    const idx = toasts.value.indexOf(toast)
    if (idx > -1) {
      toasts.value[idx].exiting = true
      setTimeout(() => {
        const i = toasts.value.indexOf(toast)
        if (i > -1) toasts.value.splice(i, 1)
      }, 300)
    }
  }, duration)
}

export function useToast() {
  return {
    toasts,
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
    remove: (id: string) => {
      const idx = toasts.value.findIndex((t) => t.id === id)
      if (idx > -1) {
        toasts.value[idx].exiting = true
        setTimeout(() => {
          const i = toasts.value.findIndex((t) => t.id === id)
          if (i > -1) toasts.value.splice(i, 1)
        }, 300)
      }
    },
  }
}
