<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AlertCircle, Loader2, RefreshCw, Sparkles } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { downloadVideoFile } from '../services/videoService'
import { downloadSubtitleFile } from '../services/subtitleService'
import { useGenerateSubtitleStore } from '../stores/generateSubtitleStore'
import { useCurrentJobStore } from '../stores/currentJobStore'
import { languageNameFromCode } from '../components/GenrateSubtitle/languages'
import type { LibraryVideo } from '../components/VideoLibrary/types'

import PageHeader from '../components/GenrateSubtitle/PageHeader.vue'
import UploadZone from '../components/GenrateSubtitle/UploadZone.vue'
import SettingPanel from '../components/GenrateSubtitle/SettingPanel.vue'
import ProgressCard from '../components/GenrateSubtitle/ProgressCard.vue'
import GeneratedVideoCard from '../components/GenrateSubtitle/GeneratedVideoCard.vue'
import OutputCard from '../components/GenrateSubtitle/OutputCard.vue'
import EmptyPanel from '../components/GenrateSubtitle/EmptyPanel.vue'
import LibraryPicker from '../components/GenrateSubtitle/LibraryPicker.vue'

const route = useRoute()
const routeVideoId = computed(() =>
  typeof route.params.videoId === 'string' ? route.params.videoId : null,
)

const generateStore = useGenerateSubtitleStore()
const jobStore = useCurrentJobStore()

const {
  sourceFile,
  existingVideo,
  sourceVideoId,
  generatedVideo,
  generatedSubtitle,
  subtitleContent,
  isLibraryModalOpen,
  isStarting,
  isLoadingResults,
} = storeToRefs(generateStore)

const { isProcessing, isDone, isFailed, progress, error: jobError } = storeToRefs(jobStore)

const canGenerate = computed(
  () => generateStore.hasSource && !isProcessing.value && !isStarting.value,
)

const settings = computed(() => generateStore.activeSettings)

const outputFormat = computed(() => generatedSubtitle.value?.subtitleFormat ?? '')
const outputLanguage = computed(() =>
  languageNameFromCode(generatedSubtitle.value?.languageCode ?? settings.value?.language ?? ''),
)

const hasResults = computed(
  () => generatedVideo.value !== null || generatedSubtitle.value !== null,
)

/* ─── Actions ─── */
async function startProcessing() {
  if (!canGenerate.value) return

  const started = await generateStore.startJob(routeVideoId.value)
  if (started) {
    toast.success('Subtitle generation started.')
  }
}

async function retryLoadResults() {
  await generateStore.loadResults()
}

function selectVideoFromLibrary(video: LibraryVideo) {
  generateStore.selectLibraryVideo(video)
  toast.success(`Selected "${video.title}" from library.`)
}

async function downloadGeneratedVideo() {
  if (!generatedVideo.value) return
  try {
    await downloadVideoFile(generatedVideo.value.id, generatedVideo.value.title)
    toast.success(`Downloading ${generatedVideo.value.title}.`)
  } catch {
    toast.error('Could not download the generated video.')
  }
}

async function downloadGeneratedSubtitle() {
  if (!generatedSubtitle.value) return
  try {
    await downloadSubtitleFile(generatedSubtitle.value.id, generatedSubtitle.value.filename)
    toast.success(`Downloading ${generatedSubtitle.value.filename}.`)
  } catch {
    toast.error('Could not download the subtitle file.')
  }
}

/* ─── Lifecycle ─── */
onMounted(async () => {
  if (routeVideoId.value) {
    await generateStore.prefillFromRoute(routeVideoId.value)
  }
  jobStore.restore()
})

onBeforeUnmount(() => {
  jobStore.stopSocketListening()
})

watch(isDone, (done) => {
  if (done) void generateStore.loadResults()
})
</script>

<template>
  <div class="gen-page">
    <PageHeader />

    <div class="gen-page__grid">
      <!-- Left: Source + Settings -->
      <div class="gen-page__left">
        <UploadZone
          v-model="sourceFile"
          :existing-video="existingVideo"
          @clear-existing="generateStore.clearSource"
          @open-library="generateStore.openLibraryPicker"
        />

        <SettingPanel />

        <button
          class="btn btn--generate"
          :disabled="!canGenerate"
          type="button"
          @click="startProcessing"
        >
          <Loader2 v-if="isStarting || isProcessing" :size="18" class="spin" />
          <Sparkles v-else :size="18" />
          <span>{{ isStarting || isProcessing ? 'Generating…' : 'Generate Subtitles' }}</span>
        </button>
      </div>

      <!-- Right: Progress + Output -->
      <div class="gen-page__right">
        <Transition name="fade">
          <ProgressCard v-if="isProcessing || isDone" :progress="progress" />
        </Transition>

        <div v-if="isFailed || jobError" class="generation-error" role="alert">
          <AlertCircle :size="20" />
          <div>
            <strong>Generation failed</strong>
            <p>{{ jobError ?? 'The subtitle job could not be completed.' }}</p>
          </div>
        </div>

        <div v-if="isDone" class="gen-page__results">
          <Transition name="fade">
            <GeneratedVideoCard
              v-if="generatedVideo"
              :title="generatedVideo.title"
              :video-id="generatedVideo.id"
              @download-video="downloadGeneratedVideo"
            />
          </Transition>

          <Transition name="fade">
            <OutputCard
              v-if="generatedSubtitle"
              :content="subtitleContent ?? ''"
              :format="outputFormat"
              :language="outputLanguage"
              @export="downloadGeneratedSubtitle"
            />
          </Transition>

          <div v-if="isDone && !hasResults" class="no-results" role="status">
            <p>
              This job completed, but no output files were found yet.
              <span v-if="isLoadingResults">Looking for generated files…</span>
            </p>
            <button class="btn btn--retry" type="button" :disabled="isLoadingResults" @click="retryLoadResults">
              <RefreshCw :size="14" :class="{ spin: isLoadingResults }" />
              Refresh results
            </button>
          </div>
        </div>

        <Transition name="fade">
          <EmptyPanel v-if="!isProcessing && !isDone && !isFailed" />
        </Transition>
      </div>
    </div>

    <LibraryPicker
      v-model="isLibraryModalOpen"
      :selected-id="sourceVideoId"
      @select="selectVideoFromLibrary"
    />
  </div>
</template>

<style scoped>
.gen-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.generation-error {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.generation-error strong {
  display: block;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.generation-error p {
  margin: 0.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.gen-page__grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.25rem;
  align-items: start;
}

.gen-page__results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  padding: 2.5rem 1.5rem;
  background: var(--secondary-color);
  border: 1px dashed var(--border-color);
  border-radius: 14px;
  color: var(--text-muted);
  text-align: center;
  font-size: 0.85rem;
}

.no-results p {
  margin: 0;
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

.btn--generate {
  width: 100%;
  justify-content: center;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  background: var(--team-gradient);
  color: #fff;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.45);
  transition: all 0.2s;
  margin-top: 1rem;
}

.btn--generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.55);
}

.btn--generate:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

.btn--retry {
  color: var(--text-secondary);
  background: var(--card-color);
  border: 1px solid var(--border-color);
}

.btn--retry:hover:not(:disabled) {
  color: var(--text-primary);
  border-color: var(--border-light);
  background: var(--hover-color);
}

.btn--retry:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .gen-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>