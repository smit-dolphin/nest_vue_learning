import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { generateSubtitleForVideo, uploadVideo, type SubtitleSettings as VideoSubtitleSettings } from '../services/videoService'
import { getSubtitleFileContent, getSubtitleFiles, type SubtitleFile } from '../services/subtitleService'
import { useCurrentJobStore } from './currentJobStore'
import { useSettingsStore } from './settingsStore'
import { useVideoLibraryStore } from './videoLibraryStore'
import type { LibraryVideo } from '../components/VideoLibrary/types'
import { normalizeLanguage } from '../components/GenrateSubtitle/languages'

export interface SelectedSource {
  filename: string
  mimetype: string
  size: number
}

export const useGenerateSubtitleStore = defineStore('generate-subtitle', () => {
  const settingsStore = useSettingsStore()

  /* ─── Source selection ─── */
  const sourceFile = ref<File | null>(null)
  const existingVideo = ref<SelectedSource | null>(null)
  const sourceVideoId = ref<string | null>(null)

  /* ─── Results ─── */
  const generatedVideo = ref<LibraryVideo | null>(null)
  const generatedSubtitle = ref<SubtitleFile | null>(null)
  const subtitleContent = ref<string | null>(null)
  const generationStartedAt = ref<number | null>(null)

  /* ─── UI state ─── */
  const isLibraryModalOpen = ref(false)
  const isStarting = ref(false)
  const isLoadingResults = ref(false)

  const hasSource = computed(
    () => sourceFile.value !== null || existingVideo.value !== null || sourceVideoId.value !== null,
  )

  const activeSettings = computed(() => settingsStore.settings)

  /* ─── Translate persisted subtitle settings into the API contract ─── */
  const buildParams = (): VideoSubtitleSettings => {
    const { settings } = settingsStore

    // Only send options the backend pipeline actually consume.
    const base: VideoSubtitleSettings = {
      leng: normalizeLanguage(settings.language),
      formate: settings.format,
      autoTranslate: settings.autoTranslate,
      wordLevelTiming: settings.wordLevel,
      burnVideo: settings.burnVideo,
    }

    // Burn-in subtitle style options are only relevant when the video will be burned.
    if (!settings.burnVideo) return base

    return {
      ...base,
      fontSize: settings.subtitleStyle.fontSize,
      fontColor: settings.subtitleStyle.fontColor,
      background: settings.subtitleStyle.background,
      backgroundColor: settings.subtitleStyle.backgroundColor,
      backgroundOpacity: settings.subtitleStyle.backgroundOpacity,
      position: settings.subtitleStyle.position,
      outline: settings.subtitleStyle.outline,
    }
  }

  /* ─── Source helpers ─── */
  function setSourceFile(file: File | null) {
    sourceFile.value = file
    if (file) {
      existingVideo.value = null
      sourceVideoId.value = null
      generationStartedAt.value = null
      resetResults()
    }
  }

  function selectLibraryVideo(video: LibraryVideo) {
    sourceFile.value = null
    sourceVideoId.value = video.id
    existingVideo.value = {
      filename: video.title,
      mimetype: video.mimetype,
      size: video.sizeBytes,
    }
    resetResults()
    isLibraryModalOpen.value = false
  }

  function clearSource() {
    sourceFile.value = null
    existingVideo.value = null
    sourceVideoId.value = null
    resetResults()
  }

  async function prefillFromRoute(videoId: string) {
    if (!videoId || sourceVideoId.value) return

    const videoStore = useVideoLibraryStore()
    if (!videoStore.videos.length) await videoStore.fetchVideos()

    const video = videoStore.videos.find((item) => item.id === videoId)
    if (!video) return

    sourceVideoId.value = video.id
    existingVideo.value = {
      filename: video.title,
      mimetype: video.mimetype,
      size: video.sizeBytes,
    }
  }

  function openLibraryPicker() {
    isLibraryModalOpen.value = true
  }

  function closeLibraryPicker() {
    isLibraryModalOpen.value = false
  }

  /* ─── Job lifecycle ─── */
  function resetResults() {
    generatedVideo.value = null
    generatedSubtitle.value = null
    subtitleContent.value = null
  }

  async function startJob(videoIdFromRoute: string | null): Promise<boolean> {
    const jobStore = useCurrentJobStore()
    const currentVideoId = sourceVideoId.value || videoIdFromRoute

    if ((!sourceFile.value && !currentVideoId) || jobStore.isProcessing) return false

    resetResults()
    generationStartedAt.value = Date.now()
    isStarting.value = true

    try {
      const result = currentVideoId
        ? await generateSubtitleForVideo(currentVideoId, buildParams())
        : await uploadVideo(sourceFile.value!, buildParams())

      sourceVideoId.value = currentVideoId ?? (result.result as { id?: string })?.id ?? null
      jobStore.startJob(result.jobId)
      return true
    } finally {
      isStarting.value = false
    }
  }

  const createdAfterGeneration = (createdAt: string) => {
    if (!generationStartedAt.value) return true
    return new Date(createdAt).getTime() >= generationStartedAt.value
  }

  async function loadResults() {
    if (!sourceVideoId.value) return

    const videoStore = useVideoLibraryStore()
    isLoadingResults.value = true

    try {
      await videoStore.fetchVideos()

      const burnedVideos = videoStore.videos
        .filter((video) => video.type === 'BURNED_VIDEO' && video.parentVideoId === sourceVideoId.value)
        .filter((video) => createdAfterGeneration(video.createdAt))
        .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())

      generatedVideo.value = burnedVideos[0] ?? null

      const subtitleFiles = await getSubtitleFiles(sourceVideoId.value).catch(() => [])
      generatedSubtitle.value =
        subtitleFiles
          .filter((file) => createdAfterGeneration(file.createdAt))
          .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())[0] ?? null

      subtitleContent.value = generatedSubtitle.value
        ? await getSubtitleFileContent(generatedSubtitle.value.id).catch(() => null)
        : null
    } finally {
      isLoadingResults.value = false
    }
  }

  return {
    sourceFile,
    existingVideo,
    sourceVideoId,
    generatedVideo,
    generatedSubtitle,
    subtitleContent,
    generationStartedAt,
    isLibraryModalOpen,
    isStarting,
    isLoadingResults,
    hasSource,
    activeSettings,
    setSourceFile,
    clearSource,
    selectLibraryVideo,
    prefillFromRoute,
    openLibraryPicker,
    closeLibraryPicker,
    resetResults,
    startJob,
    loadResults,
  }
})