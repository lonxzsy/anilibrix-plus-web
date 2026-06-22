import Fuse, { type IFuseOptions } from 'fuse.js'
import type { Title } from '@/types'

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'Yo',
  Ж: 'Zh', З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M',
  Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U',
  Ф: 'F', Х: 'Kh', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Shch',
  Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya',
}

const LATIN_TO_CYRILLIC: Record<string, string> = {
  zh: 'ж', kh: 'х', ts: 'ц', ch: 'ч', sh: 'ш',
  shch: 'щ', yu: 'ю', ya: 'я', yo: 'ё',
  a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е',
  z: 'з', i: 'и', y: 'й', k: 'к', l: 'л', m: 'м',
  n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т',
  u: 'у', f: 'ф',
  A: 'А', B: 'Б', V: 'В', G: 'Г', D: 'Д', E: 'Е',
  Z: 'З', I: 'И', Y: 'Й', K: 'К', L: 'Л', M: 'М',
  N: 'Н', O: 'О', P: 'П', R: 'Р', S: 'С', T: 'Т',
  U: 'У', F: 'Ф', Zh: 'Ж', Kh: 'Х', Ts: 'Ц', Ch: 'Ч',
  Sh: 'Ш', Shch: 'Щ', Yu: 'Ю', Ya: 'Я', Yo: 'Ё',
}

function cyrillicToLatin(text: string): string {
  return text
    .split('')
    .map((ch) => CYRILLIC_TO_LATIN[ch] || ch)
    .join('')
}

function latinToCyrillic(text: string): string {
  let result = text
  const sorted = Object.keys(LATIN_TO_CYRILLIC).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    result = result.replace(new RegExp(key, 'g'), LATIN_TO_CYRILLIC[key])
  }
  return result
}

function normalize(text: string): string {
  return cyrillicToLatin(text.toLowerCase().replace(/[^a-zа-яё0-9\s]/gi, ' ')).trim()
}

export interface SearchTokens {
  text: string
  genre?: string
  year?: string
  status?: 'ongoing' | 'completed'
  type?: string
  season?: string
}

const TOKEN_RULES: { regex: RegExp; key: keyof SearchTokens; map?: Record<string, string> }[] = [
  { regex: /(?:genre|жанр):(.+)/i, key: 'genre' },
  { regex: /(?:year|год):(\d{4})/i, key: 'year' },
  { regex: /(?:status|статус):(.+)/i, key: 'status' },
  { regex: /(?:type|тип):(.+)/i, key: 'type' },
  { regex: /(?:season|сезон):(.+)/i, key: 'season' },
]

const STATUS_MAP: Record<string, 'ongoing' | 'completed'> = {
  ongoing: 'ongoing', онгоинг: 'ongoing', выпускается: 'ongoing',
  completed: 'completed', завершён: 'completed', завершен: 'completed', вышел: 'completed',
}

const SEASON_MAP: Record<string, string> = {
  winter: 'winter', зима: 'winter', зимний: 'winter',
  spring: 'spring', весна: 'spring', весенний: 'spring',
  summer: 'summer', лето: 'summer', летний: 'summer',
  fall: 'fall', autumn: 'fall', осень: 'fall', осенний: 'fall',
}

export function parseTokens(query: string): SearchTokens {
  let text = query.trim()
  const tokens: SearchTokens = { text }

  for (const rule of TOKEN_RULES) {
    const match = text.match(rule.regex)
    if (match) {
      const value = match[1].trim().toLowerCase()
      text = text.replace(match[0], '').trim()
      if (rule.key === 'status') {
        tokens.status = STATUS_MAP[value]
      } else if (rule.key === 'season') {
        tokens.season = SEASON_MAP[value]
      } else {
        (tokens as any)[rule.key] = value
      }
    }
  }

  tokens.text = text
  return tokens
}

const FUZZY_OPTIONS: IFuseOptions<Title> = {
  keys: [
    { name: 'name.main', weight: 5 },
    { name: 'name.english', weight: 4 },
    { name: 'name.alternative', weight: 3 },
    { name: 'genres.name', weight: 2 },
    { name: 'description', weight: 1 },
  ],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  ignoreLocation: false,
}

function createFuseIndex(titles: Title[]): Fuse<Title> {
  return new Fuse(titles, FUZZY_OPTIONS)
}

export interface SearchResult {
  title: Title
  score: number
  matchType: 'exact' | 'fuzzy' | 'transliterated'
}

export function createSearchEngine(titles: () => Title[]) {
  let fuse: Fuse<Title> | null = null
  let lastTitles: Title[] | null = null

  function ensureIndex() {
    const current = titles()
    if (current !== lastTitles) {
      fuse = createFuseIndex(current)
      lastTitles = current
    }
    return fuse!
  }

  function search(query: string): SearchResult[] {
    const tokens = parseTokens(query)
    const q = tokens.text
    if (!q && !tokens.genre && !tokens.year && !tokens.status && !tokens.type && !tokens.season) {
      return []
    }

    let pool = titles()

    if (tokens.genre) {
      const g = tokens.genre.toLowerCase()
      pool = pool.filter((t) => t.genres?.some((genre) => genre.name.toLowerCase().includes(g)))
    }
    if (tokens.year) {
      pool = pool.filter((t) => String(t.year) === tokens.year)
    }
    if (tokens.status) {
      pool = pool.filter((t) =>
        tokens.status === 'ongoing' ? t.isOngoing : !t.isOngoing
      )
    }
    if (tokens.type) {
      const tp = tokens.type.toLowerCase()
      pool = pool.filter((t) => t.type?.description.toLowerCase().includes(tp))
    }
    if (tokens.season) {
      pool = pool.filter((t) => t.season?.value === tokens.season)
    }

    if (!q) {
      return pool.map((title) => ({ title, score: 0, matchType: 'exact' as const }))
    }

    const fuse = ensureIndex()
    const fuseResults = fuse.search(q)

    const transliteratedResults = findTransliterated(q, pool, fuse)

    const seen = new Set<number>()
    const combined: SearchResult[] = []

    const exactMatches = pool.filter(
      (t) =>
        t.name.main.toLowerCase() === q.toLowerCase() ||
        t.name.english?.toLowerCase() === q.toLowerCase()
    )
    for (const t of exactMatches) {
      if (!seen.has(t.id)) {
        seen.add(t.id)
        combined.push({ title: t, score: 0, matchType: 'exact' })
      }
    }

    for (const r of fuseResults) {
      if (!seen.has(r.item.id) && pool.some((t) => t.id === r.item.id)) {
        seen.add(r.item.id)
        combined.push({ title: r.item, score: r.score ?? 1, matchType: 'fuzzy' })
      }
    }

    for (const r of transliteratedResults) {
      if (!seen.has(r.title.id)) {
        seen.add(r.title.id)
        combined.push(r)
      }
    }

    combined.sort((a, b) => {
      if (a.matchType !== b.matchType) {
        const order = { exact: 0, fuzzy: 1, transliterated: 2 }
        return order[a.matchType] - order[b.matchType]
      }
      if (a.matchType === 'transliterated') return a.score - b.score
      return (a.score ?? 1) - (b.score ?? 1)
    })

    return combined
  }

  function suggest(query: string, limit = 8): Title[] {
    if (!query || query.length < 1) return []
    const tokens = parseTokens(query)
    if (!tokens.text) return []

    const fuse = ensureIndex()
    return fuse
      .search(tokens.text, { limit })
      .map((r) => r.item)
  }

  return { search, suggest }
}

function findTransliterated(
  query: string,
  pool: Title[],
  fuse: Fuse<Title>
): SearchResult[] {
  const latinized = cyrillicToLatin(query.toLowerCase())
  if (latinized === query.toLowerCase()) return []

  const cyrillicQuery = latinToCyrillic(query.toLowerCase())
  const results: SearchResult[] = []
  const seen = new Set<number>()

  for (const t of pool) {
    const fields = [t.name.main, t.name.english, t.name.alternative].filter(Boolean)
    const latinFields = fields.map((f) => cyrillicToLatin(f!.toLowerCase()))

    for (let i = 0; i < fields.length; i++) {
      if (
        fields[i]!.toLowerCase().includes(cyrillicQuery) ||
        latinFields[i].includes(latinized) ||
        latinFields[i].includes(query.toLowerCase())
      ) {
        if (!seen.has(t.id)) {
          seen.add(t.id)
          results.push({ title: t, score: 0.3, matchType: 'transliterated' })
          break
        }
      }
    }
  }

  return results
}

const HISTORY_KEY = 'anilibrix-search-history'
const MAX_HISTORY = 20

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function addSearchHistory(query: string) {
  if (!query.trim()) return
  let history = getSearchHistory().filter((h) => h !== query.trim())
  history.unshift(query.trim())
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
