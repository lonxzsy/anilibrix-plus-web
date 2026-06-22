import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChangelogEntry {
  version: string
  date: string
  title: string
  changes: string[]
}

export interface ChangelogData {
  version: string
  releases: ChangelogEntry[]
}

const LS_KEY = 'anilibrixplus-last-seen-version'

export const useChangelogStore = defineStore('changelog', () => {
  const data = ref<ChangelogData | null>(null)
  const loading = ref(false)
  const dismissed = ref(false)

  const currentVersion = computed(() => data.value?.version ?? null)
  const releases = computed(() => data.value?.releases ?? [])
  const latestRelease = computed(() => releases.value[0] ?? null)

  const showUpdate = computed(() => {
    if (!data.value) return false
    if (dismissed.value) return false
    const lastSeen = localStorage.getItem(LS_KEY)
    return data.value.version !== lastSeen
  })

  async function fetchChangelog() {
    loading.value = true
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`)
      const json: ChangelogData = await res.json()
      data.value = json
    } catch {
      data.value = null
    } finally {
      loading.value = false
    }
  }

  function markSeen() {
    if (data.value) {
      localStorage.setItem(LS_KEY, data.value.version)
    }
  }

  function dismiss() {
    dismissed.value = true
  }

  return {
    data,
    loading,
    currentVersion,
    releases,
    latestRelease,
    showUpdate,
    fetchChangelog,
    markSeen,
    dismiss,
  }
})
