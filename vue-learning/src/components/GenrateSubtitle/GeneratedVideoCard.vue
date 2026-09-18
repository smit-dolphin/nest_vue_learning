<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { Download, Film, Loader2 } from 'lucide-vue-next'
import { fetchVideoBlobUrl } from '../../services/videoService'

const props = defineProps<{
  title: string
  videoId: string
}>()

const emit = defineEmits<{
  'download-video': []
}>()

const streamUrl = ref<string | null>(null)
const isLoading = ref(false)
const failed = ref(false)

async function loadStreamUrl(videoId: string) {
  if (streamUrl.value) URL.revokeObjectURL(streamUrl.value)
  streamUrl.value = null
  failed.value = false

  if (!videoId) return

  isLoading.value = true
  try {
    streamUrl.value = await fetchVideoBlobUrl(videoId)
  } catch {
    failed.value = true
  } finally {
    isLoading.value = false
  }
}

watch(
  () => props.videoId,
  (id) => void loadStreamUrl(id),
  { immediate: true },
)

onBeforeUnmount(() => {
  if (streamUrl.value) URL.revokeObjectURL(streamUrl.value)
})
</script>

<template>
  <section class="generated-card">
    <div class="generated-card__header">
      <div class="generated-card__heading">
        <div class="generated-card__icon">
          <Film :size="16" />
        </div>
        <div>
          <h3>Generated Video</h3>
          <p>{{ title }}</p>
        </div>
      </div>
      <div class="generated-card__actions">
        <button
          class="generated-card__download"
          type="button"
          title="Download video"
          @click="emit('download-video')"
        >
          <Download :size="14" />
          Download video
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="generated-card__state">
      <Loader2 :size="24" class="spin" />
      <p>Loading generated video…</p>
    </div>
    <video v-else-if="streamUrl" class="generated-card__video" controls :src="streamUrl">
      Your browser does not support video playback.
    </video>
    <p v-else-if="failed" class="generated-card__state generated-card__state--error">
      Could not load the generated video preview.
    </p>
  </section>
</template>

<style scoped>
.generated-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
}

.generated-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
}

.generated-card__heading {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

.generated-card__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.generated-card__icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--primary-color);
  background: var(--team-color-light);
  border-radius: 8px;
}

.generated-card h3 {
  margin: 0 0 2px;
  color: var(--text-primary);
  font-size: 0.92rem;
}

.generated-card p {
  margin: 0;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.generated-card__download {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 0.45rem 0.7rem;
  color: var(--text-muted);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.72rem;
}

.generated-card__download:hover {
  color: var(--text-primary);
  border-color: var(--border-light);
  background: var(--hover-color);
}

.generated-card__video {
  display: block;
  width: calc(100% - 2.5rem);
  max-height: 480px;
  margin: 0 1.25rem 1.25rem;
  border-radius: 10px;
  background: #000;
}

.generated-card__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin: 0 1.25rem 1.25rem;
  padding: 2.5rem 1rem;
  color: var(--text-muted);
  background: #000;
  border-radius: 10px;
  text-align: center;
  font-size: 0.8rem;
}

.generated-card__state--error {
  color: #ef4444;
}

.generated-card__state p {
  margin: 0;
  white-space: normal;
  overflow: visible;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .generated-card__header {
    align-items: flex-start;
    flex-direction: column;
  }
  .generated-card__actions {
    width: 100%;
  }
  .generated-card__download {
    flex: 1;
    justify-content: center;
  }
}
</style>