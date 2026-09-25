<script setup lang="ts">
import {
  Captions,
  Check,
  FileVideo,
  FolderOpen,
  Library,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from '@lucide/vue'
import { isAxiosError } from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import JobProgressCard from '@/components/generate/JobProgressCard.vue'
import SubtitleSettingsPanel from '@/components/generate/SubtitleSettingsPanel.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentJobStore } from '@/stores/currentJobStore'
import { useSubtitleSettingsStore } from '@/stores/subtitleSettingsStore'
import { formatBytes, formatDuration } from '@/lib/format'
import {
  generateSubtitleFromVideo,
  getVideos,
  uploadVideoAndGenerateSubtitle,
} from '@/services/videoService'
import type { JobContext } from '@/stores/currentJobStore'
import type { Video } from '@/types'

const route = useRoute()
const router = useRouter()
const settingsStore = useSubtitleSettingsStore()
const jobStore = useCurrentJobStore()

const maxVideoSize = 100 * 1024 * 1024
const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi']

const videoInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedVideo = ref<Video | null>(null)
const isDragging = ref(false)
const isSubmitting = ref(false)
const formError = ref<string | null>(null)

const isLibraryOpen = ref(false)
const libraryVideos = ref<Video[]>([])
const isLoadingLibrary = ref(false)

const canGenerate = computed(
  () => (selectedFile.value !== null || selectedVideo.value !== null) && !isSubmitting.value && !jobStore.isActive,
)

const sourceLabel = computed(() => {
  if (selectedFile.value) return selectedFile.value.name
  if (selectedVideo.value) return selectedVideo.value.originalName || selectedVideo.value.filename
  return ''
})

const sourceMeta = computed(() => {
  if (selectedFile.value) return formatBytes(selectedFile.value.size)
  if (selectedVideo.value) {
    const parts = [formatBytes(selectedVideo.value.size)]
    const duration = formatDuration(selectedVideo.value.duration)
    if (duration !== '—') parts.push(duration)
    return parts.join(' · ')
  }
  return ''
})

function errorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) {
      const joined = message.filter((item): item is string => typeof item === 'string').join(', ')
      if (joined) return joined
    }
  }
  return fallback
}

function buildContext(): JobContext {
  return {
    videoId: selectedVideo.value?.id ?? null,
    videoName: sourceLabel.value,
    language: settingsStore.settings.language,
    format: settingsStore.settings.format,
    burnVideo: settingsStore.settings.burnVideo,
  }
}

function resetSource() {
  selectedFile.value = null
  selectedVideo.value = null
  formError.value = null
  isDragging.value = false
}

function selectFile(file: File | undefined) {
  if (!file) return
  formError.value = null

  if (!acceptedVideoTypes.includes(file.type)) {
    resetSource()
    formError.value = 'Please choose an MP4, WebM, MKV, or AVI video.'
    return
  }

  if (file.size > maxVideoSize) {
    resetSource()
    formError.value = 'Video must be smaller than 100 MB.'
    return
  }

  selectedVideo.value = null
  selectedFile.value = file
}

function handleFileSelection(event: Event) {
  const input = event.target as HTMLInputElement
  selectFile(input.files?.[0])
  input.value = ''
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  selectFile(event.dataTransfer?.files[0])
}

async function openLibrary() {
  isLibraryOpen.value = true
  isLoadingLibrary.value = true
  try {
    const response = await getVideos({ limit: 25, page: 1, type: 'VIDEO' })
    libraryVideos.value = response.items ?? []
  } catch (error) {
    toast.error(errorMessage(error, 'Could not load your library.'))
  } finally {
    isLoadingLibrary.value = false
  }
}

function pickFromLibrary(video: Video) {
  selectedFile.value = null
  selectedVideo.value = video
  formError.value = null
  isLibraryOpen.value = false
}

async function generate() {
  if (!canGenerate.value) return

  isSubmitting.value = true
  formError.value = null
  const context = buildContext()

  // Show the upload step immediately; the queue job id is not known yet.
  jobStore.startUpload(context)

  try {
    const options = settingsStore.generateOptions
    const result = selectedFile.value
      ? await uploadVideoAndGenerateSubtitle(selectedFile.value, options)
      : await generateSubtitleFromVideo(selectedVideo.value!.id, options)

    jobStore.startJob(result.jobId, {
      ...context,
      videoId: result.video?.id ?? context.videoId,
    })

    toast.success('Job queued. Progress updates in real time.')
  } catch (error) {
    jobStore.fail(errorMessage(error, 'Could not start the subtitle job.'))
    toast.error('Could not start the subtitle job.')
  } finally {
    isSubmitting.value = false
  }
}

function viewResult() {
  const videoId = jobStore.context.videoId
  if (videoId) {
    void router.push(`/library/subtitles/${videoId}`)
  } else {
    void router.push('/library')
  }
}

/**
 * Resolves a `:videoId` route param to a full video so a retry from the job
 * history lands with the source already selected. The API has no single-video
 * endpoint, so the library is walked page by page with a hard cap; anything
 * deeper than that is left to the library picker rather than paging forever.
 */
async function preselectFromRoute() {
  const videoId = route.params.videoId
  if (typeof videoId !== 'string' || !videoId) return

  const pageSize = 50
  const maxPages = 10

  try {
    for (let page = 1; page <= maxPages; page += 1) {
      const { items, meta } = await getVideos({ page, limit: pageSize })
      const match = items.find((video) => video.id === videoId)
      if (match) {
        selectedVideo.value = match
        formError.value = null
        return
      }
      if (page >= (meta.totalPages || 1)) break
    }

    formError.value = 'That video is not in your library. Pick one below to continue.'
  } catch (error) {
    toast.error(errorMessage(error, 'Could not load the video from the library.'))
  }
}

// A job started before a reload is still tracked: re-attach the socket and
// reconcile against the API so the progress card settles correctly.
onMounted(() => {
  jobStore.restore()
  void preselectFromRoute()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Captions"
      title="Generate Subtitle"
      subtitle="Upload a video and let the AI create accurate subtitles in seconds"
    />

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[420px_1fr]">
      <!-- Left column -->
      <div class="space-y-6">
        <!-- Source video -->
        <Card>
          <CardContent class="space-y-4 p-5">
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              <span class="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileVideo class="size-4" />
              </span>
              Source Video
            </h3>

            <input
              ref="videoInput"
              id="generate-video-file"
              type="file"
              :accept="acceptedVideoTypes.join(',')"
              class="hidden"
              @change="handleFileSelection"
            />

            <div
              v-if="!sourceLabel"
              class="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
              :class="isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/40'"
              @dragenter.prevent="isDragging = true"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
            >
              <span class="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <UploadCloud class="size-7" />
              </span>
              <p class="text-sm font-medium">Drag &amp; drop your video here</p>
              <p class="text-xs text-muted-foreground">or</p>
              <Button type="button" variant="outline" size="sm" class="gap-2" @click="videoInput?.click()">
                <FolderOpen class="size-4" />
                Browse files
              </Button>
              <p class="text-[11px] text-muted-foreground">MP4, WebM, MKV up to 100 MB</p>
            </div>

            <div v-else class="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileVideo class="size-5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ sourceLabel }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ sourceMeta }} · {{ selectedVideo ? 'From library' : 'Ready to upload' }}
                </p>
              </div>
              <span class="grid size-8 shrink-0 place-items-center rounded-lg text-emerald-600">
                <Check class="size-5" />
              </span>
              <button
                type="button"
                class="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                aria-label="Remove selected video"
                @click="resetSource"
              >
                <X class="size-4" />
              </button>
            </div>

            <p
              v-if="formError"
              class="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {{ formError }}
            </p>

            <Button type="button" variant="outline" class="w-full gap-2" @click="openLibrary">
              <Library class="size-4" />
              Pick from library
            </Button>
          </CardContent>
        </Card>

        <!-- Settings -->
        <SubtitleSettingsPanel />

        <Button
          type="button"
          size="lg"
          class="w-full gap-2"
          :disabled="!canGenerate"
          @click="generate"
        >
          <Loader2 v-if="isSubmitting" class="size-5 animate-spin" />
          <Sparkles v-else class="size-5" />
          {{ isSubmitting ? 'Starting…' : 'Generate Subtitles' }}
        </Button>

        <p v-if="jobStore.isActive" class="text-center text-xs text-muted-foreground">
          A job is already running. Wait for it to finish or dismiss it above.
        </p>
      </div>

      <!-- Right column -->
      <div class="space-y-6">
        <JobProgressCard @retry="jobStore.clear()" @view-result="viewResult" />
      </div>
    </div>

    <!-- Library picker -->
    <ModalDialog
      :open="isLibraryOpen"
      title="Pick a video"
      description="Select an existing video from your library to generate subtitles for it."
      class="sm:max-w-2xl"
      @update:open="(value: boolean) => (isLibraryOpen = value)"
    >
      <div v-if="isLoadingLibrary" class="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 class="size-4 animate-spin" />
        Loading your videos…
      </div>

      <div v-else-if="libraryVideos.length" class="max-h-96 space-y-2 overflow-y-auto">
        <button
          v-for="video in libraryVideos"
          :key="video.id"
          type="button"
          class="flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
          @click="pickFromLibrary(video)"
        >
          <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
            <FileVideo class="size-5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium">{{ video.originalName || video.filename }}</span>
            <span class="block text-xs text-muted-foreground">
              {{ formatBytes(video.size) }} · {{ formatDuration(video.duration) }} · {{ video.type === 'BURNED_VIDEO' ? 'Burned' : 'Original' }}
            </span>
          </span>
        </button>
      </div>

      <p v-else class="py-10 text-center text-sm text-muted-foreground">
        Your library is empty. Upload a video first.
      </p>
    </ModalDialog>
  </div>
</template>
