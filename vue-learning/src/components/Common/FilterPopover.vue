<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SlidersHorizontal } from 'lucide-vue-next'

defineProps<{
  count?: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  clear: []
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}

const handleDocumentPointerdown = (event: PointerEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) isOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
})
</script>

<template>
  <div ref="root" class="filter-popover">
    <button
      type="button"
      class="filter-trigger"
      :class="{ 'filter-trigger--open': isOpen }"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <SlidersHorizontal :size="15" />
      <span>Filters</span>
      <span v-if="count" class="filter-trigger__badge">{{ count }}</span>
    </button>

    <Transition name="filter-pop">
      <div v-if="isOpen" class="filter-popover__panel" role="group" aria-label="Filters">
        <div class="filter-popover__title">
          <span>Filters</span>
          <button v-if="count" type="button" class="filter-popover__clear" @click="emit('clear')">
            Clear
          </button>
        </div>
        <slot />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.filter-popover {
  position: relative;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 36px;
  padding: 0 0.8rem;
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 9px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.filter-trigger:hover:not(:disabled),
.filter-trigger--open {
  border-color: var(--primary-color);
  color: var(--text-primary);
}

.filter-trigger__badge {
  display: inline-grid;
  place-items: center;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
}

.filter-popover__panel {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 60;
  min-width: 270px;
  padding: 0.85rem;
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.filter-popover__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}

.filter-popover__clear {
  background: transparent;
  border: none;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--primary-color);
  cursor: pointer;
}

.filter-popover__clear:hover {
  text-decoration: underline;
}

:slotted(.filter-field) {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

:slotted(.filter-field label) {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

:slotted(.filter-field input),
:slotted(.filter-field select) {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  font: inherit;
  font-size: 0.8rem;
  color: var(--text-primary);
  cursor: pointer;
}

:slotted(.filter-field input:focus-visible),
:slotted(.filter-field select:focus-visible) {
  outline: none;
  border-color: var(--primary-color);
}

.filter-pop-enter-active,
.filter-pop-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.filter-pop-enter-from,
.filter-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>