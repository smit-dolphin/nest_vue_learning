import { baseApi } from '@/api/baseApi'
import { unwrap, type ListQuery, type Paginated } from '@/api/types'
import type { NotificationItem } from '@/types'

export interface ListNotificationsQuery extends ListQuery {
  unreadOnly?: boolean | string
  type?: string
}

export interface UpdatedResult {
  updated: number
}

export async function getNotifications(
  query: ListNotificationsQuery = {},
): Promise<Paginated<NotificationItem>> {
  const result = await baseApi.get<NotificationItem>('/notifications', { params: query })
  const envelope = unwrap<NotificationItem[]>(result)
  return { items: envelope.data, meta: envelope.meta! }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await baseApi.get<{ count: number }>('/notifications/unread-count')
  const envelope = unwrap<{ count: number }>(result)
  return envelope.data.count
}

export async function markAllNotificationsAsRead(): Promise<number> {
  const result = await baseApi.patch<UpdatedResult>('/notifications/read-all')
  const envelope = unwrap<UpdatedResult>(result)
  return envelope.data.updated
}

export async function markNotificationAsRead(notificationId: string): Promise<number> {
  const result = await baseApi.patch<UpdatedResult>(`/notifications/${notificationId}/read`)
  const envelope = unwrap<UpdatedResult>(result)
  return envelope.data.updated
}