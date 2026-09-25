import { defineStore } from 'pinia'

import { getUserSettings, updateUserSettings } from '@/services/settingsService'
import type { SubtitleFormat, UserSettings } from '@/types'

export interface UserSettingsValues {
  language: string
  theme: string
  compactView: boolean
  defaultLanguage: string
  defaultFormat: SubtitleFormat
  autoPunctuation: boolean
  wordLevelTiming: boolean
  autoTranslate: boolean
  translateLanguage: string | null
  fontSize: number
  fontColor: string
  backgroundOpacity: number
  position: string
  outline: boolean
  jobComplete: boolean
  jobFailed: boolean
  weeklyReport: boolean
  productUpdates: boolean
  marketing: boolean
  autoDownload: boolean
}

export const DEFAULT_USER_SETTINGS: UserSettingsValues = {
  language: 'en',
  theme: 'dark',
  compactView: false,
  defaultLanguage: 'en',
  defaultFormat: 'SRT',
  autoPunctuation: true,
  wordLevelTiming: false,
  autoTranslate: false,
  translateLanguage: null,
  fontSize: 32,
  fontColor: '#FFFFFF',
  backgroundOpacity: 50,
  position: 'bottom',
  outline: true,
  jobComplete: true,
  jobFailed: true,
  weeklyReport: false,
  productUpdates: true,
  marketing: false,
  autoDownload: false,
}

export type UpdateSettingsPayload = Partial<UserSettingsValues>

interface SettingsState {
  settings: UserSettings | null
  isLoading: boolean
  isLoaded: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    settings: null,
    isLoading: false,
    isLoaded: false,
  }),

  getters: {
    effectiveSettings: (state): UserSettingsValues => ({
      ...DEFAULT_USER_SETTINGS,
      ...(state.settings ?? {}),
    }),
    theme: (state): string => state.settings?.theme ?? DEFAULT_USER_SETTINGS.theme,
  },

  actions: {
    applyTheme() {
      document.documentElement.classList.toggle('dark', this.theme === 'dark')
    },

    async fetchSettings() {
      this.isLoading = true
      try {
        const settings = await getUserSettings()
        this.settings = settings ?? null
        this.isLoaded = true
      } finally {
        this.isLoading = false
      }
      this.applyTheme()
    },

    async updateSettings(payload: UpdateSettingsPayload) {
      const settings = await updateUserSettings(
        payload as Partial<
          Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
        >,
      )
      this.settings = settings
      this.applyTheme()
      return settings
    },
  },

  persist: {
    key: 'vue-subs-settings',
    storage: localStorage,
    pick: ['settings'],
  },
})