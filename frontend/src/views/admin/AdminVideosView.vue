<script setup lang="ts">
import { Eye, FileVideo, Search, Trash2 } from '@lucide/vue'

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

const videos = [
  { id: 'v_10428', thumb: 'from-indigo-500 to-sky-400', title: 'product_demo_final.mp4', owner: { initials: 'AP', name: 'Aarav Patel' }, duration: '04:32', size: '48.1 MB', status: 'ready', uploaded: '2h ago' },
  { id: 'v_10427', thumb: 'from-emerald-500 to-teal-400', title: 'interview_long.mp4', owner: { initials: 'RJ', name: 'Riya Joshi' }, duration: '12:08', size: '152 MB', status: 'processing', uploaded: '45m ago' },
  { id: 'v_10426', thumb: 'from-amber-500 to-orange-400', title: 'podcast_ep_12.mkv', owner: { initials: 'MK', name: 'Manav Kulkarni' }, duration: '38:21', size: '1.2 GB', status: 'processing', uploaded: '20m ago' },
  { id: 'v_10425', thumb: 'from-sky-500 to-cyan-400', title: 'tutorial_cut_03.mp4', owner: { initials: 'SD', name: 'Sara Dsouza' }, duration: '08:47', size: '92 MB', status: 'ready', uploaded: '1d ago' },
  { id: 'v_10424', thumb: 'from-purple-500 to-fuchsia-400', title: 'marketing_reel_01.mp4', owner: { initials: 'VP', name: 'Vivek Patil' }, duration: '00:42', size: '9.8 MB', status: 'failed', uploaded: '1d ago' },
  { id: 'v_10423', thumb: 'from-rose-500 to-pink-400', title: 'webinar_feb_s2.mp4', owner: { initials: 'NA', name: 'Nisha Agarwal' }, duration: '1:02:14', size: '684 MB', status: 'ready', uploaded: '2d ago' },
]

const statusStyles: Record<string, string> = {
  ready: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  failed: 'text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15',
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="FileVideo"
      title="Videos"
      subtitle="Monitor all uploaded media across the platform"
      gradient="bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sky-500/30"
    >
      <Button variant="outline" class="gap-2">
        <Eye class="size-4" />
        Review flagged
      </Button>
    </PageHeader>

    <Card>
      <CardHeader class="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>All videos</CardTitle>
          <CardDescription>52,891 media files stored</CardDescription>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search videos..." class="h-9 w-56 pl-9" />
          </div>
          <Button variant="outline" size="sm">Filter</Button>
        </div>
      </CardHeader>
      <CardContent class="overflow-x-auto p-0">
        <table class="w-full min-w-[760px] text-sm">
          <thead>
            <tr class="border-b border-border/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th class="px-5 py-3 font-semibold">Video</th>
              <th class="px-5 py-3 font-semibold">Owner</th>
              <th class="px-5 py-3 font-semibold">Duration</th>
              <th class="px-5 py-3 font-semibold">Size</th>
              <th class="px-5 py-3 font-semibold">Status</th>
              <th class="px-5 py-3 font-semibold">Uploaded</th>
              <th class="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/60">
            <tr v-for="v in videos" :key="v.id" class="transition-colors hover:bg-accent/40">
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white" :class="v.thumb">
                    <FileVideo class="size-5" />
                  </span>
                  <div class="min-w-0 leading-tight">
                    <p class="max-w-48 truncate font-semibold">{{ v.title }}</p>
                    <p class="text-xs text-muted-foreground">{{ v.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <Avatar class="size-7">
                    <AvatarFallback class="bg-indigo-100 text-xs text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">{{ v.owner.initials }}</AvatarFallback>
                  </Avatar>
                  <span class="text-xs">{{ v.owner.name }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 text-xs">{{ v.duration }}</td>
              <td class="px-5 py-3.5 text-xs text-muted-foreground">{{ v.size }}</td>
              <td class="px-5 py-3.5">
                <Badge variant="outline" :class="statusStyles[v.status]">{{ v.status }}</Badge>
              </td>
              <td class="px-5 py-3.5 text-xs text-muted-foreground">{{ v.uploaded }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="Preview video"
                  >
                    <Eye class="size-4" />
                  </button>
                  <button
                    class="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    title="Delete video"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  </div>
</template>