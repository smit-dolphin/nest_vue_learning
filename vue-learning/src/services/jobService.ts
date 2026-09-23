import { baseApi } from '../api/baseApi'
import { MAX_LIST_LIMIT, type ListQueryParams, type PaginatedList } from '../types/pagination'

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

export const JOB_STATUSES = ['COMPLETED', 'PROCESSING', 'PENDING', 'FAILED'] as const

export interface JobListParams extends ListQueryParams {
  status?: string
  language?: string
}

export const jobService = {
  async getJobForVideo(params: JobListParams = {}): Promise<PaginatedList<JobDto>> {
    const response = (await baseApi.get<PaginatedList<JobDto>>(`/jobs`, {
      params: { limit: MAX_LIST_LIMIT, ...params },
    })) as unknown as PaginatedList<JobDto>

    return response
  },

  async getJobStatus(jobId: string): Promise<JobStatusDto> {
    const result = await baseApi.get<JobStatusDto>(`/jobs/${jobId}`)
    return result as unknown as JobStatusDto
  },
}