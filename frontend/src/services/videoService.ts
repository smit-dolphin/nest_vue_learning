import { baseApi } from '@/api/baseApi'
import { unwrap } from '@/api/types'
import type { ListQuery, Paginated } from '@/api/types'
import { useAuthStore } from '@/stores/authStore'
import type { Video, VideoStatus, VideoType } from '@/types'

export interface ListVideosQuery extends ListQuery {
  type?: VideoType | string
  status?: VideoStatus | string
}

export interface SubtitleGenerateOptions {
  leng?: string
  formate?: string
  lables?: boolean
  autoTranslate?: boolean
  autoPunctuation?: boolean
  wordLevelTiming?: boolean
  burnVideo?: boolean
  fontSize?: number
  fontColor?: string
  background?: boolean
  backgroundColor?: string
  backgroundOpacity?: number
  position?: string
  outline?: number
}

export interface SubtitleJobCreated {
  video: Video
  jobId: string
  options: SubtitleGenerateOptions
}

export interface BurnJobCreated {
  jobId: string
  historyId: string
}

export interface MessageResult {
  message: string
}

export async function uploadVideoOnly(file: File): Promise<Video> {
  const formData = new FormData()
  formData.append('video', file)
  const result = await baseApi.post<Video>('/videos', formData)
  const envelope = unwrap<Video>(result)
  return envelope.data
}

export async function uploadVideoAndGenerateSubtitle(
  file: File,
  options: SubtitleGenerateOptions = {},
): Promise<SubtitleJobCreated> {
  const formData = new FormData()
  formData.append('video', file)
  const result = await baseApi.post<SubtitleJobCreated>('/videos/subtitle-jobs', formData, {
    params: options,
  })
  const envelope = unwrap<SubtitleJobCreated>(result)
  return envelope.data
}

export async function generateSubtitleFromVideo(
  videoId: string,
  options: SubtitleGenerateOptions = {},
): Promise<SubtitleJobCreated> {
  const result = await baseApi.post<SubtitleJobCreated>(
    `/videos/${videoId}/subtitle-jobs`,
    {},
    { params: options },
  )
  const envelope = unwrap<SubtitleJobCreated>(result)
  return envelope.data
}

export async function createBurnSubtitleJob(
  videoId: string,
  subtitleId: string,
  options: SubtitleGenerateOptions = {},
): Promise<BurnJobCreated> {
  const result = await baseApi.post<BurnJobCreated>(
    `/videos/${videoId}/burn-jobs`,
    { subtitleId },
    { params: options },
  )
  const envelope = unwrap<BurnJobCreated>(result)
  return envelope.data
}

export async function getVideos(query: ListVideosQuery = {}): Promise<Paginated<Video>> {
  const result = await baseApi.get<Video>('/videos', { params: query })
  const envelope = unwrap<Video[]>(result)
  return { items: envelope.data, meta: envelope.meta! }
}

export async function deleteVideo(videoId: string): Promise<MessageResult> {
  const result = await baseApi.delete<unknown>(`/videos/${videoId}`)
  const envelope = unwrap<unknown>(result)
  return { message: envelope.message }
}

export function getVideoStreamUrl(videoId: string): string {
  const authStore = useAuthStore()
  const token = authStore.accessToken
  return `${baseApi.defaults.baseURL}/videos/stream/${videoId}?token=${encodeURIComponent(token ?? '')}`
}

export async function downloadVideoFile(videoId: string): Promise<Blob> {
  const result = await baseApi.get<Blob>(`/videos/${videoId}/download`, {
    responseType: 'blob',
  })
  return result as unknown as Blob
}