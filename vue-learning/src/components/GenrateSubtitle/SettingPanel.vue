<script setup lang="ts">
import { computed } from 'vue'
import { AlignLeft, Flame, Globe2, Languages, Wand2, Zap } from 'lucide-vue-next'
import { useSettingsStore } from '../../stores/settingsStore'
import DropdownSelect from '../Common/DropdownSelect.vue'
import SubtitleStylePanel from './SubtitleStylePanel.vue'
import { BURN_COMPATIBLE_FORMATS, FORMATS, LANGUAGES } from './languages'

const settingsStore = useSettingsStore()
const settings = computed(() => settingsStore.settings)

const isFormatCompatibleWithBurn = (format: string) =>
  (BURN_COMPATIBLE_FORMATS as readonly string[]).includes(format)

/* ─── Language (translation target) ─── */
const languageOptions = LANGUAGES.map((language) => ({
  label: language.name,
  value: language.code,
}))

const selectedLanguage = computed({
  get: () => settings.value.language,
  set: (code: string) => settingsStore.updateSettings({ language: code }),
})

/* ─── Format ─── */
const availableFormats = computed(() =>
  settings.value.burnVideo
    ? FORMATS.filter(isFormatCompatibleWithBurn)
    : [...FORMATS],
)

const formatOptions = computed(() =>
  availableFormats.value.map((format) => ({ label: format, value: format })),
)

const selectedFormat = computed({
  get: () => settings.value.format,
  set: (format: string) => settingsStore.updateSettings({ format }),
})

/* ─── Actions ─── */
function toggle(key: 'autoTranslate' | 'wordLevel') {
  settingsStore.updateSettings({ [key]: !settings.value[key] })
}

function toggleAutoTranslate() {
  const next = !settings.value.autoTranslate
  settingsStore.updateSettings({ autoTranslate: next })
}

function setBurnVideo(shouldBurn: boolean) {
  settingsStore.updateSettings({
    burnVideo: shouldBurn,
    ...(shouldBurn && !isFormatCompatibleWithBurn(settings.value.format)
      ? { format: BURN_COMPATIBLE_FORMATS[0] }
      : {}),
  })
}
</script>

<template>
  <div class="settings-card">
    <div class="settings-card__header">
      <Wand2 :size="16" />
      <span>Subtitle Settings</span>
    </div>

    <!-- Translation -->
    <section class="settings-section" :class="{ 'settings-section--disabled': !settings.autoTranslate }">
      <div class="settings-section__heading">
        <Globe2 :size="14" />
        <span>Translation</span>
      </div>

      <div class="toggle-row">
        <div class="toggle-row__info">
          <p class="toggle-row__label">Auto-Translate</p>
          <p class="toggle-row__desc">Transcribe in the source language, then translate it with AI</p>
        </div>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--on': settings.autoTranslate }"
          type="button"
          aria-label="Auto-translate"
          @click="toggleAutoTranslate"
        >
          <span class="toggle-btn__thumb"></span>
        </button>
      </div>

      <div class="settings-field">
        <label class="settings-label">
          <Languages :size="13" />
          Target Language
        </label>
        <DropdownSelect
          v-model="selectedLanguage"
          :options="languageOptions"
          ariaLabel="Target language"
          :disabled="!settings.autoTranslate"
        />
        <p class="settings-field__hint">
          {{ settings.autoTranslate ? 'Subtitles are translated into this language.' : 'Enable Auto-Translate to pick a target language.' }}
        </p>
      </div>
    </section>

    <!-- Output -->
    <section class="settings-section">
      <div class="settings-section__heading">
        <AlignLeft :size="14" />
        <span>Output</span>
      </div>

      <div class="settings-field">
        <label class="settings-label">
          <AlignLeft :size="13" />
          Subtitle Format
        </label>
        <DropdownSelect
          v-model="selectedFormat"
          :options="formatOptions"
          ariaLabel="Subtitle format"
        />
        <p class="settings-field__hint">
          {{ settings.burnVideo ? 'Only SRT and WebVTT can be burned into the video.' : 'SRT and WebVTT can also be burned directly into the video.' }}
        </p>
      </div>
    </section>

    <!-- Processing -->
    <section class="settings-section">
      <div class="settings-section__heading">
        <Zap :size="14" />
        <span>Processing</span>
      </div>

      <div class="toggle-row">
        <div class="toggle-row__info">
          <p class="toggle-row__label">Word-Level Timing</p>
          <p class="toggle-row__desc">Generate precise per-word timing data (.wts)</p>
        </div>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--on': settings.wordLevel }"
          type="button"
          aria-label="Word-level timing"
          @click="toggle('wordLevel')"
        >
          <span class="toggle-btn__thumb"></span>
        </button>
      </div>
    </section>

    <!-- Output type -->
    <section class="settings-section">
      <div class="settings-section__heading">
        <Flame :size="14" />
        <span>Output Type</span>
      </div>

      <div class="segmented">
        <button
          type="button"
          class="segmented__option"
          :class="{ 'segmented__option--active': !settings.burnVideo }"
          @click="setBurnVideo(false)"
        >
          Subtitle file
        </button>
        <button
          type="button"
          class="segmented__option"
          :class="{ 'segmented__option--active': settings.burnVideo }"
          @click="setBurnVideo(true)"
        >
          <Flame :size="13" />
          Burn into video
        </button>
      </div>
      <p class="settings-field__hint">
        {{ settings.burnVideo ? 'Subtitles are rendered directly into a new video file.' : 'Generates a downloadable subtitle file.' }}
      </p>
    </section>

    <!-- Burn-in styling — only relevant when the video will be burned. -->
    <SubtitleStylePanel v-if="settings.burnVideo" />
  </div>
</template>

<style scoped>
.settings-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  margin-top: 1rem;
}

.settings-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: opacity 0.2s;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section--disabled {
  opacity: 0.6;
}

.settings-section__heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
}

.settings-field {
  position: relative;
  margin-top: 0.55rem;
}

.settings-field__hint {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0.45rem 0 0;
  line-height: 1.4;
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

/* Toggle rows */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.4rem 0;
}

.toggle-row__label {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.toggle-row__desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0;
}

.toggle-btn {
  width: 40px;
  height: 22px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  padding: 2px;
  transition: background 0.25s, border-color 0.25s;
  flex-shrink: 0;
  position: relative;
}

.toggle-btn--on {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.toggle-btn__thumb {
  display: block;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.toggle-btn--on .toggle-btn__thumb {
  transform: translateX(18px);
}

/* Segmented control for output type */
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.3rem;
  margin-top: 0.55rem;
}

.segmented__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.segmented__option:hover {
  color: var(--text-primary);
}

.segmented__option--active {
  background: var(--primary-color);
  color: #fff;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
}
</style>