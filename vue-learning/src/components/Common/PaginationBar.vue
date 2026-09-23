<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  totalData: number
  limit: number
  perPageOptions?: number[]
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
}>()

const perPageOptions = computed(() => (props.perPageOptions?.length ? props.perPageOptions : [10, 25, 50]))

const startItem = computed(() => (props.totalData === 0 ? 0 : (props.page - 1) * props.limit + 1))
const endItem = computed(() => Math.min(props.page * props.limit, props.totalData))

const pages = computed(() => {
  if (props.totalPages <= 1) return [] as (number | 'ellipsis')[]
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
  <div v-if="totalPages > 1 || totalData > 0" class="pagination">
    <div class="pagination__info">
      <span class="pagination__summary">
        Showing <strong>{{ startItem }}</strong>–<strong>{{ endItem }}</strong> of
        <strong>{{ totalData }}</strong>
      </span>
      <label class="pagination__size">
        <span>Per page</span>
        <select :value="limit" @change="handleLimitChange">
          <option v-for="size in perPageOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </label>
    </div>

    <nav v-if="totalPages > 1" class="pagination__nav" aria-label="Pagination">
      <button type="button" class="pagination__btn" :disabled="page <= 1" aria-label="First page" @click="goFirst">
        «
      </button>
      <button type="button" class="pagination__btn" :disabled="page <= 1" aria-label="Previous page" @click="goPrev">
        ‹
      </button>

      <template v-for="(value, index) in pages" :key="`${value}-${index}`">
        <span v-if="value === 'ellipsis'" class="pagination__ellipsis">…</span>
        <button
          v-else
          type="button"
          class="pagination__btn"
          :class="{ 'pagination__btn--active': value === page }"
          :aria-current="value === page ? 'page' : undefined"
          @click="goToPage(value)"
        >
          {{ value }}
        </button>
      </template>

      <button type="button" class="pagination__btn" :disabled="page >= totalPages" aria-label="Next page" @click="goNext">
        ›
      </button>
      <button type="button" class="pagination__btn" :disabled="page >= totalPages" aria-label="Last page" @click="goLast">
        »
      </button>
    </nav>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.pagination__info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.pagination__summary {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.pagination__summary strong {
  color: var(--text-primary);
}

.pagination__size {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.pagination__size select {
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  font: inherit;
  font-size: 0.8rem;
  color: var(--text-primary);
  cursor: pointer;
}

.pagination__size select:focus-visible {
  outline: none;
  border-color: var(--primary-color);
}

.pagination__nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 2.1rem;
  height: 2.1rem;
  padding: 0 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.pagination__btn:focus-visible {
  outline: none;
  border-color: var(--primary-color);
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__btn--active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.pagination__ellipsis {
  padding: 0 0.2rem;
  color: var(--text-secondary);
  font-size: 0.8rem;
}
</style>