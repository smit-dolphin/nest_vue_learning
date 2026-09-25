<script setup lang="ts">
import {
  Clapperboard,
  Download,
  FileVideo,
  Film,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from '@lucide/vue'
import { computed, ref } from 'vue'

import FilterPopover from '@/components/common/FilterPopover.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const viewMode = ref<'grid' | 'list'>('grid')
const page = ref(1)
const pageSize = ref(4)
const fromDate = ref('')
const toDate = ref('')

const videos = [
  { id: 1, title: 'product_demo_final.mp4', type: 'MP4', duration: '04:32', size: '128 MB', status: 'done', date: 'Sep 24, 2026', thumb: 'from-indigo-500 to-violet-500' },
  { id: 2, title: 'interview_long.mp4', type: 'MP4', duration: '12:08', size: '312 MB', status: 'processing', date: 'Sep 24, 2026', thumb: 'from-sky-500 to-cyan-500' },
  { id: 3, title: 'podcast_ep_12.mkv', type: 'MKV', duration: '38:21', size: '890 MB', status: 'done', date: 'Sep 23, 2026', thumb: 'from-emerald-500 to-teal-500' },
  { id: 4, title: 'tutorial_cut_03.mp4', type: 'MP4', duration: '08:47', size: '210 MB', status: 'queued', date: 'Sep 23, 2026', thumb: 'from-amber-500 to-orange-500' },
  { id: 5, title: 'wedding_highlights.webm', type: 'WEBM', duration: '15:03', size: '340 MB', status: 'done', date: 'Sep 22, 2026', thumb: 'from-rose-500 to-pink-500' },
  { id: 6, title: 'reel_timelapse.mkv', type: 'MKV', duration: '02:41', size: '96 MB', status: 'failed', date: 'Sep 21, 2026', thumb: 'from-violet-500 to-fuchsia-500' },
]

const statusStyles: Record<string, string> = {
  done: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  processing: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15',
  queued: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
  failed: 'text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15',
}

const pagedVideos = computed(() =>
  videos.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)
const totalPages = computed(() => Math.max(1, Math.ceil(videos.length / pageSize.value)))
const activeFilterCount = computed(() => Number(Boolean(fromDate.value)) + Number(Boolean(toDate.value)))

const clearFilters = () => {
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

const handleLimitChange = (value: number) => {
  pageSize.value = value
  page.value = 1
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="Film"
      title="Video Library"
      subtitle="Manage and preview all your uploaded videos"
    >
      <Button class="gap-2">
        <Plus class="size-4" />
        Upload video
      </Button>
    </PageHeader>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search videos..." class="pl-9" />
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="filter-from">From date</label>
          <input id="filter-from" v-model="fromDate" type="date" />
        </div>
        <div class="filter-field">
          <label for="filter-to">To date</label>
          <input id="filter-to" v-model="toDate" type="date" />
        </div>
      </FilterPopover>
      <div class="ml-auto flex rounded-xl border bg-card p-1">
        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg transition-colors"
          :class="viewMode === 'grid' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          title="Grid view"
          @click="viewMode = 'grid'"
        >
          <LayoutGrid class="size-4" />
        </button>
        <button
          type="button"
          class="grid size-8 place-items-center rounded-lg transition-colors"
          :class="viewMode === 'list' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          title="List view"
          @click="viewMode = 'list'"
        >
          <List class="size-4" />
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="video in pagedVideos"
        :key="video.id"
        class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="relative aspect-video overflow-hidden bg-gradient-to-br" :class="video.thumb">
          <div class="absolute inset-0 grid place-items-center">
            <span class="grid size-12 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <Clapperboard class="size-6" />
            </span>
          </div>
          <Badge
            variant="outline"
            class="absolute left-3 top-3 border-white/30 bg-white/15 capitalize text-white backdrop-blur-md"
          >
            {{ video.status }}
          </Badge>
          <span class="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 font-mono text-xs text-white">
            {{ video.duration }}
          </span>
        </div>

        <div class="flex items-center gap-3 p-4">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ video.title }}</p>
            <p class="mt-0.5 text-xs text-muted-foreground">
              {{ video.type }} · {{ video.size }} · {{ video.date }}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontal class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem class="gap-2">
                <Download class="size-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem class="gap-2">
                <FileVideo class="size-4" /> Subtitles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="gap-2 text-destructive">
                <Trash2 class="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- List -->
    <div v-else class="overflow-hidden rounded-2xl border bg-card">
      <div class="hidden grid-cols-[3fr_1fr_1.2fr_1fr_1.2fr_auto] gap-3 border-b bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
        <span>File</span>
        <span>Type</span>
        <span>Duration</span>
        <span>Status</span>
        <span>Date</span>
        <span />
      </div>
      <div v-for="video in pagedVideos" :key="video.id">
        <div class="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/40 lg:grid-cols-[3fr_1fr_1.2fr_1fr_1.2fr_auto]">
          <div class="flex min-w-0 items-center gap-3">
            <Avatar class="size-9 rounded-lg">
              <AvatarFallback class="rounded-lg bg-gradient-to-br text-xs text-white" :class="video.thumb">
                <Film class="size-4" />
              </AvatarFallback>
            </Avatar>
            <span class="truncate text-sm font-medium">{{ video.title }}</span>
          </div>
          <span class="hidden text-sm text-muted-foreground lg:block">{{ video.type }}</span>
          <span class="hidden font-mono text-sm text-muted-foreground lg:block">{{ video.duration }}</span>
          <span class="hidden lg:block">
            <Badge variant="outline" class="capitalize" :class="statusStyles[video.status]">
              {{ video.status }}
            </Badge>
          </span>
          <span class="hidden text-sm text-muted-foreground lg:block">{{ video.date }}</span>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontal class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-44">
              <DropdownMenuItem class="gap-2">
                <Download class="size-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem class="gap-2">
                <FileVideo class="size-4" /> Subtitles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="gap-2 text-destructive">
                <Trash2 class="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <PaginationBar
      v-model:page="page"
      :limit="pageSize"
      :total-pages="totalPages"
      :total-data="videos.length"
      :per-page-options="[4, 8, 16]"
      @update:limit="handleLimitChange"
    />
  </div>
</template>