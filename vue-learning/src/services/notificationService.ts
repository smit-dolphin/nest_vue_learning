import baseApi from '@/api/baseApi'

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
  return baseApi.get<NotificationItem[]>('/notifications', {
    params: unreadOnly ? { unreadOnly: true } : undefined,
  }) as unknown as Promise<NotificationItem[]>
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