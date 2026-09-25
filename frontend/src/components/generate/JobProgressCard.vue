<script setup lang="ts">
import {
  AlertCircle,
  Captions,
  Check,
  CircleDashed,
  Film,
  Flame,
  Loader2,
  RotateCw,
  Wifi,
  WifiOff,
} from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentJobStore } from '@/stores/currentJobStore'

const emit = defineEmits<{ retry: []; viewResult: [] }>()

const jobStore = useCurrentJobStore()

const now = ref(Date.now())
let ticker: number | null = null

onMounted(() => {
  ticker = window.setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (ticker !== null) window.clearInterval(ticker)
})

const steps = computed(() => {
  const percent = jobStore.percent
  const settled = jobStore.isCompleted
  return [
    { label: 'Video uploaded', done: percent > 0 || settled, active: false },
    { label: 'Queued for processing', done: percent > 0, active: jobStore.isQueued },
    {
      label: jobStore.stage || 'Processing',
      done: settled,
      active: jobStore.phase === 'processing' || jobStore.phase === 'finalizing',
    },
    { label: 'Saved to library', done: settled, active: false },
  ]
})

const elapsed = computed(() => {
  if (!jobStore.startedAt) return '—'
  const seconds = Math.max(0, Math.round((now.value - jobStore.startedAt) / 1000))
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
})

const barClass = computed(() => {
  if (jobStore.isFailed) return 'bg-destructive'
  if (jobStore.isCompleted) return 'bg-emerald-500'
  return 'bg-primary'
})

const connectionLabel = computed(() => {
  switch (jobStore.connection) {
    case 'connected':
      return 'Live'
    case 'connecting':
      return 'Connecting'
    case 'disconnected':
      return 'Reconnecting'
    default:
      return 'Idle'
  }
})
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-start justify-between gap-3">
        <CardTitle class="flex items-center gap-2">
          <Loader2 v-if="jobStore.isActive" class="size-4 animate-spin text-primary" />
          <Check v-else-if="jobStore.isCompleted" class="size-4 text-emerald-500" />
          <AlertCircle v-else-if="jobStore.isFailed" class="size-4 text-destructive" />
          <Captions v-else class="size-4 text-muted-foreground" />
          <span v-if="jobStore.hasJob || jobStore.isUploading">
            {{ jobStore.isCompleted ? 'Generation complete' : jobStore.isFailed ? 'Generation failed' : 'Generating subtitles' }}
          </span>
          <span v-else>No active job</span>
        </CardTitle>
        <Badge
          v-if="jobStore.isActive"
          variant="outline"
          class="gap-1.5 text-[10px]"
          :class="jobStore.connection === 'connected' ? 'text-emerald-600' : 'text-muted-foreground'"
        >
          <component :is="jobStore.connection === 'connected' ? Wifi : WifiOff" class="size-3" />
          {{ connectionLabel }}
        </Badge>
      </div>
      <CardDescription v-if="jobStore.context.videoName">
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="truncate">{{ jobStore.context.videoName }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ jobStore.context.language.toUpperCase() }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ jobStore.context.format }}</span>
          <Badge v-if="jobStore.context.burnVideo" variant="secondary" class="gap-1 text-[10px]">
            <Flame class="size-3" /> Burned
          </Badge>
        </span>
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <template v-if="jobStore.hasJob || jobStore.isUploading">
        <!-- Progress bar -->
        <div class="space-y-2">
          <div class="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              :class="barClass"
              :style="{ width: `${jobStore.percent}%` }"
            />
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-muted-foreground">{{ jobStore.stage ?? 'Waiting…' }}</span>
            <span class="font-mono text-xs text-muted-foreground">{{ jobStore.percent }}%</span>
          </div>
        </div>

        <!-- Steps -->
        <ol class="space-y-2">
          <li
            v-for="step in steps"
            :key="step.label"
            class="flex items-center gap-2.5 text-sm"
            :class="step.done ? 'text-foreground' : step.active ? 'text-foreground' : 'text-muted-foreground/60'"
          >
            <Check v-if="step.done" class="size-4 shrink-0 text-emerald-500" />
            <Loader2 v-else-if="step.active" class="size-4 shrink-0 animate-spin text-primary" />
            <CircleDashed v-else class="size-4 shrink-0" />
            <span class="truncate">{{ step.label }}</span>
          </li>
        </ol>

        <p v-if="jobStore.isFailed && jobStore.error" class="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {{ jobStore.error }}
        </p>

        <div class="flex flex-wrap items-center gap-2 border-t pt-4">
          <span class="font-mono text-xs text-muted-foreground">Elapsed {{ elapsed }}</span>
          <div class="ml-auto flex gap-2">
            <Button
              v-if="jobStore.isFailed"
              type="button"
              variant="outline"
              size="sm"
              class="gap-1.5"
              @click="emit('retry')"
            >
              <RotateCw class="size-3.5" />
              Try again
            </Button>
            <Button
              v-if="jobStore.isCompleted"
              type="button"
              size="sm"
              class="gap-1.5"
              @click="emit('viewResult')"
            >
              <Film class="size-3.5" />
              View in library
            </Button>
            <Button
              v-if="jobStore.isCompleted || jobStore.isFailed"
              type="button"
              variant="ghost"
              size="sm"
              @click="jobStore.clear()"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
        <span class="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Captions class="size-6" />
        </span>
        <p class="text-sm text-muted-foreground">
          Start a generation to see live progress here.
        </p>
      </div>
    </CardContent>
  </Card>
</template>
