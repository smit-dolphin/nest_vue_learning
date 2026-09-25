<script setup lang="ts">
import {
  AlignLeft,
  CaseUpper,
  Captions,
  Flame,
  Globe2,
  Languages,
  Palette,
  RotateCcw,
  Tags,
  Type,
  Wand2,
} from '@lucide/vue'
import { computed } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LANGUAGES } from '@/constants/settings'
import { useSubtitleSettingsStore } from '@/stores/subtitleSettingsStore'
import type { SubtitlePosition } from '@/stores/subtitleSettingsStore'
import type { SubtitleFormat } from '@/types'

const settingsStore = useSubtitleSettingsStore()
const settings = computed(() => settingsStore.settings)

const positionOptions: { value: SubtitlePosition; label: string }[] = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'top', label: 'Top' },
  { value: 'middle', label: 'Middle' },
]

const fontColors = ['#FFFFFF', '#000000', '#FDE047', '#F97316', '#EF4444', '#22C55E', '#3B82F6', '#A855F7']
const backgroundColors = ['#000000', '#FFFFFF', '#1F2937', '#7F1D1D', '#14532D', '#1E3A8A']

const formatValue = computed({
  get: () => settings.value.format,
  set: (value: SubtitleFormat) => settingsStore.updateSettings({ format: value }),
})

const languageValue = computed({
  get: () => settings.value.language,
  set: (value: string) => settingsStore.updateSettings({ language: value }),
})

const positionValue = computed({
  get: () => settings.value.subtitleStyle.position,
  set: (value: SubtitlePosition) => settingsStore.updateSettings({ subtitleStyle: { position: value } }),
})

const processingToggles = computed(() => [
  {
    key: 'autoPunctuation' as const,
    label: 'Auto punctuation',
    desc: 'Restore punctuation and casing in the transcript',
    icon: CaseUpper,
  },
  {
    key: 'speakerLabels' as const,
    label: 'Speaker labels',
    desc: 'Detect speakers and prefix each segment with a label',
    icon: Tags,
  },
  {
    key: 'wordLevelTiming' as const,
    label: 'Word-level timing',
    desc: 'Emit precise per-word timing data as a .wts sidecar',
    icon: Type,
  },
])

function patchStyle(patch: Record<string, number | string | boolean>) {
  settingsStore.updateSettings({ subtitleStyle: patch })
}
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between gap-3">
        <CardTitle class="flex items-center gap-2 text-sm">
          <span class="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <Wand2 class="size-4" />
          </span>
          Subtitle Settings
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="h-8 gap-1.5 text-xs text-muted-foreground"
          @click="settingsStore.resetSettings()"
        >
          <RotateCcw class="size-3.5" />
          Reset
        </Button>
      </div>
      <CardDescription>These options are sent with every generation request</CardDescription>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Language & format -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <Languages class="size-4 text-muted-foreground" />
          <h4 class="text-sm font-semibold">Language &amp; output</h4>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="gen-language">Output language</Label>
            <Select v-model="languageValue">
              <SelectTrigger id="gen-language" class="h-9 w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="language in LANGUAGES" :key="language.code" :value="language.code">
                  {{ language.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">Sent to the engine as <code class="font-mono">leng</code></p>
          </div>

          <div class="space-y-2">
            <Label for="gen-format">Subtitle format</Label>
            <Select v-model="formatValue">
              <SelectTrigger id="gen-format" class="h-9 w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="format in settingsStore.availableFormats" :key="format" :value="format">
                  {{ format === 'VTT' ? 'WebVTT' : format }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">Sent as <code class="font-mono">formate</code></p>
          </div>
        </div>
      </section>

      <div class="h-px bg-border" />

      <!-- Processing toggles -->
      <section class="space-y-3">
        <div class="flex items-center gap-2">
          <Captions class="size-4 text-muted-foreground" />
          <h4 class="text-sm font-semibold">Processing</h4>
        </div>

        <div class="divide-y rounded-xl border">
          <div
            v-for="toggle in processingToggles"
            :key="toggle.key"
            class="flex items-center justify-between gap-4 p-3.5"
          >
            <div class="flex min-w-0 items-start gap-3">
              <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <component :is="toggle.icon" class="size-4" />
              </span>
              <div class="min-w-0">
                <Label :for="`gen-${toggle.key}`" class="cursor-pointer">{{ toggle.label }}</Label>
                <p class="mt-0.5 text-xs text-muted-foreground">{{ toggle.desc }}</p>
              </div>
            </div>
            <Switch
              :id="`gen-${toggle.key}`"
              :model-value="settings[toggle.key]"
              @update:model-value="(value: boolean | 'indeterminate') => settingsStore.updateSettings({ [toggle.key]: value === true })"
            />
          </div>
        </div>
      </section>

      <div class="h-px bg-border" />

      <!-- Translation -->
      <section class="space-y-3">
        <div class="flex items-center justify-between gap-4">
          <div class="flex min-w-0 items-start gap-3">
            <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <Globe2 class="size-4" />
            </span>
            <div class="min-w-0">
              <Label for="gen-auto-translate" class="cursor-pointer">Auto-translate</Label>
              <p class="mt-0.5 text-xs text-muted-foreground">
                Transcribe the audio first, then translate it with AI
              </p>
            </div>
          </div>
          <Switch
            id="gen-auto-translate"
            :model-value="settings.autoTranslate"
            @update:model-value="(value: boolean | 'indeterminate') => settingsStore.updateSettings({ autoTranslate: value === true })"
          />
        </div>

        <p
          v-if="settings.autoTranslate"
          class="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-muted-foreground"
        >
          Subtitles are translated into <strong class="text-foreground">{{ settingsStore.languageLabel }}</strong>
          after transcription.
        </p>
      </section>

      <div class="h-px bg-border" />

      <!-- Output type -->
      <section class="space-y-3">
        <div class="flex items-center gap-2">
          <Flame class="size-4 text-muted-foreground" />
          <h4 class="text-sm font-semibold">Output type</h4>
        </div>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors"
            :class="settings.burnVideo
              ? 'border-muted-foreground/20 hover:border-primary/50'
              : 'border-primary bg-primary/5 text-foreground'"
            :aria-pressed="!settings.burnVideo"
            @click="settingsStore.setBurnVideo(false)"
          >
            <AlignLeft class="size-4" />
            Subtitle file only
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-colors"
            :class="settings.burnVideo
              ? 'border-orange-500 bg-orange-500/5 text-foreground'
              : 'border-muted-foreground/20 hover:border-orange-500/50'"
            :aria-pressed="settings.burnVideo"
            @click="settingsStore.setBurnVideo(true)"
          >
            <Flame class="size-4" />
            Burn into video
          </button>
        </div>

        <p class="text-xs text-muted-foreground">
          {{ settings.burnVideo
            ? 'A new video with the subtitles rendered in is produced alongside the subtitle file.'
            : 'Generates a downloadable subtitle file for the existing video.' }}
        </p>
      </section>

      <!-- Burn styling -->
      <template v-if="settings.burnVideo">
        <div class="h-px bg-border" />

        <section class="space-y-4">
          <div class="flex items-center gap-2">
            <Palette class="size-4 text-muted-foreground" />
            <h4 class="text-sm font-semibold">Burn-in styling</h4>
            <Badge variant="secondary" class="ml-auto text-[10px]">Only for burned output</Badge>
          </div>

          <!-- Font size -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="gen-font-size">Font size</Label>
              <span class="font-mono text-xs text-muted-foreground">{{ settings.subtitleStyle.fontSize }}px</span>
            </div>
            <input
              id="gen-font-size"
              type="range"
              min="8"
              max="96"
              step="1"
              :value="settings.subtitleStyle.fontSize"
              class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              @input="patchStyle({ fontSize: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>

          <!-- Font color -->
          <div class="space-y-2">
            <Label>Font color</Label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in fontColors"
                :key="color"
                type="button"
                class="size-8 rounded-lg border-2 transition-transform hover:scale-110"
                :class="settings.subtitleStyle.fontColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'"
                :style="{ backgroundColor: color }"
                :aria-label="`Font color ${color}`"
                :aria-pressed="settings.subtitleStyle.fontColor === color"
                @click="patchStyle({ fontColor: color })"
              />
            </div>
          </div>

          <!-- Background -->
          <div class="space-y-3 rounded-xl border p-3.5">
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <Label for="gen-bg" class="cursor-pointer">Background box</Label>
                <p class="mt-0.5 text-xs text-muted-foreground">Draw a solid box behind each subtitle</p>
              </div>
              <Switch
                id="gen-bg"
                :model-value="settings.subtitleStyle.background"
                @update:model-value="(value: boolean | 'indeterminate') => patchStyle({ background: value === true })"
              />
            </div>

            <template v-if="settings.subtitleStyle.background">
              <div class="space-y-2">
                <Label>Background color</Label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="color in backgroundColors"
                    :key="color"
                    type="button"
                    class="size-8 rounded-lg border-2 transition-transform hover:scale-110"
                    :class="settings.subtitleStyle.backgroundColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-border'"
                    :style="{ backgroundColor: color }"
                    :aria-label="`Background color ${color}`"
                    :aria-pressed="settings.subtitleStyle.backgroundColor === color"
                    @click="patchStyle({ backgroundColor: color })"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="gen-bg-opacity">Background opacity</Label>
                  <span class="font-mono text-xs text-muted-foreground">
                    {{ settings.subtitleStyle.backgroundOpacity.toFixed(2) }}
                  </span>
                </div>
                <input
                  id="gen-bg-opacity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  :value="settings.subtitleStyle.backgroundOpacity"
                  class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                  @input="patchStyle({ backgroundOpacity: Number(($event.target as HTMLInputElement).value) })"
                />
              </div>
            </template>
          </div>

          <!-- Position -->
          <div class="space-y-2">
            <Label for="gen-position">Position</Label>
            <Select v-model="positionValue">
              <SelectTrigger id="gen-position" class="h-9 w-full">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in positionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Outline -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <Label for="gen-outline">Text outline</Label>
              <span class="font-mono text-xs text-muted-foreground">{{ settings.subtitleStyle.outline }}px</span>
            </div>
            <input
              id="gen-outline"
              type="range"
              min="0"
              max="10"
              step="1"
              :value="settings.subtitleStyle.outline"
              class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
              @input="patchStyle({ outline: Number(($event.target as HTMLInputElement).value) })"
            />
          </div>
        </section>
      </template>
    </CardContent>
  </Card>
</template>
