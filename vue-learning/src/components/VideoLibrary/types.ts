export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type Status = 'all' | VideoStatus
export type ViewMode = 'grid' | 'list'

export interface LibraryVideo {
  id: string
  title: string
  mimetype: string
  duration: string
  size: string
  status: VideoStatus
  date: string
  color: string
  createdAt: string
  sizeBytes: number
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

export const filters: { label: string; value: Status }[] = [
  { label: 'All Videos', value: 'all' },
  { label: 'Uploaded', value: 'UPLOADED' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
]
