import { baseApi } from '../api/baseApi'

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
  timestamps: boolean
  lables: boolean
  autoTranslate: boolean
  autoPunctuation: boolean
  wordLevelTiming: boolean
  burnVideo: boolean
}

export interface UploadResult {
  result: unknown
  jobId: string
  options: Record<string, unknown>
}

export const uploadVideoOnly = async (file: File, userId: string): Promise<VideoDto> => {
  const formData = new FormData()
  formData.append('video', file)

  const response = await baseApi.post(`/videos/upload/${userId}`, formData)

  return response as unknown as VideoDto
}

export const uploadVideo = async (
  file: File,
  params: SubtitleSettings,
): Promise<UploadResult> => {
  const formData = new FormData()

  formData.append('video', file)

  const response = await baseApi.post('/videos', formData, {
    params: {
      leng: params.leng,
      formate: params.formate,
      lables: params.lables,
      autoTranslate: params.autoTranslate,
      autoPunctuation: params.autoPunctuation,
      wordLevelTiming: params.wordLevelTiming,
      burnVideo: params.burnVideo,
    },
  })

  return response as unknown as UploadResult
}

export const generateSubtitle = async (videoId: string) => {
  const response = await baseApi.post(`/subtitle/${videoId}`)

  return response
}

export const generateSubtitleForVideo = async (
  videoId: string,
  params: SubtitleSettings,
): Promise<UploadResult> => {
  const response = await baseApi.post(`/videos/generate-subtitle/${videoId}`, null, {
    params: {
      leng: params.leng,
      formate: params.formate,
      lables: params.lables,
      autoTranslate: params.autoTranslate,
      autoPunctuation: params.autoPunctuation,
      wordLevelTiming: params.wordLevelTiming,
      burnVideo: params.burnVideo,
    },
  })

  return response as unknown as UploadResult
}

export const getUserVideos = async (userId: string): Promise<VideoDto[]> => {
  const response = await baseApi.get<VideoDto[]>(`/videos/user/${userId}`)

  return response as unknown as VideoDto[]
}

export const deleteVideo = async (videoId: string): Promise<VideoDto> => {
  const response = await baseApi.get<VideoDto>(`/videos/delete/${videoId}`)

  return response as unknown as VideoDto
}

export const getVideoStreamUrl = (videoId: string): string => {
  return `${baseApi.defaults.baseURL}/videos/stream/${videoId}`
}

export const downloadVideoFile = async (videoId: string, filename: string): Promise<void> => {
  const blob = await baseApi.get<Blob>(`/videos/download/${videoId}`, {
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
