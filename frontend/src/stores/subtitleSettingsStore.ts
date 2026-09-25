import { defineStore } from 'pinia'

import { useSettingsStore } from '@/stores/settingsStore'
import { LANGUAGES, SUBTITLE_FORMATS } from '@/constants/settings'
import type { SubtitleGenerateOptions } from '@/services/videoService'
import type { SubtitleFormat } from '@/types'

export type SubtitlePosition = 'bottom' | 'top' | 'middle'

/** Burn-in styling. Mirrors the `SubtitleStyle` the backend builds in `videos.service.ts`. */
export interface SubtitleStyleSettings {
  fontSize: number
  fontColor: string
  background: boolean
  backgroundColor: string
  /** 0 – 1, matching the ffmpeg `boxborderw`/alpha the backend expects. */
  backgroundOpacity: number
  position: SubtitlePosition
  outline: number
}

/**
 * Everything the generation panel controls. Each field is translated into a
 * backend DTO property by `toGenerateOptions()`.
 */
export interface SubtitleSettings {
  /** Sent as `leng` – the transcription / target language code. */
  language: string
  /** Sent as `formate`. */
  format: SubtitleFormat
  /** Transcribe first, then translate into `language`. */
  autoTranslate: boolean
  /** Sent as `lables` (backend spelling) – speaker detection. */
  speakerLabels: boolean
  /** Sent as `wordLevelTiming` – emits a `.wts` word-timing sidecar. */
  wordLevelTiming: boolean
  /** Restores punctuation and casing in the transcript. */
  autoPunctuation: boolean
  /** Render the subtitles into the video instead of only a sidecar file. */
  burnVideo: boolean
  /** Only forwarded when `burnVideo` is enabled. */
  subtitleStyle: SubtitleStyleSettings
}

const LANGUAGE_CODES = new Set(LANGUAGES.map((language) => language.code))

export function normalizeLanguage(code: string): string {
  return LANGUAGE_CODES.has(code) ? code : 'en'
}

export function createDefaultSubtitleSettings(): SubtitleSettings {
  return {
    language: 'en',
    format: 'SRT',
    autoTranslate: false,
    speakerLabels: false,
    wordLevelTiming: false,
    autoPunctuation: true,
    burnVideo: false,
    subtitleStyle: {
      fontSize: 24,
      fontColor: '#FFFFFF',
      background: true,
      backgroundColor: '#000000',
      backgroundOpacity: 0.8,
      position: 'bottom',
      outline: 2,
    },
  }
}

interface SubtitleSettingsState {
  settings: SubtitleSettings
}

export const useSubtitleSettingsStore = defineStore('subtitleSettings', {
  state: (): SubtitleSettingsState => ({
    settings: createDefaultSubtitleSettings(),
  }),

  getters: {
    /** Formats the backend accepts, narrowed to the current burn mode. */
    availableFormats: (): SubtitleFormat[] => {
      // The Prisma enum only holds SRT and VTT, and both are burn-capable, so
      // enabling burn never has to rewrite the chosen format.
      return [...SUBTITLE_FORMATS]
    },

    languageLabel: (state): string =>
      LANGUAGES.find((language) => language.code === state.settings.language)?.label ?? 'English (en)',

    /**
     * The exact payload accepted by `uploadAndGenrateVideoDto`. Style keys are
     * omitted unless the video is actually burned, because the backend ignores
     * them otherwise and sending dead params is misleading.
     *
     * Booleans are only ever sent when enabled. The DTO coerces query strings
     * with `@Type(() => Boolean)`, and class-transformer does a plain
     * `Boolean(value)` – so `"false"` arrives server-side as `true`. Omitting
     * the key leaves it `undefined`, which every consumer treats as disabled.
     */
    generateOptions: (state): SubtitleGenerateOptions => {
      const { settings } = state
      const options: SubtitleGenerateOptions = {
        leng: settings.language,
        formate: settings.format,
      }

      if (settings.speakerLabels) options.lables = true
      if (settings.autoTranslate) options.autoTranslate = true
      if (settings.autoPunctuation) options.autoPunctuation = true
      if (settings.wordLevelTiming) options.wordLevelTiming = true
      if (settings.burnVideo) options.burnVideo = true

      if (settings.burnVideo) {
        options.fontSize = settings.subtitleStyle.fontSize
        options.fontColor = settings.subtitleStyle.fontColor
        // `background` is a boolean and subject to the same coercion rule.
        if (settings.subtitleStyle.background) options.background = true
        options.backgroundColor = settings.subtitleStyle.backgroundColor
        options.backgroundOpacity = settings.subtitleStyle.backgroundOpacity
        options.position = settings.subtitleStyle.position
        options.outline = settings.subtitleStyle.outline
      }

      return options
    },
  },

  actions: {
    updateSettings(patch: Partial<Omit<SubtitleSettings, 'subtitleStyle'>> & {
      subtitleStyle?: Partial<SubtitleStyleSettings>
    }) {
      const next = { ...patch }

      if (next.language !== undefined) next.language = normalizeLanguage(next.language)
      if (next.format !== undefined && !SUBTITLE_FORMATS.includes(next.format)) return

      if (next.subtitleStyle) {
        this.settings.subtitleStyle = {
          ...this.settings.subtitleStyle,
          ...next.subtitleStyle,
        }
        delete next.subtitleStyle
      }

      Object.assign(this.settings, next)
    },

    setBurnVideo(burnVideo: boolean) {
      this.settings.burnVideo = burnVideo
    },

    resetSettings() {
      this.settings = createDefaultSubtitleSettings()
    },
  },

  persist: {
    key: 'vue-subs-generation-settings',
    storage: localStorage,
    pick: ['settings'],
    afterHydrate: (context) => {
      const store = context.store as unknown as { settings: SubtitleSettings }
      const defaults = createDefaultSubtitleSettings()
      const persisted = (store.settings ?? {}) as Partial<SubtitleSettings>

      const settingsState = useSettingsStore()
      const prefs = settingsState.effectiveSettings

      const subtitleStyleFromPrefs = {
        fontSize: prefs.fontSize,
        fontColor: prefs.fontColor,
        backgroundOpacity: prefs.backgroundOpacity / 100,
        position: prefs.position as SubtitlePosition,
        outline: prefs.outline ? 2 : 0,
      }

      const subtitleStyle = {
        ...defaults.subtitleStyle,
        ...subtitleStyleFromPrefs,
        ...persisted.subtitleStyle,
      }

      store.settings = {
        ...defaults,
        language: normalizeLanguage(persisted.language ?? prefs.language ?? defaults.language),
        format: persisted.format ?? prefs.defaultFormat ?? defaults.format,
        autoTranslate: persisted.autoTranslate ?? prefs.autoTranslate ?? defaults.autoTranslate,
        autoPunctuation: persisted.autoPunctuation ?? prefs.autoPunctuation ?? defaults.autoPunctuation,
        wordLevelTiming: persisted.wordLevelTiming ?? prefs.wordLevelTiming ?? defaults.wordLevelTiming,
        speakerLabels: defaults.speakerLabels,
        burnVideo: persisted.burnVideo ?? defaults.burnVideo,
        subtitleStyle: subtitleStyle,
      }
    },
  },
})
