<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import PageHeader from '../components/VideoLibrary/PageHeader.vue'
import SearchToolbar from '../components/VideoLibrary/SearchToolbar.vue'
import VideoCard from '../components/VideoLibrary/VideoCard.vue'
import VideoListRow from '../components/VideoLibrary/VideoListRow.vue'
import EmptyState from '../components/VideoLibrary/EmptyState.vue'
import PopupModal from '../components/Containers/PopupModal.vue'
import { getVideoStreamUrl } from '../services/videoService'
import type { LibraryFilter, ViewMode } from '../components/VideoLibrary/types'
import { useVideoLibraryStore } from '../stores/videoLibraryStore'

const videoStore = useVideoLibraryStore()

const searchQuery = ref('')
const activeFilter = ref<LibraryFilter>('all')
const viewMode = ref<ViewMode>('grid')
const sortBy = ref('newest')
const deleteCandidate = ref<{ id: string; title: string } | null>(null)
const selectedVideo = ref<{ id: string; title: string; mimetype: string } | null>(null)

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
  // TODO: wire upload handler
}

const requestDelete = (videoId: string, title: string) => {
  deleteCandidate.value = { id: videoId, title }
}

const openVideo = (video: { id: string; title: string; mimetype: string }) => {
  selectedVideo.value = video
}

const confirmDelete = async () => {
  if (!deleteCandidate.value) return

  try {
    await videoStore.removeVideo(deleteCandidate.value.id)
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
        @download="() => {}"
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
        @download="() => {}"
        @delete="requestDelete(video.id, video.title)"
      />

      <EmptyState v-if="!filtered.length" />
    </div>

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
