<script setup lang="ts">
import {
  AlignLeft,
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  FileText,
  Pause,
  Play,
  Save,
  Undo2,
} from '@lucide/vue'
import { ref } from 'vue'

import PageHeader from '@/components/layout/PageHeader.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

const activeIndex = ref(2)
const isPlaying = ref(false)

const lines = ref([
  { id: 1, start: '00:00:01,000', end: '00:00:04,500', text: 'Welcome to the product demo.' },
  { id: 2, start: '00:00:04,500', end: '00:00:08,200', text: 'This video shows all key features.' },
  { id: 3, start: '00:00:08,200', end: '00:00:12,900', text: 'Subtitles are generated automatically.' },
  { id: 4, start: '00:00:12,900', end: '00:00:17,600', text: 'You can edit every line right here.' },
  { id: 5, start: '00:00:17,600', end: '00:00:21,300', text: 'Then export in the format you need.' },
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <Button as-child variant="ghost" size="sm" class="mb-4 -ml-2 gap-1.5 text-muted-foreground">
        <router-link to="/library/subtitles/abc123" class="gap-1.5">
          <ArrowLeft class="size-4" />
          Back to subtitle files
        </router-link>
      </Button>
      <PageHeader
        :icon="FileText"
        title="Subtitle Editor"
        subtitle="product_demo_final.en.srt · English"
        gradient="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30"
      >
        <Button variant="outline" class="gap-2">
          <Undo2 class="size-4" />
          Reset
        </Button>
        <Button class="gap-2 bg-emerald-600 shadow-lg shadow-emerald-600/30 hover:bg-emerald-700">
          <Save class="size-4" />
          Save & Export
        </Button>
      </PageHeader>
    </div>

    <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_440px]">
      <!-- Video preview -->
      <div class="space-y-4">
        <div class="relative aspect-video overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 shadow-xl">
          <div class="absolute inset-0 grid place-items-center">
            <div class="text-center">
              <span class="mx-auto grid size-20 place-items-center rounded-3xl bg-white/10 text-white backdrop-blur-md">
                <Play v-if="!isPlaying" class="size-9" />
                <Pause v-else class="size-9" />
              </span>
              <p class="mt-3 text-sm font-medium text-white/80">Video preview placeholder</p>
              <p class="text-xs text-white/50">product_demo_final.mp4 · 00:12</p>
            </div>
          </div>
          <div class="absolute inset-x-0 bottom-24 flex justify-center">
            <div class="rounded-xl bg-black/50 px-4 py-2 text-center backdrop-blur-md">
              <p class="text-sm font-medium text-white">{{ lines[activeIndex].text }}</p>
              <div class="mt-1 flex items-center justify-center gap-2">
                <span class="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/90">
                  <Check class="size-3" /> {{ lines[activeIndex].start }}
                </span>
                <span class="text-[10px] text-white/50">→</span>
                <span class="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 text-[10px] text-white/90">{{ lines[activeIndex].end }}</span>
              </div>
            </div>
          </div>
          <div class="absolute inset-x-4 bottom-4">
            <div class="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div class="h-full w-[56%] rounded-full brand-gradient" />
            </div>
            <div class="mt-2 flex items-center justify-between text-[11px] text-white/60">
              <span>00:12 / 04:32</span>
              <div class="flex items-center gap-2">
                <span class="size-3 rounded bg-sky-400" /> queue
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between rounded-2xl border bg-card px-4 py-3">
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" class="size-9">
              <Play v-if="!isPlaying" class="size-4" />
              <Pause v-else class="size-4" />
            </Button>
            <span class="font-mono text-sm">00:12:40</span>
            <span class="font-mono text-sm text-muted-foreground">/ 04:32</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="outline" size="sm" class="gap-2">
                <AlignLeft class="size-4" />
                Caption style
                <ChevronDown class="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <DropdownMenuItem>Bottom center</DropdownMenuItem>
              <DropdownMenuItem>Bottom left</DropdownMenuItem>
              <DropdownMenuItem>Top center</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Lines editor -->
      <div class="overflow-hidden rounded-2xl border bg-card">
        <div class="flex items-center justify-between border-b px-4 py-3">
          <p class="text-sm font-semibold">Timeline</p>
          <span class="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch :default-value="true" class="scale-75" />
            Auto-scroll
          </span>
        </div>

        <div class="divide-y">
          <div
            v-for="(line, index) in lines"
            :key="line.id"
            class="cursor-pointer px-4 py-3 transition-colors"
            :class="index === activeIndex ? 'bg-indigo-50/80 dark:bg-indigo-500/10' : 'hover:bg-accent/40'"
            @click="activeIndex = index"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span>{{ line.start }}</span>
                <span class="size-1 rounded-full bg-muted-foreground/50" />
                <span>{{ line.end }}</span>
              </div>
              <span
                class="grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-bold"
                :class="index === activeIndex ? 'brand-gradient text-white' : 'bg-muted text-muted-foreground'"
              >
                {{ index + 1 }}
              </span>
            </div>
            <div class="mt-2">
              <Input :value="line.text" class="h-9 border-transparent bg-transparent px-0 shadow-none focus:border-input focus:shadow-sm" />
            </div>
          </div>
        </div>

        <div class="border-t p-3">
          <Button variant="outline" class="w-full gap-2">
            <Download class="size-4" />
            Export .srt
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>