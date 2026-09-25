<script setup lang="ts">
import {
  Captions,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Wrench,
  X,
  Zap,
} from '@lucide/vue'
import type { Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useLogout } from '@/composables/useLogout'

const route = useRoute()
const router = useRouter()
const { logout } = useLogout()

interface NavItem {
  label: string
  icon: Component
  to: string
}

const navGroups: { group: string; items: NavItem[] }[] = [
  {
    group: 'Workspace',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
      { label: 'Generate Subtitle', icon: Captions, to: '/generate-subtitle' },
      { label: 'Video Library', icon: FileVideo, to: '/library' },
      { label: 'History', icon: History, to: '/history' },
    ],
  },
  {
    group: 'Manage',
    items: [
      { label: 'Settings', icon: Wrench, to: '/settings' },
      { label: 'Help & Support', icon: HelpCircle, to: '/help' },
    ],
  },
]

const props = withDefaults(
  defineProps<{
    collapsed: boolean
    mobileOpen?: boolean
  }>(),
  { mobileOpen: false },
)

const emit = defineEmits<{
  'update:collapsed': [value: boolean]
  'close-mobile': []
}>()

const isActive = (path: string) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path)

const goHome = () => router.push('/')
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar shadow-sm transition-[width] duration-300 ease-in-out max-lg:-translate-x-full max-lg:bg-sidebar max-lg:shadow-2xl"
    :class="[
      collapsed ? 'lg:w-[76px]' : 'lg:w-64',
      mobileOpen ? 'max-lg:translate-x-0' : '',
    ]"
  >
    <!-- Logo -->
    <div
      class="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4"
      :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
    >
      <!-- Logo: clickable home + hover-reveal expand toggle when collapsed -->
      <div
        class="group/logo relative flex min-w-0 items-center"
        :class="collapsed ? 'lg:justify-center lg:px-1' : ''"
      >
        <button
          type="button"
          class="flex min-w-0 items-center gap-2.5"
          :class="collapsed ? 'lg:justify-center' : ''"
          @click="goHome"
        >
          <span
            class="brand-gradient grid size-9 shrink-0 place-items-center rounded-xl text-white shadow-sm transition-opacity"
            :class="collapsed ? 'lg:group-hover/logo:opacity-30' : ''"
          >
            <Sparkles class="size-5" />
          </span>

          <Transition name="fade">
            <span
              v-if="!collapsed"
              class="truncate text-lg font-bold tracking-tight text-sidebar-foreground"
            >
              Vue<span class="text-primary">Subs</span>
            </span>
          </Transition>
        </button>

        <Transition name="fade">
          <button
            v-if="collapsed"
            type="button"
            class="absolute inset-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground opacity-0 ring-1 ring-border transition-all hover:bg-accent hover:text-foreground lg:grid lg:group-hover/logo:opacity-100"
            title="Expand sidebar"
            aria-label="Expand sidebar"
            @click="emit('update:collapsed', false)"
          >
            <ChevronRight class="size-4" />
          </button>
        </Transition>
      </div>

      <!-- Collapse toggle (expanded, desktop only) -->
      <button
        v-if="!collapsed"
        type="button"
        class="ml-auto hidden size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:grid"
        title="Collapse sidebar"
        aria-label="Collapse sidebar"
        @click="emit('update:collapsed', true)"
      >
        <ChevronLeft class="size-4" />
      </button>

      <button
        type="button"
        class="ml-auto grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Close menu"
        @click="emit('close-mobile')"
      >
        <X class="size-5" />
      </button>
    </div>

    <!-- Upgrade banner -->
    <Transition name="fade">
      <div
        v-if="!collapsed"
        class="mx-3 mt-4 flex items-center gap-2.5 rounded-xl bg-indigo-50 p-3 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:ring-indigo-500/20"
      >
        <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-500 text-white">
          <Zap class="size-4" />
        </span>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-indigo-600 dark:text-indigo-300">Pro plan</p>
          <p class="truncate text-xs text-muted-foreground">Unlimited subtitles</p>
        </div>
      </div>
    </Transition>

    <!-- Nav -->
    <nav class="mt-2 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
      <div v-for="group in navGroups" :key="group.group" class="mb-4">
        <Transition name="fade">
          <p
            v-if="!collapsed"
            class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {{ group.group }}
          </p>
        </Transition>

        <div class="space-y-1">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            :title="collapsed ? item.label : undefined"
            class="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            :class="[
              isActive(item.to)
                ? 'bg-sidebar-accent font-semibold text-sidebar-primary'
                : '',
              collapsed ? 'lg:justify-center lg:px-0' : '',
            ]"
            @click="emit('close-mobile')"
          >
            <component :is="item.icon" class="size-[18px] shrink-0" />
            <Transition name="fade">
              <span v-if="!collapsed">{{ item.label }}</span>
            </Transition>
            <span
              v-if="!collapsed && isActive(item.to)"
              class="ml-auto size-1.5 rounded-full bg-primary"
            />
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom -->
    <div class="border-t border-sidebar-border p-3">
      <button
        type="button"
        class="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
        :class="collapsed ? 'lg:justify-center lg:px-0' : ''"
        :title="collapsed ? 'Log out' : undefined"
        @click="logout"
      >
        <LogOut class="size-[18px] shrink-0" />
        <Transition name="fade">
          <span v-if="!collapsed">Log out</span>
        </Transition>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>