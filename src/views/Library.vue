<template>
  <div class="library-wrapper">
    <div class="library__header">
      <h1 class="library__title md3-headline-medium">Моя библиотека</h1>
      <div v-if="authStore.user" class="library__profile">
        <div class="library__profile-info">
          <span class="md3-label-large" style="color: var(--md-sys-color-on-surface)">{{
            authStore.user.name
          }}</span>
          <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">{{
            authStore.user.login
          }}</span>
        </div>
        <div v-if="authStore.user.avatar" class="library__profile-avatar">
          <img :src="authStore.user.avatar" alt="" />
        </div>
        <div v-else class="library__profile-avatar-fallback">
          {{ authStore.user.name.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>

    <div class="library__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="library__tab md3-label-large"
        :class="{ 'library__tab--active': activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="library__content">
      <!-- Favorites -->
      <div v-if="activeTab === 'favorites'" class="library__grid">
        <TitleCard
          v-for="title in libraryStore.favorites"
          :key="title.id"
          :title="title"
          @click="goToDetails(title)"
        />
        <div v-if="libraryStore.favorites.length === 0" class="library__empty">
          <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
            Нет избранных тайтлов.
          </span>
        </div>
      </div>

      <!-- History -->
      <div v-else-if="activeTab === 'history'" class="library__history">
        <div class="library__sync-bar">
          <button
            v-if="authStore.token"
            class="library__sync-btn md3-label-large"
            @click="syncData"
          >
            {{ libraryStore.apiLoading ? 'Синхронизация...' : 'Синхронизировать с сервером' }}
          </button>
        </div>
        <div
          v-for="entry in libraryStore.history.slice(0, 50)"
          :key="`${entry.titleId}-${entry.episodeId}`"
          class="library__history-item"
          @click="continuePlay(entry)"
        >
          <div class="library__history-thumb">
            <img
              v-if="getPoster(entry.titleId)"
              :src="getPoster(entry.titleId)"
              loading="lazy"
              alt=""
            />
            <div v-else class="library__history-placeholder">
              <span class="md3-title-large">{{ entry.episodeNumber }}</span>
            </div>
            <div class="library__history-progress">
              <div
                class="library__history-progress-bar"
                :style="{ width: `${getProgressPercent(entry)}%` }"
              />
            </div>
          </div>
          <div class="library__history-info">
            <span class="md3-title-medium">{{ getTitleName(entry.titleId) }}</span>
            <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
              Серия {{ entry.episodeNumber }}
            </span>
            <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
              {{ formatDuration(entry.timestamp) }} / {{ formatDuration(entry.duration) }}
            </span>
          </div>
        </div>
        <div v-if="libraryStore.history.length === 0" class="library__empty">
          <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
            История просмотров пуста.
          </span>
        </div>
      </div>

      <!-- Playlists -->
      <div v-else-if="activeTab === 'playlists'" class="library__playlists">
        <div class="library__playlists-header">
          <button class="library__create-btn md3-label-large md3-ripple" @click="createPlaylist">
            + Новый плейлист
          </button>
        </div>
        <div class="library__playlists-list">
          <div
            v-for="playlist in libraryStore.playlists"
            :key="playlist.id"
            class="library__playlist-card"
          >
            <span class="md3-title-medium">{{ playlist.name }}</span>
            <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
              {{ playlist.items.length }} тайтлов
            </span>
          </div>
          <div v-if="libraryStore.playlists.length === 0" class="library__empty">
            <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
              Нет плейлистов.
            </span>
          </div>
        </div>
      </div>

      <!-- Local Files -->
      <div v-else-if="activeTab === 'local'" class="library__local">
        <div class="library__sync-bar">
          <button class="library__sync-btn md3-label-large" @click="scanLocalFiles">
            {{ localFilesLoading ? 'Сканирование...' : 'Обновить' }}
          </button>
        </div>
        <div v-if="localFiles.length > 0" class="library__local-list">
          <div
            v-for="file in localFiles"
            :key="file.path"
            class="library__local-item"
            @click="playLocalFile(file)"
          >
            <div class="library__local-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="library__local-info">
              <span
                v-if="file.titleName"
                class="md3-title-medium"
                style="color: var(--md-sys-color-primary)"
                >{{ file.titleName }}</span
              >
              <span v-else class="md3-title-medium">{{ file.name }}</span>
              <span class="md3-body-small" style="color: var(--md-sys-color-on-surface-variant)">
                {{ formatBytes(file.size) }}
                <span
                  v-if="file.releaseId"
                  style="margin-left: 8px; color: var(--md-sys-color-primary)"
                  >· Распознано</span
                >
              </span>
            </div>
            <button
              v-if="!file.releaseId"
              class="library__local-link md3-label-small"
              @click.stop="openLocalSearch(file)"
            >
              Привязать
            </button>
          </div>
        </div>
        <div v-else-if="localFilesLoading" class="library__local-skeletons">
          <div
            v-for="n in 4"
            :key="n"
            class="md3-skeleton"
            style="height: 56px; border-radius: 8px"
          />
        </div>
        <div v-else class="library__empty">
          <span class="md3-body-large" style="color: var(--md-sys-color-on-surface-variant)">
            Видео-файлы в папке загрузок не найдены.
          </span>
        </div>
      </div>
    </div>

    <!-- Local file search modal -->
    <div
      v-if="showLocalSearchModal"
      class="library__modal-overlay"
      @click.self="showLocalSearchModal = false"
    >
      <div class="library__modal glass">
        <h3
          class="md3-title-large"
          style="color: var(--md-sys-color-on-surface); margin-bottom: 16px"
        >
          Привязать к аниме
        </h3>
        <input
          v-model="localSearchQuery"
          class="library__modal-input md3-body-medium"
          placeholder="Название аниме..."
          @keydown.enter="searchLocalTitle"
        />
        <div v-if="localSearchLoading" class="library__modal-loading">
          <div
            v-for="n in 3"
            :key="n"
            class="md3-skeleton"
            style="height: 60px; border-radius: 8px"
          />
        </div>
        <div v-else-if="localSearchResults.length > 0" class="library__modal-list">
          <div
            v-for="t in localSearchResults"
            :key="t.id"
            class="library__modal-item"
            @click="assignLocalFile(t)"
          >
            <img
              v-if="t.poster?.preview"
              :src="t.poster.preview"
              class="library__modal-thumb"
              alt=""
            />
            <div v-else class="library__modal-thumb-placeholder" />
            <span class="md3-body-large">{{ t.name.main }}</span>
          </div>
        </div>
        <p
          v-else
          class="md3-body-large"
          style="color: var(--md-sys-color-on-surface-variant); text-align: center"
        >
          Ничего не найдено
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLibraryStore } from '@/stores/library'
import { useTitleStore } from '@/stores/titles'
import { useAuthStore } from '@/stores/auth'
import { localFilesBridge } from '@/utils/db-bridge'
import { api } from '@/api/client'
import TitleCard from '@/components/TitleCard.vue'
import { formatTime } from '@/utils/helpers'
import type { Title, HistoryEntry } from '@/types'

interface LocalFile {
  name: string
  path: string
  size: number
  modifiedAt: number
  releaseId?: number
  titleName?: string
}

const router = useRouter()
const libraryStore = useLibraryStore()
const titleStore = useTitleStore()
const authStore = useAuthStore()

async function syncData() {
  await libraryStore.syncWithApi()
}

const activeTab = ref<'favorites' | 'history' | 'playlists' | 'local'>('favorites')
const localFiles = ref<LocalFile[]>([])
const localFilesLoading = ref(false)
const showLocalSearchModal = ref(false)
const currentLocalFile = ref<LocalFile | null>(null)
const localSearchResults = ref<Title[]>([])
const localSearchQuery = ref('')
const localSearchLoading = ref(false)

const tabs = [
  { id: 'favorites' as const, label: 'Избранное' },
  { id: 'history' as const, label: 'История' },
  { id: 'playlists' as const, label: 'Плейлисты' },
  { id: 'local' as const, label: 'Локальные файлы' },
]

function goToDetails(title: Title) {
  router.push(`/title/${title.id}`)
}

function continuePlay(entry: HistoryEntry) {
  router.push(`/player/${entry.titleId}/${entry.episodeId}`)
}

function getPoster(titleId: number) {
  const t = titleStore.titles.find((tt) => tt.id === titleId)
  if (!t?.poster) return ''
  return t.poster.preview || t.poster.src || t.poster.thumbnail || ''
}

function getTitleName(titleId: number) {
  const t = titleStore.titles.find((tt) => tt.id === titleId)
  return t?.name.main || `Тайтл #${titleId}`
}

function getProgressPercent(entry: HistoryEntry) {
  if (!entry.duration) return 0
  return Math.round((entry.timestamp / entry.duration) * 100)
}

function formatDuration(seconds: number) {
  return formatTime(seconds)
}

async function createPlaylist() {
  const name = prompt('Название плейлиста:')
  if (name?.trim()) {
    await libraryStore.createPlaylist(name.trim())
  }
}

async function scanLocalFiles() {
  localFilesLoading.value = true
  try {
    const files = await localFilesBridge.scan()
    const mapped = files.map((f: any) => ({
      name: f.name,
      path: f.path,
      size: f.size,
      modifiedAt: f.modifiedAt,
      releaseId: f.releaseId,
      titleName: f.releaseId ? getTitleName(f.releaseId) : undefined,
    }))
    localFiles.value = mapped

    // Fetch missing titles in background
    const missingIds = [
      ...new Set(
        mapped
          .filter(
            (f: LocalFile) => f.releaseId && !titleStore.titles.find((t) => t.id === f.releaseId)
          )
          .map((f: LocalFile) => f.releaseId!)
      ),
    ]
    for (const id of missingIds) {
      try {
        await titleStore.fetchTitle(String(id))
      } catch {
        /* ignore */
      }
    }
    // Recompute names after fetching
    localFiles.value = mapped.map((f: LocalFile) => ({
      ...f,
      titleName: f.releaseId ? getTitleName(f.releaseId) : undefined,
    }))
  } finally {
    localFilesLoading.value = false
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i]
}

function playLocalFile(file: LocalFile) {
  router.push(`/player/local/${encodeURIComponent(file.path)}`)
}

function openLocalSearch(file: LocalFile) {
  currentLocalFile.value = file
  localSearchQuery.value = file.name.replace(/\.[^.]+$/, '').replace(/[\[\]\(\)_\.\-]/g, ' ')
  showLocalSearchModal.value = true
  searchLocalTitle()
}

async function searchLocalTitle() {
  if (!localSearchQuery.value.trim()) return
  localSearchLoading.value = true
  try {
    const result = await api.getCatalogReleases(1, 20, localSearchQuery.value.trim())
    localSearchResults.value = result.data || []
  } catch (e) {
    console.warn('Local search failed:', e)
    localSearchResults.value = []
  } finally {
    localSearchLoading.value = false
  }
}

async function assignLocalFile(title: Title) {
  if (!currentLocalFile.value) return
  await localFilesBridge.setMapping(currentLocalFile.value.name, title.id)
  await scanLocalFiles()
  showLocalSearchModal.value = false
  currentLocalFile.value = null
}

onMounted(() => {
  libraryStore.loadFavorites()
  libraryStore.loadHistory()
  libraryStore.loadPlaylists()
  scanLocalFiles()
})
</script>

<style scoped lang="scss">
.library {
  display: flex;
  flex-direction: column;
  gap: 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  &__title {
    color: var(--md-sys-color-on-surface);
  }

  &__profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__profile-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  &__profile-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid var(--md-sys-color-primary);
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.25);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__profile-avatar-fallback {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    font: var(--md-sys-typescale-label-medium);
    font-size: 14px;
    border: 1.5px solid var(--md-sys-color-primary);
    box-shadow: 0 0 8px rgba(184, 165, 232, 0.25);
  }

  &__sync-bar {
    margin-bottom: 12px;
  }

  &__sync-btn {
    padding: 8px 16px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-primary);
    cursor: pointer;
    transition:
      background-color 150ms var(--md-sys-motion-easing-standard),
      border-color 150ms var(--md-sys-motion-easing-standard),
      box-shadow 150ms var(--md-sys-motion-easing-standard);

    &:hover {
      background: var(--md-sys-color-primary-container);
      border-color: var(--md-sys-color-primary);
      box-shadow: var(--glow-primary);
    }

    &:active {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
  }

  &__tabs {
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
  }

  &__tab {
    padding: 12px 20px;
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    position: relative;
    transition: color 200ms var(--md-sys-motion-easing-standard);

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 3px;
      background: var(--md-sys-color-primary);
      border-radius: var(--md-sys-shape-corner-small) var(--md-sys-shape-corner-small) 0 0;
      transform: scaleX(0);
      transition: transform 200ms var(--md-sys-motion-easing-standard);
    }

    &:hover {
      color: var(--md-sys-color-on-surface);
    }

    &--active {
      color: var(--md-sys-color-primary);

      &::after {
        transform: scaleX(1);
      }
    }
  }

  &__content {
    min-height: 200px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    grid-column: 1 / -1;
  }

  &__history {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__history-item {
    display: flex;
    gap: 16px;
    padding: 12px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    cursor: pointer;
    transition:
      background-color 200ms var(--md-sys-motion-easing-standard),
      transform 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      transform: translateX(4px);
    }
  }

  &__history-thumb {
    position: relative;
    width: 160px;
    height: 90px;
    border-radius: var(--md-sys-shape-corner-small);
    overflow: hidden;
    background: var(--md-sys-color-surface-container-high);
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__history-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--md-sys-color-on-surface-variant);
  }

  &__history-progress {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
  }

  &__history-progress-bar {
    height: 100%;
    background: var(--md-sys-color-primary);
    transition: width 300ms var(--md-sys-motion-easing-standard);
  }

  &__history-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
  }

  &__playlists-header {
    margin-bottom: 16px;
  }

  &__create-btn {
    padding: 10px 20px;
    border-radius: var(--md-sys-shape-corner-medium);
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-primary);
    cursor: pointer;
    transition:
      background-color 150ms var(--md-sys-motion-easing-standard),
      border-color 150ms var(--md-sys-motion-easing-standard),
      box-shadow 150ms var(--md-sys-motion-easing-standard);

    &:hover {
      background: var(--md-sys-color-primary-container);
      border-color: var(--md-sys-color-primary);
      box-shadow: var(--glow-primary);
    }

    &:active {
      background: var(--md-sys-color-primary);
      color: var(--md-sys-color-on-primary);
    }
  }

  &__playlists-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  &__playlist-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 20px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    cursor: pointer;
    transition:
      transform 200ms var(--md-sys-motion-easing-standard),
      box-shadow 200ms var(--md-sys-motion-easing-standard);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--md-sys-elevation-1);
    }
  }

  &__local {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__local-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__local-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: var(--md-sys-shape-corner-medium);
    background: var(--md-sys-color-surface-container);
    cursor: pointer;
    transition:
      background-color 200ms,
      transform 200ms;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
      transform: translateX(4px);
    }
  }

  &__local-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--md-sys-color-primary-container);
    color: var(--md-sys-color-on-primary-container);
    flex-shrink: 0;
  }

  &__local-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;

    span:first-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__local-skeletons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__local-link {
    padding: 6px 12px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--md-sys-color-outline);
    background: transparent;
    color: var(--md-sys-color-primary);
    cursor: pointer;
    font-size: 12px;
    transition:
      background-color 150ms,
      border-color 150ms;
    flex-shrink: 0;

    &:hover {
      background: var(--md-sys-color-primary-container);
      border-color: var(--md-sys-color-primary);
    }
  }

  &__modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  }

  &__modal {
    width: 480px;
    max-height: 70vh;
    overflow-y: auto;
    padding: 24px;
    border-radius: var(--md-sys-shape-corner-medium);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__modal-input {
    padding: 10px 14px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--md-sys-color-outline);
    background: var(--md-sys-color-surface-container);
    color: var(--md-sys-color-on-surface);
    outline: none;

    &:focus {
      border-color: var(--md-sys-color-primary);
    }
  }

  &__modal-loading {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__modal-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__modal-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: var(--md-sys-shape-corner-small);
    background: var(--md-sys-color-surface-container);
    cursor: pointer;
    transition: background-color 150ms;

    &:hover {
      background: var(--md-sys-color-surface-container-high);
    }
  }

  &__modal-thumb {
    width: 40px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--md-sys-shape-corner-extra-small);
    flex-shrink: 0;
  }

  &__modal-thumb-placeholder {
    width: 40px;
    height: 60px;
    border-radius: var(--md-sys-shape-corner-extra-small);
    background: var(--md-sys-color-surface-container-high);
    flex-shrink: 0;
  }
}
</style>
