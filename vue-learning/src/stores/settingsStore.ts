import { defineStore } from 'pinia'
import type { SubtitleSettings } from '../components/GenrateSubtitle/types'

const DEFAULT_SETTINGS: SubtitleSettings = {
  language: 'English',
  format: 'SRT',
  timestamps: true,
  speakerLabels: false,
  autoTranslate: false,
  punctuation: true,
  wordLevel: false,
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS },
  }),

  actions: {
    updateSettings(settings: SubtitleSettings) {
      Object.assign(this.settings, settings)
    },

    resetSettings() {
      Object.assign(this.settings, DEFAULT_SETTINGS)
    },
  },

  persist: {
    storage: localStorage,
    pick: ['settings'],
  },
})
