<script setup lang="ts">
import { computed } from 'vue'
import { AlignLeft, Flame, Globe2, Languages, RotateCcw, Wand2, Zap } from 'lucide-vue-next'
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

const isBurnEnabled = computed(() => settings.value.burnVideo)
</script>

<template>
  <div class="settings-card">
    <div class="settings-card__header">
      <span class="settings-card__icon"><Wand2 :size="15" /></span>
      <div class="settings-card__titles">
        <span class="settings-card__title">Subtitle Settings</span>
        <span class="settings-card__subtitle">Tune how subtitles are generated</span>
      </div>
      <button
        class="settings-card__reset"
        type="button"
        title="Reset all settings to defaults"
        @click="settingsStore.resetSettings()"
      >
        <RotateCcw :size="13" />
        Reset
      </button>
    </div>

    <div class="settings-card__body">
      <!-- Translation -->
      <section
        class="settings-section"
        :class="{ 'settings-section--muted': !settings.autoTranslate }"
      >
        <div class="settings-section__heading">
          <span class="settings-section__dot"><Globe2 :size="13" /></span>
          <div>
            <p class="settings-section__label">Translation</p>
            <p class="settings-section__hint">Transcribe + translate with AI</p>
          </div>
          <button
            class="switch"
            :class="{ 'switch--on': settings.autoTranslate }"
            type="button"
            aria-label="Auto-translate"
            @click="toggleAutoTranslate"
          >
            <span class="switch__thumb"></span>
          </button>
        </div>

        <div v-if="settings.autoTranslate" class="settings-row">
          <label class="settings-row__label">
            <Languages :size="13" />
            Target Language
          </label>
          <div class="settings-row__control">
            <DropdownSelect
              v-model="selectedLanguage"
              :options="languageOptions"
              ariaLabel="Target language"
              :disabled="!settings.autoTranslate"
            />
            <p class="settings-row__hint">
              Subtitles are translated into {{ settings.language }}.
            </p>
          </div>
        </div>
      </section>

      <!-- Output -->
      <section class="settings-section">
        <div class="settings-section__heading">
          <span class="settings-section__dot"><AlignLeft :size="13" /></span>
          <div>
            <p class="settings-section__label">Output</p>
            <p class="settings-section__hint">Subtitle file format</p>
          </div>
        </div>

        <div class="settings-row">
          <label class="settings-row__label">
            <AlignLeft :size="13" />
            Subtitle Format
          </label>
          <div class="settings-row__control">
            <DropdownSelect
              v-model="selectedFormat"
              :options="formatOptions"
              ariaLabel="Subtitle format"
            />
            <p class="settings-row__hint">
              {{ settings.burnVideo ? 'Only SRT and WebVTT can be burned into the video.' : 'SRT and WebVTT can also be burned directly into the video.' }}
            </p>
          </div>
        </div>
      </section>

      <!-- Processing -->
      <section class="settings-section">
        <div class="settings-section__heading">
          <span class="settings-section__dot"><Zap :size="13" /></span>
          <div>
            <p class="settings-section__label">Processing</p>
            <p class="settings-section__hint">Extras baked into the output</p>
          </div>
          <button
            class="switch"
            :class="{ 'switch--on': settings.wordLevel }"
            type="button"
            aria-label="Word-level timing"
            @click="toggle('wordLevel')"
          >
            <span class="switch__thumb"></span>
          </button>
        </div>

        <p v-if="settings.wordLevel" class="settings-row__hint settings-row__hint--inline">
          Precise per-word timing data (.wts) will be generated.
        </p>
      </section>

      <!-- Output type -->
      <section class="settings-section">
        <div class="settings-section__heading">
          <span class="settings-section__dot settings-section__dot--burn"><Flame :size="13" /></span>
          <div>
            <p class="settings-section__label">Output Type</p>
            <p class="settings-section__hint">File only, or burned into the video</p>
          </div>
        </div>

        <div class="segmented" :class="{ 'segmented--burn': isBurnEnabled }">
          <button
            type="button"
            class="segmented__option"
            :class="{ 'segmented__option--active': !isBurnEnabled }"
            @click="setBurnVideo(false)"
          >
            Subtitle file
          </button>
          <button
            type="button"
            class="segmented__option"
            :class="{ 'segmented__option--active': isBurnEnabled }"
            @click="setBurnVideo(true)"
          >
            <Flame :size="13" />
            Burn into video
          </button>
        </div>
        <p class="settings-row__hint">
          {{ isBurnEnabled ? 'Subtitles are rendered directly into a new video file.' : 'Generates a downloadable subtitle file.' }}
        </p>
      </section>

      <!-- Burn-in styling — everything the backend burn pipeline understands. -->
      <SubtitleStylePanel v-if="isBurnEnabled" />
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.1rem;
  margin-top: 1rem;
  box-shadow: var(--shadow-sm);
}

.settings-card__header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.35rem;
}

.settings-card__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  color: #fff;
  background: var(--team-gradient);
  border-radius: 9px;
  box-shadow: 0 3px 10px rgba(139, 92, 246, 0.4);
}

.settings-card__titles {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.settings-card__title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-primary);
}

.settings-card__subtitle {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.settings-card__reset {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 0.3rem 0.55rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.settings-card__reset:hover {
  color: var(--text-primary);
  border-color: var(--border-light);
}

.settings-card__body {
  display: flex;
  flex-direction: column;
}

.settings-section {
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border-color);
  transition: opacity 0.2s;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-section--muted {
  opacity: 0.85;
}

.settings-section__heading {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.settings-section__dot {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: var(--primary-color);
  background: var(--team-color-light);
  border-radius: 8px;
}

.settings-section__dot--burn {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.settings-section__label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary);
}

.settings-section__hint {
  margin: 1px 0 0;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.settings-row {
  margin-top: 0.7rem;
  padding-left: calc(26px + 0.55rem);
}

.settings-row__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.settings-row__control {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.settings-row__hint {
  margin: 0;
  font-size: 0.7rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.settings-row__hint--inline {
  margin-top: 0.55rem;
  padding: 0.5rem 0.65rem;
  background: var(--card-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

/* Switch */
.switch {
  width: 42px;
  height: 24px;
  min-width: 42px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  padding: 2px;
  transition: background 0.25s, border-color 0.25s;
  margin-left: auto;
  position: relative;
}

.switch--on {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.switch__thumb {
  display: block;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.switch--on .switch__thumb {
  transform: translateX(18px);
}

/* Segmented control for output type */
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 11px;
  padding: 0.28rem;
  margin-top: 0.7rem;
}

.segmented--burn {
  border-color: rgba(249, 115, 22, 0.35);
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
  font-weight: 700;
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

.segmented--burn .segmented__option--active {
  background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4);
}
</style>