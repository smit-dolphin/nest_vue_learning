<script setup lang="ts">
import { computed } from 'vue'
import {
  AlignVerticalJustifyCenter,
  Brush,
  Droplets,
  Paintbrush,
  PenLine,
  RectangleHorizontal,
  Type,
} from 'lucide-vue-next'
import { useSettingsStore } from '../../stores/settingsStore'
import DropdownSelect from '../Common/DropdownSelect.vue'

const settingsStore = useSettingsStore()
const style = computed(() => settingsStore.settings.subtitleStyle)

const FONT_SIZE_MIN = 12
const FONT_SIZE_MAX = 72
const OUTLINE_MIN = 0
const OUTLINE_MAX = 8

const positionOptions = [
  { label: 'Bottom', value: 'bottom' },
  { label: 'Top', value: 'top' },
  { label: 'Middle', value: 'middle' },
]

const selectedPosition = computed({
  get: () => style.value.position,
  set: (position: string) => updateStyle({ position: position as 'bottom' | 'top' | 'middle' }),
})

function updateStyle(patch: Partial<typeof style.value>) {
  settingsStore.updateSettings({
    subtitleStyle: { ...style.value, ...patch },
  })
}

function changeFontSize(delta: number) {
  const fontSize = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, style.value.fontSize + delta))
  updateStyle({ fontSize })
}

function changeOutline(delta: number) {
  const outline = Math.min(OUTLINE_MAX, Math.max(OUTLINE_MIN, style.value.outline + delta))
  updateStyle({ outline })
}

function toggleBackground() {
  updateStyle({ background: !style.value.background })
}

function setBackgroundOpacity(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  updateStyle({ backgroundOpacity: Math.min(1, Math.max(0, value)) })
}
</script>

<template>
  <div class="style-card">
    <div class="style-card__header">
      <span class="style-card__icon"><Brush :size="14" /></span>
      <div>
        <p class="style-card__title">Burn-in Subtitle Style</p>
        <p class="style-card__subtitle">Rendered into the video by the backend</p>
      </div>
    </div>

    <div class="style-card__grid">
      <div class="style-field">
        <label class="style-label">
          <Type :size="12" />
          Font Size
        </label>
        <div class="stepper">
          <button
            type="button"
            class="stepper__btn"
            :disabled="style.fontSize <= FONT_SIZE_MIN"
            @click="changeFontSize(-1)"
          >
            −
          </button>
          <span class="stepper__value">{{ style.fontSize }}px</span>
          <button
            type="button"
            class="stepper__btn"
            :disabled="style.fontSize >= FONT_SIZE_MAX"
            @click="changeFontSize(1)"
          >
            +
          </button>
        </div>
      </div>

      <div class="style-field">
        <label class="style-label">
          <Paintbrush :size="12" />
          Font Color
        </label>
        <label class="color-input">
          <input
            class="color-input__picker"
            type="color"
            :value="style.fontColor"
            title="Font color"
            @input="updateStyle({ fontColor: ($event.target as HTMLInputElement).value })"
          />
          <span class="color-input__swatch" :style="{ background: style.fontColor }">
            <Paintbrush :size="12" />
          </span>
          <span class="color-input__value">{{ style.fontColor }}</span>
        </label>
      </div>

      <div class="style-field style-field--span">
        <div class="style-toggle">
          <div class="style-toggle__info">
            <p class="style-toggle__label">
              <RectangleHorizontal :size="13" />
              Background
            </p>
            <p class="style-toggle__desc">Show a backdrop behind the subtitles</p>
          </div>
          <button
            class="switch"
            :class="{ 'switch--on': style.background }"
            type="button"
            aria-label="Subtitle background"
            @click="toggleBackground"
          >
            <span class="switch__thumb"></span>
          </button>
        </div>
      </div>

      <template v-if="style.background">
        <div class="style-field">
          <label class="style-label">
            <Paintbrush :size="12" />
            Background Color
          </label>
          <label class="color-input">
            <input
              class="color-input__picker"
              type="color"
              :value="style.backgroundColor"
              title="Background color"
              @input="updateStyle({ backgroundColor: ($event.target as HTMLInputElement).value })"
            />
            <span class="color-input__swatch" :style="{ background: style.backgroundColor }">
              <Paintbrush :size="12" />
            </span>
            <span class="color-input__value">{{ style.backgroundColor }}</span>
          </label>
        </div>

        <div class="style-field">
          <label class="style-label">
            <Droplets :size="12" />
            Opacity
          </label>
          <div class="range-row">
            <input
              class="range-row__slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="style.backgroundOpacity"
              @input="setBackgroundOpacity"
            />
            <span class="range-row__value">{{ Math.round(style.backgroundOpacity * 100) }}%</span>
          </div>
        </div>
      </template>

      <div class="style-field">
        <label class="style-label">
          <AlignVerticalJustifyCenter :size="12" />
          Position
        </label>
        <DropdownSelect
          v-model="selectedPosition"
          :options="positionOptions"
          ariaLabel="Subtitle position"
        />
      </div>

      <div class="style-field">
        <label class="style-label">
          <PenLine :size="12" />
          Outline
        </label>
        <div class="stepper">
          <button
            type="button"
            class="stepper__btn"
            :disabled="style.outline <= OUTLINE_MIN"
            @click="changeOutline(-1)"
          >
            −
          </button>
          <span class="stepper__value">{{ style.outline }}px</span>
          <button
            type="button"
            class="stepper__btn"
            :disabled="style.outline >= OUTLINE_MAX"
            @click="changeOutline(1)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-card {
  position: relative;
  margin-top: 0.85rem;
  background: var(--card-color);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 12px;
  padding: 1rem;
}

.style-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(239, 68, 68, 0.04));
}

.style-card__header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.9rem;
}

.style-card__icon {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: #f97316;
  background: rgba(249, 115, 22, 0.14);
  border-radius: 8px;
}

.style-card__title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--text-primary);
}

.style-card__subtitle {
  margin: 1px 0 0;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.style-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  position: relative;
}

.style-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.style-field--span {
  grid-column: 1 / -1;
}

.style-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}

/* Steppers */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 9px;
  padding: 0.3rem;
}

.stepper__btn {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  color: var(--text-primary);
  background: var(--hover-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
}

.stepper__btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.stepper__btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 1px;
}

.stepper__value {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Color pickers */
.color-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 9px;
  padding: 0.35rem 0.6rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-input:hover {
  border-color: var(--border-focus);
}

.color-input:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
}

.color-input__picker {
  width: 0;
  height: 0;
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.color-input__swatch {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.9);
}

.color-input__value {
  font-size: 0.74rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Toggle */
.style-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.45rem 0;
}

.style-toggle__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.style-toggle__desc {
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--text-muted);
  margin: 0;
}

.switch {
  width: 42px;
  height: 24px;
  min-width: 42px;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  padding: 2px;
  transition: background 0.25s, border-color 0.25s;
  position: relative;
}

.switch:hover {
  border-color: var(--border-focus);
}

.switch:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
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

/* Range */
.range-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 9px;
  padding: 0.5rem 0.6rem;
}

.range-row__slider {
  flex: 1;
  accent-color: var(--primary-color, #8b5cf6);
}

.range-row__value {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}
</style>