import { baseApi } from '@/api/baseApi'
import { unwrap } from '@/api/types'
import type { DashboardData } from '@/types'

export async function getDashboard(): Promise<DashboardData> {
  const result = await baseApi.get<DashboardData>('/dashboard')
  const envelope = unwrap<DashboardData>(result)
  return envelope.data
}