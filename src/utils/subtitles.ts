export interface SubtitleCue {
  id: number
  start: number
  end: number
  text: string
}

export interface SubtitleStyle {
  fontSize: number
  color: string
  backgroundColor: string
  backgroundOpacity: number
  fontFamily: string
  outlineColor: string
  outlineWidth: number
  shadowBlur: number
  shadowColor: string
  position: 'top' | 'bottom' | 'center'
  align: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
  textTransform: 'none' | 'uppercase' | 'lowercase'
}

export const defaultSubtitleStyle: SubtitleStyle = {
  fontSize: 22,
  color: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.65,
  fontFamily: 'Inter, system-ui, sans-serif',
  outlineColor: '#000000',
  outlineWidth: 2,
  shadowBlur: 8,
  shadowColor: 'rgba(0,0,0,0.8)',
  position: 'bottom',
  align: 'center',
  lineHeight: 1.4,
  letterSpacing: 0.02,
  textTransform: 'none'
}

export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const blocks = content.trim().split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 3) continue

    const id = parseInt(lines[0], 10)
    if (isNaN(id)) continue

    const timeMatch = lines[1].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    )
    if (!timeMatch) continue

    const start =
      parseInt(timeMatch[1]) * 3600 +
      parseInt(timeMatch[2]) * 60 +
      parseInt(timeMatch[3]) +
      parseInt(timeMatch[4]) / 1000

    const end =
      parseInt(timeMatch[5]) * 3600 +
      parseInt(timeMatch[6]) * 60 +
      parseInt(timeMatch[7]) +
      parseInt(timeMatch[8]) / 1000

    const text = lines.slice(2).join('\n').replace(/<[^>]+>/g, '')

    cues.push({ id, start, end, text })
  }

  return cues
}

export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = []
  const lines = content.trim().split('\n')
  let i = 0

  // Skip WEBVTT header
  while (i < lines.length && !lines[i].includes('-->')) {
    i++
  }

  while (i < lines.length) {
    const timeLine = lines[i]
    const timeMatch = timeLine.match(
      /(\d{2}:)?(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}:)?(\d{2}):(\d{2})[,.](\d{3})/
    )
    if (!timeMatch) {
      i++
      continue
    }

    const parseTime = (h: string, m: string, s: string, ms: string) => {
      const hours = h ? parseInt(h) : 0
      return hours * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000
    }

    const start = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
    const end = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8])

    i++
    const textLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
      textLines.push(lines[i].replace(/<[^>]+>/g, ''))
      i++
    }

    if (textLines.length > 0) {
      cues.push({ id: cues.length + 1, start, end, text: textLines.join('\n') })
    }
  }

  return cues
}

export function loadSubtitleStyle(): SubtitleStyle {
  try {
    const raw = localStorage.getItem('anilibrixplus-subtitle-style')
    if (raw) return { ...defaultSubtitleStyle, ...JSON.parse(raw) }
  } catch {}
  return { ...defaultSubtitleStyle }
}

export function saveSubtitleStyle(style: SubtitleStyle) {
  localStorage.setItem('anilibrixplus-subtitle-style', JSON.stringify(style))
}
