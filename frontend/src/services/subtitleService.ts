import { baseApi } from '@/api/baseApi'
import { unwrap, type ListQuery, type Paginated } from '@/api/types'
import type { Subtitle, SubtitleFormat } from '@/types'

export interface ListSubtitlesQuery extends ListQuery {
  format?: SubtitleFormat | string
}

export interface MessageResult {
  message: string
}

export async function getSubtitles(
  videoId: string,
  query: ListSubtitlesQuery = {},
): Promise<Paginated<Subtitle>> {
  const result = await baseApi.get<Subtitle>(`/subtitle/${videoId}`, { params: query })
  const envelope = unwrap<Subtitle[]>(result)
  return { items: envelope.data, meta: envelope.meta! }
}

export async function getSubtitleContent(subtitleId: string): Promise<string> {
  const result = await baseApi.get<string>(`/subtitle/${subtitleId}/content`)
  return result as unknown as string
}

export async function downloadSubtitleFile(subtitleId: string): Promise<Blob> {
  const result = await baseApi.get<Blob>(`/subtitle/${subtitleId}/download`, {
    responseType: 'blob',
  })
  return result as unknown as Blob
}

export async function deleteSubtitle(subtitleId: string): Promise<MessageResult> {
  const result = await baseApi.delete<unknown>(`/subtitle/${subtitleId}`)
  const envelope = unwrap<unknown>(result)
  return { message: envelope.message }
}

export async function cleanupLocalSubtitleFiles(): Promise<MessageResult> {
  const result = await baseApi.delete<unknown>('/subtitle/clean-up/local-files')
  const envelope = unwrap<unknown>(result)
  return { message: envelope.message }
}