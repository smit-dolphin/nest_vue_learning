import { defineStore } from 'pinia'
import type { SubtitleSettings } from '../components/GenrateSubtitle/types'

const DEFAULT_SETTINGS: SubtitleSettings = {
  language: 'English',
  format: 'SRT',
  timestamps: true,
  speakerLabels: false,
  autoTranslate: false,
  burnVideo: false,
  punctuation: true,
  wordLevel: false,
  subtitleStyle: {
    fontSize: 24,
    fontColor: 'white',
    background: true,
    backgroundColor: 'black',
    backgroundOpacity: 0.8,
    position: 'bottom',
    outline: 2,
  },
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
