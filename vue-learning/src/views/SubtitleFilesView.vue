<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Download, FileText, Flame, Loader2, Music2, RefreshCw, Trash2 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { burnSubtitleFile, deleteSubtitleFile, downloadSubtitleFile, getSubtitleFiles, type SubtitleFile } from '../services/subtitleService'
import { deleteAudioFile, downloadAudioFile, getAudioByVideoId, type AudioFile } from '../services/videoService'
import { jobService } from '../services/jobService'
import { useVideoLibraryStore } from '../stores/videoLibraryStore'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoLibraryStore()

const files = ref<SubtitleFile[]>([])
const audio = ref<AudioFile | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const downloadingId = ref<string | null>(null)
const burningId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const downloadError = ref<string | null>(null)

const videoId = computed(() => String(route.params.videoId))
const video = computed(() => videoStore.videos.find(item => item.id === videoId.value))

const isBurnableFormat = (file: SubtitleFile) => {
  const format = file.subtitleFormat.toUpperCase().replace('.', '')
  return format === 'SRT' || format === 'VTT'
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const loadFiles = async () => {
  isLoading.value = true
  error.value = null

  try {
    const [subtitleFiles, audioFile] = await Promise.all([
      getSubtitleFiles(videoId.value),
      getAudioByVideoId(videoId.value).catch(() => null),
    ])
    files.value = subtitleFiles
    audio.value = audioFile
  } catch {
    files.value = []
    audio.value = null
    error.value = 'No subtitle files were found for this video.'
  } finally {
    isLoading.value = false
  }
}

const downloadAudio = async () => {
  if (!audio.value) return
  downloadingId.value = audio.value.id
  downloadError.value = null

  try {
    await downloadAudioFile(videoId.value, audio.value.id, audio.value.filename)
    toast.success(`Downloading ${audio.value.filename}.`)
  } catch {
    downloadError.value = `Could not download ${audio.value.filename}.`
  } finally {
    downloadingId.value = null
  }
}

const deleteAudio = async () => {
  const file = audio.value
  if (!file || !window.confirm(`Delete audio file "${file.filename}"?`)) return

  deletingId.value = file.id
  try {
    await deleteAudioFile(file.id)
    audio.value = null
    toast.success('Audio deleted successfully.')
  } catch {
    downloadError.value = `Could not delete ${file.filename}.`
    toast.error(`Could not delete ${file.filename}.`)
  } finally {
    deletingId.value = null
  }
}

const downloadFile = async (file: SubtitleFile) => {
  downloadingId.value = file.id
  downloadError.value = null

  try {
    await downloadSubtitleFile(file.id, file.filename)
    toast.success(`Downloading ${file.filename}.`)
  } catch {
    downloadError.value = `Could not download ${file.filename}.`
  } finally {
    downloadingId.value = null
  }
}

const waitForBurnJob = async (jobId: string) => {
  for (let attempt = 0; attempt < 120; attempt++) {
    const job = await jobService.getJobStatus(jobId)

    const normalizedStatus = (job.status || '').toLowerCase()
    if (normalizedStatus === 'completed') return
    if (normalizedStatus === 'failed') throw new Error('Burn job failed')

    await new Promise(resolve => window.setTimeout(resolve, 1000))
  }

  throw new Error('Burn job timed out')
}

const burnFile = async (file: SubtitleFile) => {
  burningId.value = file.id

  try {
    const { jobId } = await burnSubtitleFile(videoId.value, file.id)
    await waitForBurnJob(jobId)
    await videoStore.fetchVideos()
    toast.success(`Burned video created from ${file.filename}.`)
  } catch {
    toast.error(`Could not burn ${file.filename} into the video.`)
  } finally {
    burningId.value = null
  }
}

const deleteFile = async (file: SubtitleFile) => {
  const confirmed = window.confirm(`Delete subtitle file "${file.filename}"?`)
  if (!confirmed) return

  deletingId.value = file.id
  downloadError.value = null

  try {
    await deleteSubtitleFile(file.id)
    await loadFiles()
    toast.success(`Deleted ${file.filename}.`)
  } catch {
    downloadError.value = `Could not delete ${file.filename}.`
    toast.error(`Could not delete ${file.filename}.`)
  } finally {
    deletingId.value = null
  }
}

onMounted(async () => {
  if (!videoStore.videos.length) await videoStore.fetchVideos()
  await loadFiles()
})
</script>

<template>
  <div class="subtitle-files-page">
    <header class="subtitle-files-page__header">
      <button class="back-button" type="button" @click="router.push('/library')">
        <ArrowLeft :size="16" />
        Back to library
      </button>
      <div>
        <p class="eyebrow">Subtitle files</p>
        <h1>{{ video?.title ?? 'Video files' }}</h1>
        <p class="subtitle-files-page__id">Video ID: {{ videoId }}</p>
      </div>
    </header>

    <section class="files-panel">
      <div class="files-panel__header">
        <div>
          <h2>Available files</h2>
          <p>{{ files.length + (audio ? 1 : 0) }} generated file{{ files.length + (audio ? 1 : 0) === 1 ? '' : 's' }}</p>
          <p v-if="downloadError" class="download-error">{{ downloadError }}</p>
        </div>
        <button class="refresh-button" type="button" title="Refresh files" @click="loadFiles">
          <RefreshCw :size="15" />
          Refresh
        </button>
      </div>

      <div v-if="isLoading" class="table-state">
        <Loader2 :size="26" class="spin" />
        <span>Loading generated files...</span>
      </div>

      <div v-else-if="error" class="table-state table-state--error">
        <FileText :size="26" />
        <span>{{ error }}</span>
        <button class="retry-button" type="button" @click="loadFiles">Try again</button>
      </div>

      <div v-else-if="!files.length && !audio" class="table-state">
        <FileText :size="26" />
        <span>This video has no generated files yet.</span>
      </div>

      <div v-else class="files-table-wrap">
        <table class="files-table">
          <thead>
            <tr>
              <th>File name</th>
              <th>Format</th>
              <th>Language</th>
              <th>Type</th>
              <th>Size</th>
              <th>Created</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="audio">
              <td>
                <div class="file-name">
                  <Music2 :size="17" />
                  <strong>{{ audio.filename }}</strong>
                </div>
              </td>
              <td>{{ audio.mimetype }}</td>
              <td>Audio</td>
              <td>Generated audio</td>
              <td>{{ formatBytes(audio.size) }}</td>
              <td>{{ new Date(audio.createdAt).toLocaleDateString() }}</td>
              <td class="file-actions">
                <button class="download-button" type="button" :disabled="downloadingId === audio.id" @click="downloadAudio">
                  <Loader2 v-if="downloadingId === audio.id" :size="15" class="spin" />
                  <Download v-else :size="15" />
                  <span>{{ downloadingId === audio.id ? 'Downloading' : 'Download' }}</span>
                </button>
                <button class="delete-button" type="button" :disabled="deletingId === audio.id" @click="deleteAudio">
                  <Loader2 v-if="deletingId === audio.id" :size="15" class="spin" />
                  <Trash2 v-else :size="15" />
                  <span>{{ deletingId === audio.id ? 'Deleting' : 'Delete' }}</span>
                </button>
              </td>
            </tr>
            <tr v-for="file in files" :key="file.id">
              <td>
                <div class="file-name">
                  <FileText :size="17" />
                  <strong>{{ file.filename }}</strong>
                </div>
              </td>
              <td>{{ file.subtitleFormat }}</td>
              <td>{{ file.languageCode }}</td>
              <td>{{ file.mimeType }}</td>
              <td>{{ formatBytes(file.size) }}</td>
              <td>{{ new Date(file.createdAt).toLocaleDateString() }}</td>
              <td class="file-actions">
                <button
                  class="download-button"
                  type="button"
                  :title="`Download ${file.filename}`"
                  :aria-label="`Download ${file.filename}`"
                  :disabled="downloadingId === file.id"
                  @click="downloadFile(file)"
                >
                  <Loader2 v-if="downloadingId === file.id" :size="15" class="spin" />
                  <Download v-else :size="15" />
                  <span>{{ downloadingId === file.id ? 'Downloading' : 'Download' }}</span>
                </button>
                <button
                  v-if="isBurnableFormat(file)"
                  class="burn-button"
                  type="button"
                  :title="`Burn ${file.filename} into the video`"
                  :aria-label="`Burn ${file.filename} into the video`"
                  :disabled="burningId === file.id"
                  @click="burnFile(file)"
                >
                  <Loader2 v-if="burningId === file.id" :size="15" class="spin" />
                  <Flame v-else :size="15" />
                  <span>{{ burningId === file.id ? 'Burning' : 'Burn' }}</span>
                </button>
                <button
                  class="delete-button"
                  type="button"
                  :title="`Delete ${file.filename}`"
                  :aria-label="`Delete ${file.filename}`"
                  :disabled="deletingId === file.id"
                  @click="deleteFile(file)"
                >
                  <Loader2 v-if="deletingId === file.id" :size="15" class="spin" />
                  <Trash2 v-else :size="15" />
                  <span>{{ deletingId === file.id ? 'Deleting' : 'Delete' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subtitle-files-page { padding: 1.75rem; color: var(--text-primary); }
.subtitle-files-page__header { display: flex; flex-direction: column; gap: 1.3rem; margin-bottom: 1.5rem; }
.back-button, .refresh-button, .retry-button { display: inline-flex; align-items: center; gap: 0.45rem; width: fit-content; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 0.75rem; background: var(--secondary-color); color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; }
.back-button:hover, .refresh-button:hover, .retry-button:hover { color: var(--text-primary); border-color: var(--border-light); }
.eyebrow { margin: 0 0 0.35rem; color: #f97316; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { margin: 0; font-size: clamp(1.35rem, 2vw, 2rem); }
.subtitle-files-page__id { margin: 0.4rem 0 0; color: var(--text-muted); font-size: 0.75rem; }
.files-panel { overflow: hidden; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 12px; }
.files-panel__header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.1rem 1.25rem; border-bottom: 1px solid var(--border-color); }
.files-panel__header h2 { margin: 0; font-size: 1rem; }
.files-panel__header p { margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.78rem; }
.download-error { color: #ef4444 !important; }
.files-table-wrap { overflow-x: auto; }
.files-table { width: 100%; border-collapse: collapse; min-width: 820px; }
.files-table th, .files-table td { padding: 0.85rem 1.1rem; text-align: left; border-bottom: 1px solid var(--border-color); font-size: 0.8rem; white-space: nowrap; }
.files-table th { color: var(--text-muted); font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
.files-table td { color: var(--text-secondary); }
.files-table tbody tr:last-child td { border-bottom: 0; }
.files-table tbody tr:hover { background: var(--hover-color); }
.file-name { display: flex; align-items: center; gap: 0.65rem; color: var(--text-primary); }
.file-name svg { color: #f97316; flex-shrink: 0; }
.file-actions { text-align: right !important; }
.download-button { display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid var(--border-color); border-radius: 7px; padding: 0.42rem 0.65rem; background: transparent; color: var(--text-secondary); font-size: 0.75rem; cursor: pointer; }
.download-button:hover:not(:disabled) { border-color: #f97316; color: #f97316; }
.download-button:disabled { cursor: wait; opacity: 0.65; }
.burn-button { display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 0.35rem; border: 1px solid rgba(249,115,22,0.35); border-radius: 7px; padding: 0.42rem 0.65rem; background: rgba(249,115,22,0.08); color: #f97316; font-size: 0.75rem; cursor: pointer; }
.burn-button:hover:not(:disabled) { background: rgba(249,115,22,0.16); }
.burn-button:disabled { cursor: wait; opacity: 0.65; }
.delete-button { display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 0.35rem; border: 1px solid rgba(239,68,68,0.35); border-radius: 7px; padding: 0.42rem 0.65rem; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 0.75rem; cursor: pointer; }
.delete-button:hover:not(:disabled) { background: rgba(239,68,68,0.16); }
.delete-button:disabled { cursor: wait; opacity: 0.65; }
.table-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.65rem; min-height: 250px; color: var(--text-muted); font-size: 0.85rem; }
.table-state--error { color: #ef4444; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) { .subtitle-files-page { padding: 1rem; } .files-panel__header { align-items: flex-start; flex-direction: column; } }
</style>
