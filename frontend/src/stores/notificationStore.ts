import { defineStore } from 'pinia'

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/services/notificationService'
import type { NotificationItem } from '@/types'

interface NotificationState {
  notifications: NotificationItem[]
  unreadCount: number
  isLoading: boolean
  isLoaded: boolean
}

export const useNotificationStore = defineStore('notifications', {
  state: (): NotificationState => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    isLoaded: false,
  }),

  actions: {
    async fetchNotifications(limit = 10) {
      this.isLoading = true
      try {
        const result = await getNotifications({ limit })
        this.notifications = result.items
        this.unreadCount = await getUnreadNotificationCount()
        this.isLoaded = true
      } finally {
        this.isLoading = false
      }
    },

    async refreshUnread() {
      try {
        this.unreadCount = await getUnreadNotificationCount()
      } catch {
        // 401 / refresh failures are handled by the Axios interceptor.
      }
    },

    async markRead(notificationId: string) {
      const target = this.notifications.find((n) => n.id === notificationId)
      if (target && !target.readAt) {
        target.readAt = new Date().toISOString()
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
      try {
        await markNotificationAsRead(notificationId)
      } catch {
        // Error is toasted by the interceptor.
      }
    },

    async markAllRead() {
      const now = new Date().toISOString()
      for (const n of this.notifications) {
        if (!n.readAt) n.readAt = now
      }
      this.unreadCount = 0
      try {
        await markAllNotificationsAsRead()
      } catch {
        // Error is toasted by the interceptor.
      }
    },
  },
})