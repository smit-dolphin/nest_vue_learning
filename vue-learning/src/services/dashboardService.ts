import baseApi from '@/api/baseApi'

export interface DashboardStat {
  key: string
  label: string
  value: number
  change: string
  trend: 'up' | 'down'
}

export interface DashboardRecentJob {
  id: string
  title: string
  lang: string
  duration: string
  status: 'done' | 'processing' | 'queued' | 'failed'
  time: string
}

export interface DashboardLanguage {
  name: string
  pct: number
}

export interface DashboardResponse {
  stats: DashboardStat[]
  recentJobs: DashboardRecentJob[]
  languages: DashboardLanguage[]
}

export function getDashboard() {
  return baseApi.get<DashboardResponse>('/dashboard') as unknown as Promise<DashboardResponse>
}