<script setup lang="ts">
import {
  ArrowUpRight,
  FileVideo,
  LayoutDashboard,
  ListChecks,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from '@lucide/vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const stats = [
  { label: 'Total Users', value: '18,402', change: '+12.5%', icon: Users, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-400', chart: [40, 60, 45, 70, 55, 80, 75, 90] },
  { label: 'Total Videos', value: '52,891', change: '+8.2%', icon: FileVideo, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-400', chart: [30, 50, 60, 45, 70, 65, 80, 85] },
  { label: 'Subtitle Jobs', value: '128,473', change: '+21.1%', icon: ListChecks, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400', chart: [50, 40, 65, 75, 60, 85, 70, 95] },
  { label: 'Storage Used', value: '6.4 TB', change: '-3.4%', icon: Zap, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400', chart: [80, 70, 75, 60, 65, 55, 60, 50] },
]

const weeklyActivity = [
  { label: 'Mon', value: 62 },
  { label: 'Tue', value: 78 },
  { label: 'Wed', value: 51 },
  { label: 'Thu', value: 88 },
  { label: 'Fri', value: 70 },
  { label: 'Sat', value: 43 },
  { label: 'Sun', value: 66 },
]

const recentUsers = [
  { initials: 'AP', name: 'Aarav Patel', email: 'aarav.patel@gmail.com', role: 'USER', joined: '5m ago' },
  { initials: 'RJ', name: 'Riya Joshi', email: 'riya.joshi@outlook.com', role: 'USER', joined: '22m ago' },
  { initials: 'MK', name: 'Manav Kulkarni', email: 'manav.k@gmail.com', role: 'USER', joined: '1h ago' },
  { initials: 'SD', name: 'Sara Dsouza', email: 'sara.d@yahoo.com', role: 'ADMIN', joined: '3h ago' },
]

const pendingJobs = [
  { title: 'product_demo_final.mp4', user: 'Aarav Patel', status: 'processing', pct: 64 },
  { title: 'interview_long.mp4', user: 'Riya Joshi', status: 'queued', pct: 0 },
  { title: 'podcast_ep_12.mkv', user: 'Manav Kulkarni', status: 'processing', pct: 82 },
]

const statusStyles: Record<string, string> = {
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  queued: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
}
</script>

<template>
  <div class="space-y-6">
    <div class="relative overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-indigo-500/10">
      <div class="absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/40 blur-3xl" />
      <div class="absolute -bottom-24 right-24 size-56 rounded-full bg-sky-500/30 blur-3xl" />
      <div class="relative flex flex-col gap-6 p-6 sm:p-8">
        <div class="max-w-xl">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <ShieldCheck class="size-3.5 text-sky-300" />
            Platform overview
          </span>
          <h2 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, Admin 👋</h2>
          <p class="mt-2 text-sm leading-relaxed text-white/70">
            Here's what's happening across VueSubs right now. All systems operational.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <Button as-child class="bg-white text-slate-900 hover:bg-white/90">
            <router-link to="/admin/users" class="gap-2">
              <Users class="size-4" />
              Manage users
            </router-link>
          </Button>
          <Button as-child variant="outline" class="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
            <router-link to="/admin/jobs" class="gap-2">
              <ListChecks class="size-4" />
              View jobs
            </router-link>
          </Button>
        </div>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="s in stats" :key="s.label">
        <CardContent class="p-5">
          <div class="flex items-start justify-between">
            <span class="grid size-10 place-items-center rounded-xl" :class="s.tone">
              <component :is="s.icon" class="size-5" />
            </span>
            <Badge variant="outline" class="gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp class="size-3" /> {{ s.change }}
            </Badge>
          </div>
          <p class="mt-4 text-2xl font-bold tracking-tight">{{ s.value }}</p>
          <p class="text-sm text-muted-foreground">{{ s.label }}</p>
          <div class="mt-3 flex h-10 items-end gap-1">
            <span
              v-for="(v, i) in s.chart"
              :key="i"
              class="flex-1 rounded-sm bg-primary/10"
              :style="{ height: `${v}%` }"
            />
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Activity chart -->
      <Card class="lg:col-span-2">
        <CardHeader class="flex-row items-start justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <LayoutDashboard class="size-4 text-primary" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Subtitle jobs executed over the last 7 days</CardDescription>
          </div>
          <Badge variant="outline">This week</Badge>
        </CardHeader>
        <CardContent>
          <div class="flex h-48 items-end gap-3">
            <div
              v-for="d in weeklyActivity"
              :key="d.label"
              class="flex flex-1 flex-col items-center gap-2"
            >
              <div class="flex w-full flex-1 items-end rounded-lg bg-muted/40">
                <div
                  class="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-sky-400"
                  :style="{ height: `${d.value}%` }"
                />
              </div>
              <span class="text-xs text-muted-foreground">{{ d.label }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pending jobs -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Sparkles class="size-4 text-primary" />
            Live Jobs
          </CardTitle>
          <CardDescription>Currently running subtitle generation</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="job in pendingJobs" :key="job.title" class="space-y-2">
            <div class="flex items-center justify-between gap-2">
              <p class="truncate text-sm font-medium">{{ job.title }}</p>
              <Badge variant="outline" :class="statusStyles[job.status]">{{ job.status }}</Badge>
            </div>
            <p class="text-xs text-muted-foreground">{{ job.user }}</p>
            <div class="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                :style="{ width: `${job.pct}%` }"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Recent users -->
      <Card class="lg:col-span-2">
        <CardHeader class="flex-row items-start justify-between">
          <div>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Newest accounts across the platform</CardDescription>
          </div>
          <Button as-child variant="outline" size="sm" class="gap-1.5">
            <router-link to="/admin/users" class="gap-1.5">
              View all <ArrowUpRight class="size-3.5" />
            </router-link>
          </Button>
        </CardHeader>
        <CardContent class="divide-y">
          <div v-for="u in recentUsers" :key="u.email" class="flex items-center gap-3 py-3">
            <Avatar class="size-9">
              <AvatarFallback class="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">{{ u.initials }}</AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold">{{ u.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ u.email }}</p>
            </div>
            <Badge variant="outline" class="capitalize">{{ u.role.toLowerCase() }}</Badge>
            <span class="hidden text-xs text-muted-foreground sm:block">{{ u.joined }}</span>
          </div>
        </CardContent>
      </Card>

      <!-- Storage card -->
      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>Cloud media usage</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <div class="flex items-end justify-between">
              <p class="text-2xl font-bold tracking-tight">6.4 TB</p>
              <p class="text-xs text-muted-foreground">of 8 TB</p>
            </div>
            <div class="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
              <div class="h-full w-[80%] rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" />
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Videos</span>
              <span class="font-medium">4.8 TB</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Subtitles</span>
              <span class="font-medium">1.1 TB</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Profile images</span>
              <span class="font-medium">0.5 TB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>