<script setup lang="ts">
import { computed } from 'vue'
import {
  AlignVerticalJustifyCenter,
  Droplets,
  Paintbrush,
  Palette,
  PenLine,
  RectangleHorizontal,
  Type,
} from 'lucide-vue-next'
import { useSettingsStore } from '../../stores/settingsStore'
import DropdownSelect from '../Common/DropdownSelect.vue'

const settingsStore = useSettingsStore()
const style = computed(() => settingsStore.settings.subtitleStyle)

const FONT_SIZE_MIN = 12
const FONT_SIZE_MAX = 64
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
      <Palette :size="16" />
      <span>Subtitle Style</span>
    </div>

    <div class="style-card__body">
      <div class="style-field">
        <label class="style-label">
          <Type :size="13" />
          Font Size
        </label>
        <div class="stepper">
          <button type="button" class="stepper__btn" :disabled="style.fontSize <= FONT_SIZE_MIN" @click="changeFontSize(-1)">−</button>
          <span class="stepper__value">{{ style.fontSize }}px</span>
          <button type="button" class="stepper__btn" :disabled="style.fontSize >= FONT_SIZE_MAX" @click="changeFontSize(1)">+</button>
        </div>
      </div>

      <div class="style-field">
        <label class="style-label">
          <Paintbrush :size="13" />
          Font Color
        </label>
        <div class="color-input">
          <span class="color-swatch" :style="{ background: style.fontColor }"></span>
          <input
            class="color-input__picker"
            type="color"
            :value="style.fontColor"
            title="Font color"
            @input="updateStyle({ fontColor: ($event.target as HTMLInputElement).value })"
          />
          <span class="color-input__value">{{ style.fontColor }}</span>
        </div>
      </div>

      <div class="style-toggle">
        <div class="toggle-row__info">
          <p class="toggle-row__label">
            <RectangleHorizontal :size="13" />
            Background
          </p>
          <p class="toggle-row__desc">Show a backdrop behind the subtitles</p>
        </div>
        <button
          class="style-toggle__btn"
          :class="{ 'style-toggle__btn--on': style.background }"
          type="button"
          aria-label="Subtitle background"
          @click="toggleBackground"
        >
          <span class="style-toggle__thumb"></span>
        </button>
      </div>

      <template v-if="style.background">
        <div class="style-field">
          <label class="style-label">
            <Palette :size="13" />
            Background Color
          </label>
          <div class="color-input">
            <span class="color-swatch" :style="{ background: style.backgroundColor }"></span>
            <input
              class="color-input__picker"
              type="color"
              :value="style.backgroundColor"
              title="Background color"
              @input="updateStyle({ backgroundColor: ($event.target as HTMLInputElement).value })"
            />
            <span class="color-input__value">{{ style.backgroundColor }}</span>
          </div>
        </div>

        <div class="style-field">
          <label class="style-label">
            <Droplets :size="13" />
            Background Opacity
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
          <AlignVerticalJustifyCenter :size="13" />
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
          <PenLine :size="13" />
          Outline
        </label>
        <div class="stepper">
          <button type="button" class="stepper__btn" :disabled="style.outline <= OUTLINE_MIN" @click="changeOutline(-1)">−</button>
          <span class="stepper__value">{{ style.outline }}px</span>
          <button type="button" class="stepper__btn" :disabled="style.outline >= OUTLINE_MAX" @click="changeOutline(1)">+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.style-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  margin-top: 1rem;
}

.style-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.style-card__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.style-field {
  position: relative;
}

.style-label {
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

.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.35rem;
}

.stepper__btn {
  width: 28px;
  height: 28px;
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

.stepper__value {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

.color-input {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
}

.color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  flex-shrink: 0;
}

.color-input__picker {
  width: 0;
  height: 0;
  opacity: 0;
  position: absolute;
}

.color-input__value {
  font-size: 0.78rem;
  color: var(--text-secondary);
  text-transform: capitalize;
  flex: 1;
}

.style-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-color);
}

.toggle-row__label {
  display: flex;
  align-items: center;
  gap: 6px;
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

.style-toggle__btn {
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

.style-toggle__btn--on {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.style-toggle__thumb {
  display: block;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.style-toggle__btn--on .style-toggle__thumb {
  transform: translateX(18px);
}

.range-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.range-row__slider {
  flex: 1;
  accent-color: var(--primary-color, #8b5cf6);
}

.range-row__value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 42px;
  text-align: right;
}
</style>