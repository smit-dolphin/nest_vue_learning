import { baseApi } from '../api/baseApi'
import { useAuthStore } from '../stores/authStore'

export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type VideoType = 'VIDEO' | 'BURNED_VIDEO'

export interface VideoDto {
  id: string
  filename: string
  path: string
  mimetype: string
  size: number
  duration: number | null
  type: VideoType
  status: VideoStatus
  errorMessage: string | null
  userId: string
  parentVideoId?: string | null
  createdAt: string
  updatedAt: string
}

export interface SubtitleSettings {
  leng: string
  formate: string
  autoTranslate: boolean
  autoPunctuation: boolean
  wordLevelTiming: boolean
  /** Detect speakers and prefix segments with speaker labels. */
  lables: boolean
  burnVideo: boolean
  // Burn-in subtitle style — only sent when burnVideo is true
  fontSize?: number
  fontColor?: string
  background?: boolean
  backgroundColor?: string
  backgroundOpacity?: number
  position?: string
  outline?: number
}

export interface UploadResult {
  result: unknown
  jobId: string
  options: Record<string, unknown>
}

export const uploadVideoOnly = async (file: File): Promise<VideoDto> => {
  const formData = new FormData()
  formData.append('video', file)

  const response = await baseApi.post(`/videos`, formData)

  return response as unknown as VideoDto
}

export const uploadVideo = async (
  file: File,
  params: SubtitleSettings,
): Promise<UploadResult> => {
  const formData = new FormData()

  formData.append('video', file)

  const response = await baseApi.post('/videos/subtitle-jobs', formData, {
    params: {
      leng: params.leng,
      formate: params.formate,
      autoTranslate: params.autoTranslate,
      autoPunctuation: params.autoPunctuation,
      wordLevelTiming: params.wordLevelTiming,
      lables: params.lables,
      burnVideo: params.burnVideo,
      ...(params.burnVideo
        ? {
            fontSize: params.fontSize,
            fontColor: params.fontColor,
            background: params.background,
            backgroundColor: params.backgroundColor,
            backgroundOpacity: params.backgroundOpacity,
            position: params.position,
            outline: params.outline,
          }
        : {}),
    },
  })

  return response as unknown as UploadResult
}

export const generateSubtitleForVideo = async (
  videoId: string,
  params: SubtitleSettings,
): Promise<UploadResult> => {
  const response = await baseApi.post(`/videos/${videoId}/subtitle-jobs`, null, {
    params: {
      leng: params.leng,
      formate: params.formate,
      autoTranslate: params.autoTranslate,
      autoPunctuation: params.autoPunctuation,
      wordLevelTiming: params.wordLevelTiming,
      lables: params.lables,
      burnVideo: params.burnVideo,
      ...(params.burnVideo
        ? {
            fontSize: params.fontSize,
            fontColor: params.fontColor,
            background: params.background,
            backgroundColor: params.backgroundColor,
            backgroundOpacity: params.backgroundOpacity,
            position: params.position,
            outline: params.outline,
          }
        : {}),
    },
  })

  return response as unknown as UploadResult
}

export const getUserVideos = async (): Promise<VideoDto[]> => {
  const response = await baseApi.get<VideoDto[]>(`/videos`)

  return response as unknown as VideoDto[]
}

export const deleteVideo = async (videoId: string): Promise<VideoDto> => {
  const response = await baseApi.delete<VideoDto>(`/videos/${videoId}`)

  return response as unknown as VideoDto
}

export const getVideoStreamUrl = (videoId: string): string => {
  const base = `${baseApi.defaults.baseURL}/videos/stream/${videoId}`
  const authStore = useAuthStore()
  const token = authStore.accessToken
  return token ? `${base}?token=${encodeURIComponent(token)}` : base
}

export const getVideoPreviewUrl = (videoId: string): string => {
  return getVideoStreamUrl(videoId)
}

export const downloadVideoFile = async (videoId: string, filename: string): Promise<void> => {
  const blob = await baseApi.get<Blob>(`/videos/${videoId}/download`, {
    responseType: 'blob',
  }) as unknown as Blob
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
