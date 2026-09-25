<script setup lang="ts">
import {
  AlignLeft,
  Captions,
  Check,
  FileVideo,
  FolderOpen,
  Globe2,
  Languages,
  ListOrdered,
  Loader2,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Wand2,
  X,
} from '@lucide/vue'
import { ref } from 'vue'

import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const fileName = ref('')
const dragging = ref(false)
const videoInput = ref<HTMLInputElement | null>(null)

const onPick = (event: Event) => {
  const input = event.target as HTMLInputElement
  fileName.value = input.files?.[0]?.name ?? ''
}

const clearFile = () => {
  fileName.value = ''
}
</script>

<template>
  <div>
    <PageHeader
      :icon="Captions"
      title="Generate Subtitle"
      subtitle="Upload a video and let the AI create accurate subtitles in seconds"
    />

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[400px_1fr]">
      <!-- Left column -->
      <div class="space-y-6">
        <!-- Upload -->
        <Card>
          <CardContent class="p-5">
            <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span class="grid size-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <FileVideo class="size-4" />
              </span>
              Source Video
            </h3>

            <input ref="videoInput" id="video-file" type="file" accept="video/*" class="hidden" @change="onPick" />

            <div
              v-if="!fileName"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
              :class="dragging ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-500/10' : 'border-muted-foreground/25 hover:border-indigo-400 hover:bg-muted/40'"
              @dragover.prevent="dragging = true"
              @dragleave="dragging = false"
              @drop.prevent="dragging = false"
            >
              <span class="grid size-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <UploadCloud class="size-7" />
              </span>
              <p class="text-sm font-medium">Drag & drop your video here</p>
              <p class="text-xs text-muted-foreground">or</p>
              <Button type="button" variant="outline" size="sm" class="gap-2" @click="videoInput?.click()">
                <FolderOpen class="size-4" />
                Browse files
              </Button>
              <p class="text-[11px] text-muted-foreground">MP4, WebM, MKV up to 100 MB</p>
            </div>

            <div v-else class="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                <FileVideo class="size-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ fileName }}</p>
                <p class="text-xs text-muted-foreground">Ready to process</p>
              </div>
              <span class="grid size-8 shrink-0 place-items-center rounded-lg text-emerald-600">
                <Check class="size-5" />
              </span>
              <button type="button" class="grid size-8 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive" @click="clearFile">
                <X class="size-4" />
              </button>
            </div>

            <Button type="button" variant="outline" class="mt-3 w-full gap-2">
              <FolderOpen class="size-4" />
              Pick from library
            </Button>
          </CardContent>
        </Card>

        <!-- Settings -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-sm">
              <span class="grid size-7 place-items-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
                <Wand2 class="size-4" />
              </span>
              Processing Settings
            </CardTitle>
            <CardDescription>Configure how your subtitles are generated</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="language" class="flex items-center gap-1.5">
                <Languages class="size-3.5" /> Output language
              </Label>
              <Input id="language" type="text" value="English (en)" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <Label for="format" class="flex items-center gap-1.5">
                  <AlignLeft class="size-3.5" /> Format
                </Label>
                <Input id="format" type="text" value="SRT" />
              </div>
              <div class="space-y-2">
                <Label for="style" class="flex items-center gap-1.5">
                  <ListOrdered class="size-3.5" /> Style
                </Label>
                <Input id="style" type="text" value="Burned" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="dictionary" class="flex items-center gap-1.5">
                <Globe2 class="size-3.5" /> Custom dictionary
              </Label>
              <Textarea id="dictionary" placeholder="tech terms, proper nouns…" class="h-20 resize-none" />
            </div>

            <div class="flex items-center justify-between rounded-xl bg-muted/50 p-3">
              <div>
                <p class="text-sm font-medium">Auto-download on completion</p>
                <p class="text-xs text-muted-foreground">Save the subtitle file automatically</p>
              </div>
              <Switch :default-checked="true" />
            </div>
          </CardContent>
        </Card>

        <Button size="lg" class="w-full gap-2 bg-indigo-600 shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
          <Sparkles class="size-5" />
          Generate Subtitles
        </Button>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <!-- Progress card -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Loader2 class="size-4 animate-spin" />
              Processing
            </CardTitle>
            <CardDescription>product_demo_final.mp4 · English</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="h-2.5 overflow-hidden rounded-full bg-muted">
              <div class="h-full w-[72%] rounded-full brand-gradient transition-all" />
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Transcribing audio…</span>
              <span class="font-mono text-xs text-muted-foreground">72%</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <Check class="size-4 text-emerald-500" />
                <span class="text-muted-foreground">Video uploaded</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Loader2 class="size-4 animate-spin text-indigo-500" />
                <span>Transcribing audio</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground/60">
                <span class="size-4 rounded-full border-2 border-muted" />
                <span>Generating subtitles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Result placeholder -->
        <div class="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-muted-foreground/20 py-16 text-center">
          <span class="grid size-16 place-items-center rounded-3xl brand-gradient text-white shadow-lg shadow-indigo-500/30">
            <Sparkles class="size-8" />
          </span>
          <div>
            <p class="font-semibold">Your output will appear here</p>
            <p class="mt-1 max-w-sm text-sm text-muted-foreground">
              Once finished, your burned video and subtitle file will be ready to preview and download.
            </p>
          </div>
          <Badge variant="outline" class="gap-1.5 bg-muted/40 py-1.5 font-medium">
            <RefreshCw class="size-3.5" />
            Watch live progress
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>