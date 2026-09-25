<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    totalData: number
    limit: number
    perPageOptions?: number[]
  }>(),
  { perPageOptions: () => [10, 25, 50] },
)

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
}>()

const startItem = computed(() =>
  props.totalData === 0 ? 0 : (props.page - 1) * props.limit + 1,
)
const endItem = computed(() => Math.min(props.page * props.limit, props.totalData))

const pages = computed<(number | 'ellipsis')[]>(() => {
  if (props.totalPages <= 1) return []
  const current = props.page
  const total = props.totalPages
  const window: (number | 'ellipsis')[] = []
  const pushRange = (from: number, to: number) => {
    for (let i = from; i <= to; i += 1) window.push(i)
  }
  pushRange(1, Math.min(2, total))
  if (current > 4) window.push('ellipsis')
  pushRange(Math.max(3, current - 1), Math.min(total - 2, current + 1))
  if (current < total - 3) window.push('ellipsis')
  pushRange(Math.max(total - 1, 3), total)
  return window
})

const goToPage = (target: number) => {
  const next = Math.min(Math.max(1, target), props.totalPages)
  if (next !== props.page) emit('update:page', next)
}

const goFirst = () => goToPage(1)
const goPrev = () => goToPage(props.page - 1)
const goNext = () => goToPage(props.page + 1)
const goLast = () => goToPage(props.totalPages)

const handleLimitChange = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  if (value && value !== props.limit) emit('update:limit', value)
}
</script>

<template>
  <div
    v-if="totalPages > 1 || totalData > 0"
    class="flex flex-col gap-4 rounded-2xl border bg-card p-4"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">
        Showing <strong class="text-foreground">{{ startItem }}</strong>–<strong class="text-foreground">{{ endItem }}</strong> of
        <strong class="text-foreground">{{ totalData }}</strong>
      </p>

      <nav v-if="totalPages > 1" class="order-last flex w-full flex-wrap items-center justify-center gap-1.5 sm:order-none sm:mx-auto sm:w-auto" aria-label="Pagination">
        <Button variant="outline" size="icon" class="size-9" :disabled="page <= 1" aria-label="First page" @click="goFirst">
          <span class="text-sm">«</span>
        </Button>
        <Button variant="outline" size="icon" class="size-9" :disabled="page <= 1" aria-label="Previous page" @click="goPrev">
          <ChevronLeft class="size-4" />
        </Button>

        <template v-for="(value, index) in pages" :key="`${value}-${index}`">
          <span v-if="value === 'ellipsis'" class="px-1 text-muted-foreground">…</span>
          <Button
            v-else
            variant="ghost"
            size="icon"
            class="size-9"
            :class="value === page ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : ''"
            :aria-current="value === page ? 'page' : undefined"
            @click="goToPage(value)"
          >
            {{ value }}
          </Button>
        </template>

        <Button variant="outline" size="icon" class="size-9" :disabled="page >= totalPages" aria-label="Next page" @click="goNext">
          <ChevronRight class="size-4" />
        </Button>
        <Button variant="outline" size="icon" class="size-9" :disabled="page >= totalPages" aria-label="Last page" @click="goLast">
          <span class="text-sm">»</span>
        </Button>
      </nav>

      <label class="flex items-center gap-2 text-sm text-muted-foreground">
        Per page
        <select
          :value="limit"
          class="h-9 rounded-lg border bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          @change="handleLimitChange"
        >
          <option v-for="size in perPageOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
    </div>
  </div>
</template>