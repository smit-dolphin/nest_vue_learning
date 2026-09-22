<script setup lang="ts">
import { computed } from 'vue'
import {
  AlignLeft,
  Flame,
  Globe2,
  Languages,
  RotateCcw,
  Wand2,
  Zap,
} from 'lucide-vue-next'

import { useSettingsStore } from '../../stores/settingsStore'
import DropdownSelect from '../Common/DropdownSelect.vue'
import SubtitleStylePanel from './SubtitleStylePanel.vue'
import { BURN_COMPATIBLE_FORMATS, FORMATS, LANGUAGES } from './languages'

const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)

const isFormatCompatibleWithBurn = (format: string) =>
  (BURN_COMPATIBLE_FORMATS as readonly string[]).includes(format)

/* -------------------------------------------------------------------------- */
/* Language                                                                   */
/* -------------------------------------------------------------------------- */

const languageOptions = LANGUAGES.map((language) => ({
  label: language.name,
  value: language.code,
}))

const selectedLanguage = computed({
  get: () => settings.value.language,
  set: (code: string) => {
    settingsStore.updateSettings({
      language: code,
    })
  },
})

/* -------------------------------------------------------------------------- */
/* Format                                                                     */
/* -------------------------------------------------------------------------- */

const availableFormats = computed(() => {
  if (settings.value.burnVideo) {
    return FORMATS.filter(isFormatCompatibleWithBurn)
  }

  return [...FORMATS]
})

const formatOptions = computed(() =>
  availableFormats.value.map((format) => ({
    label: format,
    value: format,
  })),
)

const selectedFormat = computed({
  get: () => settings.value.format,
  set: (format: string) => {
    settingsStore.updateSettings({
      format,
    })
  },
})

/* -------------------------------------------------------------------------- */
/* Toggles                                                                    */
/* -------------------------------------------------------------------------- */

type ToggleKey =
  | 'autoTranslate'
  | 'wordLevel'
  | 'autoPunctuation'
  | 'speakerLabels'

function toggle(key: ToggleKey) {
  settingsStore.updateSettings({
    [key]: !settings.value[key],
  })
}

/* -------------------------------------------------------------------------- */
/* Burn                                                                       */
/* -------------------------------------------------------------------------- */

function setBurnVideo(shouldBurn: boolean) {
  settingsStore.updateSettings({
    burnVideo: shouldBurn,

    ...(shouldBurn &&
    !isFormatCompatibleWithBurn(settings.value.format)
      ? {
          format: BURN_COMPATIBLE_FORMATS[0],
        }
      : {}),
  })
}

const isBurnEnabled = computed(() => settings.value.burnVideo)
</script>

<template>
  <div class="settings-card">
    <!-- ================================================================== -->
    <!-- Header                                                             -->
    <!-- ================================================================== -->

    <div class="settings-card__header">
      <span class="settings-card__icon">
        <Wand2 :size="15" />
      </span>

      <div class="settings-card__titles">
        <span class="settings-card__title">
          Subtitle Settings
        </span>

        <span class="settings-card__subtitle">
          Tune how subtitles are generated
        </span>
      </div>

      <button
        class="settings-card__reset"
        type="button"
        title="Reset all settings to defaults"
        @click="settingsStore.resetSettings()"
      >
        <RotateCcw :size="13" />
        <span>Reset</span>
      </button>
    </div>

    <!-- ================================================================== -->
    <!-- Body                                                               -->
    <!-- ================================================================== -->

    <div class="settings-card__body">
      <!-- ================================================================ -->
      <!-- Translation                                                       -->
      <!-- ================================================================ -->

      <section
        class="settings-section"
        :class="{
          'settings-section--muted': !settings.autoTranslate,
        }"
      >
        <div class="settings-section__heading">
          <span class="settings-section__icon">
            <Globe2 :size="14" />
          </span>

          <div class="settings-section__text">
            <p class="settings-section__label">
              Translation
            </p>

            <p class="settings-section__hint">
              Transcribe + translate with AI
            </p>
          </div>

          <button
            class="switch"
            :class="{
              'switch--on': settings.autoTranslate,
            }"
            type="button"
            aria-label="Auto-translate"
            :aria-pressed="settings.autoTranslate"
            @click="toggle('autoTranslate')"
          >
            <span class="switch__thumb"></span>
          </button>
        </div>

        <div
          v-if="settings.autoTranslate"
          class="settings-row"
        >
          <label class="settings-row__label">
            <Languages :size="13" />
            <span>Target Language</span>
          </label>

          <div class="settings-row__control">
            <DropdownSelect
              v-model="selectedLanguage"
              :options="languageOptions"
              ariaLabel="Target language"
              :disabled="!settings.autoTranslate"
            />

            <p class="settings-row__hint">
              Subtitles are translated into
              <strong>{{ settings.language }}</strong>.
            </p>
          </div>
        </div>
      </section>

      <!-- ================================================================ -->
      <!-- Output                                                           -->
      <!-- ================================================================ -->

      <section class="settings-section">
        <div class="settings-section__heading">
          <span class="settings-section__icon">
            <AlignLeft :size="14" />
          </span>

          <div class="settings-section__text">
            <p class="settings-section__label">
              Output
            </p>

            <p class="settings-section__hint">
              Subtitle file format
            </p>
          </div>
        </div>

        <div class="settings-row">
          <label class="settings-row__label">
            <AlignLeft :size="13" />
            <span>Subtitle Format</span>
          </label>

          <div class="settings-row__control">
            <DropdownSelect
              v-model="selectedFormat"
              :options="formatOptions"
              ariaLabel="Subtitle format"
            />

            <p class="settings-row__hint">
              {{
                settings.burnVideo
                  ? 'Only SRT and WebVTT can be burned into the video.'
                  : 'SRT and WebVTT can also be burned directly into the video.'
              }}
            </p>
          </div>
        </div>
      </section>

      <!-- ================================================================ -->
      <!-- Processing                                                        -->
      <!-- ================================================================ -->

      <section class="settings-section">
        <div class="settings-section__heading">
          <span class="settings-section__icon">
            <Zap :size="14" />
          </span>

          <div class="settings-section__text">
            <p class="settings-section__label">
              Processing
            </p>

            <p class="settings-section__hint">
              Extras applied while generating
            </p>
          </div>
        </div>

        <div class="toggle-list">
          <!-- Word level -->

          <div class="toggle-row">
            <div class="toggle-row__info">
              <p class="toggle-row__label">
                Word-level timing
              </p>

              <p class="toggle-row__desc">
                Emit precise per-word timing data (.wts sidecar)
              </p>
            </div>

            <button
              class="switch"
              :class="{
                'switch--on': settings.wordLevel,
              }"
              type="button"
              aria-label="Word-level timing"
              :aria-pressed="settings.wordLevel"
              @click="toggle('wordLevel')"
            >
              <span class="switch__thumb"></span>
            </button>
          </div>

          <!-- Auto punctuation -->

          <div class="toggle-row">
            <div class="toggle-row__info">
              <p class="toggle-row__label">
                Auto punctuation
              </p>

              <p class="toggle-row__desc">
                Restore punctuation and casing in the transcript
              </p>
            </div>

            <button
              class="switch"
              :class="{
                'switch--on': settings.autoPunctuation,
              }"
              type="button"
              aria-label="Auto punctuation"
              :aria-pressed="settings.autoPunctuation"
              @click="toggle('autoPunctuation')"
            >
              <span class="switch__thumb"></span>
            </button>
          </div>

          <!-- Speaker labels -->

          <div class="toggle-row">
            <div class="toggle-row__info">
              <p class="toggle-row__label">
                Speaker labels
              </p>

              <p class="toggle-row__desc">
                Identify speakers and prefix each segment with a label
              </p>
            </div>

            <button
              class="switch"
              :class="{
                'switch--on': settings.speakerLabels,
              }"
              type="button"
              aria-label="Speaker labels"
              :aria-pressed="settings.speakerLabels"
              @click="toggle('speakerLabels')"
            >
              <span class="switch__thumb"></span>
            </button>
          </div>
        </div>
      </section>

      <!-- ================================================================ -->
      <!-- Output Type                                                       -->
      <!-- ================================================================ -->

      <section class="settings-section">
        <div class="settings-section__heading">
          <span
            class="settings-section__icon settings-section__icon--burn"
          >
            <Flame :size="14" />
          </span>

          <div class="settings-section__text">
            <p class="settings-section__label">
              Output Type
            </p>

            <p class="settings-section__hint">
              File only, or burned into the video
            </p>
          </div>
        </div>

        <!-- Segmented control -->

        <div
          class="segmented"
          :class="{
            'segmented--burn': isBurnEnabled,
          }"
        >
          <button
            type="button"
            class="segmented__option"
            :class="{
              'segmented__option--active': !isBurnEnabled,
            }"
            @click="setBurnVideo(false)"
          >
            <span>Subtitle file</span>
          </button>

          <button
            type="button"
            class="segmented__option"
            :class="{
              'segmented__option--active': isBurnEnabled,
            }"
            @click="setBurnVideo(true)"
          >
            <Flame :size="13" />

            <span>Burn into video</span>
          </button>
        </div>

        <p class="settings-row__hint settings-row__hint--output">
          {{
            isBurnEnabled
              ? 'Subtitles are rendered directly into a new video file.'
              : 'Generates a downloadable subtitle file.'
          }}
        </p>
      </section>

      <!-- ================================================================ -->
      <!-- Burn-in Styling                                                   -->
      <!-- ================================================================ -->

      <section
        v-if="isBurnEnabled"
        class="burn-style-wrapper"
      >
        <SubtitleStylePanel />
      </section>
    </div>
  </div>
</template>

<style scoped>
/* ==========================================================================
   Main card
   ========================================================================== */

.settings-card {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 16px;

  padding: 1.1rem;

  box-shadow: var(--shadow-sm);

  overflow: hidden;
}

/* ==========================================================================
   Header
   ========================================================================== */

.settings-card__header {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 0.65rem;

  padding-bottom: 0.9rem;
  margin-bottom: 0;

  border-bottom: 1px solid var(--border-color);
}

.settings-card__icon {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  flex: 0 0 30px;

  color: #fff;

  background: var(--team-gradient);

  border-radius: 9px;

  box-shadow:
    0 3px 10px rgba(139, 92, 246, 0.35);
}

.settings-card__titles {
  min-width: 0;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-card__title {
  min-width: 0;

  color: var(--text-primary);

  font-size: 0.9rem;
  font-weight: 800;

  line-height: 1.2;
}

.settings-card__subtitle {
  min-width: 0;

  color: var(--text-muted);

  font-size: 0.72rem;
  line-height: 1.35;

  white-space: normal;
}

.settings-card__reset {
  flex: 0 0 auto;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 4px;

  padding: 0.34rem 0.55rem;

  color: var(--text-muted);
  background: var(--card-color);

  border: 1px solid var(--border-color);
  border-radius: 8px;

  font-size: 0.7rem;
  font-weight: 600;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.settings-card__reset:hover {
  color: var(--text-primary);
  background: var(--hover-color);
  border-color: var(--border-light);
}

/* ==========================================================================
   Body
   ========================================================================== */

.settings-card__body {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;
}

/* ==========================================================================
   Section
   ========================================================================== */

.settings-section {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  padding: 1rem 0;

  border-bottom: 1px solid var(--border-color);

  transition: opacity 0.2s ease;
}

.settings-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.settings-section--muted {
  opacity: 0.72;
}

/* ==========================================================================
   Section heading
   ========================================================================== */

.settings-section__heading {
  width: 100%;
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 0.55rem;
}

.settings-section__icon {
  width: 27px;
  height: 27px;

  display: grid;
  place-items: center;

  flex: 0 0 27px;

  color: var(--primary-color);
  background: var(--team-color-light);

  border-radius: 8px;
}

.settings-section__icon--burn {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.settings-section__text {
  min-width: 0;
  flex: 1;
}

.settings-section__label {
  margin: 0;

  color: var(--text-primary);

  font-size: 0.84rem;
  font-weight: 750;

  line-height: 1.25;
}

.settings-section__hint {
  margin: 2px 0 0;

  color: var(--text-muted);

  font-size: 0.71rem;
  line-height: 1.4;
}

/* ==========================================================================
   Normal rows
   ========================================================================== */

.settings-row {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  margin-top: 0.75rem;

  padding-left: calc(27px + 0.55rem);
}

.settings-row__label {
  display: flex;
  align-items: center;

  gap: 5px;

  margin-bottom: 0.42rem;

  color: var(--text-secondary);

  font-size: 0.73rem;
  font-weight: 650;

  line-height: 1.25;
}

.settings-row__control {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 0.35rem;
}

.settings-row__hint {
  margin: 0;

  color: var(--text-muted);

  font-size: 0.69rem;
  line-height: 1.45;

  overflow-wrap: anywhere;
}

.settings-row__hint strong {
  color: var(--text-secondary);
  font-weight: 650;
}

.settings-row__hint--output {
  margin-top: 0.55rem;
  padding-left: 0;
}

/* ==========================================================================
   Processing toggles
   ========================================================================== */

.toggle-list {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 0.45rem;

  margin-top: 0.75rem;

  padding-left: calc(27px + 0.55rem);
}

.toggle-row {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;

  display: flex;
  align-items: center;

  gap: 0.7rem;

  padding: 0.68rem 0.72rem;

  background: var(--card-color);

  border: 1px solid var(--border-color);
  border-radius: 10px;

  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.toggle-row:hover {
  border-color: var(--border-light);
  background: var(--hover-color);
}

.toggle-row__info {
  min-width: 0;
  flex: 1;
}

.toggle-row__label {
  margin: 0;

  color: var(--text-primary);

  font-size: 0.77rem;
  font-weight: 700;

  line-height: 1.25;
}

.toggle-row__desc {
  margin: 3px 0 0;

  color: var(--text-muted);

  font-size: 0.68rem;
  line-height: 1.4;

  overflow-wrap: anywhere;
}

/* ==========================================================================
   Switch
   ========================================================================== */

.switch {
  width: 40px;
  height: 23px;

  min-width: 40px;
  flex: 0 0 40px;

  position: relative;

  display: flex;
  align-items: center;

  padding: 2px;

  background: var(--card-color);

  border: 1px solid var(--border-color);
  border-radius: 20px;

  cursor: pointer;

  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  box-sizing: border-box;
}

.switch--on {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.switch:hover {
  border-color: var(--border-focus);
}

.switch:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.switch__thumb {
  width: 17px;
  height: 17px;

  display: block;

  flex: 0 0 17px;

  background: #fff;

  border-radius: 50%;

  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.35);

  transition:
    transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.switch--on .switch__thumb {
  transform: translateX(17px);
}

/* ==========================================================================
   Output type segmented control
   ========================================================================== */

.segmented {
  width: 100%;
  min-width: 0;

  box-sizing: border-box;

  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

  gap: 0.3rem;

  margin-top: 0.75rem;

  padding: 0.28rem;

  background: var(--card-color);

  border: 1px solid var(--border-color);
  border-radius: 11px;

  overflow: hidden;
}

.segmented--burn {
  border-color: rgba(249, 115, 22, 0.35);
}

.segmented__option {
  min-width: 0;
  width: 100%;

  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 5px;

  padding: 0.55rem 0.45rem;

  background: transparent;

  border: none;
  border-radius: 8px;

  color: var(--text-muted);

  font-size: 0.72rem;
  font-weight: 700;

  line-height: 1.2;

  cursor: pointer;

  overflow: hidden;

  transition:
    color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.segmented__option span {
  min-width: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segmented__option:hover {
  color: var(--text-primary);
}

.segmented__option:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

.segmented__option--active {
  color: #fff;
  background: var(--primary-color);

  box-shadow:
    0 2px 8px rgba(139, 92, 246, 0.35);
}

.segmented--burn .segmented__option--active {
  background: linear-gradient(
    135deg,
    #f97316 0%,
    #ef4444 100%
  );

  box-shadow:
    0 2px 8px rgba(249, 115, 22, 0.35);
}

/* ==========================================================================
   Burn-in style wrapper
   ========================================================================== */

/*
 * Important:
 *
 * SubtitleStylePanel is its own component.
 * This wrapper makes sure that component can never make
 * the parent Settings card wider than the available column.
 */

.burn-style-wrapper {
  width: 100%;
  min-width: 0;
  max-width: 100%;

  box-sizing: border-box;

  padding-top: 1rem;

  overflow: hidden;
}

/*
 * These deep rules protect the parent from a child component
 * containing fixed-width controls.
 */

.burn-style-wrapper :deep(*) {
  box-sizing: border-box;
  max-width: 100%;
}

.burn-style-wrapper :deep(input),
.burn-style-wrapper :deep(select),
.burn-style-wrapper :deep(button) {
  max-width: 100%;
}

.burn-style-wrapper :deep(input[type='range']) {
  width: 100%;
  min-width: 0;
}

.burn-style-wrapper :deep(input[type='text']) {
  min-width: 0;
}

/* ==========================================================================
   Medium width
   ========================================================================== */

@media (max-width: 1100px) {
  .settings-card {
    padding: 1rem;
  }

  .settings-row,
  .toggle-list {
    padding-left: 0;
  }

  .settings-section__heading {
    gap: 0.5rem;
  }

  .settings-section__icon {
    width: 26px;
    height: 26px;
    flex-basis: 26px;
  }

  .settings-section__label {
    font-size: 0.82rem;
  }
}

/* ==========================================================================
   Small width
   ========================================================================== */

@media (max-width: 520px) {
  .settings-card {
    padding: 0.9rem;
    border-radius: 14px;
  }

  .settings-card__header {
    align-items: flex-start;
  }

  .settings-card__reset {
    padding: 0.32rem 0.45rem;
  }

  .settings-card__reset span {
    display: none;
  }

  .settings-card__subtitle {
    max-width: 180px;
  }

  .settings-section {
    padding: 0.9rem 0;
  }

  .settings-row,
  .toggle-list {
    padding-left: 0;
  }

  .toggle-row {
    align-items: flex-start;
  }

  .toggle-row__desc {
    max-width: 95%;
  }

  .segmented__option {
    font-size: 0.68rem;
    padding-inline: 0.3rem;
  }
}

/* ==========================================================================
   Very narrow width
   ========================================================================== */

@media (max-width: 380px) {
  .settings-card {
    padding: 0.75rem;
  }

  .settings-card__title {
    font-size: 0.82rem;
  }

  .settings-card__subtitle {
    font-size: 0.67rem;
  }

  .settings-section__label {
    font-size: 0.78rem;
  }

  .settings-section__hint {
    font-size: 0.67rem;
  }

  .toggle-row {
    padding: 0.6rem;
  }

  .toggle-row__label {
    font-size: 0.73rem;
  }

  .toggle-row__desc {
    font-size: 0.65rem;
  }

  .switch {
    width: 38px;
    min-width: 38px;
    flex-basis: 38px;
  }

  .switch__thumb {
    width: 16px;
    height: 16px;
    flex-basis: 16px;
  }

  .switch--on .switch__thumb {
    transform: translateX(16px);
  }
}
</style>