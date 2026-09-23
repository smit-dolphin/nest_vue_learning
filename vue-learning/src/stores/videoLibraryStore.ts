import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { isAxiosError } from 'axios'
import {
  deleteVideo,
  getUserVideos,
  VIDEO_STATUSES,
  type VideoDto,
  type VideoStatus,
} from '../services/videoService'
import { useAuthStore } from './authStore'
import { MAX_LIST_LIMIT, type PaginationMeta } from '../types/pagination'
import type { LibraryFilter, LibraryVideo } from '../components/VideoLibrary/types'

const STATUS_COLORS: Record<VideoStatus, string> = {
  UPLOADED: '#06b6d4',
  PROCESSING: '#8b5cf6',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
}

const BURNED_VIDEO_COLOR = '#f97316'

const FILTER_TO_TYPE: Record<Exclude<LibraryFilter, 'all'>, 'VIDEO' | 'BURNED_VIDEO'> = {
  uploaded: 'VIDEO',
  burned: 'BURNED_VIDEO',
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || Number.isNaN(seconds)) return '—'

  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainingSeconds = total % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function toLibraryVideo(video: VideoDto): LibraryVideo {
  return {
    id: video.id,
    title: video.filename,
    mimetype: video.mimetype,
    size: formatBytes(video.size),
    duration: formatDuration(video.duration),
    status: video.status,
    type: video.type,
    date: formatDate(video.createdAt),
    color: video.type === 'BURNED_VIDEO'
      ? BURNED_VIDEO_COLOR
      : STATUS_COLORS[video.status],
    createdAt: video.createdAt,
    sizeBytes: video.size,
    parentVideoId: video.parentVideoId ?? null,
  }
}

export const useVideoLibraryStore = defineStore('video-library', () => {
  const videos = ref<LibraryVideo[]>([])
  const isLoading = ref(false)
  const deletingId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const meta = ref<PaginationMeta | null>(null)

  const page = ref(1)
  const limit = ref(10)
  const search = ref('')
  const filter = ref<LibraryFilter>('all')
  const status = ref<VideoStatus | 'ALL'>('ALL')
  const from = ref('')
  const to = ref('')

  const totalItems = computed(() => meta.value?.totalData ?? 0)
  const totalPages = computed(() => meta.value?.totalPages ?? 0)
  const activeFilterCount = computed(
    () =>
      Number(filter.value !== 'all') +
      Number(status.value !== 'ALL') +
      Number(!!from.value) +
      Number(!!to.value),
  )

  function buildParams() {
    const typeFilter = filter.value === 'all' ? undefined : FILTER_TO_TYPE[filter.value]
    return {
      page: page.value,
      limit: limit.value,
      search: search.value.trim() || undefined,
      type: typeFilter,
      status: status.value === 'ALL' ? undefined : status.value,
      from: from.value ? `${from.value}T00:00:00.000` : undefined,
      to: to.value ? `${to.value}T23:59:59.999` : undefined,
    }
  }

  // Coalesce synchronous filter changes (e.g. "clear all") into one request,
  // and drop stale responses so a slow request can't overwrite newer results.
  let requestSeq = 0
  let fetchScheduled = false

  function scheduleFetch() {
    if (fetchScheduled) return
    fetchScheduled = true
    queueMicrotask(() => {
      fetchScheduled = false
      void fetchVideos()
    })
  }

  async function fetchVideos() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    const seq = ++requestSeq
    isLoading.value = true
    error.value = null

    try {
      const response = await getUserVideos(buildParams())
      if (seq !== requestSeq) return

      videos.value = response.data.map(toLibraryVideo)
      meta.value = response.meta

      // Clamp the current page when the result set shrank (e.g. after delete).
      const maxPages = response.meta.totalPages
      if (page.value > maxPages && maxPages >= 1) {
        page.value = maxPages
        const retry = await getUserVideos(buildParams())
        if (seq !== requestSeq) return
        videos.value = retry.data.map(toLibraryVideo)
        meta.value = retry.meta
      }
    } catch (err: unknown) {
      if (seq !== requestSeq) return
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load videos'
        : 'Failed to load videos'
    } finally {
      if (seq === requestSeq) isLoading.value = false
    }
  }

  // Loads every video server side for lookup flows that are not paginated,
  // without touching the pagination/filter state used by the library view.
  async function fetchAll() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    isLoading.value = true
    error.value = null

    try {
      const response = await getUserVideos({ page: 1, limit: MAX_LIST_LIMIT })
      videos.value = response.data.map(toLibraryVideo)
    } catch (err: unknown) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load videos'
        : 'Failed to load videos'
    } finally {
      isLoading.value = false
    }
  }

  async function setSearch(value: string) {
    search.value = value
    page.value = 1
    scheduleFetch()
  }

  async function setFilter(value: LibraryFilter) {
    filter.value = value
    page.value = 1
    scheduleFetch()
  }

  async function setStatus(value: VideoStatus | 'ALL') {
    status.value = value
    page.value = 1
    scheduleFetch()
  }

  async function setDateRange(nextFrom: string, nextTo: string) {
    from.value = nextFrom
    to.value = nextTo
    page.value = 1
    scheduleFetch()
  }

  async function setPage(value: number) {
    if (value === page.value) return
    page.value = value
    scheduleFetch()
  }

  async function setLimit(value: number) {
    if (value === limit.value) return
    limit.value = value
    page.value = 1
    scheduleFetch()
  }

  function resetFilters() {
    filter.value = 'all'
    status.value = 'ALL'
    from.value = ''
    to.value = ''
    search.value = ''
    page.value = 1
    scheduleFetch()
  }

  async function removeVideo(videoId: string) {
    deletingId.value = videoId
    error.value = null

    try {
      await deleteVideo(videoId)
      await fetchVideos()
    } catch (err: unknown) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to delete video'
        : 'Failed to delete video'
      throw err
    } finally {
      deletingId.value = null
    }
  }

  return {
    videos,
    isLoading,
    deletingId,
    error,
    meta,
    page,
    limit,
    status,
    from,
    to,
    totalItems,
    totalPages,
    activeFilterCount,
    VIDEO_STATUSES,
    fetchVideos,
    fetchAll,
    setSearch,
    setFilter,
    setStatus,
    setDateRange,
    setPage,
    setLimit,
    resetFilters,
    removeVideo,
  }
})
