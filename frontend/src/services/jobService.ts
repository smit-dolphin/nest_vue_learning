import { baseApi } from '@/api/baseApi'
import { unwrap, type ListQuery, type Paginated } from '@/api/types'
import type { JobStatus, SubtitleJob } from '@/types'

export interface ListJobsQuery extends ListQuery {
  status?: JobStatus | string
  language?: string
}

export async function getJobs(query: ListJobsQuery = {}): Promise<Paginated<SubtitleJob>> {
  const result = await baseApi.get<SubtitleJob>('/jobs', { params: query })
  const envelope = unwrap<SubtitleJob[]>(result)
  return { items: envelope.data, meta: envelope.meta! }
}

export async function getJobById(jobId: string): Promise<SubtitleJob> {
  const result = await baseApi.get<SubtitleJob>(`/jobs/${jobId}`)
  const envelope = unwrap<SubtitleJob>(result)
  return envelope.data
}