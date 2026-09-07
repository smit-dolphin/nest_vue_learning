<script setup lang="ts">
import { Play, FileType, Download, Trash2, MoreHorizontal } from 'lucide-vue-next'
import type { LibraryVideo } from './types'
import StatusChip from './StatusChip.vue'

defineProps<{
  video: LibraryVideo
}>()

const emit = defineEmits<{
  (e: 'download'): void
  (e: 'delete'): void
  (e: 'more'): void
}>()
</script>

<template>
  <div class="video-card">
    <!-- Thumbnail -->
    <div class="video-card__thumb" :style="{ background: `linear-gradient(135deg, ${video.color}22, ${video.color}08)` }">
      <div class="video-card__play-icon" :style="{ color: video.color }">
        <Play :size="22" fill="currentColor" />
      </div>
      <div class="video-card__duration">{{ video.duration }}</div>
      <!-- Status overlay -->
      <div class="video-card__status-badge">
        <StatusChip :status="video.status" />
      </div>
    </div>

    <!-- Info -->
    <div class="video-card__body">
      <p class="video-card__title">{{ video.title }}</p>
      <div class="video-card__meta">
        <span><FileType :size="11" /> {{ video.mimetype }}</span>
        <span>{{ video.size }}</span>
      </div>
      <p class="video-card__date">{{ video.date }}</p>
    </div>

    <!-- Actions -->
    <div class="video-card__actions">
      <button class="action-btn" title="Download" :disabled="video.status !== 'COMPLETED'" @click="emit('download')">
        <Download :size="14" />
      </button>
      <button class="action-btn action-btn--danger" title="Delete" @click="emit('delete')">
        <Trash2 :size="14" />
      </button>
      <button class="action-btn" title="More" @click="emit('more')">
        <MoreHorizontal :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.video-card {
  background: var(--secondary-color); border: 1px solid var(--border-color);
  border-radius: 14px; overflow: hidden; transition: border-color 0.2s, transform 0.2s;
  display: flex; flex-direction: column;
}
.video-card:hover { border-color: var(--border-light); transform: translateY(-3px); }

.video-card__thumb {
  height: 140px; display: flex; align-items: center; justify-content: center;
  position: relative; cursor: pointer;
}
.video-card__play-icon {
  width: 48px; height: 48px; background: rgba(0,0,0,0.4); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); transition: transform 0.2s;
}
.video-card:hover .video-card__play-icon { transform: scale(1.1); }

.video-card__duration {
  position: absolute; bottom: 8px; right: 8px;
  background: rgba(0,0,0,0.65); color: #fff; font-size: 0.7rem; font-weight: 700;
  border-radius: 6px; padding: 2px 7px;
}
.video-card__status-badge {
  position: absolute; top: 8px; left: 8px;
}

.video-card__body { padding: 0.85rem 0.85rem 0.5rem; flex: 1; }
.video-card__title { font-size: 0.83rem; font-weight: 600; color: var(--text-primary); margin: 0 0 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.video-card__meta { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 4px; }
.video-card__meta span { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--text-muted); }
.video-card__date { font-size: 0.7rem; color: var(--text-muted); }

.video-card__actions { display: flex; gap: 4px; padding: 0.5rem 0.85rem 0.85rem; }

.action-btn {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  background: var(--card-color); border: 1px solid var(--border-color); border-radius: 7px;
  color: var(--text-muted); cursor: pointer; transition: all 0.2s;
}
.action-btn:hover { background: var(--hover-color); color: var(--text-primary); border-color: var(--border-light); }
.action-btn--danger:hover { background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.3); }
.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
