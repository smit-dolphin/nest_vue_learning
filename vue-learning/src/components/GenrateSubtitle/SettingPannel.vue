<script setup lang="ts">

import { ref } from 'vue'
import {
  Globe2,
  ChevronDown,
  Check,
  Wand2,
  AlignLeft,
} from 'lucide-vue-next'


/* ─── Types ─── */

export interface SubtitleSettings {
  language: string
  format: string
  timestamps: boolean
  speakerLabels: boolean
  autoTranslate: boolean
  punctuation: boolean
  wordLevel: boolean
}


/* ─── Emit ─── */

const emit = defineEmits<{
  settingsChange: [settings: SubtitleSettings]
}>()


/* ─── State ─── */

const selectedLang = ref('English')
const selectedFormat = ref('SRT')

const langOpen = ref(false)
const formatOpen = ref(false)


/* ─── Options ─── */

// const languages = [
//   'English',
//   'Spanish',
//   'French',
//   'German',
//   'Japanese',
//   'Korean',
//   'Portuguese',
//   'Arabic',
//   'Hindi',
//   'Chinese (Simplified)',
// ]

const languages = [
  { name: 'English', code: 'en' },
  { name: 'Chinese', code: 'zh' },
  { name: 'German', code: 'de' },
  { name: 'Spanish', code: 'es' },
  { name: 'Russian', code: 'ru' },
  { name: 'Korean', code: 'ko' },
  { name: 'French', code: 'fr' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Polish', code: 'pl' },
  { name: 'Catalan', code: 'ca' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Italian', code: 'it' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Finnish', code: 'fi' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'Hebrew', code: 'he' },
  { name: 'Ukrainian', code: 'uk' },
  { name: 'Greek', code: 'el' },
  { name: 'Malay', code: 'ms' },
  { name: 'Czech', code: 'cs' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Danish', code: 'da' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Thai', code: 'th' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'Lithuanian', code: 'lt' },
  { name: 'Latin', code: 'la' },
  { name: 'Maori', code: 'mi' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Persian', code: 'fa' },
  { name: 'Latvian', code: 'lv' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Serbian', code: 'sr' },
  { name: 'Azerbaijani', code: 'az' },
  { name: 'Slovenian', code: 'sl' },
  { name: 'Estonian', code: 'et' },
  { name: 'Macedonian', code: 'mk' },
  { name: 'Nepali', code: 'ne' },
  { name: 'Mongolian', code: 'mn' },
  { name: 'Bosnian', code: 'bs' },
  { name: 'Kazakh', code: 'kk' },
  { name: 'Albanian', code: 'sq' },
  { name: 'Swahili', code: 'sw' },
  { name: 'Galician', code: 'gl' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Sinhala', code: 'si' },
  { name: 'Khmer', code: 'km' },
  { name: 'Welsh', code: 'cy' },
  { name: 'Armenian', code: 'hy' },
  { name: 'Lao', code: 'lo' },
  { name: 'Myanmar', code: 'my' },
  { name: 'Telugu', code: 'te' },
  { name: 'Tagalog', code: 'tl' },
  { name: 'Maltese', code: 'mt' },
  { name: 'Icelandic', code: 'is' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Welsh', code: 'cy' },
  { name: 'Basque', code: 'eu' },
];

const formats = [
  'SRT',
  'WebVTT',
  'ASS/SSA',
  'JSON',
  'Plain Text',
]


/* ─── Subtitle Options ─── */

const subtitleOptions = ref({
  timestamps: true,
  speakerLabels: false,
  autoTranslate: false,
  punctuation: true,
  wordLevel: false,
})


/* ─── Send Settings To Parent ─── */

function sendSettings() {

  const settings: SubtitleSettings = {
    language: languages.find((lang) => lang.name === selectedLang.value)?.code || 'en',
    format: selectedFormat.value,

    timestamps: subtitleOptions.value.timestamps,
    speakerLabels: subtitleOptions.value.speakerLabels,
    autoTranslate: subtitleOptions.value.autoTranslate,
    punctuation: subtitleOptions.value.punctuation,
    wordLevel: subtitleOptions.value.wordLevel,
  }

  emit('settingsChange', settings)
}


/* ─── Select Language ─── */

function selectLanguage(lang: string) {

  selectedLang.value = lang
  langOpen.value = false

  sendSettings()
}


/* ─── Select Format ─── */

function selectFormat(format: string) {

  selectedFormat.value = format
  formatOpen.value = false

  sendSettings()
}


/* ─── Toggle Option ─── */

function toggleOption(
  key: keyof typeof subtitleOptions.value
) {

  subtitleOptions.value[key] =
    !subtitleOptions.value[key]

  sendSettings()
}


/* ─── Send Initial Settings ─── */

sendSettings()

</script>


<template>

  <div class="settings-card">

    <div class="settings-card__header">
      <Wand2 :size="16" />
      <span>Subtitle Settings</span>
    </div>


    <div class="settings-grid">

      <!-- Language -->

      <div class="settings-field">

        <label class="settings-label">
          <Globe2 :size="13" />
          Language
        </label>


        <div
          class="custom-select"
          @click="langOpen = !langOpen"
        >

          <span>{{ selectedLang }}</span>

          <ChevronDown
            :size="14"
            :class="{ rotated: langOpen }"
          />


          <Transition name="dropdown">

            <div
              v-if="langOpen"
              class="custom-select__dropdown"
            >

              <button
                v-for="lang in languages"
                :key="lang.name"
                class="custom-select__option"
                :class="{
                  'custom-select__option--active':
                    lang.name === selectedLang
                }"
                @click.stop="selectLanguage(lang.name)"
              >

                {{ lang.name }}

                <Check
                  v-if="lang.name === selectedLang"
                  :size="12"
                />

              </button>

            </div>

          </Transition>

        </div>

      </div>


      <!-- Format -->

      <div class="settings-field">

        <label class="settings-label">
          <AlignLeft :size="13" />
          Output Format
        </label>


        <div
          class="custom-select"
          @click="formatOpen = !formatOpen"
        >

          <span>{{ selectedFormat }}</span>

          <ChevronDown
            :size="14"
            :class="{ rotated: formatOpen }"
          />


          <Transition name="dropdown">

            <div
              v-if="formatOpen"
              class="custom-select__dropdown"
            >

              <button
                v-for="fmt in formats"
                :key="fmt"
                class="custom-select__option"
                :class="{
                  'custom-select__option--active':
                    fmt === selectedFormat
                }"
                @click.stop="selectFormat(fmt)"
              >

                {{ fmt }}

                <Check
                  v-if="fmt === selectedFormat"
                  :size="12"
                />

              </button>

            </div>

          </Transition>

        </div>

      </div>

    </div>


    <!-- Toggles -->

    <div class="settings-toggles">

      <div
        v-for="(val, key) in subtitleOptions"
        :key="key"
        class="toggle-row"
      >

        <div class="toggle-row__info">

          <p class="toggle-row__label">
            {{
              {
                timestamps: 'Include Timestamps',
                speakerLabels: 'Speaker Labels',
                autoTranslate: 'Auto-Translate',
                punctuation: 'Auto Punctuation',
                wordLevel: 'Word-Level Timing',
              }[key]
            }}
          </p>


          <p class="toggle-row__desc">
            {{
              {
                timestamps: 'Add time codes to each subtitle block',
                speakerLabels: 'Identify and label different speakers',
                autoTranslate: 'Translate to the selected language',
                punctuation: 'Add punctuation automatically',
                wordLevel: 'Precise timing per word',
              }[key]
            }}
          </p>

        </div>


        <button
          class="toggle-btn"
          :class="{
            'toggle-btn--on':
              subtitleOptions[key as keyof typeof subtitleOptions]
          }"
          @click="
            toggleOption(
              key as keyof typeof subtitleOptions
            )
          "
        >

          <span class="toggle-btn__thumb"></span>

        </button>

      </div>

    </div>

  </div>

</template>



<style scoped>

/* Settings Card */

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
  margin-bottom: 1rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.settings-field {
  position: relative;
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


/* Custom Select */

.custom-select {
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-primary);
  transition: border-color 0.2s;
  position: relative;
}

.custom-select:hover {
  border-color: var(--border-light);
}

.custom-select .rotated {
  transform: rotate(180deg);
  transition: transform 0.2s;
}

.custom-select__dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  box-shadow: var(--shadow-md);
  z-index: 50;
  overflow: hidden;
  max-height: 200px;
  overflow-y: auto;
}

.custom-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}

.custom-select__option:hover {
  background: var(--hover-color);
  color: var(--text-primary);
}

.custom-select__option--active {
  color: var(--primary-color);
  background: var(--active-color);
}


/* Toggle Rows */

.settings-toggles {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-color);
}

.toggle-row:last-child {
  border-bottom: none;
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
  transition:
    background 0.25s,
    border-color 0.25s;
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
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.toggle-btn--on .toggle-btn__thumb {
  transform: translateX(18px);
}

</style>