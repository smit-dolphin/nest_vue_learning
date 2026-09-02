<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  status: 'done' | 'processing' | 'failed'
}>()

const icon = computed(() =>
  ({ done: CheckCircle2, processing: Loader2, failed: AlertCircle }[props.status] ?? CheckCircle2)
)
const color = computed(() =>
  ({ done: '#10b981', processing: '#8b5cf6', failed: '#ef4444' }[props.status] ?? '#10b981')
)
const bg = computed(() =>
  ({ done: 'rgba(16,185,129,0.1)', processing: 'rgba(139,92,246,0.1)', failed: 'rgba(239,68,68,0.1)' }[props.status] ?? '')
)
</script>

<template>
  <span class="status-chip" :style="{ background: bg, color }">
    <component :is="icon" :size="11" :class="status === 'processing' ? 'spin' : ''" />
    {{ status }}
  </span>
</template>

<style scoped>
.status-chip {
  display: inline-flex; align-items: center; gap: 4px;
  border-radius: 20px; padding: 3px 10px; font-size: 0.7rem; font-weight: 700;
  text-transform: capitalize; width: fit-content;
}
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
