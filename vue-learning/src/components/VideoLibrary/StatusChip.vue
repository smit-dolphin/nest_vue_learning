<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-vue-next'
import type { VideoStatus } from './types'

const props = defineProps<{
  status: VideoStatus
}>()

const icon = computed(() =>
  ({ UPLOADED: CheckCircle2, PROCESSING: Loader2, COMPLETED: CheckCircle2, FAILED: AlertCircle }[props.status] ?? CheckCircle2)
)
const color = computed(() =>
  ({ UPLOADED: '#06b6d4', PROCESSING: '#8b5cf6', COMPLETED: '#10b981', FAILED: '#ef4444' }[props.status] ?? '#06b6d4')
)
const bg = computed(() =>
  ({ UPLOADED: 'rgba(6,182,212,0.1)', PROCESSING: 'rgba(139,92,246,0.1)', COMPLETED: 'rgba(16,185,129,0.1)', FAILED: 'rgba(239,68,68,0.1)' }[props.status] ?? '')
)
</script>

<template>
  <span class="status-chip" :style="{ background: bg, color }">
    <component :is="icon" :size="11" :class="status === 'PROCESSING' ? 'spin' : ''" />
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
