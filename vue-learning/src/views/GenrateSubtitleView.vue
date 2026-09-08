<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AlertCircle, Loader2, Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { downloadVideoFile, generateSubtitleForVideo, getVideoStreamUrl, uploadVideo } from '../services/videoService.ts'
import { downloadSubtitleFile, getSubtitleFiles, type SubtitleFile } from '../services/subtitleService'
import { useCurrentJobStore } from '../stores/currentJobStore.ts'
import { useSettingsStore } from '../stores/settingsStore.ts'

import PageHeader from '../components/GenrateSubtitle/PageHeader.vue'
import UploadZone from '../components/GenrateSubtitle/UploadZone.vue'
import SettingPannel from '../components/GenrateSubtitle/SettingPannel.vue'
import ProgressCard from '../components/GenrateSubtitle/ProgressCard.vue'
import GeneratedVideoCard from '../components/GenrateSubtitle/GeneratedVideoCard.vue'
import EmptyPanel from '../components/GenrateSubtitle/EmptyPanel.vue'
import type { SubtitleSettings } from '../components/GenrateSubtitle/types'
import { useVideoLibraryStore } from '../stores/videoLibraryStore.ts'
import type { LibraryVideo } from '../components/VideoLibrary/types'

const route = useRoute()
const videoStore = useVideoLibraryStore()
const existingVideo = ref<{ filename: string; mimetype: string; size: number } | null>(null)
const sourceVideoId = ref<string | null>(null)
const generatedVideo = ref<LibraryVideo | null>(null)
const generatedSubtitle = ref<SubtitleFile | null>(null)
const generationStartedAt = ref<number | null>(null)
const videoId = computed(() => typeof route.params.videoId === 'string' ? route.params.videoId : null)

/* ─── State ─── */
const sourceFile = ref<File | null>(null)
const settingsStore = useSettingsStore()
const { settings: subtitleSettings } = storeToRefs(settingsStore)

const jobStore = useCurrentJobStore()
const { isProcessing, isDone, isFailed, progress, error: jobError } = storeToRefs(jobStore)

const params = computed(() => ({
  leng: subtitleSettings.value.language,
  formate: subtitleSettings.value.format,
  timestamps: subtitleSettings.value.timestamps,
  lables: subtitleSettings.value.speakerLabels,
  autoTranslate: subtitleSettings.value.autoTranslate,
  autoPunctuation: subtitleSettings.value.punctuation,
  wordLevelTiming: subtitleSettings.value.wordLevel,
  burnVideo: true,
}))

/* ─── Methods ─── */
const loadGeneratedVideo = async () => {
  if (!sourceVideoId.value) return

  await videoStore.fetchVideos()
  const matchingVideos = videoStore.videos
    .filter((video) => video.type === 'BURNED_VIDEO' && video.parentVideoId === sourceVideoId.value)
    .filter((video) => {
      if (!generationStartedAt.value) return true
      return new Date(video.createdAt).getTime() >= generationStartedAt.value
    })
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())

  generatedVideo.value = matchingVideos[0] ?? null

  const subtitleFiles = await getSubtitleFiles(sourceVideoId.value).catch(() => [])
  generatedSubtitle.value = subtitleFiles
    .filter((file) => {
      if (!generationStartedAt.value) return true
      return new Date(file.createdAt).getTime() >= generationStartedAt.value
    })
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())[0] ?? null
}

const downloadGeneratedVideo = async () => {
  if (!generatedVideo.value) return
  await downloadVideoFile(generatedVideo.value.id, generatedVideo.value.title)
  toast.success(`Downloading ${generatedVideo.value.title}.`)
}

const downloadGeneratedSubtitle = async () => {
  if (!generatedSubtitle.value) return
  await downloadSubtitleFile(generatedSubtitle.value.id, generatedSubtitle.value.filename)
  toast.success(`Downloading ${generatedSubtitle.value.filename}.`)
}

const startProcessing = async () => {
  if ((!sourceFile.value && !videoId.value) || isProcessing.value) return

  generatedVideo.value = null
  generationStartedAt.value = Date.now()

  try {
    const result = videoId.value
      ? await generateSubtitleForVideo(videoId.value, params.value)
      : await uploadVideo(sourceFile.value!, params.value)

    sourceVideoId.value = videoId.value ?? (result.result as { id?: string })?.id ?? null
    jobStore.startJob(result.jobId)
    toast.success('Subtitle generation started.')
  } catch {
    toast.error('Could not start subtitle generation.')
  }
}

onMounted(async () => {
  if (videoId.value) {
    await videoStore.fetchVideos()
    const video = videoStore.videos.find((item) => item.id === videoId.value)
    if (video) {
      sourceVideoId.value = video.id
      existingVideo.value = {
        filename: video.title,
        mimetype: video.mimetype,
        size: video.sizeBytes,
      }
    }
  }

  // Resume polling for an in-flight job persisted in the store (e.g. after refresh)
  jobStore.restore()
})

onBeforeUnmount(() => {
  jobStore.stopPolling()
})

watch(isDone, (done) => {
  if (done) void loadGeneratedVideo()
})

function handleSettings(settings: SubtitleSettings) {
  settingsStore.updateSettings(settings)
}
</script>

<template>
  <div class="gen-page">
    <!-- Page Header -->
    <PageHeader />

    <div class="gen-page__grid">
      <!-- Left: Upload + Settings -->
      <div class="gen-page__left">
        <!-- Upload Zone -->
        <UploadZone v-model="sourceFile" :existing-video="existingVideo" />

        <SettingPannel @settingsChange="handleSettings" />

        <!-- Generate Button -->
        <button class="btn btn--generate" :disabled="(!sourceFile && !existingVideo) || isProcessing" @click="startProcessing">
          <Loader2 v-if="isProcessing" :size="18" class="spin" />
          <Sparkles v-else :size="18" />
          <span>{{ isProcessing ? 'Generating…' : 'Generate Subtitles' }}</span>
        </button>
      </div>

      <!-- Right: Progress + Output -->
      <div class="gen-page__right">
        <!-- Progress Card -->
        <Transition name="fade">
          <ProgressCard v-if="isProcessing || isDone" :progress="progress" />
        </Transition>

        <div v-if="isFailed || jobError" class="generation-error" role="alert">
          <AlertCircle :size="20" />
          <div>
            <strong>Generation failed</strong>
            <p>{{ jobError ?? 'The subtitle job could not be completed.' }}</p>
          </div>
        </div>

        <!-- Generated video -->
        <Transition name="fade">
          <GeneratedVideoCard
            v-if="isDone && generatedVideo"
            :title="generatedVideo.title"
            :stream-url="getVideoStreamUrl(generatedVideo.id)"
            :subtitle="generatedSubtitle"
            @download-video="downloadGeneratedVideo"
            @download-subtitle="downloadGeneratedSubtitle"
          />
        </Transition>

        <!-- Empty State (right panel) -->
        <Transition name="fade">
          <EmptyPanel v-if="!isProcessing && !isDone" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gen-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.generation-error {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.generation-error strong { display: block; color: var(--text-primary); font-size: 0.85rem; }
.generation-error p { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.78rem; }

.gen-page__grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.55rem 1.1rem;
  border: none;
  text-decoration: none;
}

.btn--generate {
  width: 100%;
  justify-content: center;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  background: var(--team-gradient);
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.45);
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn--generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.55);
}

.btn--generate:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .gen-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>