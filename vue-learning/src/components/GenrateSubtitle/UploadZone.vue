<script setup lang="ts">
import { computed, ref } from 'vue'
import { Upload, FileVideo, X, Film } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { SelectedSource } from '../../stores/generateSubtitleStore'

const ACCEPTED_TYPES = ['video/', 'audio/']
const MAX_FILE_BYTES = 100 * 1024 * 1024 // Matches backend fileSize limit.

const model = defineModel<File | null>({ required: true })

const props = defineProps<{
  existingVideo?: SelectedSource | null
}>()

const emit = defineEmits<{
  'clear-existing': []
  'open-library': []
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const fileSizeMB = computed(() => {
  if (model.value) return (model.value.size / 1024 / 1024).toFixed(2)
  if (props.existingVideo) return (props.existingVideo.size / 1024 / 1024).toFixed(2)
  return '0'
})

const displayName = computed(() => model.value?.name ?? props.existingVideo?.filename ?? '')
const displayMeta = computed(() => model.value?.type ?? props.existingVideo?.mimetype ?? 'Media')

function acceptFile(file: File): boolean {
  const isAcceptedType = ACCEPTED_TYPES.some((prefix) => file.type.startsWith(prefix))

  if (!isAcceptedType) {
    toast.error('Only video and audio files are supported.')
    return false
  }

  if (file.size > MAX_FILE_BYTES) {
    toast.error('File is too large. Maximum size is 100MB.')
    return false
  }

  return true
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file && acceptFile(file)) model.value = file
}

function onFileInput(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file && acceptFile(file)) model.value = file
}

function triggerUpload() {
  fileInput.value?.click()
}

function removeFile() {
  model.value = null
  if (props.existingVideo) emit('clear-existing')
}
</script>

<template>
  <div
    class="upload-zone"
    :class="{
      'upload-zone--dragging': isDragging,
      'upload-zone--has-file': !!model || !!existingVideo,
    }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="!model && !existingVideo && triggerUpload()"
  >
    <input
      ref="fileInput"
      type="file"
      accept="video/*,audio/*"
      class="upload-zone__input"
      @change="onFileInput"
    />

    <Transition name="fade" mode="out-in">
      <div v-if="model || existingVideo" key="file" class="upload-zone__file">
        <div class="upload-zone__file-icon">
          <FileVideo :size="24" />
        </div>
        <div class="upload-zone__file-info">
          <div class="upload-zone__title-row">
            <p class="upload-zone__filename">{{ displayName }}</p>
            <span class="upload-zone__badge">{{ existingVideo ? 'Library Video' : 'Uploaded File' }}</span>
          </div>
          <p class="upload-zone__filesize">{{ fileSizeMB }} MB · {{ displayMeta }}</p>
        </div>
        <button class="upload-zone__remove" type="button" title="Remove file" @click.stop="removeFile">
          <X :size="16" />
        </button>
      </div>

      <div v-else key="empty" class="upload-zone__empty">
        <div class="upload-zone__icon-ring">
          <Upload :size="26" />
        </div>
        <p class="upload-zone__title">Drop your video or audio here</p>
        <p class="upload-zone__hint">MP4, WebM, MOV, MKV, MP3, WAV · Max 100MB</p>
        <div class="upload-zone__actions">
          <button class="btn btn--primary" type="button" @click.stop="triggerUpload">
            <Upload :size="14" /> Browse Device
          </button>
          <button class="btn btn--outline" type="button" @click.stop="emit('open-library')">
            <Film :size="14" /> Pick from Library
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.upload-zone {
  background: var(--secondary-color);
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.upload-zone:hover,
.upload-zone--dragging {
  border-color: var(--primary-color);
  background: rgba(139, 92, 246, 0.04);
  box-shadow: 0 0 25px rgba(139, 92, 246, 0.15);
}

.upload-zone--has-file {
  cursor: default;
  border-style: solid;
  border-color: rgba(139, 92, 246, 0.3);
  background: var(--secondary-color);
}

.upload-zone__input {
  display: none;
}

.upload-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-zone__icon-ring {
  width: 58px;
  height: 58px;
  background: var(--team-color-light);
  border: 1px solid rgba(139, 92, 246, 0.35);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  margin-bottom: 0.35rem;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.2);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.upload-zone__title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.upload-zone__hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0 0 0.65rem;
}

.upload-zone__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}

.upload-zone__file {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  text-align: left;
}

.upload-zone__file-icon {
  width: 44px;
  height: 44px;
  background: var(--team-color-light);
  border: 1px solid rgba(139, 92, 246, 0.3);
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

.upload-zone__title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.upload-zone__filename {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-zone__badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.15);
  color: var(--primary-color);
  border: 1px solid rgba(139, 92, 246, 0.25);
  white-space: nowrap;
}

.upload-zone__filesize {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 3px 0 0;
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
  background: rgba(239, 68, 68, 0.12);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.3);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem 0.95rem;
  border: none;
  text-decoration: none;
}

.btn--primary {
  background: var(--team-gradient);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(139, 92, 246, 0.45);
}

.btn--outline {
  background: var(--card-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn--outline:hover {
  background: var(--hover-color);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>