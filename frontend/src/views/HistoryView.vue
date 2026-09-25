<script setup lang="ts">
import {
  CalendarDays,
  Captions,
  CheckCircle2,
  Clock,
  Download,
  History,
  Loader2,
  RotateCcw,
  Search,
  XCircle,
} from '@lucide/vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import FilterPopover from '@/components/common/FilterPopover.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDebouncedRef } from '@/composables/useDebounce'
import { LANGUAGES } from '@/constants/settings'
import { getJobs, type ListJobsQuery } from '@/services/jobService'
import type { JobStatus, SubtitleJob } from '@/types'

const router = useRouter()

const summary = reactive({
  total: 0,
  completed: 0,
  processing: 0,
  failed: 0,
})

const summaryCards = computed(() => [
  { label: 'Total jobs', value: String(summary.total), icon: Captions, tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' },
  { label: 'Completed', value: String(summary.completed), icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { label: 'Processing', value: String(summary.processing), icon: Clock, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
  { label: 'Failed', value: String(summary.failed), icon: XCircle, tone: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400' },
])

const filters = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const
const activeFilter = ref<(typeof filters)[number]>('ALL')

const jobs = ref<SubtitleJob[]>([])
const loading = ref(false)

const historyPage = ref(1)
const historyLimit = ref(10)
const historyTotal = ref(0)
const historyTotalPages = computed(() => Math.max(1, Math.ceil(historyTotal.value / historyLimit.value)))

const searchInput = ref('')
const searchQuery = useDebouncedRef(searchInput)
const languageFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const activeFilterCount = computed(
  () =>
    (languageFilter.value ? 1 : 0) +
    (dateFrom.value ? 1 : 0) +
    (dateTo.value ? 1 : 0),
)

const showFilterChip = (f: (typeof filters)[number]) =>
  f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()

const loadSummary = async () => {
  try {
    const [total, completed, processing, failed] = await Promise.all([
      getJobs({ page: 1, limit: 1 }),
      getJobs({ page: 1, limit: 1, status: 'COMPLETED' }),
      getJobs({ page: 1, limit: 1, status: 'PROCESSING' }),
      getJobs({ page: 1, limit: 1, status: 'FAILED' }),
    ])
    summary.total = total.meta.totalData
    summary.completed = completed.meta.totalData
    summary.processing = processing.meta.totalData
    summary.failed = failed.meta.totalData
  } catch {
    // Error is toasted by the Axios interceptor.
  }
}

const fetchJobs = async () => {
  loading.value = true
  try {
    const query: ListJobsQuery = {
      page: historyPage.value,
      limit: historyLimit.value,
    }
    if (activeFilter.value !== 'ALL') query.status = activeFilter.value
    if (searchQuery.value) query.search = searchQuery.value
    if (languageFilter.value) query.language = languageFilter.value
    if (dateFrom.value) query.from = new Date(`${dateFrom.value}T00:00:00`).toISOString()
    if (dateTo.value) query.to = new Date(`${dateTo.value}T23:59:59.999`).toISOString()

    const result = await getJobs(query)
    jobs.value = result.items
    historyTotal.value = result.meta.totalData
  } catch {
    // Error is toasted by the Axios interceptor.
  } finally {
    loading.value = false
  }
}

const reload = () => {
  historyPage.value = 1
  fetchJobs()
}

watch(searchQuery, () => {
  historyPage.value = 1
  fetchJobs()
})

const selectFilter = (f: (typeof filters)[number]) => {
  activeFilter.value = f
  reload()
}

const clearFilters = () => {
  searchInput.value = ''
  languageFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  activeFilter.value = 'ALL'
  reload()
}

const handleHistoryLimit = (value: number) => {
  historyLimit.value = value
  reload()
}

const statusMeta: Record<JobStatus, { label: string; cls: string; dot: string }> = {
  COMPLETED: { label: 'completed', cls: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15', dot: 'bg-emerald-500' },
  PROCESSING: { label: 'processing', cls: 'text-sky-600 dark:text-sky-400 border-sky-200 bg-sky-50 dark:border-sky-500/30 dark:bg-sky-500/15', dot: 'bg-sky-500' },
  PENDING: { label: 'pending', cls: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15', dot: 'bg-amber-500' },
  FAILED: { label: 'failed', cls: 'text-red-600 dark:text-red-400 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/15', dot: 'bg-red-500' },
}

const ageDays = (iso: string) => {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((startOfDay.getTime() - target.getTime()) / 86400000)
}

const dayLabel = (iso: string) => {
  const days = ageDays(iso)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

const groups = computed(() => {
  const map = new Map<string, SubtitleJob[]>()
  for (const job of jobs.value) {
    const key = new Date(job.createdAt).toDateString()
    const list = map.get(key) ?? []
    list.push(job)
    map.set(key, list)
  }
  return Array.from(map.entries()).map(([key, items]) => ({ key, label: dayLabel(items[0].createdAt), items }))
})

const timeAgo = (iso: string) => {
  const diffSeconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diffSeconds < 60) return 'Just now'
  const minutes = Math.floor(diffSeconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const formatDuration = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return '—'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const jobTitle = (job: SubtitleJob) =>
  job.video?.originalName || job.video?.filename || 'Unknown video'
const jobDuration = (job: SubtitleJob) => formatDuration(job.video?.duration)
const jobLang = (job: SubtitleJob) => (job.languageCode ? job.languageCode.toUpperCase() : '—')

const downloadSubtitle = (job: SubtitleJob) => {
  router.push(`/library/subtitles/${job.videoId}`)
}

const regenerate = (job: SubtitleJob) => {
  router.push(`/generate-subtitle/${job.videoId}`)
}

onMounted(() => {
  loadSummary()
  fetchJobs()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      :icon="History"
      title="History"
      subtitle="All your subtitle generation jobs"
      gradient="bg-gradient-to-br from-fuchsia-500 to-rose-500 shadow-rose-500/30"
    />

    <!-- Summary -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="item in summaryCards" :key="item.label" class="flex items-center gap-3 rounded-2xl border bg-card p-4">
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
        <Input v-model="searchInput" type="search" placeholder="Search history..." class="pl-9" />
      </div>
      <div class="ml-auto flex gap-1.5 overflow-x-auto rounded-xl border bg-card p-1">
        <button
          v-for="f in filters"
          :key="f"
          type="button"
          class="whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          :class="f === activeFilter ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          @click="selectFilter(f)"
        >
          {{ showFilterChip(f) }}
        </button>
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="filter-language">Language</label>
          <select id="filter-language" v-model="languageFilter" @change="reload()">
            <option value="">All languages</option>
            <option v-for="l in LANGUAGES" :key="l.code" :value="l.code">{{ l.label }}</option>
          </select>
        </div>

        <div class="filter-field">
          <label for="filter-from">Date from</label>
          <input id="filter-from" v-model="dateFrom" type="date" @change="reload()" />
        </div>

        <div class="filter-field">
          <label for="filter-to">Date to</label>
          <input id="filter-to" v-model="dateTo" type="date" @change="reload()" />
        </div>
      </FilterPopover>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center gap-2 rounded-2xl border bg-card py-16 text-sm text-muted-foreground">
      <Loader2 class="size-4 animate-spin" />
      Loading your jobs...
    </div>

    <!-- Empty -->
    <div class="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center">
      <span class="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <History class="size-6" />
      </span>
      <p class="text-sm font-semibold">No jobs found</p>
      <p class="max-w-sm text-sm text-muted-foreground">
        Subtitle generation jobs will appear here once you start processing videos.
      </p>
    </div>

    <!-- Timeline -->
    <template v-if="!loading && jobs.length > 0">
      <div v-for="group in groups" :key="group.key" class="space-y-8">
        <div>
          <div class="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarDays class="size-4" />
            {{ group.label }}
            <span class="rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium normal-case">
              {{ group.items.length }} job{{ group.items.length === 1 ? '' : 's' }}
            </span>
          </div>
          <div class="space-y-3 border-l-2 pl-6">
            <div v-for="job in group.items" :key="job.id" class="relative">
              <span class="absolute -left-[31px] top-5 size-3 rounded-full ring-4 ring-background" :class="statusMeta[job.status].dot" />
              <div class="rounded-2xl border bg-card p-4 transition-colors hover:border-border hover:shadow-sm">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">{{ jobTitle(job) }}</p>
                    <div class="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1"><Clock class="size-3.5" /> {{ jobDuration(job) }}</span>
                      <span>{{ jobLang(job) }}</span>
                      <span v-if="job.completedAt" class="flex items-center gap-1">
                        <CheckCircle2 class="size-3.5 text-emerald-500" /> Completed {{ timeAgo(job.completedAt) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-2">
                    <Badge variant="outline" class="capitalize" :class="statusMeta[job.status].cls">
                      {{ statusMeta[job.status].label }}
                    </Badge>
                    <span class="text-xs text-muted-foreground">{{ timeAgo(job.createdAt) }}</span>
                  </div>
                </div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" class="gap-1.5" :disabled="job.status !== 'COMPLETED'" @click="downloadSubtitle(job)">
                    <Download class="size-3.5" /> Download
                  </Button>
                  <Button variant="outline" size="sm" class="gap-1.5" :disabled="job.status === 'PROCESSING' || job.status === 'PENDING'" @click="regenerate(job)">
                    <RotateCcw class="size-3.5" /> Regenerate
                  </Button>
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
        @update:page="fetchJobs"
      />
    </template>
  </div>
</template>