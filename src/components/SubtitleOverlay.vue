<template>
  <div class="subtitle-overlay" :style="overlayStyle">
    <div v-if="activeCue" class="subtitle-text" :style="textStyle">
      {{ activeCue.text }}
    </div>
  </div>

  <div v-if="showSettings" class="subtitle-settings" @click.stop>
    <div class="subtitle-settings__header">
      <h4 class="md3-title-small">Субтитры</h4>
      <button class="subtitle-settings__close" @click="emit('closeSettings')">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Файл</label>
      <div class="subtitle-settings__file">
        <button class="subtitle-settings__btn md3-label-small" @click="selectFile">
          {{ hasFile ? 'Изменить файл' : 'Выбрать файл (.srt / .vtt)' }}
        </button>
        <button
          v-if="hasFile"
          class="subtitle-settings__btn subtitle-settings__btn--danger md3-label-small"
          @click="clearFile"
        >
          Удалить
        </button>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".srt,.vtt"
        style="display: none"
        @change="onFileSelected"
      />
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Размер</label>
      <input
        v-model.number="style.fontSize"
        type="range"
        min="12"
        max="48"
        step="1"
        @input="emitStyle"
      />
      <span class="subtitle-settings__value md3-body-small">{{ style.fontSize }}px</span>
    </div>

    <div class="subtitle-settings__row">
      <div class="subtitle-settings__section">
        <label class="subtitle-settings__label md3-label-small">Цвет текста</label>
        <input v-model="style.color" type="color" @input="emitStyle" />
      </div>
      <div class="subtitle-settings__section">
        <label class="subtitle-settings__label md3-label-small">Цвет фона</label>
        <input v-model="style.backgroundColor" type="color" @input="emitStyle" />
      </div>
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Прозрачность фона</label>
      <input
        v-model.number="style.backgroundOpacity"
        type="range"
        min="0"
        max="1"
        step="0.05"
        @input="emitStyle"
      />
      <span class="subtitle-settings__value md3-body-small"
        >{{ Math.round(style.backgroundOpacity * 100) }}%</span
      >
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Outline</label>
      <div class="subtitle-settings__row">
        <input v-model="style.outlineColor" type="color" @input="emitStyle" />
        <input
          v-model.number="style.outlineWidth"
          type="range"
          min="0"
          max="4"
          step="0.5"
          @input="emitStyle"
        />
        <span class="subtitle-settings__value md3-body-small">{{ style.outlineWidth }}px</span>
      </div>
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Позиция</label>
      <div class="subtitle-settings__row">
        <button
          v-for="p in ['top', 'center', 'bottom']"
          :key="p"
          class="subtitle-settings__chip"
          :class="{ active: style.position === p }"
          @click="
            style.position = p as any
            emitStyle()
          "
        >
          {{ p === 'top' ? 'Вверху' : p === 'center' ? 'Центр' : 'Внизу' }}
        </button>
      </div>
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Выравнивание</label>
      <div class="subtitle-settings__row">
        <button
          v-for="a in ['left', 'center', 'right']"
          :key="a"
          class="subtitle-settings__chip"
          :class="{ active: style.align === a }"
          @click="
            style.align = a as any
            emitStyle()
          "
        >
          {{ a === 'left' ? 'Лево' : a === 'center' ? 'Центр' : 'Право' }}
        </button>
      </div>
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Межстрочный интервал</label>
      <input
        v-model.number="style.lineHeight"
        type="range"
        min="1"
        max="2.5"
        step="0.1"
        @input="emitStyle"
      />
    </div>

    <div class="subtitle-settings__section">
      <label class="subtitle-settings__label md3-label-small">Тень</label>
      <div class="subtitle-settings__row">
        <input v-model="style.shadowColor" type="color" @input="emitStyle" />
        <input
          v-model.number="style.shadowBlur"
          type="range"
          min="0"
          max="20"
          step="1"
          @input="emitStyle"
        />
        <span class="subtitle-settings__value md3-body-small">{{ style.shadowBlur }}px</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SubtitleCue, SubtitleStyle } from '@/utils/subtitles'
import { loadSubtitleStyle, saveSubtitleStyle } from '@/utils/subtitles'

const props = defineProps<{
  currentTime: number
  showSettings: boolean
}>()

const emit = defineEmits<{
  closeSettings: []
}>()

const cues = ref<SubtitleCue[]>([])
const hasFile = ref(false)
const style = ref<SubtitleStyle>(loadSubtitleStyle())
const fileInput = ref<HTMLInputElement>()

const activeCue = computed(() => {
  const t = props.currentTime
  return cues.value.find((c) => t >= c.start && t <= c.end) || null
})

const overlayStyle = computed(() => {
  const s = style.value
  const justify = s.align === 'left' ? 'flex-start' : s.align === 'right' ? 'flex-end' : 'center'
  const alignItems =
    s.position === 'top' ? 'flex-start' : s.position === 'bottom' ? 'flex-end' : 'center'
  const padding =
    s.position === 'top' ? '48px 24px 20%' : s.position === 'bottom' ? '20% 24px 48px' : '24px'

  return {
    display: 'flex',
    justifyContent: justify,
    alignItems,
    padding,
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: 4,
  } as any
})

const textStyle = computed(() => {
  const s = style.value
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return {
    fontSize: `${s.fontSize}px`,
    color: s.color,
    fontFamily: s.fontFamily,
    lineHeight: s.lineHeight,
    letterSpacing: `${s.letterSpacing}em`,
    textTransform: s.textTransform,
    textAlign: s.align,
    backgroundColor: hexToRgba(s.backgroundColor, s.backgroundOpacity),
    padding: '4px 12px',
    borderRadius: '4px',
    textShadow: `${s.outlineWidth}px ${s.outlineWidth}px 0 ${s.outlineColor}, -${s.outlineWidth}px -${s.outlineWidth}px 0 ${s.outlineColor}, ${s.outlineWidth}px -${s.outlineWidth}px 0 ${s.outlineColor}, -${s.outlineWidth}px ${s.outlineWidth}px 0 ${s.outlineColor}, 0 ${s.shadowBlur}px ${s.shadowBlur}px ${s.shadowColor}`,
    maxWidth: '80%',
    wordBreak: 'break-word' as any,
  }
})

function selectFile() {
  fileInput.value?.click()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    const text = reader.result as string
    if (file.name.endsWith('.vtt')) {
      cues.value = parseVTT(text)
    } else {
      cues.value = parseSRT(text)
    }
    hasFile.value = true
  }
  reader.readAsText(file)
}

function clearFile() {
  cues.value = []
  hasFile.value = false
}

function emitStyle() {
  saveSubtitleStyle(style.value)
}

function parseSRT(content: string): SubtitleCue[] {
  const result: SubtitleCue[] = []
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
    const text = lines
      .slice(2)
      .join('\n')
      .replace(/<[^>]+>/g, '')
    result.push({ id, start, end, text })
  }
  return result
}

function parseVTT(content: string): SubtitleCue[] {
  const result: SubtitleCue[] = []
  const lines = content.trim().split('\n')
  let i = 0
  while (i < lines.length && !lines[i].includes('-->')) i++
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
      result.push({ id: result.length + 1, start, end, text: textLines.join('\n') })
    }
  }
  return result
}

watch(
  () => props.showSettings,
  (show) => {
    if (show) {
      style.value = loadSubtitleStyle()
    }
  }
)
</script>

<style scoped lang="scss">
.subtitle-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.subtitle-text {
  transition: opacity 150ms var(--md-sys-motion-easing-standard);
  white-space: pre-line;
}

.subtitle-settings {
  position: absolute;
  bottom: 80px;
  right: 16px;
  width: 320px;
  max-height: 420px;
  overflow-y: auto;
  z-index: 20;
  border-radius: var(--md-sys-shape-corner-small);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: rgba(15, 14, 18, 0.92);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__close {
    background: transparent;
    border: none;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--md-sys-shape-corner-small);
    transition: color 150ms;

    &:hover {
      color: var(--md-sys-color-on-surface);
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__label {
    color: var(--md-sys-color-on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__file {
    display: flex;
    gap: 8px;
  }

  &__btn {
    padding: 6px 12px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: rgba(255, 255, 255, 0.04);
    color: var(--md-sys-color-on-surface);
    cursor: pointer;
    transition: background 150ms;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    &--danger {
      color: var(--md-sys-color-error);
      border-color: rgba(224, 138, 133, 0.2);
    }
  }

  &__chip {
    padding: 4px 10px;
    border-radius: var(--md-sys-shape-corner-small);
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--md-sys-color-on-surface-variant);
    cursor: pointer;
    font-size: 12px;
    transition: all 150ms;

    &.active {
      background: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
      border-color: rgba(184, 165, 232, 0.2);
    }
  }

  &__value {
    color: var(--md-sys-color-on-surface-variant);
    min-width: 36px;
    text-align: right;
  }

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: var(--md-sys-color-primary);
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 6px rgba(184, 165, 232, 0.3);
    }

    &::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: var(--md-sys-color-primary);
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
  }

  input[type='color'] {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: var(--md-sys-shape-corner-small);
    background: transparent;
    cursor: pointer;
    padding: 0;
  }
}
</style>
