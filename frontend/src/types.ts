export type VideoType = 'VIDEO' | 'BURNED_VIDEO'

export type VideoStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type SubtitleFormat = 'SRT' | 'VTT'

export type UserRole = 'USER' | 'ADMIN'

export interface Video {
  id: string
  filename: string
  originalName?: string | null
  path: string
  mimetype: string
  size: number
  duration: number | null
  type: VideoType
  status: VideoStatus
  errorMessage: string | null
  parentVideoId: string | null
  userId: string
  createdAt: string
  updatedAt: string
  user?: { email: string }
}

export interface Audio {
  id: string
  filename: string
  path: string
  mimetype: string
  size: number
  duration: number | null
  videoId: string
  createdAt: string
  updatedAt: string
}

export interface Subtitle {
  id: string
  filename: string
  originalName?: string | null
  mimeType: string
  path: string
  size: number
  duration: number | null
  languageCode: string
  subtitleFormat: SubtitleFormat
  videoId: string
  createdAt: string
  updatedAt: string
}

export interface SubtitleJob {
  id: string
  queueJobId: string | null
  videoId: string
  status: JobStatus
  languageCode: string | null
  errorMessage: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  video?: {
    id: string
    filename: string
    originalName?: string | null
    path: string
    mimetype: string
    duration: number | null
  }
}

export interface NotificationItem {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  id: string
  userId: string
  language: string
  theme: string
  compactView: boolean
  defaultLanguage: string
  defaultFormat: SubtitleFormat
  autoPunctuation: boolean
  wordLevelTiming: boolean
  autoTranslate: boolean
  translateLanguage: string | null
  fontSize: number
  fontColor: string
  backgroundOpacity: number
  position: string
  outline: boolean
  jobComplete: boolean
  jobFailed: boolean
  weeklyReport: boolean
  productUpdates: boolean
  marketing: boolean
  autoDownload: boolean
  createdAt: string
  updatedAt: string
}

export type JobStatusKey = 'done' | 'processing' | 'queued' | 'failed'

export interface DashboardStat {
  key: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down'
}

export interface RecentJob {
  id: string
  title: string
  lang: string
  duration: string
  status: JobStatusKey
  time: string
}

export interface LanguagePct {
  name: string
  pct: number
}

export interface DashboardData {
  stats: DashboardStat[]
  recentJobs: RecentJob[]
  languages: LanguagePct[]
}