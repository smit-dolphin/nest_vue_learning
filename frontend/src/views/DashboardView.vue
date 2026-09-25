<script setup lang="ts">
import {
  ArrowDownRight,
  ArrowUpRight,
  Captions,
  CheckCircle2,
  Clock,
  FileVideo,
  Globe2,
  MoreHorizontal,
  Play,
  Sparkles,
  TrendingUp,
  Zap,
} from '@lucide/vue'
import { ArrowRight } from '@lucide/vue'

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

const stats = [
  { label: 'Total Subtitles', value: '1,284', change: '+12.5%', trend: 'up', icon: Captions, tone: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-400' },
  { label: 'Hours Processed', value: '186h', change: '+8.2%', trend: 'up', icon: Clock, tone: 'text-sky-600 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-400' },
  { label: 'Accuracy Rate', value: '97.4%', change: '+1.1%', trend: 'up', icon: TrendingUp, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { label: 'Completed Today', value: '42', change: '-3.4%', trend: 'down', icon: CheckCircle2, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-400' },
]

const jobs = [
  { id: 1, title: 'product_demo_final.mp4', lang: 'English (en)', duration: '04:32', status: 'done', time: '2h ago' },
  { id: 2, title: 'interview_long.mp4', lang: 'Spanish (es)', duration: '12:08', status: 'processing', time: '45m ago' },
  { id: 3, title: 'podcast_ep_12.mkv', lang: 'French (fr)', duration: '38:21', status: 'queued', time: '20m ago' },
  { id: 4, title: 'tutorial_cut_03.mp4', lang: 'German (de)', duration: '08:47', status: 'done', time: '1d ago' },
]

const statusStyles: Record<string, string> = {
  done: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  queued: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
}

const languages = [
  { name: 'English', pct: 56, color: 'bg-indigo-500' },
  { name: 'Spanish', pct: 22, color: 'bg-sky-500' },
  { name: 'French', pct: 14, color: 'bg-emerald-500' },
  { name: 'German', pct: 8, color: 'bg-amber-500' },
]
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