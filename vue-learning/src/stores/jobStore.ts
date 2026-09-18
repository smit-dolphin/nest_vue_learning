import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { jobService, type JobDto } from '../services/jobService'
import { useAuthStore } from './authStore'
import type { VideoItem } from '../components/VideoLibrary/types'

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

  async function fetchJobs() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    isLoading.value = true
    error.value = null
    try {
      const data = await jobService.getJobForVideo()
      jobs.value = data
      videos.value = data.map(jobToVideoItem)
    } catch (err: unknown) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load history'
        : 'Failed to load history'
    } finally {
      isLoading.value = false
    }
  }

  return {
    jobs,
    videos,
    isLoading,
    error,
    fetchJobs,
  }
})
