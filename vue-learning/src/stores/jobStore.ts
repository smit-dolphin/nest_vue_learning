import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { jobService, JOB_STATUSES, type JobDto } from '../services/jobService'
import { useAuthStore } from './authStore'
import type { PaginationMeta } from '../types/pagination'
import type { VideoItem } from '../components/VideoLibrary/types'

export const JOB_STATUS_FILTERS = ['ALL', ...JOB_STATUSES] as const
export type JobStatusFilter = (typeof JOB_STATUS_FILTERS)[number]

const STATUS_MAP: Record<string, VideoItem['status']> = {
  COMPLETED: 'done',
  PROCESSING: 'processing',
  PENDING: 'processing',
  QUEUED: 'processing',
  FAILED: 'failed',
}

const STATUS_COLORS: Record<string, string> = {
  done: '#10b981',
  processing: '#8b5cf6',
  failed: '#ef4444',
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '—'
  }
  const total = Math.round(seconds)
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function jobToVideoItem(job: JobDto): VideoItem {
  const status = STATUS_MAP[job.status] ?? 'processing'

  return {
    id: job.id,
    title: job.video?.filename ?? 'Untitled video',
    duration: formatDuration(job.video?.duration ?? null),
    size: formatBytes(job.video?.size ?? 0),
    lang: job.languageCode ?? 'English',
    status,
    segments: status === 'done' ? 1 : 0,
    date: formatDate(job.createdAt),
    color: STATUS_COLORS[status] ?? '#8b5cf6',
  }
}

export const useJobStore = defineStore('jobs', () => {
  const jobs = ref<JobDto[]>([])
  const videos = ref<VideoItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const meta = ref<PaginationMeta | null>(null)

  const page = ref(1)
  const limit = ref(10)
  const search = ref('')
  const status = ref<JobStatusFilter>('ALL')
  const language = ref('')
  const from = ref('')
  const to = ref('')

  const totalItems = computed(() => meta.value?.totalData ?? 0)
  const totalPages = computed(() => meta.value?.totalPages ?? 0)
  const activeFilterCount = computed(
    () =>
      Number(status.value !== 'ALL') +
      Number(!!language.value) +
      Number(!!from.value) +
      Number(!!to.value),
  )

  function buildParams() {
    return {
      page: page.value,
      limit: limit.value,
      search: search.value.trim() || undefined,
      status: status.value === 'ALL' ? undefined : status.value,
      language: language.value || undefined,
      from: from.value ? `${from.value}T00:00:00.000` : undefined,
      to: to.value ? `${to.value}T23:59:59.999` : undefined,
    }
  }

  // Coalesce synchronous filter changes into one request and drop stale
  // responses so a slow request can't overwrite newer results.
  let requestSeq = 0
  let fetchScheduled = false

  function scheduleFetch() {
    if (fetchScheduled) return
    fetchScheduled = true
    queueMicrotask(() => {
      fetchScheduled = false
      void fetchJobs()
    })
  }

  async function fetchJobs() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    const seq = ++requestSeq
    isLoading.value = true
    error.value = null
    try {
      const response = await jobService.getJobForVideo(buildParams())
      if (seq !== requestSeq) return

      jobs.value = response.data
      videos.value = response.data.map(jobToVideoItem)
      meta.value = response.meta

      // Clamp the current page when the result set shrank.
      const maxPages = response.meta.totalPages
      if (page.value > maxPages && maxPages >= 1) {
        page.value = maxPages
        const retry = await jobService.getJobForVideo(buildParams())
        if (seq !== requestSeq) return
        jobs.value = retry.data
        videos.value = retry.data.map(jobToVideoItem)
        meta.value = retry.meta
      }
    } catch (err: unknown) {
      if (seq !== requestSeq) return
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load history'
        : 'Failed to load history'
    } finally {
      if (seq === requestSeq) isLoading.value = false
    }
  }

  async function setSearch(value: string) {
    search.value = value
    page.value = 1
    scheduleFetch()
  }

  async function setStatus(value: JobStatusFilter) {
    status.value = value
    page.value = 1
    scheduleFetch()
  }

  async function setLanguage(value: string) {
    language.value = value
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
    status.value = 'ALL'
    language.value = ''
    from.value = ''
    to.value = ''
    search.value = ''
    page.value = 1
    scheduleFetch()
  }

  return {
    jobs,
    videos,
    isLoading,
    error,
    meta,
    page,
    limit,
    status,
    language,
    from,
    to,
    totalItems,
    totalPages,
    activeFilterCount,
    fetchJobs,
    setSearch,
    setStatus,
    setLanguage,
    setDateRange,
    setPage,
    setLimit,
    resetFilters,
  }
})
