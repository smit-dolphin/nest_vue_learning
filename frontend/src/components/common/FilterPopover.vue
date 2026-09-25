<script setup lang="ts">
import { SlidersHorizontal } from '@lucide/vue'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

defineProps<{
  count?: number
  disabled?: boolean
}>()

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" class="gap-2" :disabled="disabled">
        <SlidersHorizontal class="size-4" />
        Filters
        <Badge v-if="count" variant="secondary" class="size-5 justify-center rounded-full p-0 text-[10px]">
          {{ count }}
        </Badge>
      </Button>
    </PopoverTrigger>

    <PopoverContent align="end" class="w-72">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
        <button
          v-if="count"
          type="button"
          class="text-xs font-semibold text-primary hover:underline"
          @click="emit('clear')"
        >
          Clear
        </button>
      </div>
      <div class="filter-fields flex flex-col gap-4">
        <slot />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
:slotted(.filter-field) {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

:slotted(.filter-field label) {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted-foreground);
}

:slotted(.filter-field input),
:slotted(.filter-field select) {
  height: 2.25rem;
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--background);
  padding: 0 0.6rem;
  font: inherit;
  font-size: 0.85rem;
  color: var(--foreground);
  cursor: pointer;
  outline: none;
}

:slotted(.filter-field input:focus-visible),
:slotted(.filter-field select:focus-visible) {
  outline: 2px solid var(--ring);
  outline-offset: 1px;
}
</style>