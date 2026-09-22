<script setup lang="ts">
import { FileVideo, Download, Trash2 } from 'lucide-vue-next'
import type { LibraryVideo } from './types'
import StatusChip from './StatusChip.vue'
import VideoActionsMenu from './VideoActionsMenu.vue'

defineProps<{
  video: LibraryVideo
}>()

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'download'): void
  (e: 'delete'): void
}>()
</script>

<template>
  <div class="video-list__row">
    <div class="video-list__file" role="button" tabindex="0" @click="emit('open')" @keydown.enter="emit('open')">
      <div class="video-list__file-icon" :style="{ background: `${video.color}22`, color: video.color }">
        <FileVideo :size="14" />
      </div>
      <span class="video-list__filename" :title="video.title">{{ video.title }}</span>
    </div>
    <span class="video-list__cell video-list__cell--type" :style="{ color: video.color }">
      {{ video.type === 'BURNED_VIDEO' ? 'Burned' : 'Uploaded' }}
    </span>
    <span class="video-list__cell video-list__cell--duration">{{ video.duration }}</span>
    <span class="video-list__cell video-list__cell--size">{{ video.size }}</span>
    <StatusChip :status="video.status" />
    <span class="video-list__cell video-list__cell--date">{{ video.date }}</span>
    <div class="video-list__actions">
      <button class="action-btn" type="button" title="Download video" aria-label="Download video" @click="emit('download')"><Download :size="13" /></button>
      <button class="action-btn action-btn--danger" type="button" title="Delete video" aria-label="Delete video" @click="emit('delete')"><Trash2 :size="13" /></button>
      <VideoActionsMenu v-if="video.type === 'VIDEO'" :video-id="video.id" />
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

@media (max-width: 760px) {
  .video-list__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.65rem;
    margin: 0.5rem 0.75rem;
    padding: 0.8rem;
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: 12px;
  }

  .video-list__row:last-child {
    margin-bottom: 0.75rem;
    border-bottom: 1px solid var(--border-color);
  }

  .video-list__row:hover {
    background: var(--card-color);
    border-color: var(--border-light);
  }

  .video-list__file {
    flex: 1 1 100%;
    min-width: 0;
  }

  .video-list__cell--type {
    display: none;
  }

  .video-list__actions {
    margin-left: auto;
  }

  .video-list__cell {
    font-size: 0.75rem;
  }
}
</style>
