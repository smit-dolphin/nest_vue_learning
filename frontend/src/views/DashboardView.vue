<script setup lang="ts">
import {
  ArrowDownRight,
  ArrowUpRight,
  Captions,
  CheckCircle2,
  Clock,
  FileVideo,
  Globe2,
  Loader2,
  MoreHorizontal,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from '@lucide/vue'
import { ArrowRight } from '@lucide/vue'
import { onMounted, ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getDashboard } from '@/services/dashboardService'
import type { DashboardData } from '@/types'

const loading = ref(false)
const stats = ref<Array<{ label: string; value: string; change: string; trend: 'up' | 'down'; icon: any; tone: string }>>([])
const jobs = ref<Array<{ id: number; title: string; lang: string; duration: string; status: string; time: string }>>([])
const languages = ref<Array<{ name: string; pct: number; color: string }>>([])

const statusStyles: Record<string, string> = {
  done: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  queued: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
}

const statIcons: Record<string, any> = {
  totalSubtitles: Captions,
  hoursProcessed: Clock,
  accuracyRate: TrendingUp,
  completedToday: CheckCircle2,
}

const statTones: Record<string, string> = {
  totalSubtitles: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-400',
  hoursProcessed: 'text-sky-600 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-400',
  accuracyRate: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400',
  completedToday: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400',
}

const formatValue = (key: string, value: number): string => {
  if (key === 'hoursProcessed') return `${value}h`
  if (key === 'accuracyRate') return `${value}%`
  if (key === 'completedToday') return String(value)
  return value.toLocaleString()
}

const fetchDashboard = async () => {
  loading.value = true
  try {
    const data: DashboardData = await getDashboard()

    stats.value = data.stats.map((stat) => ({
      label: stat.label,
      value: formatValue(stat.key, stat.value),
      change: stat.change,
      trend: stat.trend,
      icon: statIcons[stat.key] || Clock,
      tone: statTones[stat.key] || 'text-muted-foreground bg-muted dark:text-muted-foreground',
    }))

    jobs.value = data.recentJobs.map((job, index) => ({
      id: index + 1,
      title: job.title,
      lang: job.lang,
      duration: job.duration,
      status: job.status,
      time: job.time,
    }))

    const maxPct = Math.max(...data.languages.map((l) => l.pct))
    languages.value = data.languages.map((lang) => ({
      name: lang.name,
      pct: lang.pct,
      color: lang.pct === maxPct ? 'bg-indigo-500' : 'bg-muted-foreground',
    }))
  } catch {
    // Error is toasted by the Axios interceptor
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-3xl bg-[oklch(0.19_0.035_278)] text-white shadow-xl shadow-indigo-500/10">
      <div class="absolute -right-16 -top-16 size-64 rounded-full bg-indigo-500/40 blur-3xl" />
      <div class="absolute -bottom-24 right-24 size-56 rounded-full bg-sky-500/30 blur-3xl" />
      <div class="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="max-w-xl">
          <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
            <Sparkles class="size-3.5 text-indigo-300" />
            AI-Powered Subtitle Engine
          </span>
          <h2 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, Smit <span class="animate-pulse">👋</span>
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-white/70">
            Everything is running smoothly. Here's a snapshot of your subtitle activity.
          </p>
          <div class="mt-5 flex flex-wrap gap-3">
            <Button as-child class="bg-white text-slate-900 hover:bg-white/90">
              <router-link to="/generate-subtitle" class="gap-2">
                <Zap class="size-4" />
                Generate Subtitles
              </router-link>
            </Button>
            <Button as-child variant="ghost" class="text-white hover:bg-white/10 hover:text-white">
              <router-link to="/library" class="gap-2">
                <FileVideo class="size-4" />
                View Library
              </router-link>
            </Button>
          </div>
        </div>
        <div class="hidden shrink-0 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:block">
          <div class="flex items-center gap-3">
            <span class="grid size-11 place-items-center rounded-xl bg-indigo-500 text-white">
              <Captions class="size-5" />
            </span>
            <div>
              <p class="text-sm font-semibold">Subtitle Engine</p>
              <p class="flex items-center gap-1.5 text-xs text-emerald-300">
                <span class="size-2 animate-pulse rounded-full bg-emerald-400" /> Active
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label" class="transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent class="p-5">
          <div class="flex items-center justify-between">
            <span class="grid size-10 place-items-center rounded-xl" :class="stat.tone">
              <component :is="stat.icon" class="size-5" />
            </span>
            <Badge
              variant="outline"
              class="gap-1 font-medium"
              :class="stat.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
            >
              <ArrowUpRight v-if="stat.trend === 'up'" class="size-3" />
              <ArrowDownRight v-else class="size-3" />
              {{ stat.change }}
            </Badge>
          </div>
          <p class="mt-4 text-3xl font-bold tracking-tight">{{ stat.value }}</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ stat.label }}</p>
          <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div class="brand-gradient h-full rounded-full opacity-90" style="width: 60%" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Recent jobs -->
      <Card class="xl:col-span-2">
        <CardHeader class="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>Latest subtitle generation tasks</CardDescription>
          </div>
          <Button as-child variant="ghost" size="sm" class="gap-1">
            <router-link to="/history" class="gap-1">
              View all
              <ArrowRight class="size-3.5" />
            </router-link>
          </Button>
        </CardHeader>
        <CardContent class="p-0 sm:p-0">
          <div v-if="loading" class="flex items-center justify-center gap-2 rounded-2xl border py-16 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" />
            Loading dashboard...
          </div>
          <template v-else>
            <div class="hidden grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] gap-3 border-y bg-muted/50 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
              <span>File</span>
              <span>Language</span>
              <span>Duration</span>
              <span>Status</span>
              <span>Time</span>
              <span />
            </div>
            <div
              v-for="job in jobs"
              :key="job.id"
              class="grid grid-cols-1 items-center gap-2 border-b px-5 py-3 transition-colors last:border-0 hover:bg-accent/40 sm:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto] sm:gap-3"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <span class="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                  <Play class="size-3" />
                </span>
                <span class="truncate text-sm font-medium">{{ job.title }}</span>
              </div>
              <span class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Globe2 class="size-3.5 shrink-0" /> {{ job.lang }}
              </span>
              <span class="text-sm text-muted-foreground">{{ job.duration }}</span>
              <span>
                <Badge variant="outline" class="capitalize" :class="statusStyles[job.status]">
                  {{ job.status }}
                </Badge>
              </span>
              <span class="text-sm text-muted-foreground">{{ job.time }}</span>
              <button type="button" class="grid size-7 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
                <MoreHorizontal class="size-4" />
              </button>
            </div>
          </template>
        </CardContent>
      </Card>

      <!-- Language breakdown -->
      <Card>
        <CardHeader>
          <CardTitle>Language Breakdown</CardTitle>
          <CardDescription>Top languages this month</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div v-for="lang in languages" :key="lang.name">
            <div class="mb-1.5 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2 font-medium">
                <span class="size-2.5 rounded-full" :class="lang.color" />
                {{ lang.name }}
              </span>
              <span class="font-semibold text-muted-foreground">{{ lang.pct }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-muted">
              <div class="h-full rounded-full transition-all" :class="lang.color" :style="{ width: lang.pct + '%' }" />
            </div>
          </div>

          <Separator />

          <div class="flex items-center justify-between rounded-xl bg-muted/50 p-4">
            <div class="flex items-center gap-3">
              <Avatar class="size-10">
                <AvatarFallback class="brand-gradient text-xs font-bold text-white">ENG</AvatarFallback>
              </Avatar>
              <div>
                <p class="text-sm font-semibold">Most used language</p>
                <p class="text-xs text-muted-foreground">English · 714 subtitles</p>
              </div>
            </div>
            <ArrowUpRight class="size-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>