<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FileVideo, Loader2, UploadCloud, X } from 'lucide-vue-next'
import PageHeader from '../components/VideoLibrary/PageHeader.vue'
import SearchToolbar from '../components/VideoLibrary/SearchToolbar.vue'
import VideoCard from '../components/VideoLibrary/VideoCard.vue'
import VideoListRow from '../components/VideoLibrary/VideoListRow.vue'
import EmptyState from '../components/VideoLibrary/EmptyState.vue'
import PopupModal from '../components/Containers/PopupModal.vue'
import { downloadVideoFile, getVideoStreamUrl, uploadVideoOnly } from '../services/videoService'
import type { LibraryFilter, ViewMode } from '../components/VideoLibrary/types'
import { useVideoLibraryStore } from '../stores/videoLibraryStore'
import { useAuthStore } from '../stores/authStore'
import { toast } from 'vue-sonner'

const videoStore = useVideoLibraryStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const activeFilter = ref<LibraryFilter>('all')
const viewMode = ref<ViewMode>('grid')
const sortBy = ref('newest')
const deleteCandidate = ref<{ id: string; title: string } | null>(null)
const selectedVideo = ref<{ id: string; title: string; mimetype: string } | null>(null)
const downloadError = ref<string | null>(null)
const isUploadModalOpen = ref(false)
const uploadInput = ref<HTMLInputElement | null>(null)
const selectedUpload = ref<File | null>(null)
const isUploading = ref(false)
const uploadError = ref<string | null>(null)

const videos = computed(() => videoStore.videos)

const filtered = computed(() => {
  return videos.value
    .filter(v => activeFilter.value === 'all'
      || (activeFilter.value === 'uploaded' && v.type === 'VIDEO')
      || (activeFilter.value === 'burned' && v.type === 'BURNED_VIDEO'))
    .filter(v => v.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .sort((a, b) => {
      if (sortBy.value === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      if (sortBy.value === 'size') return b.sizeBytes - a.sizeBytes
      return b.createdAt.localeCompare(a.createdAt)
    })
})

const hasError = computed(() => videoStore.error !== null)

onMounted(() => {
  videoStore.fetchVideos()
})

const onUpload = () => {
  if (isUploading.value) return

  uploadError.value = null
  selectedUpload.value = null
  isUploadModalOpen.value = true
}

const selectUpload = (file: File | undefined) => {
  if (!file) return

  const allowedTypes = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi']
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Please choose an MP4, WebM, MKV, or AVI video.'
    return
  }

  if (file.size > 100 * 1024 * 1024) {
    uploadError.value = 'Video must be smaller than 100 MB.'
    return
  }

  uploadError.value = null
  selectedUpload.value = file
}

const handleUploadSelection = (event: Event) => {
  const input = event.target as HTMLInputElement
  selectUpload(input.files?.[0])
  input.value = ''
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  selectUpload(event.dataTransfer?.files[0])
}

const clearUploadSelection = () => {
  if (isUploading.value) return
  selectedUpload.value = null
  uploadError.value = null
}

const closeUploadModal = () => {
  if (isUploading.value) return
  isUploadModalOpen.value = false
  selectedUpload.value = null
  uploadError.value = null
}

const formatUploadSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const uploadSelectedVideo = async () => {
  const file = selectedUpload.value

  if (!file || !authStore.user?.id) return

  isUploading.value = true
  uploadError.value = null

  try {
    await uploadVideoOnly(file, authStore.user.id)
    await videoStore.fetchVideos()
    toast.success(`${file.name} uploaded successfully.`)
  } catch {
    uploadError.value = `Could not upload ${file.name}.`
  } finally {
    isUploading.value = false
    if (!uploadError.value) closeUploadModal()
  }
}

const requestDelete = (videoId: string, title: string) => {
  deleteCandidate.value = { id: videoId, title }
}

const openVideo = (video: { id: string; title: string; mimetype: string }) => {
  selectedVideo.value = video
}

const downloadVideo = async (video: { id: string; title: string }) => {
  downloadError.value = null

  try {
    await downloadVideoFile(video.id, video.title)
    toast.success(`Downloading ${video.title}.`)
  } catch {
    downloadError.value = `Could not download ${video.title}.`
  }
}

const confirmDelete = async () => {
  if (!deleteCandidate.value) return

  try {
    await videoStore.removeVideo(deleteCandidate.value.id)
    toast.success('Video deleted successfully.')
  } catch {
    // The store exposes the request error in the page's existing error state.
  } finally {
    deleteCandidate.value = null
  }
}
</script>

<template>
  <div class="library-page">

    <PageHeader :total="videos.length" @upload="onUpload" />
    <SearchToolbar
      v-model:search-query="searchQuery"
      v-model:active-filter="activeFilter"
      v-model:sort-by="sortBy"
      v-model:view-mode="viewMode"
    />

    <!-- Grid View -->
    <div v-if="videoStore.isLoading" class="state-message">
      <Loader2 :size="32" class="spin" />
      <p>Loading videos...</p>
    </div>

    <div v-else-if="hasError" class="state-message">
      <p>Failed to load videos</p>
      <span>{{ videoStore.error }}</span>
      <button class="btn btn--primary" @click="videoStore.fetchVideos()">Retry</button>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="video-grid">
      <VideoCard
        v-for="video in filtered"
        :key="video.id"
        :video="video"
        @open="openVideo(video)"
        @download="downloadVideo(video)"
        @delete="requestDelete(video.id, video.title)"
      />

      <EmptyState v-if="!filtered.length" show-hint />
    </div>

    <!-- List View -->
    <div v-else class="video-list">
      <div class="video-list__head">
        <span>File</span>
        <span>Type</span>
        <span>Duration</span>
        <span>Size</span>
        <span>Status</span>
        <span>Date</span>
        <span></span>
      </div>

      <VideoListRow
        v-for="video in filtered"
        :key="video.id"
        :video="video"
        @open="openVideo(video)"
        @download="downloadVideo(video)"
        @delete="requestDelete(video.id, video.title)"
      />

      <EmptyState v-if="!filtered.length" />
    </div>

    <p v-if="downloadError" class="download-error">{{ downloadError }}</p>

    <PopupModal
      :model-value="isUploadModalOpen"
      title="Upload video"
      :close-on-backdrop="!isUploading"
      @update:model-value="value => value ? (isUploadModalOpen = true) : closeUploadModal()"
    >
      <div class="upload-dialog">
        <input
          ref="uploadInput"
          class="upload-input"
          type="file"
          accept="video/mp4,video/webm,video/mkv,video/avi"
          @change="handleUploadSelection"
        />

        <button
          v-if="!selectedUpload"
          class="upload-dropzone"
          type="button"
          @click="uploadInput?.click()"
          @dragover.prevent
          @drop="handleDrop"
        >
          <span class="upload-dropzone__icon"><UploadCloud :size="28" /></span>
          <strong>Drop your video here</strong>
          <span>or click to browse from your device</span>
          <small>MP4, WebM, MKV, or AVI up to 100 MB</small>
        </button>

        <div v-else class="upload-file">
          <span class="upload-file__icon"><FileVideo :size="22" /></span>
          <div class="upload-file__details">
            <strong>{{ selectedUpload.name }}</strong>
            <span>{{ formatUploadSize(selectedUpload.size) }}</span>
          </div>
          <button
            class="upload-file__remove"
            type="button"
            aria-label="Remove selected video"
            @click="clearUploadSelection"
          >
            <X :size="17" />
          </button>
        </div>

        <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      </div>

      <template #footer>
        <button class="btn btn--secondary" type="button" :disabled="isUploading" @click="closeUploadModal">
          Cancel
        </button>
        <button class="btn btn--primary" type="button" :disabled="!selectedUpload || isUploading" @click="uploadSelectedVideo">
          <Loader2 v-if="isUploading" :size="15" class="spin" />
          {{ isUploading ? 'Uploading...' : 'Upload video' }}
        </button>
      </template>
    </PopupModal>

    <PopupModal
      :model-value="selectedVideo !== null"
      :title="selectedVideo?.title ?? 'Video preview'"
      @update:model-value="value => !value && (selectedVideo = null)"
    >
      <video
        v-if="selectedVideo"
        class="video-player"
        controls
        autoplay
        :src="getVideoStreamUrl(selectedVideo.id)"
        :type="selectedVideo.mimetype"
      >
        Your browser does not support video playback.
      </video>
    </PopupModal>

    <PopupModal
      :model-value="deleteCandidate !== null"
      title="Delete video?"
      @update:model-value="value => !value && (deleteCandidate = null)"
    >
      <p class="delete-confirmation">This will permanently delete <strong>{{ deleteCandidate?.title }}</strong>.</p>

      <template #footer>
        <button class="btn btn--secondary" type="button" @click="deleteCandidate = null">Cancel</button>
        <button class="btn btn--danger" type="button" @click="confirmDelete">Delete</button>
      </template>
    </PopupModal>

  </div>
</template>

<style scoped>
.library-page { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

/* Grid */
.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }

/* State messages (loading / error) */
.state-message {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 0.75rem; padding: 4rem 2rem; color: var(--text-muted); text-align: center;
}
.state-message p { font-size: 1rem; font-weight: 600; color: var(--text-secondary); margin: 0; }
.state-message span { font-size: 0.8rem; }
.download-error { margin: 0; color: #ef4444; font-size: 0.8rem; }
.upload-error { margin: 0; color: #ef4444; font-size: 0.8rem; }
.upload-input { display: none; }
.upload-dialog { display: flex; flex-direction: column; gap: 0.85rem; }
.upload-dropzone {
  display: flex; flex-direction: column; align-items: center; gap: 0.45rem;
  width: 100%; padding: 2rem 1rem; color: var(--text-secondary);
  background: color-mix(in srgb, var(--card-color) 72%, transparent);
  border: 1px dashed var(--border-color); border-radius: 12px; cursor: pointer;
}
.upload-dropzone:hover { border-color: #06b6d4; background: color-mix(in srgb, #06b6d4 8%, var(--card-color)); }
.upload-dropzone__icon { display: grid; place-items: center; width: 50px; height: 50px; color: #06b6d4; background: rgba(6, 182, 212, 0.12); border-radius: 50%; }
.upload-dropzone strong { color: var(--text-primary); font-size: 0.95rem; }
.upload-dropzone span { font-size: 0.8rem; }
.upload-dropzone small { margin-top: 0.35rem; color: var(--text-muted); font-size: 0.7rem; }
.upload-file { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem; background: var(--card-color); border: 1px solid var(--border-color); border-radius: 10px; }
.upload-file__icon { display: grid; place-items: center; width: 40px; height: 40px; color: #06b6d4; background: rgba(6, 182, 212, 0.12); border-radius: 8px; flex-shrink: 0; }
.upload-file__details { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 0.2rem; }
.upload-file__details strong { overflow: hidden; color: var(--text-primary); font-size: 0.82rem; text-overflow: ellipsis; white-space: nowrap; }
.upload-file__details span { color: var(--text-muted); font-size: 0.72rem; }
.upload-file__remove { display: grid; place-items: center; padding: 0.3rem; color: var(--text-muted); background: transparent; border: 0; cursor: pointer; }
.upload-file__remove:hover { color: #ef4444; }
.btn:disabled { cursor: not-allowed; opacity: 0.55; transform: none; }

.btn { display: inline-flex; align-items: center; gap: 6px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; padding: 0.55rem 1.1rem; border: none; text-decoration: none; }
.btn--primary { background: var(--team-gradient); color: #fff; box-shadow: 0 4px 12px rgba(139,92,246,0.4); }
.btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(139,92,246,0.5); }
.btn--secondary { background: var(--card-color); color: var(--text-secondary); border: 1px solid var(--border-color); }
.btn--danger { background: #ef4444; color: #fff; }
.btn--danger:hover { background: #dc2626; }
.delete-confirmation { margin: 0; line-height: 1.5; }
.delete-confirmation strong { color: var(--text-primary); }
.video-player { display: block; width: 100%; max-height: 65vh; border-radius: 8px; background: #000; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* List View */
.video-list { background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 14px; overflow: hidden; }
.video-list__head {
  display: grid; grid-template-columns: 3fr 1.2fr 80px 80px 100px 120px 80px;
  gap: 0.5rem; padding: 0.75rem 1rem;
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); border-bottom: 1px solid var(--border-color);
}
</style>
