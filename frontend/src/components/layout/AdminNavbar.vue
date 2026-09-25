<script setup lang="ts">
import { Bell, ChevronDown, Menu, Search, ShieldCheck } from '@lucide/vue'
import { computed } from 'vue'
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

const emit = defineEmits<{ 'toggle-mobile': [] }>()
const route = useRoute()

const titles: Record<string, string> = {
  'admin-dashboard': 'Admin Dashboard',
  'admin-users': 'Users',
  'admin-videos': 'Videos',
  'admin-jobs': 'Subtitle Jobs',
}

const pageTitle = computed(() => titles[String(route.name)] ?? 'Admin')

const notifications = [
  { title: 'New user registered', time: '2m ago', tone: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { title: 'Video flagged for review', time: '1h ago', tone: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
  { title: 'Storage at 82% capacity', time: '3h ago', tone: 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400' },
]
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-md sm:px-6"
  >
    <button
      type="button"
      class="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
      aria-label="Open admin menu"
      @click="emit('toggle-mobile')"
    >
      <Menu class="size-5" />
    </button>

    <div class="min-w-0">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-primary">Admin console</p>
      <h1 class="truncate text-lg font-semibold tracking-tight sm:text-xl">{{ pageTitle }}</h1>
    </div>

    <div class="ml-auto flex items-center gap-2 sm:gap-3">
      <div class="relative hidden md:block">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search admin..." class="h-9 w-52 pl-9 lg:w-64" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline" size="icon" class="relative size-9">
            <Bell class="size-4" />
            <span class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground ring-2 ring-background">
              3
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div
            v-for="n in notifications"
            :key="n.title"
            class="flex items-start gap-3 px-2 py-2.5"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-lg" :class="n.tone">
              <Bell class="size-4" />
            </span>
            <div class="min-w-0">
              <p class="text-sm font-medium">{{ n.title }}</p>
              <p class="text-xs text-muted-foreground">{{ n.time }}</p>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button type="button" class="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar class="size-9">
              <AvatarFallback class="bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-semibold text-white">
                AD
              </AvatarFallback>
            </Avatar>
            <span class="hidden text-left leading-tight sm:block">
              <span class="block text-sm font-semibold">Admin</span>
              <span class="block flex items-center gap-1 text-xs text-muted-foreground">
                <ShieldCheck class="size-3" /> Super admin
              </span>
            </span>
            <ChevronDown class="hidden size-4 text-muted-foreground sm:block" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="$router.push('/admin')">Admin dashboard</DropdownMenuItem>
          <DropdownMenuItem @click="$router.push('/settings')">Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="$router.push('/')">Back to app</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>