export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type VideoType = 'VIDEO' | 'BURNED_VIDEO'
export type LibraryFilter = 'all' | 'uploaded' | 'burned'
export type ViewMode = 'grid' | 'list'

export interface LibraryVideo {
  id: string
  title: string
  mimetype: string
  duration: string
  size: string
  status: VideoStatus
  type: VideoType
  date: string
  color: string
  createdAt: string
  sizeBytes: number
  parentVideoId: string | null
}


export interface VideoItem {
  id: string | number
  title: string
  duration: string
  size: string
  lang: string
  status: 'done' | 'processing' | 'failed'
  segments: number
  date: string
  color: string
}

export const filters: { label: string; value: LibraryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Burned', value: 'burned' },
]
