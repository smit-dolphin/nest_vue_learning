<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, FileVideo, X } from 'lucide-vue-next'

const model = defineModel<File | null>({ required: true })

const isDragging = ref(false)

const fileSizeMB = computed(() =>
  model.value ? (model.value.size / 1024 / 1024).toFixed(2) : '0'
)

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) model.value = file
}

const onFileInput = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) model.value = file
}

const triggerUpload = () => {
  document.getElementById('file-input')?.click()
}

const removeFile = () => {
  model.value = null
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{
      'upload-zone--dragging': isDragging,
      'upload-zone--has-file': !!model,
    }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="!model && triggerUpload()"
  >
    <input id="file-input" type="file" accept="video/*,audio/*" class="upload-zone__input" @change="onFileInput" />

    <Transition name="fade" mode="out-in">
      <div v-if="model" key="file" class="upload-zone__file">
        <div class="upload-zone__file-icon">
          <FileVideo :size="28" />
        </div>
        <div class="upload-zone__file-info">
          <p class="upload-zone__filename">{{ model.name }}</p>
          <p class="upload-zone__filesize">{{ fileSizeMB }} MB · {{ model.type }}</p>
        </div>
        <button class="upload-zone__remove" @click.stop="removeFile">
          <X :size="16" />
        </button>
      </div>

      <div v-else key="empty" class="upload-zone__empty">
        <div class="upload-zone__icon-ring">
          <Upload :size="28" />
        </div>
        <p class="upload-zone__title">Drop your video or audio here</p>
        <p class="upload-zone__hint">Supports MP4, MOV, MKV, AVI, MP3, WAV · Max 500MB</p>
        <button class="btn btn--outline" @click.stop="triggerUpload">
          <Upload :size="14" /> Browse Files
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.upload-zone {
  background: var(--secondary-color);
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.25s ease;
  text-align: center;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-zone:hover,
.upload-zone--dragging {
  border-color: var(--primary-color);
  background: rgba(139, 92, 246, 0.05);
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

.upload-zone--has-file {
  cursor: default;
  border-style: solid;
  border-color: var(--border-light);
}

.upload-zone__input {
  display: none;
}

.upload-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.upload-zone__icon-ring {
  width: 64px;
  height: 64px;
  background: var(--team-color-light);
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

.upload-zone__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.upload-zone__hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.upload-zone__file {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  text-align: left;
}

.upload-zone__file-icon {
  width: 48px;
  height: 48px;
  background: var(--team-color-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  flex-shrink: 0;
}

.upload-zone__file-info {
  flex: 1;
  overflow: hidden;
}

.upload-zone__filename {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-zone__filesize {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0;
}

.upload-zone__remove {
  width: 32px;
  height: 32px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.upload-zone__remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.55rem 1.1rem;
  border: none;
  text-decoration: none;
}

.btn--outline {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid rgba(139, 92, 246, 0.4);
}

.btn--outline:hover {
  background: var(--team-color-light);
}
</style>
