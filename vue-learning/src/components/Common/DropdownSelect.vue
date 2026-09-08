<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

export interface DropdownOption {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: string
  options: DropdownOption[]
  ariaLabel: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const optionButtons = ref<HTMLButtonElement[]>([])
const isOpen = ref(false)
const highlightedIndex = ref(-1)

const selectedIndex = () => props.options.findIndex((option) => option.value === props.modelValue)

const focusOption = async (index: number) => {
  highlightedIndex.value = index
  await nextTick()
  optionButtons.value[index]?.focus()
}

const open = async () => {
  isOpen.value = true
  await focusOption(Math.max(selectedIndex(), 0))
}

const close = (restoreFocus = true) => {
  isOpen.value = false
  highlightedIndex.value = -1
  if (restoreFocus) trigger.value?.focus()
}

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  close()
}

const toggle = () => {
  if (isOpen.value) close()
  else void open()
}

const handleDocumentPointerdown = (event: PointerEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) close(false)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void open()
    }
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const nextIndex = (highlightedIndex.value + direction + props.options.length) % props.options.length
    void focusOption(nextIndex)
    return
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    const option = props.options[highlightedIndex.value]
    if (option) selectOption(option.value)
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleDocumentPointerdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleDocumentPointerdown)
})
</script>

<template>
  <div ref="root" class="custom-select">
    <button
      ref="trigger"
      type="button"
      class="custom-select__trigger"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span>{{ options.find((option) => option.value === modelValue)?.label ?? modelValue }}</span>
      <ChevronDown :size="14" :class="{ rotated: isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="custom-select__dropdown" role="listbox" :aria-label="ariaLabel" @keydown="handleKeydown">
        <button
          v-for="(option, index) in options"
          :key="`${option.value}-${index}`"
          :ref="(element) => { if (element) optionButtons[index] = element as HTMLButtonElement }"
          type="button"
          class="custom-select__option"
          :class="{ 'custom-select__option--active': option.value === modelValue }"
          role="option"
          :aria-selected="option.value === modelValue"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
          <Check v-if="option.value === modelValue" :size="12" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select { position: relative; }
.custom-select__trigger {
  width: 100%; background: var(--card-color); border: 1px solid var(--border-color);
  border-radius: 8px; padding: 0.55rem 0.75rem; display: flex; align-items: center;
  justify-content: space-between; cursor: pointer; font: inherit; font-size: 0.85rem;
  color: var(--text-primary); text-align: left; transition: border-color 0.2s;
}
.custom-select__trigger:hover, .custom-select__trigger:focus-visible {
  border-color: var(--border-light); outline: none;
}
.custom-select__trigger .rotated { transform: rotate(180deg); transition: transform 0.2s; }
.custom-select__dropdown {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--card-color);
  border: 1px solid var(--border-light); border-radius: 10px; box-shadow: var(--shadow-md);
  z-index: 50; overflow: hidden; max-height: 200px; overflow-y: auto;
}
.custom-select__option {
  display: flex; align-items: center; justify-content: space-between; padding: 0.55rem 0.75rem;
  font-size: 0.82rem; color: var(--text-secondary); background: transparent; border: none;
  cursor: pointer; width: 100%; text-align: left; transition: background 0.15s;
}
.custom-select__option:hover, .custom-select__option:focus-visible {
  background: var(--hover-color); color: var(--text-primary); outline: none;
}
.custom-select__option--active { color: var(--primary-color); background: var(--active-color); }
</style>