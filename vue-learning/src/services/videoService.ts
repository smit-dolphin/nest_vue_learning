import { baseApi } from '../api/baseApi'

export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface VideoDto {
  id: string
  filename: string
  path: string
  mimetype: string
  size: number
  duration: number | null
  status: VideoStatus
  errorMessage: string | null
  userId: string
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

export const getUserVideos = async (userId: string): Promise<VideoDto[]> => {
  const response = await baseApi.get<VideoDto[]>(`/videos/user/${userId}`)

  return response as unknown as VideoDto[]
}

export const deleteVideo = async (videoId: string): Promise<VideoDto> => {
  const response = await baseApi.get<VideoDto>(`/videos/delete/${videoId}`)

  return response as unknown as VideoDto
}
