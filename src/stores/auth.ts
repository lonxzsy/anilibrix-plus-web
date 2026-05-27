import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, setAuthToken } from '@/api/client'

export interface User {
  id: number
  login: string
  email: string
  name: string
  avatar: string
  createdAt?: string
  updatedAt?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('anilibrixplus-token'))
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  if (token.value) setAuthToken(token.value)

  async function login(loginStr: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await api.login(loginStr, password)
      if (data.token || data.session_token || data.access_token) {
        const t = data.token || data.session_token || data.access_token
        token.value = t
        localStorage.setItem('anilibrixplus-token', t)
        localStorage.setItem('anilibrixplus-login', loginStr)

        // Fetch full profile from API
        await fetchProfile()
        if (!user.value) {
          user.value = buildUser(data.user || data, loginStr)
        }
        return true
      }
      error.value = data.message || 'Неверный логин или пароль'
      return false
    } catch (e: any) {
      const msg = e.response?.data?.message || e.response?.data?.error || 'Ошибка авторизации'
      error.value = msg
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const data = await api.getMeProfile()
      if (data) {
        user.value = buildUser(data, data.login || '')
      }
    } catch (e) {
      console.warn('Failed to fetch profile:', e)
    }
  }

  function toAbsoluteImageUrl(path: string): string {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `https://aniliberty.top${path}`
  }

  function buildUser(raw: any, fallbackLogin: string): User {
    const login = raw?.login || fallbackLogin
    const avatarObj = raw?.avatar
    const avatarUrl = avatarObj
      ? toAbsoluteImageUrl(avatarObj.preview || avatarObj.thumbnail || avatarObj.optimized?.preview || avatarObj.optimized?.thumbnail || '')
      : ''
    return {
      id: raw?.id || 0,
      login,
      email: raw?.email || '',
      name: raw?.nickname || raw?.name || raw?.display_name || login,
      avatar: avatarUrl,
      createdAt: raw?.created_at,
      updatedAt: raw?.updated_at
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('anilibrixplus-token')
    localStorage.removeItem('anilibrixplus-login')
  }

  async function init() {
    const t = localStorage.getItem('anilibrixplus-token')
    const l = localStorage.getItem('anilibrixplus-login')
    if (t) {
      token.value = t
      setAuthToken(t)
      await fetchProfile()
    } else if (l) {
      token.value = null
      setAuthToken(null)
      user.value = buildUser(null, l)
    }
  }

  return {
    token,
    user,
    loading,
    error,
    login,
    logout,
    init,
    fetchProfile
  }
})
