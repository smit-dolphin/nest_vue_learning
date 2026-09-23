<script setup lang="ts">
import { watch } from 'vue'
import { Check, Film, Loader2 } from 'lucide-vue-next'
import PopupModal from '../Containers/PopupModal.vue'
import { useVideoLibraryStore } from '../../stores/videoLibraryStore'
import type { LibraryVideo } from '../VideoLibrary/types'

const props = defineProps<{
  modelValue: boolean
  selectedId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [video: LibraryVideo]
}>()

const videoStore = useVideoLibraryStore()

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen && !videoStore.videos.length) void videoStore.fetchAll()
  },
)

function select(video: LibraryVideo) {
  emit('select', video)
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
</script>

<template>
  <PopupModal
    :model-value="modelValue"
    title="Select video from library"
    @update:model-value="(value) => emit('update:modelValue', value)"
  >
    <div class="library-picker">
      <div v-if="videoStore.isLoading" class="library-picker__state">
        <Loader2 :size="24" class="spin" />
        <span>Loading videos…</span>
      </div>

      <div v-else-if="videoStore.error && !videoStore.videos.length" class="library-picker__state">
        <p>{{ videoStore.error }}</p>
      </div>

      <div v-else-if="!videoStore.videos.length" class="library-picker__state">
        <Film :size="28" />
        <p>No videos in library yet.</p>
      </div>

      <div v-else class="library-picker__list">
        <button
          v-for="video in videoStore.videos"
          :key="video.id"
          type="button"
          class="library-picker__item"
          :class="{ 'library-picker__item--selected': selectedId === video.id }"
          @click="select(video)"
        >
          <div class="library-picker__item-icon">
            <Film :size="20" />
          </div>
          <div class="library-picker__item-info">
            <strong>{{ video.title }}</strong>
            <span>{{ formatSize(video.sizeBytes) }} · {{ video.type === 'BURNED_VIDEO' ? 'Burned Video' : 'Uploaded Video' }}</span>
          </div>
          <Check v-if="selectedId === video.id" :size="18" class="library-picker__check" />
        </button>
      </div>
    </div>
  </PopupModal>
</template>

<style scoped>
.library-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 420px;
  overflow-y: auto;
}

.library-picker__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  text-align: center;
}

.library-picker__state p {
  margin: 0;
  font-size: 0.85rem;
}

.library-picker__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.library-picker__item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: inherit;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  width: 100%;
  font: inherit;
}

.library-picker__item:hover {
  background: var(--hover-color);
  border-color: var(--border-light);
}

.library-picker__item--selected {
  border-color: var(--primary-color);
  background: var(--team-color-light);
}

.library-picker__item-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.15);
  color: var(--primary-color);
  border-radius: 10px;
  flex-shrink: 0;
}

.library-picker__item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.library-picker__item-info strong {
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.library-picker__item-info span {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.library-picker__check {
  color: var(--primary-color);
  flex-shrink: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>