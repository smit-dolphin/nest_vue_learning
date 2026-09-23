<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Download, FileText, Flame, Loader2, Pencil, RefreshCw, Search, Trash2 } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import {
  burnSubtitleFile,
  deleteSubtitleFile,
  downloadSubtitleFile,
  getSubtitleFiles,
  SUBTITLE_FORMATS,
  type SubtitleFile,
} from '../services/subtitleService'
import { jobService } from '../services/jobService'
import PaginationBar from '../components/Common/PaginationBar.vue'
import FilterPopover from '../components/Common/FilterPopover.vue'
import { useDebouncedSearch } from '../composables/useDebouncedSearch'
import type { PaginationMeta } from '../types/pagination'
import { useVideoLibraryStore } from '../stores/videoLibraryStore'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const videoStore = useVideoLibraryStore()

const files = ref<SubtitleFile[]>([])
const meta = ref<PaginationMeta | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
const page = ref(1)
const limit = ref(10)
const formatFilter = ref<'ALL' | (typeof SUBTITLE_FORMATS)[number]>('ALL')
const fromDate = ref('')
const toDate = ref('')
const downloadingId = ref<string | null>(null)
const burningId = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const downloadError = ref<string | null>(null)

const { input: searchQuery, value: debouncedSearch } = useDebouncedSearch(350)

const videoId = computed(() => String(route.params.videoId))
const video = computed(() => videoStore.videos.find(item => item.id === videoId.value))

const activeFilterCount = computed(
  () => Number(formatFilter.value !== 'ALL') + Number(!!fromDate.value) + Number(!!toDate.value),
)

watch([debouncedSearch, formatFilter, fromDate, toDate], () => {
  page.value = 1
  loadFiles()
})

const isBurnableFormat = (file: SubtitleFile) => {
  const format = file.subtitleFormat.toUpperCase().replace('.', '')
  return format === 'SRT' || format === 'VTT'
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

let requestSeq = 0

const loadFiles = async () => {
  const seq = ++requestSeq
  isLoading.value = true
  error.value = null

  try {
    const response = await getSubtitleFiles(videoId.value, {
      page: page.value,
      limit: limit.value,
      search: searchQuery.value.trim() || undefined,
      format: formatFilter.value === 'ALL' ? undefined : formatFilter.value,
      from: fromDate.value ? `${fromDate.value}T00:00:00.000` : undefined,
      to: toDate.value ? `${toDate.value}T23:59:59.999` : undefined,
    })
    if (seq !== requestSeq) return
    files.value = response.data
    meta.value = response.meta

    const maxPages = response.meta.totalPages
    if (page.value > maxPages && maxPages >= 1) {
      page.value = maxPages
      const retry = await getSubtitleFiles(videoId.value, {
        page: page.value,
        limit: limit.value,
        search: searchQuery.value.trim() || undefined,
        format: formatFilter.value === 'ALL' ? undefined : formatFilter.value,
        from: fromDate.value ? `${fromDate.value}T00:00:00.000` : undefined,
        to: toDate.value ? `${toDate.value}T23:59:59.999` : undefined,
      })
      if (seq !== requestSeq) return
      files.value = retry.data
    }
  } catch (err) {
    if (seq !== requestSeq) return
    files.value = []
    meta.value = null
    if (isAxiosError(err) && err.response?.status === 404) {
      const hasFilters = !!searchQuery.value.trim() || formatFilter.value !== 'ALL' || !!fromDate.value || !!toDate.value
      error.value = hasFilters
        ? 'No subtitle files match your current filters.'
        : 'No subtitle files were found for this video.'
    } else {
      error.value = 'Could not load subtitle files.'
    }
  } finally {
    if (seq === requestSeq) isLoading.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  formatFilter.value = 'ALL'
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
  loadFiles()
}

const onPageChange = (value: number) => {
  page.value = value
  loadFiles()
}

const onLimitChange = (value: number) => {
  limit.value = value
  page.value = 1
  loadFiles()
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
    await videoStore.fetchAll()
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
  if (!videoStore.videos.length) await videoStore.fetchAll()
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
          <p>{{ meta?.totalData ?? files.length }} generated file{{ (meta?.totalData ?? files.length) === 1 ? '' : 's' }}</p>
          <p v-if="downloadError" class="download-error">{{ downloadError }}</p>
        </div>
        <button class="refresh-button" type="button" title="Refresh files" @click="loadFiles">
          <RefreshCw :size="15" />
          Refresh
        </button>
      </div>

      <div class="files-toolbar">
        <div class="files-toolbar__search">
          <Search :size="15" class="files-toolbar__search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search files by name or language..."
            class="files-toolbar__search-input"
          />
        </div>
        <select v-model="formatFilter" class="format-select" aria-label="Filter by format">
          <option value="ALL">All formats</option>
          <option v-for="f in SUBTITLE_FORMATS" :key="f" :value="f">{{ f }}</option>
        </select>
        <FilterPopover :count="activeFilterCount" @clear="clearFilters">
          <div class="filter-field">
            <label for="subtitle-from">From date</label>
            <input id="subtitle-from" v-model="fromDate" type="date" />
          </div>
          <div class="filter-field">
            <label for="subtitle-to">To date</label>
            <input id="subtitle-to" v-model="toDate" type="date" />
          </div>
        </FilterPopover>
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

      <div v-else-if="!files.length" class="table-state">
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
            <tr v-for="file in files" :key="file.id">
              <td data-label="File name">
                <div class="file-name">
                  <FileText :size="17" />
                  <strong>{{ file.filename }}</strong>
                </div>
              </td>
              <td data-label="Format">{{ file.subtitleFormat }}</td>
              <td data-label="Language">{{ file.languageCode }}</td>
              <td data-label="Type">{{ file.mimeType }}</td>
              <td data-label="Size">{{ formatBytes(file.size) }}</td>
              <td data-label="Created">{{ new Date(file.createdAt).toLocaleDateString() }}</td>
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
                  class="edit-button"
                  type="button"
                  :title="`Edit ${file.filename}`"
                  :aria-label="`Edit ${file.filename}`"
                  @click="router.push(`/library/subtitles/${videoId}/edit/${file.id}`)"
                >
                  <Pencil :size="15" />
                  <span>Edit</span>
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

      <PaginationBar
        v-if="!isLoading && !error"
        :page="page"
        :limit="limit"
        :total-pages="meta?.totalPages ?? 0"
        :total-data="meta?.totalData ?? files.length"
        @update:page="onPageChange"
        @update:limit="onLimitChange"
      />
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
.files-toolbar { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
.files-toolbar__search {
  display: flex; align-items: center; gap: 7px; flex: 1 1 260px; min-width: 200px;
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 9px; padding: 0.5rem 0.75rem; transition: border-color 0.2s;
}
.files-toolbar__search:focus-within { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.files-toolbar__search-icon { color: var(--text-muted); flex-shrink: 0; }
.files-toolbar__search-input { background: transparent; border: none; outline: none; color: var(--text-primary); font-size: 0.82rem; width: 100%; }
.files-toolbar__search-input::placeholder { color: var(--text-muted); }
.format-select {
  background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 9px; padding: 0.5rem 0.7rem; font-size: 0.8rem; color: var(--text-primary);
  outline: none; cursor: pointer; transition: border-color 0.2s;
}
.format-select:focus { border-color: var(--border-focus); }
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
.edit-button { display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 0.35rem; border: 1px solid rgba(139,92,246,0.4); border-radius: 7px; padding: 0.42rem 0.65rem; background: rgba(139,92,246,0.1); color: #a78bfa; font-size: 0.75rem; cursor: pointer; }
.edit-button:hover { background: rgba(139,92,246,0.18); }
.delete-button { display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 0.35rem; border: 1px solid rgba(239,68,68,0.35); border-radius: 7px; padding: 0.42rem 0.65rem; background: rgba(239,68,68,0.08); color: #ef4444; font-size: 0.75rem; cursor: pointer; }
.delete-button:hover:not(:disabled) { background: rgba(239,68,68,0.16); }
.delete-button:disabled { cursor: wait; opacity: 0.65; }
.table-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.65rem; min-height: 250px; color: var(--text-muted); font-size: 0.85rem; }
.table-state--error { color: #ef4444; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .subtitle-files-page { padding: 1rem; }
  .files-panel__header { align-items: flex-start; flex-direction: column; }

  .files-table-wrap { overflow-x: visible; }
  .files-table { min-width: 0; }

  .files-table thead { display: none; }

  .files-table,
  .files-table tbody,
  .files-table tr,
  .files-table td { display: block; width: 100%; }

  .files-table tbody tr {
    width: auto;
    margin: 0 0.75rem 0.75rem;
    padding: 0.25rem 0.75rem;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .files-table tbody tr:last-child {
    margin-bottom: 0.75rem;
  }

  .files-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid var(--border-color);
    text-align: right;
    white-space: normal;
  }

  .files-table td::before {
    content: attr(data-label);
    flex-shrink: 0;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .files-table tbody tr:last-child td {
    border-bottom: 1px solid var(--border-color);
  }

  .files-table td:last-child {
    border-bottom: none;
  }

  .file-name {
    justify-content: flex-end;
    min-width: 0;
  }

  .file-name strong {
    text-align: right;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .file-actions::before {
    display: none;
  }

  .download-button,
  .burn-button,
  .delete-button,
  .edit-button {
    margin-left: 0;
  }
}
</style>
