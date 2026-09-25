<script setup lang="ts">
import { ListChecks, RefreshCw, Search } from '@lucide/vue'

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
import { Input } from '@/components/ui/input'
import PageHeader from '@/components/layout/PageHeader.vue'

const jobs = [
  { id: '#JOB-8492', video: 'product_demo_final.mp4', user: { initials: 'AP', name: 'Aarav Patel' }, status: 'processing', pct: 64, updated: '2m ago' },
  { id: '#JOB-8491', video: 'interview_long.mp4', user: { initials: 'RJ', name: 'Riya Joshi' }, status: 'processing', pct: 27, updated: '8m ago' },
  { id: '#JOB-8490', video: 'podcast_ep_12.mkv', user: { initials: 'MK', name: 'Manav Kulkarni' }, status: 'queued', pct: 0, updated: '12m ago' },
  { id: '#JOB-8489', video: 'tutorial_cut_03.mp4', user: { initials: 'SD', name: 'Sara Dsouza' }, status: 'completed', pct: 100, updated: '28m ago' },
  { id: '#JOB-8488', video: 'webinar_feb_s2.mp4', user: { initials: 'NA', name: 'Nisha Agarwal' }, status: 'failed', pct: 41, updated: '1h ago' },
  { id: '#JOB-8487', video: 'marketing_reel_01.mp4', user: { initials: 'VP', name: 'Vivek Patil' }, status: 'completed', pct: 100, updated: '2h ago' },
]

const statusStyles: Record<string, string> = {
  completed: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  queued: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
  failed: 'text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15',
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="ListChecks"
      title="Subtitle Jobs"
      subtitle="Track subtitle generation work across all users"
      gradient="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30"
    >
      <Button variant="outline" class="gap-2">
        <RefreshCw class="size-4" />
        Refresh
      </Button>
    </PageHeader>

    <Card>
      <CardHeader class="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Active queue</CardTitle>
          <CardDescription>128,473 lifetime jobs · 14 currently running</CardDescription>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search jobs..." class="h-9 w-56 pl-9" />
          </div>
          <Button variant="outline" size="sm">Filter</Button>
        </div>
      </CardHeader>
      <CardContent class="overflow-x-auto p-0">
        <table class="w-full min-w-[720px] text-sm">
          <thead>
            <tr class="border-b border-border/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th class="px-5 py-3 font-semibold">Job</th>
              <th class="px-5 py-3 font-semibold">Video</th>
              <th class="px-5 py-3 font-semibold">Owner</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 font-semibold">Progress</th>
              <th class="px-5 py-3 font-semibold">Updated</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr v-for="job in jobs" :key="job.id" class="transition-colors hover:bg-accent/40">
              <td class="px-5 py-3.5">
                <span class="font-mono text-xs font-semibold text-primary">{{ job.id }}</span>
              </td>
              <td class="max-w-48 truncate px-5 py-3.5 font-medium">{{ job.video }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <Avatar class="size-7">
                    <AvatarFallback class="bg-indigo-100 text-xs text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">{{ job.user.initials }}</AvatarFallback>
                  </Avatar>
                  <span class="text-xs">{{ job.user.name }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <Badge variant="outline" :class="statusStyles[job.status]">{{ job.status }}</Badge>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex w-32 items-center gap-2">
                  <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"
                      :class="job.status === 'failed' ? 'bg-gradient-to-r from-red-500 to-rose-400' : ''"
                      :style="{ width: `${job.pct}%` }"
                    />
                  </div>
                  <span class="w-8 text-right text-xs text-muted-foreground">{{ job.pct }}%</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs text-muted-foreground">{{ job.updated }}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
</template>