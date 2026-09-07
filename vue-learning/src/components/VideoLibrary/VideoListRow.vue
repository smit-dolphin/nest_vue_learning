<script setup lang="ts">
import { FileVideo, Download, Trash2 } from 'lucide-vue-next'
import type { LibraryVideo } from './types'
import StatusChip from './StatusChip.vue'

defineProps<{
  video: LibraryVideo
}>()

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="video-list__row">
    <div class="video-list__file">
      <div class="video-list__file-icon" :style="{ background: `${video.color}22`, color: video.color }">
        <FileVideo :size="14" />
      </div>
      <span class="video-list__filename" :title="video.title">{{ video.title }}</span>
    </div>
    <span class="video-list__cell">{{ video.mimetype }}</span>
    <span class="video-list__cell">{{ video.duration }}</span>
    <span class="video-list__cell">{{ video.size }}</span>
    <StatusChip :status="video.status" />
    <span class="video-list__cell">{{ video.date }}</span>
    <div class="video-list__actions">
      <button class="action-btn" :disabled="video.status !== 'COMPLETED'" @click="emit('download')"><Download :size="13" /></button>
      <button class="action-btn action-btn--danger" @click="emit('delete')"><Trash2 :size="13" /></button>
    </div>
  </div>
</template>

<style scoped>
.video-list__row {
  display: grid; grid-template-columns: 3fr 1.2fr 80px 80px 100px 120px 80px;
  gap: 0.5rem; padding: 0.8rem 1rem; align-items: center;
  border-bottom: 1px solid var(--border-color); transition: background 0.15s;
}
.video-list__row:last-child { border-bottom: none; }
.video-list__row:hover { background: var(--hover-color); }

.video-list__file { display: flex; align-items: center; gap: 10px; overflow: hidden; }
.video-list__file-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.video-list__filename { font-size: 0.82rem; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.video-list__cell { font-size: 0.8rem; color: var(--text-secondary); }
.video-list__actions { display: flex; gap: 4px; }

.action-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  background: var(--card-color); border: 1px solid var(--border-color); border-radius: 7px;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
