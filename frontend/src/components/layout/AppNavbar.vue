<script setup lang="ts">
import { Bell, ChevronDown, Menu, Moon, Search, Sun } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

const route = useRoute()
const emit = defineEmits<{ 'toggle-mobile': [] }>()

const darkMode = ref(document.documentElement.classList.contains('dark'))

const toggleTheme = () => {
  darkMode.value = !darkMode.value
  document.documentElement.classList.toggle('dark', darkMode.value)
}

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

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" class="relative size-9">
            <Bell class="size-4" />
            <span class="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div class="flex items-start gap-3 px-2 py-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              ✓
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">Subtitle ready</p>
              <p class="text-xs text-muted-foreground">Subtitle file for demo_video.mp4 is ready to download.</p>
            </div>
          </div>
          <div class="flex items-start gap-3 px-2 py-2.5">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              ✕
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">Processing failed</p>
              <p class="text-xs text-muted-foreground">Oops, subtitle generation for sample.mkv failed.</p>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" class="hidden h-6 sm:block" />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" class="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar class="size-9">
              <AvatarFallback class="brand-gradient text-sm font-semibold text-white">SG</AvatarFallback>
            </Avatar>
            <span class="hidden text-left leading-tight sm:block">
              <span class="block text-sm font-semibold">Smit Gajjar</span>
              <span class="block text-xs text-muted-foreground">smit@example.com</span>
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
          <DropdownMenuItem class="text-destructive" @click="$router.push('/login')">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>