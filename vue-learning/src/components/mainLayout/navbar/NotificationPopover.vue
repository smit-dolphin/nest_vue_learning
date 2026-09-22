<script setup lang="ts">
import { Bell, Check, CheckCheck, LoaderCircle, X } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from '@/services/notificationService'

const isOpen = ref(false)
const isLoading = ref(false)
const isMarkingAllRead = ref(false)
const notifications = ref<NotificationItem[]>([])
const unreadCount = ref(0)
const notificationRoot = ref<HTMLElement | null>(null)
const notificationPollInterval = 5 * 60 * 1000
let pollTimer: ReturnType<typeof setInterval> | undefined

const visibleUnreadCount = computed(() => unreadCount.value > 99 ? '99+' : unreadCount.value)

function formatDate(date: string) {
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(value)
}

async function refreshUnreadCount() {
  try {
    const response = await getUnreadNotificationCount()
    unreadCount.value = response.count
  } catch {
    // The shared API interceptor handles authentication and request errors.
  }
}

async function loadNotifications() {
  isLoading.value = true
  try {
    notifications.value = await getNotifications()
    await refreshUnreadCount()
  } catch {
    // Keep the previous list visible if the request fails.
  } finally {
    isLoading.value = false
  }
}

async function togglePopover() {
  isOpen.value = !isOpen.value
  if (isOpen.value) await loadNotifications()
}

async function markAsRead(notification: NotificationItem) {
  if (notification.readAt) return

  notification.readAt = new Date().toISOString()
  unreadCount.value = Math.max(0, unreadCount.value - 1)

  try {
    await markNotificationAsRead(notification.id)
  } catch {
    notification.readAt = null
    unreadCount.value += 1
  }
}

async function markAllAsRead() {
  if (!unreadCount.value || isMarkingAllRead.value) return

  isMarkingAllRead.value = true
  const previousReadStates = notifications.value.map((notification) => notification.readAt)
  notifications.value.forEach((notification) => {
    notification.readAt ??= new Date().toISOString()
  })
  unreadCount.value = 0

  try {
    await markAllNotificationsAsRead()
  } catch {
    notifications.value.forEach((notification, index) => {
      notification.readAt = previousReadStates[index] ?? null
    })
    await refreshUnreadCount()
  } finally {
    isMarkingAllRead.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (notificationRoot.value && event.target instanceof Node && !notificationRoot.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  void refreshUnreadCount()
  pollTimer = setInterval(() => {
    void refreshUnreadCount()
  }, notificationPollInterval)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <div ref="notificationRoot" class="notification-popover">
    <button
      class="navbar__icon-btn"
      :aria-expanded="isOpen"
      aria-label="Open notifications"
      title="Notifications"
      @click.stop="togglePopover"
    >
      <Bell :size="18" />
      <span v-if="unreadCount" class="navbar__notif-badge">{{ visibleUnreadCount }}</span>
    </button>

    <Transition name="notification-panel">
      <section v-if="isOpen" class="notification-panel" aria-label="Notifications">
        <header class="notification-panel__header">
          <div>
            <p class="notification-panel__eyebrow">Inbox</p>
            <h2>Notifications</h2>
          </div>
          <button class="notification-panel__close" aria-label="Close notifications" @click="isOpen = false">
            <X :size="16" />
          </button>
        </header>

        <div class="notification-panel__toolbar">
          <span>{{ unreadCount ? `${unreadCount} unread` : 'All caught up' }}</span>
          <button
            v-if="unreadCount"
            class="notification-panel__mark-all"
            :disabled="isMarkingAllRead"
            @click="markAllAsRead"
          >
            <CheckCheck :size="14" />
            Mark all read
          </button>
        </div>

        <div class="notification-panel__body">
          <div v-if="isLoading" class="notification-panel__state">
            <LoaderCircle :size="20" class="notification-panel__spinner" />
            <span>Loading messages...</span>
          </div>

          <div v-else-if="!notifications.length" class="notification-panel__state">
            <Bell :size="22" />
            <strong>No notifications yet</strong>
            <span>Updates about your subtitle jobs will appear here.</span>
          </div>

          <button
            v-for="notification in notifications"
            v-else
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !notification.readAt }"
            @click="markAsRead(notification)"
          >
            <span class="notification-item__dot" aria-hidden="true"></span>
            <span class="notification-item__content">
              <span class="notification-item__topline">
                <strong>{{ notification.title }}</strong>
                <small>{{ formatDate(notification.createdAt) }}</small>
              </span>
              <span class="notification-item__message">{{ notification.message }}</span>
            </span>
            <Check v-if="notification.readAt" :size="15" class="notification-item__read" />
          </button>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.notification-popover {
  position: relative;
  flex-shrink: 0;
}

.notification-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: min(390px, calc(100vw - 2rem));
  overflow: hidden;
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 14px;
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.notification-panel__header,
.notification-panel__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.1rem;
}

.notification-panel__header {
  border-bottom: 1px solid var(--border-color);
}

.notification-panel__eyebrow {
  margin: 0 0 0.2rem;
  color: var(--primary-color);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notification-panel h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.notification-panel__close,
.notification-panel__mark-all {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  color: var(--text-secondary);
  background: transparent;
  cursor: pointer;
}

.notification-panel__close {
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 7px;
}

.notification-panel__close:hover,
.notification-panel__mark-all:hover {
  color: var(--text-primary);
  background: var(--hover-color);
}

.notification-panel__mark-all {
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: 600;
}

.notification-panel__mark-all:disabled {
  cursor: wait;
  opacity: 0.6;
}

.notification-panel__toolbar {
  padding-top: 0.7rem;
  padding-bottom: 0.7rem;
  color: var(--text-muted);
  font-size: 0.72rem;
}

.notification-panel__body {
  max-height: min(440px, calc(100vh - 180px));
  overflow-y: auto;
  border-top: 1px solid var(--border-color);
}

.notification-panel__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 3rem 1.5rem;
  color: var(--text-muted);
  text-align: center;
  font-size: 0.78rem;
}

.notification-panel__state strong {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.notification-panel__spinner {
  animation: spin 0.9s linear infinite;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  width: 100%;
  padding: 0.95rem 1.1rem;
  border: 0;
  border-bottom: 1px solid var(--border-color);
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.notification-item:hover {
  background: var(--hover-color);
}

.notification-item__dot {
  width: 7px;
  height: 7px;
  margin-top: 0.35rem;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}

.notification-item--unread .notification-item__dot {
  background: var(--primary-color);
  box-shadow: 0 0 0 3px var(--team-color-light);
}

.notification-item__content {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 0.3rem;
}

.notification-item__topline {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.notification-item__topline strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item__topline small {
  color: var(--text-muted);
  font-size: 0.63rem;
  white-space: nowrap;
}

.notification-item__message {
  color: var(--text-secondary);
  font-size: 0.75rem;
  line-height: 1.45;
}

.notification-item__read {
  color: var(--success-color);
  flex-shrink: 0;
}

.notification-panel-enter-active,
.notification-panel-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
  transform-origin: top right;
}

.notification-panel-enter-from,
.notification-panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 650px) {
  .notification-panel {
    position: fixed;
    top: 64px;
    right: 0.75rem;
    left: 0.75rem;
    width: auto;
  }
}
</style>