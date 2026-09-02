<script setup lang="ts">
import { FileVideo } from 'lucide-vue-next'

defineProps<{
  showHint?: boolean
}>()
</script>

<template>
  <div class="empty-state">
    <FileVideo :size="40" />
    <p>No videos found</p>
    <span v-if="showHint">Try changing your filters or upload a new file</span>
  </div>
</template>

<style scoped>
.empty-state { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; padding: 4rem 2rem; color: var(--text-muted); text-align: center; }
.empty-state p { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin: 0; }
.empty-state span { font-size: 0.8rem; }
</style>
