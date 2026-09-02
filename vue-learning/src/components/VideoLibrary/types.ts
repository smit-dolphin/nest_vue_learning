export type Status = 'all' | 'done' | 'processing' | 'failed'
export type ViewMode = 'grid' | 'list'

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
  { label: 'All Files', value: 'all' },
  { label: 'Completed', value: 'done' },
  { label: 'Processing', value: 'processing' },
  { label: 'Failed', value: 'failed' },
]
