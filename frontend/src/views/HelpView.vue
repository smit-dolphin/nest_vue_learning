<script setup lang="ts">
import {
  Book,
  ChevronDown,
  FileText,
  Globe2,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Video,
  Zap,
} from '@lucide/vue'
import { ref } from 'vue'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const openFaq = ref(0)

const faqs = [
  {
    q: 'What video formats are supported?',
    a: 'We support all major video formats including MP4, MOV, MKV, AVI, WebM. Files up to 500MB can be uploaded directly.',
  },
  {
    q: 'How accurate are the generated subtitles?',
    a: 'Our AI model achieves an average accuracy of 98.4% across English content. Accuracy varies by language, background noise, and audio quality.',
  },
  {
    q: 'Which subtitle formats can I export?',
    a: 'You can export as SRT, WebVTT, ASS/SSA, JSON, and Plain Text. All formats are compatible with major players and editing software.',
  },
  {
    q: 'How long does processing take?',
    a: 'Processing time depends on file duration. A 5-minute video typically completes in 30–60 seconds on the Pro plan.',
  },
  {
    q: 'Can I edit subtitles before exporting?',
    a: 'Yes! After generation, you can edit individual subtitle segments directly in the editor. Changes are saved automatically.',
  },
]

const docs = [
  { title: 'Quick Start Guide', desc: 'Get up and running in 5 minutes', icon: Zap, tone: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400' },
  { title: 'API Reference', desc: 'Full REST API documentation', icon: FileText, tone: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
  { title: 'Subtitle Formats', desc: 'SRT, WebVTT, ASS — explained', icon: Book, tone: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' },
  { title: 'Language Support', desc: '50+ supported languages', icon: Globe2, tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' },
]

const tutorials = [
  { title: 'Getting Started with VueSubs', duration: '3:45', views: '12K', tone: 'bg-indigo-500' },
  { title: 'Batch Processing Videos', duration: '5:12', views: '8.4K', tone: 'bg-sky-500' },
  { title: 'Using the API Programmatically', duration: '8:30', views: '5.1K', tone: 'bg-emerald-500' },
  { title: 'Editing & Exporting Subtitles', duration: '4:20', views: '9.7K', tone: 'bg-pink-500' },
]

const services = [
  { name: 'Subtitle Engine', status: 'operational' },
  { name: 'Video Upload API', status: 'operational' },
  { name: 'Translation Service', status: 'degraded' },
  { name: 'Export Service', status: 'operational' },
]

const statusTone: Record<string, string> = {
  operational: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/15',
  degraded: 'text-amber-600 dark:text-amber-400 border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/15',
}
</script>

<template>
  <div class="space-y-6">
    <!-- Hero -->
    <div class="relative overflow-hidden rounded-3xl bg-[oklch(0.19_0.035_278)] text-white shadow-xl shadow-indigo-500/10">
      <div class="absolute -left-16 -top-16 size-56 rounded-full bg-sky-500/30 blur-3xl" />
      <div class="absolute -right-16 -bottom-16 size-64 rounded-full bg-indigo-500/40 blur-3xl" />
      <div class="relative p-8">
        <span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium">
          <HelpCircle class="size-3.5 text-indigo-300" />
          Help Center
        </span>
        <h2 class="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">How can we help you?</h2>
        <p class="mt-2 text-sm text-white/70">Search the docs, browse FAQs, or reach out to our support team</p>
        <div class="relative mt-5 max-w-lg">
          <Search class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input type="search" placeholder="Search for answers..." class="h-11 rounded-xl border-white/20 bg-white/95 pl-10 text-slate-900 placeholder:text-slate-400" />
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <button v-for="tag in ['Upload Video', 'API Keys', 'Export Formats', 'Billing', 'Translation']" :key="tag" type="button"
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/20">
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- FAQ -->
      <Card class="xl:col-span-2">
        <CardContent class="p-5 sm:p-6">
          <h3 class="mb-4 font-semibold">Frequently asked questions</h3>
          <div class="divide-y">
            <div v-for="(faq, i) in faqs" :key="i">
              <button type="button" class="flex w-full items-center justify-between gap-4 py-4 text-left" @click="openFaq = openFaq === i ? -1 : i">
                <span class="text-sm font-medium" :class="openFaq === i ? 'text-indigo-600 dark:text-indigo-400' : ''">{{ faq.q }}</span>
                <ChevronDown class="size-4 shrink-0 text-muted-foreground transition-transform" :class="openFaq === i ? 'rotate-180' : ''" />
              </button>
              <div v-if="openFaq === i" class="pb-4 text-sm leading-relaxed text-muted-foreground">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="space-y-6">
        <!-- Docs -->
        <Card>
          <CardContent class="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1">
            <div v-for="doc in docs" :key="doc.title" class="flex items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-accent/40">
              <span class="grid size-10 shrink-0 place-items-center rounded-xl" :class="doc.tone">
                <component :is="doc.icon" class="size-5" />
              </span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ doc.title }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ doc.desc }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Status -->
        <Card>
          <CardContent class="flex items-center justify-between p-5">
            <p class="font-semibold">System status</p>
            <Badge variant="outline" class="gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span class="size-2 animate-pulse rounded-full bg-emerald-500" />
              All systems nominal
            </Badge>
          </CardContent>
          <div class="border-t p-4">
            <div v-for="s in services" :key="s.name" class="flex items-center justify-between py-2 text-sm">
              <span class="text-muted-foreground">{{ s.name }}</span>
              <Badge variant="outline" class="capitalize" :class="statusTone[s.status]">{{ s.status }}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- Tutorials + Contact -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card class="xl:col-span-2">
        <CardContent class="p-5 sm:p-6">
          <h3 class="mb-4 font-semibold">Video tutorials</h3>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div v-for="t in tutorials" :key="t.title" class="group cursor-pointer">
              <div class="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br" :class="t.tone">
                <div class="absolute inset-0 grid place-items-center">
                  <span class="grid size-12 place-items-center rounded-full bg-white/25 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Video class="size-5" />
                  </span>
                </div>
                <span class="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-mono text-white">{{ t.duration }}</span>
              </div>
              <p class="mt-2 text-sm font-medium">{{ t.title }}</p>
              <p class="text-xs text-muted-foreground">{{ t.views }} views</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="xl:col-span-1">
        <CardContent class="flex flex-col gap-4 p-6">
          <span class="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
            <MessageCircle class="size-6" />
          </span>
          <div>
            <h3 class="font-semibold">Still need help?</h3>
            <p class="mt-1 text-sm text-muted-foreground">Our support team typically replies within 24 hours.</p>
          </div>
          <Button class="w-full gap-2">
            <Mail class="size-4" />
            Contact support
          </Button>
          <div class="rounded-xl bg-muted/50 p-3 text-center">
            <p class="text-xs text-muted-foreground">Response time</p>
            <p class="text-sm font-semibold">~ 2 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>