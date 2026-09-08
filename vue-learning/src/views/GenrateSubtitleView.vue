<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Loader2, Sparkles } from 'lucide-vue-next'
import { uploadVideo } from '../services/videoService.ts'
import { useCurrentJobStore } from '../stores/currentJobStore.ts'
import { useSettingsStore } from '../stores/settingsStore.ts'

import PageHeader from '../components/GenrateSubtitle/PageHeader.vue'
import UploadZone from '../components/GenrateSubtitle/UploadZone.vue'
import SettingPannel from '../components/GenrateSubtitle/SettingPannel.vue'
import ProgressCard from '../components/GenrateSubtitle/ProgressCard.vue'
import OutputCard from '../components/GenrateSubtitle/OutputCard.vue'
import EmptyPanel from '../components/GenrateSubtitle/EmptyPanel.vue'
import type { SubtitleSettings } from '../components/GenrateSubtitle/types'

/* ─── State ─── */
const sourceFile = ref<File | null>(null)
const settingsStore = useSettingsStore()
const { settings: subtitleSettings } = storeToRefs(settingsStore)

const jobStore = useCurrentJobStore()
const { isProcessing, isDone, progress } = storeToRefs(jobStore)

const params = computed(() => ({
  leng: subtitleSettings.value.language,
  formate: subtitleSettings.value.format,
  timestamps: subtitleSettings.value.timestamps,
  lables: subtitleSettings.value.speakerLabels,
  autoTranslate: subtitleSettings.value.autoTranslate,
  autoPunctuation: subtitleSettings.value.punctuation,
  wordLevelTiming: subtitleSettings.value.wordLevel,
  burnVideo: true,
}))

/* ─── Mock subtitle output ─── */
const subtitleOutput = `1
00:00:01,200 --> 00:00:04,800
Welcome to the product demonstration for Q3 2026.

2
00:00:05,000 --> 00:00:08,400
Today we'll be showcasing our latest AI-powered features.

3
00:00:08,600 --> 00:00:12,200
The subtitle engine processes video in real-time with 98% accuracy.

4
00:00:12,500 --> 00:00:16,100
Let's dive into the new dashboard and explore the capabilities.

5
00:00:16,300 --> 00:00:20,000
You can export in SRT, WebVTT, or any major subtitle format.`

/* ─── Methods ─── */
const startProcessing = async () => {
  if (!sourceFile.value || isProcessing.value) return

  const uplodadresult = await uploadVideo(sourceFile.value!, params.value)
  console.log(uplodadresult)

  jobStore.startJob(uplodadresult.jobId)
}

onMounted(() => {
  // Resume polling for an in-flight job persisted in the store (e.g. after refresh)
  jobStore.restore()
})

onBeforeUnmount(() => {
  jobStore.stopPolling()
})

function handleSettings(settings: SubtitleSettings) {
  settingsStore.updateSettings(settings)
}
</script>

<template>
  <div class="gen-page">
    <!-- Page Header -->
    <PageHeader />

    <div class="gen-page__grid">
      <!-- Left: Upload + Settings -->
      <div class="gen-page__left">
        <!-- Upload Zone -->
        <UploadZone v-model="sourceFile" />

        <SettingPannel @settingsChange="handleSettings" />

        <!-- Generate Button -->
        <button class="btn btn--generate" :disabled="!sourceFile || isProcessing" @click="startProcessing">
          <Loader2 v-if="isProcessing" :size="18" class="spin" />
          <Sparkles v-else :size="18" />
          <span>{{ isProcessing ? 'Generating…' : 'Generate Subtitles' }}</span>
        </button>
      </div>

      <!-- Right: Progress + Output -->
      <div class="gen-page__right">
        <!-- Progress Card -->
        <Transition name="fade">
          <ProgressCard v-if="isProcessing || isDone" :progress="progress" />
        </Transition>

        <!-- Output Card -->
        <Transition name="fade">
          <OutputCard
            v-if="isDone"
            :subtitle-output="subtitleOutput"
            :format="subtitleSettings.format"
            :language="subtitleSettings.language"
          />
        </Transition>

        <!-- Empty State (right panel) -->
        <Transition name="fade">
          <EmptyPanel v-if="!isProcessing && !isDone" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gen-page {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gen-page__grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.25rem;
  align-items: start;
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
  border: none;
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

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
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