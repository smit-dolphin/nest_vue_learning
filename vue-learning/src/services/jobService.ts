import { baseApi } from '../api/baseApi'

export interface VideoDto {
  id: string
  filename: string
  path: string
  mimetype: string
  size: number
  duration: number | null
}

export interface JobDto {
  id: string
  queueJobId: string
  videoId: string
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'QUEUED'
  languageCode: string
  errorMessage: string | null
  startedAt: string
  completedAt: string
  createdAt: string
  updatedAt: string
  video: VideoDto
}

export interface JobStatusDto {
  id: string
  status: string
  progress: number
}

export const jobService = {
  async getJobForVideo(userId: string): Promise<JobDto[]> {
    const result = await baseApi.get<JobDto[]>(`/job/${userId}/list`)
    return result as unknown as JobDto[]
  },

  async getJobStatus(jobId: string): Promise<JobStatusDto> {
    const result = await baseApi.get<JobStatusDto>(`/job/${jobId}`)
    return result as unknown as JobStatusDto
  },
}