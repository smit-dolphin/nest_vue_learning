<script setup lang="ts">
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronDown,
  FileVideo,
  Loader2,
  Menu,
  Moon,
  Search,
  Sun,
  XCircle,
} from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useLogout } from '@/composables/useLogout'
import { getProfileImageUrl } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useNotificationStore } from '@/stores/notificationStore'
import { useSettingsStore } from '@/stores/settingsStore'

const route = useRoute()
const emit = defineEmits<{ 'toggle-mobile': [] }>()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { logout } = useLogout()
const notificationsOpen = ref(false)

watch(notificationsOpen, (open) => {
  if (open) notificationStore.fetchNotifications()
})

const darkMode = ref(settingsStore.theme === 'dark')

const toggleTheme = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
  settingsStore.updateSettings({ theme: darkMode.value ? 'dark' : 'light' }).catch(() => {
    // Ignore failures; the toggle is purely cosmetic here.
  })
}

const userName = computed(() => authStore.user?.username || 'User')
const userEmail = computed(() => authStore.user?.email || '')
const userInitials = computed(() => {
  const source = (authStore.user?.username || authStore.user?.email || 'U').trim()
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return (initials || 'U').toUpperCase()
})
const avatarSrc = computed(() => getProfileImageUrl())

const titles: Record<string, string> = {
  dashboard: 'Dashboard',
  'generate-subtitle': 'Generate Subtitle',
  library: 'Video Library',
  'subtitle-files': 'Subtitle Files',
  'subtitle-editor': 'Subtitle Editor',
  history: 'History',
  settings: 'Settings',
  help: 'Help & Support',
  profile: 'Profile',
}

const pageTitle = computed(() => titles[String(route.name)] ?? 'Dashboard')

const crumbs = computed(() => {
  if (route.name === 'subtitle-files') return ['Library', 'Subtitles']
  if (route.name === 'subtitle-editor') return ['Library', 'Subtitles', 'Editor']
  if (route.name === 'generate-subtitle-video') return ['Generate']
  return []
})

const notificationIcon = (type: string) => {
  switch (type) {
    case 'JOB_COMPLETED':
      return { icon: Check, classes: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' }
    case 'BURNED_VIDEO':
      return { icon: FileVideo, classes: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' }
    case 'JOB_FAILED':
      return { icon: XCircle, classes: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' }
    default:
      return { icon: Bell, classes: 'bg-muted text-muted-foreground' }
  }
}

const timeAgo = (iso: string) => {
  const diffSeconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diffSeconds < 60) return 'Just now'
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md transition-[left] duration-300 sm:px-6"
  >
    <button
      type="button"
      class="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      aria-label="Open menu"
      @click="emit('toggle-mobile')"
    >
      <Menu class="size-5" />
    </button>

    <div class="min-w-0">
      <nav v-if="crumbs.length" class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span v-for="(crumb, i) in crumbs" :key="crumb" class="flex items-center gap-1.5">
          <span>{{ crumb }}</span>
          <span v-if="i < crumbs.length - 1">/</span>
        </span>
      </nav>
      <h1 class="truncate text-lg font-semibold tracking-tight sm:text-xl">{{ pageTitle }}</h1>
    </div>

    <div class="ml-auto flex items-center gap-2 sm:gap-3">
      <div class="relative hidden md:block">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search..." class="h-9 w-52 pl-9 pr-16 lg:w-64" />
        <kbd class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <Button
        variant="outline"
        size="icon"
        class="size-9"
        :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <Sun v-if="darkMode" class="size-4" />
        <Moon v-else class="size-4" />
      </Button>

      <DropdownMenu v-model:open="notificationsOpen">
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" class="relative size-9">
            <Bell class="size-4" />
            <span
              v-if="notificationStore.unreadCount > 0"
              class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground ring-2 ring-background"
            >
              {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-80">
          <div class="flex items-center justify-between gap-2 px-2 py-1.5">
            <DropdownMenuLabel class="px-1 py-0">Notifications</DropdownMenuLabel>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              :disabled="notificationStore.unreadCount === 0"
              @click="notificationStore.markAllRead()"
            >
              <CheckCheck class="size-3.5" />
              Mark all read
            </button>
          </div>
          <DropdownMenuSeparator />

          <div v-if="notificationStore.isLoading" class="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" />
            Loading notifications...
          </div>

          <div v-else-if="notificationStore.notifications.length === 0" class="flex flex-col items-center gap-2 py-8 text-center">
            <span class="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground">
              <BellOff class="size-5" />
            </span>
            <p class="text-sm font-medium">No notifications</p>
            <p class="text-xs text-muted-foreground">We'll let you know when there's something new.</p>
          </div>

          <div v-else class="max-h-80 overflow-y-auto">
            <DropdownMenuItem
              v-for="n in notificationStore.notifications"
              :key="n.id"
              class="items-start gap-3 py-2.5"
              :class="!n.readAt ? 'bg-accent/50' : ''"
              @click="notificationStore.markRead(n.id)"
            >
              <span class="grid size-9 shrink-0 place-items-center rounded-lg" :class="notificationIcon(n.type).classes">
                <component :is="notificationIcon(n.type).icon" class="size-4" />
              </span>
              <div class="min-w-0">
                <p class="text-sm font-medium">{{ n.title }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ n.message }}</p>
                <p class="mt-0.5 text-[10px] text-muted-foreground/70">{{ timeAgo(n.createdAt) }}</p>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" class="hidden h-6 sm:block" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" class="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar class="size-9">
              <AvatarImage v-if="avatarSrc" :src="avatarSrc" alt="Profile" />
              <AvatarFallback class="brand-gradient text-sm font-semibold text-white">{{ userInitials }}</AvatarFallback>
            </Avatar>
            <span class="hidden text-left leading-tight sm:block">
              <span class="block text-sm font-semibold">{{ userName }}</span>
              <span class="block max-w-32 truncate text-xs text-muted-foreground">{{ userEmail }}</span>
            </span>
            <ChevronDown class="hidden size-4 text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="$router.push('/profile')">Profile</DropdownMenuItem>
          <DropdownMenuItem @click="$router.push('/settings')">Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive" @click="logout">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>