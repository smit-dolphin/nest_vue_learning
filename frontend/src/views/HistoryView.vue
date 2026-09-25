<script setup lang="ts">
import {
  CalendarDays,
  Captions,
  CheckCircle2,
  Clock,
  Download,
  History,
  MoreHorizontal,
  RotateCcw,
  Search,
  Trash2,
  TrendingUp,
} from '@lucide/vue'
import { computed, ref } from 'vue'

import FilterPopover from '@/components/common/FilterPopover.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const summary = [
  { label: 'Total jobs', value: '248', icon: Captions, tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' },
  { label: 'Completed', value: '231', icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { label: 'Avg. accuracy', value: '97.8%', icon: TrendingUp, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
  { label: 'Processed', value: '48h', icon: Clock, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
]

const filters = ['ALL', 'COMPLETED', 'PROCESSING', 'PENDING', 'FAILED']
const activeFilter = 'ALL'

const jobs = [
  { id: 1, title: 'product_demo_final.mp4', lang: 'English', duration: '04:32', status: 'done', time: '2 min ago', segments: 142 },
  { id: 2, title: 'interview_long.mp4', lang: 'Spanish', duration: '12:08', status: 'processing', time: '45 min ago', segments: 0 },
  { id: 3, title: 'podcast_ep_12.mkv', lang: 'French', duration: '38:21', status: 'done', time: '3 h ago', segments: 512 },
  { id: 4, title: 'tutorial_cut_03.mp4', lang: 'German', duration: '08:47', status: 'failed', time: 'Yesterday', segments: 0 },
  { id: 5, title: 'wedding_highlights.webm', lang: 'English', duration: '15:03', status: 'done', time: 'Yesterday', segments: 268 },
]

const statusMeta: Record<string, { label: string; cls: string; dot: string }> = {
  done: { label: 'done', cls: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
  processing: { label: 'processing', cls: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15', dot: 'bg-sky-500' },
  failed: { label: 'failed', cls: 'text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15', dot: 'bg-red-500' },
}

const historyPage = ref(1)
const historyLimit = ref(10)
const historyTotal = ref(248)
const languageFilter = ref('')

const historyTotalPages = computed(() => Math.max(1, Math.ceil(historyTotal.value / historyLimit.value)))
const activeFilterCount = computed(() => (languageFilter.value ? 1 : 0))

const clearFilters = () => {
  languageFilter.value = ''
  historyPage.value = 1
}

const handleHistoryLimit = (value: number) => {
  historyLimit.value = value
  historyPage.value = 1
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="History"
      title="History"
      subtitle="All your subtitle generation jobs"
      gradient="bg-gradient-to-br from-fuchsia-500 to-rose-500 shadow-rose-500/30"
    >
      <Button variant="outline" class="gap-2 text-destructive">
        <Trash2 class="size-4" />
        Clear all
      </Button>
    </PageHeader>

    <!-- Summary -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="item in summary" :key="item.label" class="flex items-center gap-3 rounded-2xl border bg-card p-4">
        <span class="grid size-10 shrink-0 place-items-center rounded-xl" :class="item.tone">
          <component :is="item.icon" class="size-5" />
        </span>
        <div>
          <p class="text-xl font-bold leading-none">{{ item.value }}</p>
          <p class="mt-1 text-xs text-muted-foreground">{{ item.label }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search history..." class="pl-9" />
      </div>
      <div class="ml-auto flex gap-1.5 overflow-x-auto rounded-xl border bg-card p-1">
        <button v-for="f in filters" :key="f" type="button"
          class="whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          :class="f === activeFilter ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'">
          {{ f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase() }}
        </button>
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="filter-language">Language</label>
          <select id="filter-language" v-model="languageFilter">
            <option value="">All languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </FilterPopover>
    </div>

    <!-- Timeline -->
    <div class="space-y-8">
      <div>
        <div class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays class="size-4" />
          Today
          <span class="rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium normal-case">3 jobs</span>
        </div>
        <div class="space-y-3 border-l-2 pl-6">
          <div v-for="job in jobs.slice(0, 3)" :key="job.id" class="relative">
            <span class="absolute -left-[31px] top-5 size-3 rounded-full ring-4 ring-background" :class="statusMeta[job.status].dot" />
            <div class="rounded-2xl border bg-card p-4 transition-colors hover:border-border hover:shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ job.title }}</p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1"><Clock class="size-3.5" /> {{ job.duration }}</span>
                    <span>{{ job.lang }}</span>
                    <span v-if="job.segments" class="flex items-center gap-1"><Captions class="size-3.5" /> {{ job.segments }} segments</span>
                    <span class="flex items-center gap-1"><TrendingUp class="size-3.5" /> 98%</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <Badge variant="outline" class="capitalize" :class="statusMeta[job.status].cls">
                    {{ statusMeta[job.status].label }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">{{ job.time }}</span>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" class="gap-1.5" :disabled="job.status !== 'done'">
                  <Download class="size-3.5" /> Download
                </Button>
                <Button variant="outline" size="sm" class="gap-1.5" :disabled="job.status === 'processing'">
                  <RotateCcw class="size-3.5" /> Regenerate
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="size-8 ml-auto">
                      <MoreHorizontal class="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuItem class="gap-2 text-destructive">
                      <Trash2 class="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CalendarDays class="size-4" />
          Yesterday
          <span class="rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium normal-case">2 jobs</span>
        </div>
        <div class="space-y-3 border-l-2 pl-6">
          <div v-for="job in jobs.slice(3)" :key="job.id" class="relative">
            <span class="absolute -left-[31px] top-5 size-3 rounded-full ring-4 ring-background" :class="statusMeta[job.status].dot" />
            <div class="rounded-2xl border bg-card p-4 transition-colors hover:shadow-sm">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">{{ job.title }}</p>
                  <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span class="flex items-center gap-1"><Clock class="size-3.5" /> {{ job.duration }}</span>
                    <span>{{ job.lang }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <Badge variant="outline" class="capitalize" :class="statusMeta[job.status].cls">
                    {{ statusMeta[job.status].label }}
                  </Badge>
                  <span class="text-xs text-muted-foreground">{{ job.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <PaginationBar
      v-model:page="historyPage"
      :limit="historyLimit"
      :total-pages="historyTotalPages"
      :total-data="historyTotal"
      :per-page-options="[10, 25, 50]"
      @update:limit="handleHistoryLimit"
    />
  </div>
</template>