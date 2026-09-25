<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
  Flame,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Upload,
} from '@lucide/vue'
import { isAxiosError } from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'

import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import FilterPopover from '@/components/common/FilterPopover.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { useDebouncedRef } from '@/composables/useDebounce'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { formatBytes, formatDate } from '@/lib/format'
import { deleteSubtitle, downloadSubtitleFile, getSubtitles } from '@/services/subtitleService'
import type { Subtitle, SubtitleFormat } from '@/types'

const route = useRoute()
const router = useRouter()

const videoId = computed(() => String(route.params.videoId ?? ''))
const videoName = computed(() => {
  const name = route.query.name
  return typeof name === 'string' && name.trim() ? name : 'this video'
})

const formatOptions: { value: SubtitleFormat; label: string }[] = [
  { value: 'SRT', label: 'SRT' },
  { value: 'VTT', label: 'VTT' },
]

const formatTone: Record<SubtitleFormat, string> = {
  SRT: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  VTT: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
}

const files = ref<Subtitle[]>([])
const totalData = ref(0)
const totalPages = ref(0)
const page = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const debouncedSearch = useDebouncedRef(searchQuery)
const formatFilter = ref<SubtitleFormat | ''>('')
const fromDate = ref('')
const toDate = ref('')

const isLoading = ref(false)
const loadError = ref<string | null>(null)
const actionError = ref<string | null>(null)
const downloadingId = ref<string | null>(null)
const deleteCandidate = ref<Subtitle | null>(null)
const isDeleting = ref(false)
const deleteError = ref<string | null>(null)

let requestSequence = 0

const activeFilterCount = computed(
  () =>
    Number(Boolean(searchQuery.value.trim())) +
    Number(Boolean(formatFilter.value)) +
    Number(Boolean(fromDate.value)) +
    Number(Boolean(toDate.value)),
)

const deleteDescription = computed(() => {
  if (!deleteCandidate.value) return ''
  return `This will permanently delete “${displayName(deleteCandidate.value)}”. This action cannot be undone.`
})

const emptyMessage = computed(() => {
  if (activeFilterCount.value > 0) return 'Try changing your search or filters.'
  return 'No subtitles have been generated for this video yet.'
})

function displayName(subtitle: Subtitle): string {
  return subtitle.originalName || subtitle.filename
}

function languageLabel(subtitle: Subtitle): string {
  return subtitle.languageCode ? subtitle.languageCode.toUpperCase() : '—'
}

function errorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message)) {
      const joined = message.filter((item): item is string => typeof item === 'string').join(', ')
      if (joined) return joined
    }
  }
  return fallback
}

function buildQuery() {
  return {
    page: page.value,
    limit: pageSize.value,
    search: debouncedSearch.value.trim() || undefined,
    format: formatFilter.value || undefined,
    from: fromDate.value ? `${fromDate.value}T00:00:00.000` : undefined,
    to: toDate.value ? `${toDate.value}T23:59:59.999` : undefined,
  }
}

async function fetchSubtitles() {
  const requestId = ++requestSequence
  isLoading.value = true
  loadError.value = null

  try {
    const response = await getSubtitles(videoId.value, buildQuery())
    if (requestId !== requestSequence) return

    const maxPage = Math.max(1, response.meta?.totalPages ?? 0)
    if (page.value > maxPage) {
      page.value = maxPage
      await fetchSubtitles()
      return
    }

    files.value = response.items ?? []
    totalData.value = response.meta?.totalData ?? 0
    totalPages.value = response.meta?.totalPages ?? 0
  } catch (error) {
    if (requestId !== requestSequence) return

    // The API answers 404 when a video simply has no subtitle files yet, which
    // is an empty state rather than a failure.
    const message = isAxiosError(error) ? error.response?.data?.message : undefined
    const isEmptyResult =
      isAxiosError(error) &&
      error.response?.status === 404 &&
      typeof message === 'string' &&
      message.includes('No subtitle files')

    if (isEmptyResult) {
      files.value = []
      totalData.value = 0
      totalPages.value = 0
    } else {
      loadError.value = errorMessage(error, 'Failed to load subtitle files.')
    }
  } finally {
    if (requestId === requestSequence) isLoading.value = false
  }
}

function handlePageChange(value: number) {
  if (value === page.value) return
  page.value = value
  void fetchSubtitles()
}

function handleLimitChange(value: number) {
  pageSize.value = value
  page.value = 1
  void fetchSubtitles()
}

function setFormatFilter(value: SubtitleFormat | '') {
  if (formatFilter.value === value) return
  formatFilter.value = value
  page.value = 1
  void fetchSubtitles()
}

function clearFilters() {
  searchQuery.value = ''
  formatFilter.value = ''
  fromDate.value = ''
  toDate.value = ''
  page.value = 1
}

function openEditor(subtitle: Subtitle) {
  void router.push(`/library/subtitles/${videoId.value}/edit/${subtitle.id}`)
}

async function downloadSubtitle(subtitle: Subtitle) {
  if (downloadingId.value) return
  downloadingId.value = subtitle.id
  actionError.value = null

  try {
    const blob = await downloadSubtitleFile(subtitle.id)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = displayName(subtitle)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success(`Downloading ${displayName(subtitle)}.`)
  } catch (error) {
    actionError.value = errorMessage(error, `Could not download ${displayName(subtitle)}.`)
  } finally {
    downloadingId.value = null
  }
}

function requestDelete(subtitle: Subtitle) {
  if (isDeleting.value) return
  deleteCandidate.value = subtitle
  deleteError.value = null
}

function closeDeleteDialog() {
  if (isDeleting.value) return
  deleteCandidate.value = null
  deleteError.value = null
}

function handleDeleteOpenChange(value: boolean) {
  if (!value) closeDeleteDialog()
}

async function confirmDelete() {
  const candidate = deleteCandidate.value
  if (!candidate || isDeleting.value) return

  isDeleting.value = true
  deleteError.value = null

  try {
    await deleteSubtitle(candidate.id)
    toast.success(`${displayName(candidate)} deleted successfully.`)
    deleteCandidate.value = null
    await fetchSubtitles()
  } catch (error) {
    deleteError.value = errorMessage(error, 'Could not delete this subtitle file.')
  } finally {
    isDeleting.value = false
  }
}

watch(debouncedSearch, () => {
  page.value = 1
  void fetchSubtitles()
})

watch([fromDate, toDate], () => {
  page.value = 1
  void fetchSubtitles()
})

onMounted(() => {
  void fetchSubtitles()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <Button as-child variant="ghost" size="sm" class="mb-4 -ml-2 gap-1.5 text-muted-foreground">
        <router-link to="/library" class="gap-1.5">
          <ArrowLeft class="size-4" />
          Back to library
        </router-link>
      </Button>
      <PageHeader
        :icon="FileText"
        title="Subtitle Files"
        :subtitle="`${videoName} · ${totalData} file${totalData === 1 ? '' : 's'} generated`"
        gradient="bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/30"
      >
        <Button variant="outline" class="gap-2">
          <Flame class="size-4" />
          Burn to video
        </Button>
        <Button class="gap-2">
          <Upload class="size-4" />
          Reimport
        </Button>
      </PageHeader>
    </div>

    <p
      v-if="actionError"
      class="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      role="alert"
    >
      {{ actionError }}
    </p>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="searchQuery" type="search" placeholder="Search by file name or language code..." class="pl-9" />
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="subtitle-from">From date</label>
          <input id="subtitle-from" v-model="fromDate" type="date" />
        </div>
        <div class="filter-field">
          <label for="subtitle-to">To date</label>
          <input id="subtitle-to" v-model="toDate" type="date" />
        </div>
      </FilterPopover>
      <div class="ml-auto flex gap-1.5 rounded-xl border bg-card p-1">
        <button
          v-for="option in [{ value: '', label: 'ALL' }, ...formatOptions]"
          :key="option.value || 'all'"
          type="button"
          class="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          :class="formatFilter === option.value ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'"
          :aria-pressed="formatFilter === option.value"
          @click="setFormatFilter(option.value as SubtitleFormat | '')"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border bg-card text-muted-foreground">
      <Loader2 class="size-7 animate-spin text-primary" />
      <p class="text-sm">Loading subtitle files…</p>
    </div>

    <div v-else-if="loadError" class="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border bg-card text-center">
      <span class="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <FileText class="size-6" />
      </span>
      <div>
        <p class="font-semibold">Could not load subtitle files</p>
        <p class="mt-1 text-sm text-muted-foreground">{{ loadError }}</p>
      </div>
      <Button type="button" variant="outline" @click="fetchSubtitles">Try again</Button>
    </div>

    <template v-else>
      <Card v-if="files.length" class="overflow-hidden">
        <div class="hidden grid-cols-[3fr_0.8fr_0.8fr_0.9fr_1.1fr_auto] gap-3 border-b bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
          <span>File</span>
          <span>Format</span>
          <span>Language</span>
          <span>Size</span>
          <span>Created</span>
          <span />
        </div>
        <div v-for="subtitle in files" :key="subtitle.id">
          <div class="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40 md:grid-cols-[3fr_0.8fr_0.8fr_0.9fr_1.1fr_auto]">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <FileText class="size-4" />
              </span>
              <span class="truncate text-sm font-medium">{{ displayName(subtitle) }}</span>
            </div>
            <span>
              <Badge variant="outline" class="font-mono" :class="formatTone[subtitle.subtitleFormat]">
                {{ subtitle.subtitleFormat }}
              </Badge>
            </span>
            <span class="hidden text-sm text-muted-foreground md:block">{{ languageLabel(subtitle) }}</span>
            <span class="hidden font-mono text-sm text-muted-foreground md:block">{{ formatBytes(subtitle.size) }}</span>
            <span class="hidden text-sm text-muted-foreground md:block">{{ formatDate(subtitle.createdAt) }}</span>
            <div class="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8"
                :disabled="downloadingId === subtitle.id"
                :aria-label="`Download ${displayName(subtitle)}`"
                @click="downloadSubtitle(subtitle)"
              >
                <Loader2 v-if="downloadingId === subtitle.id" class="size-4 animate-spin" />
                <Download v-else class="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                :aria-label="`Delete ${displayName(subtitle)}`"
                @click="requestDelete(subtitle)"
              >
                <Trash2 class="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button type="button" variant="ghost" size="icon" class="size-8" :aria-label="`More actions for ${displayName(subtitle)}`">
                    <MoreHorizontal class="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48">
                  <DropdownMenuItem class="gap-2" @click="openEditor(subtitle)">
                    <Pencil class="size-4" /> Edit file
                  </DropdownMenuItem>
                  <DropdownMenuItem class="gap-2">
                    <Flame class="size-4" /> Burn to video
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      <div v-else class="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card/50 px-6 text-center">
        <span class="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileText class="size-7" />
        </span>
        <div>
          <p class="font-semibold">No subtitle files found</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ emptyMessage }}</p>
        </div>
        <Button v-if="activeFilterCount" type="button" variant="outline" @click="clearFilters">
          Clear filters
        </Button>
      </div>
    </template>

    <PaginationBar
      v-if="!isLoading && !loadError"
      :page="page"
      :limit="pageSize"
      :total-pages="totalPages"
      :total-data="totalData"
      :per-page-options="[10, 25, 50]"
      @update:page="handlePageChange"
      @update:limit="handleLimitChange"
    />

    <ConfirmDialog
      :open="deleteCandidate !== null"
      title="Delete subtitle file?"
      :description="deleteDescription"
      confirm-label="Delete file"
      :loading="isDeleting"
      @update:open="handleDeleteOpenChange"
      @cancel="closeDeleteDialog"
      @confirm="confirmDelete"
    >
      <p
        v-if="deleteError"
        class="mt-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        role="alert"
      >
        {{ deleteError }}
      </p>
    </ConfirmDialog>
  </div>
</template>
