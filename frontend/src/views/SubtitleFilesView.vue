<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
  Flame,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  Upload,
} from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import FilterPopover from '@/components/common/FilterPopover.vue'
import PaginationBar from '@/components/common/PaginationBar.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const route = useRoute()
const router = useRouter()

const videoId = ref(String(route.params.videoId))

const files = [
  { id: 1, name: 'product_demo_final.en.srt', format: 'SRT', lang: 'English', size: '24 KB', segments: 142, createdAt: 'Sep 24, 2026', burnable: true },
  { id: 2, name: 'product_demo_final.es.srt', format: 'SRT', lang: 'Spanish', size: '23 KB', segments: 138, createdAt: 'Sep 24, 2026', burnable: true },
  { id: 3, name: 'product_demo_final.en.vtt', format: 'VTT', lang: 'English', size: '27 KB', segments: 142, createdAt: 'Sep 24, 2026', burnable: true },
  { id: 4, name: 'product_demo_final.en.ass', format: 'ASS', lang: 'English', size: '31 KB', segments: 142, createdAt: 'Sep 24, 2026', burnable: false },
  { id: 5, name: 'product_demo_final.en.json', format: 'JSON', lang: 'English', size: '18 KB', segments: 142, createdAt: 'Sep 24, 2026', burnable: false },
]

const formatTone: Record<string, string> = {
  SRT: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  VTT: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400',
  ASS: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  JSON: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
}

const page = ref(1)
const pageSize = ref(10)
const formatFilter = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(files.length / pageSize.value)))
const activeFilterCount = computed(() => (formatFilter.value ? 1 : 0))

const clearFilters = () => {
  formatFilter.value = ''
  page.value = 1
}

const handleLimitChange = (value: number) => {
  pageSize.value = value
  page.value = 1
}
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
        :subtitle="`product_demo_final.mp4 · ${files.length} files generated`"
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

    <!-- Video summary -->
    <Card>
      <CardContent class="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
          <FileText class="size-6" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold">product_demo_final.mp4</p>
          <p class="text-sm text-muted-foreground">04:32 · 128 MB · MP4</p>
        </div>
        <div class="flex gap-6 rounded-xl bg-accent/50 px-5 py-3">
          <div class="text-center">
            <p class="text-lg font-bold">5</p>
            <p class="text-[11px] uppercase tracking-wide text-muted-foreground">Formats</p>
          </div>
          <div class="w-px bg-border" />
          <div class="text-center">
            <p class="text-lg font-bold">702</p>
            <p class="text-[11px] uppercase tracking-wide text-muted-foreground">Segments</p>
          </div>
          <div class="w-px bg-border" />
          <div class="text-center">
            <p class="text-lg font-bold">98%</p>
            <p class="text-[11px] uppercase tracking-wide text-muted-foreground">Accuracy</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-52 flex-1">
        <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input type="search" placeholder="Search subtitle files..." class="pl-9" />
      </div>
      <FilterPopover :count="activeFilterCount" @clear="clearFilters">
        <div class="filter-field">
          <label for="filter-format">Format</label>
          <select id="filter-format" v-model="formatFilter">
            <option value="">All formats</option>
            <option value="SRT">SRT</option>
            <option value="VTT">VTT</option>
            <option value="ASS">ASS</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
      </FilterPopover>
      <div class="ml-auto flex gap-1.5 rounded-xl border bg-card p-1">
        <button v-for="f in ['ALL', 'SRT', 'VTT', 'ASS', 'JSON']" :key="f" type="button"
          class="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
          :class="f === 'ALL' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'">
          {{ f }}
        </button>
      </div>
    </div>

    <!-- Files table -->
    <Card class="overflow-hidden">
      <div class="hidden grid-cols-[3fr_1fr_1fr_1.2fr_1.2fr_auto] gap-3 border-b bg-muted/50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground md:grid">
        <span>File</span>
        <span>Format</span>
        <span>Language</span>
        <span>Segments</span>
        <span>Created</span>
        <span />
      </div>
      <div v-for="file in files" :key="file.id">
        <div class="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3.5 transition-colors hover:bg-accent/40 md:grid-cols-[3fr_1fr_1fr_1.2fr_1.2fr_auto]">
          <div class="flex min-w-0 items-center gap-3">
            <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              <FileText class="size-4" />
            </span>
            <span class="truncate text-sm font-medium">{{ file.name }}</span>
          </div>
          <span>
            <Badge variant="outline" class="font-mono" :class="formatTone[file.format]">
              {{ file.format }}
            </Badge>
          </span>
          <span class="hidden text-sm text-muted-foreground md:block">{{ file.lang }}</span>
          <span class="hidden text-sm text-muted-foreground md:block">{{ file.segments }}</span>
          <span class="hidden text-sm text-muted-foreground md:block">{{ file.createdAt }}</span>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="size-8">
                <MoreHorizontal class="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-48">
              <DropdownMenuItem class="gap-2" @click="router.push(`/library/subtitles/${videoId}/edit/${file.id}`)">
                <Pencil class="size-4" /> Edit file
              </DropdownMenuItem>
              <DropdownMenuItem class="gap-2">
                <Download class="size-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem class="gap-2" :disabled="!file.burnable">
                <Flame class="size-4" /> Burn to video
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="gap-2 text-destructive">
                <Trash2 class="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>

    <!-- Pagination -->
    <PaginationBar
      v-model:page="page"
      :limit="pageSize"
      :total-pages="totalPages"
      :total-data="files.length"
      :per-page-options="[5, 10, 25]"
      @update:limit="handleLimitChange"
    />
  </div>
</template>