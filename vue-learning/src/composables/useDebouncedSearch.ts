import { ref, watch, type Ref } from 'vue'

export interface DebouncedSearch {
  // Mirrors the input immediately (bind v-model to this).
  input: Ref<string>
  // Updates only after the user stops typing for `delay` ms.
  value: Ref<string>
}

export function useDebouncedSearch(delay = 350): DebouncedSearch {
  const input = ref('')
  const value = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(input, (next) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      value.value = next
    }, delay)
  })

  return { input, value }
}