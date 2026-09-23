import baseApi from '@/api/baseApi'
import { MAX_LIST_LIMIT, type PaginatedList } from '../types/pagination'

export interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  data: Record<string, unknown> | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

interface UnreadCountResponse {
  count: number
}

export function getNotifications(unreadOnly = false) {
  const params: Record<string, unknown> = { limit: MAX_LIST_LIMIT }
  if (unreadOnly) params.unreadOnly = true

  return baseApi
    .get<PaginatedList<NotificationItem>>('/notifications', { params })
    .then(
      (response) =>
        ((response as unknown as PaginatedList<NotificationItem>).data ?? []) as NotificationItem[],
    )
}

export function getUnreadNotificationCount() {
  return baseApi.get<UnreadCountResponse>('/notifications/unread-count') as unknown as Promise<UnreadCountResponse>
}

export function markNotificationAsRead(notificationId: string) {
  return baseApi.patch<{ updated: number }>(
    `/notifications/${notificationId}/read`,
  ) as unknown as Promise<{ updated: number }>
}

export function markAllNotificationsAsRead() {
  return baseApi.patch<{ updated: number }>('/notifications/read-all') as unknown as Promise<{ updated: number }>
}