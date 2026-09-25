<script setup lang="ts">
import {
  ArrowLeft,
  FileVideo,
  LayoutDashboard,
  ListChecks,
  Settings2,
  ShieldCheck,
  ShieldHalf,
  Users,
} from '@lucide/vue'
import type { Component } from 'vue'
import { useRoute } from 'vue-router'

defineEmits<{ 'close-mobile': [] }>()

const route = useRoute()

interface AdminNavItem {
  label: string
  icon: Component
  to: string
}

const navGroups: { group: string; items: AdminNavItem[] }[] = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/admin' }],
  },
  {
    group: 'Management',
    items: [
      { label: 'Users', icon: Users, to: '/admin/users' },
      { label: 'Videos', icon: FileVideo, to: '/admin/videos' },
      { label: 'Subtitle Jobs', icon: ListChecks, to: '/admin/jobs' },
    ],
  },
  {
    group: 'General',
    items: [{ label: 'Settings', icon: Settings2, to: '/admin/settings' }],
  },
]

const isActive = (path: string) =>
  path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-slate-950 text-slate-300 shadow-2xl max-lg:-translate-x-full max-lg:transition-transform max-lg:duration-300 lg:translate-x-0"
    :class="route.path.startsWith('/admin') ? 'lg:translate-x-0' : ''"
  >
    <!-- Brand -->
    <div class="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
      <span class="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/30">
        <ShieldHalf class="size-5" />
      </span>
      <span class="text-lg font-bold tracking-tight text-white">
        Vue<span class="text-sky-400">Subs</span>
        <span class="ml-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">Admin</span>
      </span>
    </div>

    <!-- Nav -->
    <nav class="mt-4 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2">
      <div v-for="group in navGroups" :key="group.group" class="mb-5">
        <p class="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {{ group.group }}
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            :class="isActive(item.to) ? 'bg-indigo-500/15 font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-500/30' : ''"
            @click="$emit('close-mobile')"
          >
            <component :is="item.icon" class="size-[18px] shrink-0" />
            {{ item.label }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom -->
    <div class="space-y-1 border-t border-white/10 p-3">
      <router-link
        to="/"
        class="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        @click="$emit('close-mobile')"
      >
        <ArrowLeft class="size-[18px] shrink-0" />
        Back to app
      </router-link>
      <div class="flex items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2">
        <span class="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 text-white">
          <ShieldCheck class="size-4" />
        </span>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-sm font-semibold text-white">Admin</p>
          <p class="truncate text-xs text-slate-500">Super administrator</p>
        </div>
      </div>
    </div>
  </aside>
</template>