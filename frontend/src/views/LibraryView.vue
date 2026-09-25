<script setup lang="ts">
import {
  Clapperboard,
  Download,
  FileVideo,
  Film,
  LayoutGrid,
  List,
  Loader2,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from '@lucide/vue'
import { isAxiosError } from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FilterPopover from '@/components/common/FilterPopover.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useDebouncedRef } from '@/composables/useDebounce'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { formatBytes, formatDate, formatDuration } from '@/lib/format'
import {
  deleteVideo,
  downloadVideoFile,
  getVideoStreamUrl,
  getVideos,
  uploadVideoOnly,
} from '@/services/videoService'
import type { Video, VideoStatus, VideoType } from '@/types'

const router = useRouter()
const maxVideoSize = 100 * 1024 * 1024
const acceptedVideoTypes = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi']
const thumbnailGradients = [
  'from-indigo-500 to-violet-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-violet-500 to-fuchsia-500',
]

const statusLabels: Record<VideoStatus, string> = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
}

const typeLabels: Record<VideoType, string> = {
  VIDEO: 'Original',
  BURNED_VIDEO: 'Burned',
}

const statusStyles: Record<VideoStatus, string> = {
  UPLOADED: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/15 dark:text-sky-300',
  PROCESSING: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
  FAILED: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300',
}

const viewMode = ref<'grid' | 'list'>('grid')
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearch = useDebouncedRef(searchQuery)
const fromDate = ref('')
const toDate = ref('')
const statusFilter = ref<VideoStatus | ''>('')
const typeFilter = ref<VideoType | ''>('')
const videos = ref<Video[]>([])
const totalData = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const downloadError = ref<string | null>(null)

const uploadInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const isUploadModalOpen = ref(false)
const isUploading = ref(false)
const isDragging = ref(false)
const uploadError = ref<string | null>(null)

const deleteCandidate = ref<Video | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

const previewVideo = ref<Video | null>(null)
const previewUrl = ref<string | null>(null)
const previewError = ref<string | null>(null)

let requestSequence = 0

const activeFilterCount = computed(
  () =>
    Number(Boolean(searchQuery.value.trim())) +
    Number(Boolean(fromDate.value)) +
    Number(Boolean(toDate.value)) +
    Number(Boolean(statusFilter.value)) +
    Number(Boolean(typeFilter.value)),
)

const deleteDescription = computed(() => {
  if (!deleteCandidate.value) return ''
  return `This will permanently delete “${displayName(deleteCandidate.value)}”. This action cannot be undone.`
})

const emptyMessage = computed(() => {
  if (activeFilterCount.value > 0) return 'Try changing your search or filters.'
  return 'Upload your first video to start building your library.'
})

function displayName(video: Video): string {
  return video.originalName || video.filename
}

function fileType(video: Video): string {
  const name = displayName(video)
  const extension = name.includes('.') ? name.split('.').pop() : ''
  return extension ? extension.toUpperCase() : video.mimetype.split('/').pop()?.toUpperCase() || 'VIDEO'
}

function thumbnailClass(video: Video): string {
  let hash = 0
  for (const character of video.id) hash = (hash * 31 + character.charCodeAt(0)) | 0
  return thumbnailGradients[Math.abs(hash) % thumbnailGradients.length] ?? thumbnailGradients[0]
}

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

function buildQuery() {
  return {
    page: page.value,
    limit: pageSize.value,
    search: debouncedSearch.value.trim() || undefined,
    status: statusFilter.value || undefined,
    type: typeFilter.value || undefined,
    from: fromDate.value ? `${fromDate.value}T00:00:00.000` : undefined,
    to: toDate.value ? `${toDate.value}T23:59:59.999` : undefined,
  }
}

async function fetchVideos() {
  const requestId = ++requestSequence
  isLoading.value = true
  loadError.value = null

  try {
    const response = await getVideos(buildQuery())
    if (requestId !== requestSequence) return

    const maxPage = Math.max(1, response.meta?.totalPages ?? 0)
    if (page.value > maxPage) {
      page.value = maxPage
      await fetchVideos()
      return
    }

    videos.value = response.items ?? []
    totalData.value = response.meta?.totalData ?? 0
    totalPages.value = response.meta?.totalPages ?? 0
  } catch (error) {
    if (requestId === requestSequence) {
      loadError.value = errorMessage(error, 'Failed to load videos.')
    }
  } finally {
    if (requestId === requestSequence) isLoading.value = false
  }
}

function handlePageChange(value: number) {
  if (value === page.value) return
  page.value = value
  void fetchVideos()
}

function handleLimitChange(value: number) {
  pageSize.value = value
  page.value = 1
  void fetchVideos()
}

function clearFilters() {
  searchQuery.value = ''
  fromDate.value = ''
  toDate.value = ''
  statusFilter.value = ''
  typeFilter.value = ''
  page.value = 1
}

function openUploadModal() {
  if (isUploading.value) return
  selectedFile.value = null
  uploadError.value = null
  isDragging.value = false
  isUploadModalOpen.value = true
}

function closeUploadModal() {
  if (isUploading.value) return
  isUploadModalOpen.value = false
  selectedFile.value = null
  uploadError.value = null
  isDragging.value = false
}

function handleUploadOpenChange(value: boolean) {
  if (value) {
    isUploadModalOpen.value = true
  } else {
    closeUploadModal()
  }
}

function selectFile(file: File | undefined) {
  if (!file) return

  if (!acceptedVideoTypes.includes(file.type)) {
    selectedFile.value = null
    uploadError.value = 'Please choose an MP4, WebM, MKV, or AVI video.'
    return
  }

  if (file.size > maxVideoSize) {
    selectedFile.value = null
    uploadError.value = 'Video must be smaller than 100 MB.'
    return
  }

  selectedFile.value = file
  uploadError.value = null
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

function clearSelectedFile() {
  if (isUploading.value) return
  selectedFile.value = null
  uploadError.value = null
}

async function uploadSelectedVideo() {
  const file = selectedFile.value
  if (!file || isUploading.value) return

  isUploading.value = true
  uploadError.value = null
  let uploaded = false

  try {
    await uploadVideoOnly(file)
    uploaded = true
    toast.success(`${file.name} uploaded successfully.`)
  } catch (error) {
    uploadError.value = errorMessage(error, `Could not upload ${file.name}.`)
  } finally {
    isUploading.value = false
  }

  if (!uploaded) return

  selectedFile.value = null
  uploadError.value = null
  isDragging.value = false
  isUploadModalOpen.value = false
  page.value = 1
  await fetchVideos()
}

function requestDelete(video: Video) {
  if (isDeleting.value) return
  deleteCandidate.value = video
  deleteError.value = null
}

function closeDeleteDialog() {
  if (isDeleting.value) return
  deleteCandidate.value = null
  deleteError.value = null
}

function handleDeleteOpenChange(value: boolean) {
  if (!value) closeDeleteDialog()
}

async function confirmDelete() {
  const candidate = deleteCandidate.value
  if (!candidate || isDeleting.value) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await deleteVideo(candidate.id)
    toast.success(`${displayName(candidate)} deleted successfully.`)
    deleteCandidate.value = null
    await fetchVideos()
  } catch (error) {
    deleteError.value = errorMessage(error, 'Could not delete this video.')
  } finally {
    isDeleting.value = false
  }
}

function openSubtitles(video: Video) {
  // The API has no single-video endpoint, so the display name travels in the
  // query string and stays available after a page refresh.
  void router.push({
    path: `/library/subtitles/${video.id}`,
    query: { name: displayName(video) },
  })
}

function openPreview(video: Video) {
  previewError.value = null
  previewVideo.value = video
  previewUrl.value = getVideoStreamUrl(video.id)
}

function closePreview() {
  previewVideo.value = null
  previewUrl.value = null
  previewError.value = null
}

function handlePreviewOpenChange(value: boolean) {
  if (!value) closePreview()
}

function handlePreviewError() {
  previewError.value = 'This video could not be played. It may still be processing or use an unsupported codec.'
}

async function downloadVideo(video: Video) {
  downloadError.value = null

  try {
    const blob = await downloadVideoFile(video.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = displayName(video)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`Downloading ${displayName(video)}.`)
  } catch (error) {
    downloadError.value = errorMessage(error, `Could not download ${displayName(video)}.`)
  }
}

watch(debouncedSearch, () => {
  page.value = 1
  void fetchVideos()
})

watch([fromDate, toDate, statusFilter, typeFilter], () => {
  page.value = 1
  void fetchVideos()
})

onMounted(() => {
  void fetchVideos()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Film"
      title="Video Library"
      subtitle="Manage and preview all your uploaded videos"
    >
      <Button type="button" class="gap-2" :disabled="isUploading" @click="openUploadModal">
        <Plus class="size-4" />
        Upload video
      </Button>
    </PageHeader>

    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="searchQuery" type="search" placeholder="Search videos..." class="pl-9" />
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="video-status">Status</label>
          <select id="video-status" v-model="statusFilter">
            <option value="">All statuses</option>
            <option v-for="status in (['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'] as VideoStatus[])" :key="status" :value="status">
              {{ statusLabels[status] }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label for="video-type">Type</label>
          <select id="video-type" v-model="typeFilter">
            <option value="">All types</option>
            <option value="VIDEO">Original</option>
            <option value="BURNED_VIDEO">Burned</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="filter-from">From date</label>
          <input id="filter-from" v-model="fromDate" type="date" />
        </div>
        <div class="filter-field">
          <label for="filter-to">To date</label>
          <input id="filter-to" v-model="toDate" type="date" />
        </div>
      </FilterPopover>
      <div class="ml-auto flex rounded-xl border bg-card p-1">
        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg transition-colors"
          :class="viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          title="Grid view"
          aria-label="Grid view"
          :aria-pressed="viewMode === 'grid'"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="size-4" />
        </button>
        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg transition-colors"
          :class="viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          title="List view"
          aria-label="List view"
          :aria-pressed="viewMode === 'list'"
          @click="viewMode = 'list'"
        >
          <List class="size-4" />
        </button>
      </div>
    </div>

    <p v-if="downloadError" class="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
      {{ downloadError }}
    </p>

    <div v-if="isLoading" class="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border bg-card text-muted-foreground">
      <Loader2 class="size-7 animate-spin text-primary" />
      <p class="text-sm">Loading videos…</p>
    </div>

    <div v-else-if="loadError" class="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border bg-card text-center">
      <span class="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <Film class="size-6" />
      </span>
      <div>
        <p class="font-semibold">Could not load videos</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ loadError }}</p>
      </div>
      <Button type="button" variant="outline" @click="fetchVideos">Try again</Button>
    </div>

    <template v-else>
      <div v-if="videos.length && viewMode === 'grid'" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="video in videos"
          :key="video.id"
          class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <button
            type="button"
            class="relative aspect-video w-full overflow-hidden bg-gradient-to-br"
            :class="thumbnailClass(video)"
            :aria-label="`Preview ${displayName(video)}`"
            @click="openPreview(video)"
          >
            <div class="absolute inset-0 grid place-items-center">
              <span class="grid size-12 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
                <Clapperboard class="size-6" />
              </span>
            </div>
            <span class="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100">
              <span class="grid size-14 place-items-center rounded-2xl bg-white/90 text-slate-900 shadow-lg">
                <Play class="size-6 fill-current" />
              </span>
            </span>
            <Badge
              variant="outline"
              class="absolute left-3 top-3 border-white/30 bg-white/15 capitalize text-white backdrop-blur-md"
            >
              {{ statusLabels[video.status] }}
            </Badge>
            <span class="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
              {{ formatDuration(video.duration) }}
            </span>
          </button>

          <div class="flex items-center gap-3 p-4">
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ displayName(video) }}</p>
              <p class="mt-0.5 truncate text-xs text-muted-foreground">
                {{ typeLabels[video.type] }} · {{ formatBytes(video.size) }} · {{ formatDate(video.createdAt) }}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button type="button" variant="ghost" size="icon" class="size-8" :aria-label="`Actions for ${displayName(video)}`">
                  <MoreHorizontal class="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44">
                <DropdownMenuItem class="gap-2" @click="downloadVideo(video)">
                  <Download class="size-4" /> Download
                </DropdownMenuItem>
                <DropdownMenuItem class="gap-2" @click="openSubtitles(video)">
                  <FileVideo class="size-4" /> Subtitles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" class="gap-2" @click="requestDelete(video)">
                  <Trash2 class="size-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </article>
      </div>

      <div v-else-if="videos.length" class="overflow-hidden rounded-2xl border bg-card">
        <div class="hidden grid-cols-[3fr_1fr_1.2fr_1fr_1.2fr_auto] gap-3 border-b bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
          <span>File</span>
          <span>Type</span>
          <span>Duration</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>
        <div v-for="video in videos" :key="video.id">
          <div class="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40 lg:grid-cols-[3fr_1fr_1.2fr_1fr_1.2fr_auto]">
            <div class="flex min-w-0 items-center gap-3">
              <Avatar class="size-9 rounded-lg">
                <AvatarFallback class="rounded-lg bg-gradient-to-br text-xs text-white" :class="thumbnailClass(video)">
                  <Film class="size-4" />
                </AvatarFallback>
              </Avatar>
              <span class="truncate text-sm font-medium">{{ displayName(video) }}</span>
            </div>
            <span class="hidden text-sm text-muted-foreground lg:block">{{ fileType(video) }}</span>
            <span class="hidden font-mono text-sm text-muted-foreground lg:block">{{ formatDuration(video.duration) }}</span>
            <span class="hidden lg:block">
              <Badge variant="outline" class="capitalize" :class="statusStyles[video.status]">
                {{ statusLabels[video.status] }}
              </Badge>
            </span>
            <span class="hidden text-sm text-muted-foreground lg:block">{{ formatDate(video.createdAt) }}</span>
            <div class="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8"
                :aria-label="`Preview ${displayName(video)}`"
                @click="openPreview(video)"
              >
                <Play class="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button type="button" variant="ghost" size="icon" class="size-8" :aria-label="`Actions for ${displayName(video)}`">
                    <MoreHorizontal class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44">
                  <DropdownMenuItem class="gap-2" @click="downloadVideo(video)">
                    <Download class="size-4" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-2" @click="openSubtitles(video)">
                    <FileVideo class="size-4" /> Subtitles
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" class="gap-2" @click="requestDelete(video)">
                    <Trash2 class="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 text-center">
        <span class="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Film class="size-7" />
        </span>
        <div>
          <p class="font-semibold">No videos found</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ emptyMessage }}</p>
        </div>
        <Button type="button" class="gap-2" @click="openUploadModal">
          <Plus class="size-4" />
          Upload video
        </Button>
      </div>
    </template>

    <PaginationBar
      v-if="!isLoading && !loadError"
      :page="page"
      :limit="pageSize"
      :total-pages="totalPages"
      :total-data="totalData"
      :per-page-options="[10, 25, 50]"
      @update:page="handlePageChange"
      @update:limit="handleLimitChange"
    />

    <ModalDialog
      :open="isUploadModalOpen"
      title="Upload video"
      description="Add a video to your library. MP4, WebM, MKV, and AVI files up to 100 MB are supported."
      :close-on-backdrop="!isUploading"
      :show-close-button="!isUploading"
      @update:open="handleUploadOpenChange"
    >
      <div class="space-y-4">
        <input
          ref="uploadInput"
          class="hidden"
          type="file"
          accept="video/mp4,video/webm,video/mkv,video/avi"
          @change="handleFileSelection"
        />

        <div
          v-if="!selectedFile"
          class="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/60 hover:bg-muted/30'"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <span class="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud class="size-7" />
          </span>
          <div>
            <p class="text-sm font-semibold">Drop your video here</p>
            <p class="mt-1 text-sm text-muted-foreground">or choose a file from your device</p>
          </div>
          <Button type="button" variant="outline" @click="uploadInput?.click()">Browse files</Button>
          <p class="text-xs text-muted-foreground">MP4, WebM, MKV, or AVI up to 100 MB</p>
        </div>

        <div v-else class="flex items-center gap-3 rounded-2xl border bg-muted/40 p-3">
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <FileVideo class="size-5" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ selectedFile.name }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">{{ formatBytes(selectedFile.size) }} · Ready to upload</p>
          </div>
          <Button type="button" variant="ghost" size="icon" class="size-8 text-muted-foreground hover:text-destructive" :disabled="isUploading" aria-label="Remove selected video" @click="clearSelectedFile">
            <X class="size-4" />
          </Button>
        </div>

        <p v-if="uploadError" class="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
          {{ uploadError }}
        </p>
      </div>

      <template #footer>
        <Button type="button" variant="outline" :disabled="isUploading" @click="closeUploadModal">
          Cancel
        </Button>
        <Button type="button" :disabled="!selectedFile || isUploading" @click="uploadSelectedVideo">
          <Loader2 v-if="isUploading" class="size-4 animate-spin" />
          {{ isUploading ? 'Uploading…' : 'Upload video' }}
        </Button>
      </template>
    </ModalDialog>

    <ConfirmDialog
      :open="deleteCandidate !== null"
      title="Delete video?"
      :description="deleteDescription"
      confirm-label="Delete video"
      :loading="isDeleting"
      @update:open="handleDeleteOpenChange"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    >
      <p v-if="deleteError" class="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
        {{ deleteError }}
      </p>
    </ConfirmDialog>

    <ModalDialog
      :open="previewVideo !== null"
      :title="previewVideo ? displayName(previewVideo) : 'Video preview'"
      :description="previewVideo ? `${typeLabels[previewVideo.type]} · ${formatBytes(previewVideo.size)}` : undefined"
      class="sm:max-w-3xl"
      @update:open="handlePreviewOpenChange"
    >
      <video
        v-if="previewUrl && !previewError"
        :key="previewUrl"
        class="aspect-video w-full rounded-xl bg-black object-contain"
        controls
        autoplay
        playsinline
        preload="metadata"
        :src="previewUrl"
        @error="handlePreviewError"
      >
        Your browser does not support video playback.
      </video>
      <p
        v-else-if="previewUrl"
        class="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        role="alert"
      >
        {{ previewError }}
      </p>
      <div v-else class="grid aspect-video place-items-center rounded-xl bg-muted text-sm text-muted-foreground">
        Preparing preview…
      </div>

      <template #footer>
        <Button type="button" variant="outline" @click="closePreview">Close</Button>
        <Button v-if="previewVideo" type="button" class="gap-2" @click="downloadVideo(previewVideo)">
          <Download class="size-4" />
          Download
        </Button>
      </template>
    </ModalDialog>
  </div>
</template>
