import { defineStore } from 'pinia'
import type { SubtitleSettings } from '../components/GenrateSubtitle/types'
import { DEFAULT_FORMAT, DEFAULT_LANGUAGE, normalizeLanguage } from '../components/GenrateSubtitle/languages'

const createDefaultSettings = (): SubtitleSettings => ({
  language: DEFAULT_LANGUAGE,
  format: DEFAULT_FORMAT,
  autoTranslate: false,
  wordLevel: false,
  burnVideo: false,
  subtitleStyle: {
    fontSize: 24,
    fontColor: 'white',
    background: true,
    backgroundColor: 'black',
    backgroundOpacity: 0.8,
    position: 'bottom',
    outline: 2,
  },
})

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: createDefaultSettings(),
  }),

  actions: {
    updateSettings(settings: Partial<SubtitleSettings>) {
      if (settings.language !== undefined) {
        settings.language = normalizeLanguage(settings.language)
      }
      Object.assign(this.settings, settings)
    },

    resetSettings() {
      Object.assign(this.settings, createDefaultSettings())
    },
  },

  persist: {
    storage: localStorage,
    pick: ['settings'],
  },
})