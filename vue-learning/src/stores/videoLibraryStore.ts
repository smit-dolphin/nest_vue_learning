import { defineStore } from 'pinia'
import { ref } from 'vue'
import { isAxiosError } from 'axios'
import { deleteVideo, getUserVideos, type VideoDto, type VideoStatus } from '../services/videoService'
import { useAuthStore } from './authStore'

import type { LibraryVideo } from '../components/VideoLibrary/types'

const STATUS_COLORS: Record<VideoStatus, string> = {
  UPLOADED: '#06b6d4',
  PROCESSING: '#8b5cf6',
  COMPLETED: '#10b981',
  FAILED: '#ef4444',
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
    date: formatDate(video.createdAt),
    color: STATUS_COLORS[video.status],
    createdAt: video.createdAt,
    sizeBytes: video.size,
  }
}

export const useVideoLibraryStore = defineStore('video-library', () => {
  const videos = ref<LibraryVideo[]>([])
  const isLoading = ref(false)
  const deletingId = ref<string | null>(null)
  const error = ref<string | null>(null)

  async function fetchVideos() {
    const authStore = useAuthStore()
    if (!authStore.user?.id) return

    isLoading.value = true
    error.value = null

    try {
      const data = await getUserVideos(authStore.user.id)
      videos.value = data.map(toLibraryVideo)
    } catch (err: unknown) {
      error.value = isAxiosError(err)
        ? err.response?.data?.message ?? 'Failed to load videos'
        : 'Failed to load videos'
    } finally {
      isLoading.value = false
    }
  }

  async function removeVideo(videoId: string) {
    deletingId.value = videoId
    error.value = null

    try {
      await deleteVideo(videoId)
      videos.value = videos.value.filter(video => video.id !== videoId)
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
    fetchVideos,
    removeVideo,
  }
})
