<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Upload,
  Captions,
  Sparkles,
  Download,
  Copy,
  Check,
  Loader2,
  FileVideo,
  Languages,
  Clock,
  X,
} from 'lucide-vue-next'
import {
  uploadVideo, 
} from "../services/videoService.ts"
import baseApi from '@/api/baseApi.ts'

import SettingPannel from "../components/GenrateSubtitle/SettingPannel.vue"

export interface SubtitleSettings {
  language: string
  format: string
  timestamps: boolean
  speakerLabels: boolean
  autoTranslate: boolean
  punctuation: boolean
  wordLevel: boolean
}

/* ─── State ─── */
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const isProcessing = ref(false)
const isDone = ref(false)
const progress = ref(0)
const copied = ref(false)
const selectedLang = ref('English')
const selectedFormat = ref('SRT')
const langOpen = ref(false)
const formatOpen = ref(false)
const jobid = ref(null)
const subtitleSettings = ref<SubtitleSettings>(
  {
    language: 'English',
    format: 'SRT',
    timestamps: true,
    speakerLabels: false,
    autoTranslate: false,
    punctuation: true,
    wordLevel: false,
  }
)
const params=computed(()=>({ 
  leng: subtitleSettings.value.language,
  formate: subtitleSettings.value.format,
  lables: subtitleSettings.value.speakerLabels,
  autoTranslate: subtitleSettings.value.autoTranslate,
  autoPunctuation: subtitleSettings.value.punctuation,
  wordLevelTiming: subtitleSettings.value.wordLevel,
  burnVideo: true,}))

const outputfilepath=ref<null|string>(null)


// watch(
//   subtitleSettings,
//   () => {
//    const params = {
//   leng: subtitleSettings.language,
//   formate: subtitleSettings.format,
//   lables: subtitleSettings.speakerLabels,
//   autoTranslate: subtitleSettings.autoTranslate,
//   autoPunctuation: subtitleSettings.punctuation,
//   wordLevelTiming: subtitleSettings.wordLevel,
//   burnVideo: subtitleSettings.burnVideo,
// } 
//   },
//   { immediate: true }
// )
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
const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) selectedFile.value = file
}

const onFileInput = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) selectedFile.value = file
}

const triggerUpload = () => {
  document.getElementById('file-input')?.click()
}

const removeFile = () => {
  selectedFile.value = null
  isDone.value = false
  progress.value = 0
}

const fileSizeMB = computed(() =>
  selectedFile.value ? (selectedFile.value.size / 1024 / 1024).toFixed(2) : '0'
)

const startProcessing = async () => {
  if (!selectedFile.value || isProcessing.value) return

  // const steps = [10, 25, 40, 58, 72, 85, 93, 100]
  // for (const step of steps) {
  //   await new Promise(r => setTimeout(r, 350))
  //   progress.value = step
  // } 
  const uplodadresult = await uploadVideo(
  selectedFile.value!,
  params.value
)

console.log(uplodadresult)
jobid.value = uplodadresult.jobId


  isProcessing.value = true
  // progress.value = 0




  // isProcessing.value = false
  // isDone.value = true
}
onMounted(() => {
  setInterval(async () => {

    if (isProcessing.value == true) {
      const result = await baseApi.get(`job/${jobid.value}`)
      console.log(result)
      progress.value = result.progress
      if (result.progress === 100) {
        isProcessing.value = false
        isDone.value = true
        
      }
    }

  }, 1000 * 10)


})

const copyOutput = async () => {
  await navigator.clipboard.writeText(subtitleOutput)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const progressLabel = computed(() => {
  if (progress.value < 30) return 'Uploading media...'
  if (progress.value < 60) return 'Transcribing audio...'
  if (progress.value < 85) return 'burning subtitles...'
  if (progress.value < 100) return 'Formatting output...'
  return 'Complete!'
})



function handleSettings(settings: SubtitleSettings) {
  subtitleSettings.value = settings
}
</script>

<template>
  <div class="gen-page">
    <!-- Page Header -->
    <div class="gen-page__header">
      <div class="gen-page__header-left">
        <div class="gen-page__icon-wrap">
          <Captions :size="22" />
        </div>
        <div>
          <h2 class="gen-page__title">Generate Subtitles</h2>
          <p class="gen-page__sub">Upload your video and let AI transcribe and generate subtitles automatically</p>
        </div>
      </div>
      <div class="gen-page__header-right">
        <div class="gen-page__model-badge">
          <Sparkles :size="13" />
          <span>Whisper v3 Turbo</span>
        </div>
      </div>
    </div>

    <div class="gen-page__grid">
      <!-- Left: Upload + Settings -->
      <div class="gen-page__left">

        <!-- Upload Zone -->
        <div class="upload-zone" :class="{
          'upload-zone--dragging': isDragging,
          'upload-zone--has-file': !!selectedFile
        }" @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="onDrop"
          @click="!selectedFile && triggerUpload()">
          <input id="file-input" type="file" accept="video/*,audio/*" class="upload-zone__input"
            @change="onFileInput" />

          <Transition name="fade" mode="out-in">
            <!-- File selected state -->
            <div v-if="selectedFile" class="upload-zone__file" key="file">
              <div class="upload-zone__file-icon">
                <FileVideo :size="28" />
              </div>
              <div class="upload-zone__file-info">
                <p class="upload-zone__filename">{{ selectedFile.name }}</p>
                <p class="upload-zone__filesize">{{ fileSizeMB }} MB · {{ selectedFile.type }}</p>
              </div>
              <button class="upload-zone__remove" @click.stop="removeFile">
                <X :size="16" />
              </button>
            </div>

            <!-- Empty state -->
            <div v-else class="upload-zone__empty" key="empty">
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

        <SettingPannel @settingsChange="handleSettings" />


        <!-- Generate Button -->
        <button class="btn btn--generate" :disabled="!selectedFile || isProcessing" @click="startProcessing">
          <Loader2 v-if="isProcessing" :size="18" class="spin" />
          <Sparkles v-else :size="18" />
          <span>{{ isProcessing ? 'Generating…' : 'Generate Subtitles' }}</span>
        </button>
      </div>

      <!-- Right: Progress + Output -->
      <div class="gen-page__right">

        <!-- Progress Card -->
        <Transition name="fade">
          <div v-if="isProcessing || isDone" class="progress-card">
            <div class="progress-card__header">
              <div class="progress-card__title-wrap">
                <Loader2 v-if="isProcessing" :size="15" class="spin text-purple" />
                <Check v-else :size="15" class="text-green" />
                <span class="progress-card__title">{{ progressLabel }}</span>
              </div>
              <span class="progress-card__pct">{{ progress }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progress + '%' }" :class="{ 'progress-fill--done': isDone }">
              </div>
            </div>
            <div class="progress-steps">
              <div v-for="step in ['Upload', 'Transcribe', 'Burning', 'Format']" :key="step" class="progress-step"
                :class="{
                  'progress-step--done': (step === 'Upload' && progress >= 30) ||
                    (step === 'Transcribe' && progress >= 60) ||
                    (step === 'Burning' && progress >= 85) ||
                    (step === 'Format' && progress >= 100)
                }">
                <Check
                  v-if="(step === 'Upload' && progress >= 30) || (step === 'Transcribe' && progress >= 60) || (step === 'Burning' && progress >= 85) || (step === 'Format' && progress >= 100)"
                  :size="10" />
                <Clock v-else :size="10" />
                {{ step }}
              </div>
            </div>
          </div>
        </Transition>

        <!-- Output Card -->
        <Transition name="fade">
          <div v-if="isDone" class="output-card">
            <div class="output-card__header">
              <div>
                <h3 class="output-card__title">Subtitle Output</h3>
                <p class="output-card__sub">{{ selectedFormat }} · {{ selectedLang }} · {{
                  subtitleOutput.split('\n\n').length }} segments</p>
              </div>
              <div class="output-card__actions">
                <button class="btn btn--sm btn--ghost" @click="copyOutput">
                  <component :is="copied ? Check : Copy" :size="14" />
                  {{ copied ? 'Copied!' : 'Copy' }}
                </button>
                <button class="btn btn--sm btn--primary">
                  <Download :size="14" />
                  Export .{{ selectedFormat.toLowerCase().split('/')[0] }}
                </button>
              </div>
            </div>
            <div class="output-card__content">
              <pre class="output-card__pre">{{ subtitleOutput }}</pre>
            </div>

            <!-- Subtitle Preview Blocks -->
            <div class="subtitle-blocks">
              <h4 class="subtitle-blocks__title">Preview</h4>
              <div class="subtitle-block-list">
                <div v-for="(block, i) in subtitleOutput.trim().split('\n\n')" :key="i" class="subtitle-block">
                  <div class="subtitle-block__meta">
                    <span class="subtitle-block__num">#{{ i + 1 }}</span>
                    <span class="subtitle-block__time">
                      <Clock :size="11" />
                      {{ block.split('\n')[1] }}
                    </span>
                  </div>
                  <p class="subtitle-block__text">{{ block.split('\n').slice(2).join(' ') }}</p>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        

        <!-- Empty State (right panel) -->
        <Transition name="fade">
          <div v-if="!isProcessing && !isDone" class="empty-panel">
            <div class="empty-panel__icon">
              <Languages :size="32" />
            </div>
            <p class="empty-panel__title">Your subtitles will appear here</p>
            <p class="empty-panel__hint">Upload a file and click Generate to start</p>
            <div class="empty-panel__features">
              <div v-for="feat in ['98% accuracy', '50+ languages', 'Word-level timing', 'Instant export']" :key="feat"
                class="empty-panel__feat">
                <Check :size="12" />
                <span>{{ feat }}</span>
              </div>
            </div>
          </div>
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

/* Header */
.gen-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gen-page__header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.gen-page__icon-wrap {
  width: 48px;
  height: 48px;
  background: var(--team-gradient);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: var(--shadow-glow);
  flex-shrink: 0;
}

.gen-page__title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.gen-page__sub {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
}

.gen-page__model-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--card-color);
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 0.4rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #a78bfa;
}

/* Grid */
.gen-page__grid {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* Upload Zone */
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

/* File selected */
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


/* Generate Button */
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

/* Progress Card */
.progress-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.progress-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.progress-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-card__title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}

.progress-card__pct {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--primary-color);
}

.progress-track {
  height: 6px;
  background: var(--card-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.85rem;
}

.progress-fill {
  height: 100%;
  background: var(--team-gradient);
  border-radius: 6px;
  transition: width 0.4s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.progress-fill--done::after {
  display: none;
}

.progress-steps {
  display: flex;
  gap: 0.5rem;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  color: var(--text-muted);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
  transition: all 0.3s;
}

.progress-step--done {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-color);
}

/* Output Card */
.output-card {
  background: var(--secondary-color);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  overflow: hidden;
}

.output-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0;
  margin-bottom: 1rem;
}

.output-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
}

.output-card__sub {
  font-size: 0.73rem;
  color: var(--text-muted);
  margin: 0;
}

.output-card__actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.output-card__content {
  background: var(--tertiary-color);
  margin: 0 1.25rem;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.output-card__pre {
  margin: 0;
  padding: 1rem;
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  line-height: 1.7;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
}

/* Subtitle Blocks */
.subtitle-blocks {
  padding: 1.25rem;
}

.subtitle-blocks__title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin: 0 0 0.85rem;
}

.subtitle-block-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subtitle-block {
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  transition: border-color 0.2s;
}

.subtitle-block:hover {
  border-color: var(--border-light);
}

.subtitle-block__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.subtitle-block__num {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--primary-color);
  background: var(--team-color-light);
  border-radius: 4px;
  padding: 1px 6px;
}

.subtitle-block__time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  color: var(--text-muted);
  font-family: monospace;
}

.subtitle-block__text {
  font-size: 0.83rem;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

/* Empty Panel */
.empty-panel {
  background: var(--secondary-color);
  border: 1px dashed var(--border-color);
  border-radius: 16px;
  padding: 3rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
  min-height: 400px;
  justify-content: center;
}

.empty-panel__icon {
  width: 72px;
  height: 72px;
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.empty-panel__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.empty-panel__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.empty-panel__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.empty-panel__feat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
}

.empty-panel__feat svg {
  color: var(--success-color);
}

/* Buttons */
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

.btn--primary {
  background: var(--team-gradient);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
}

.btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(139, 92, 246, 0.5);
}

.btn--ghost {
  background: var(--card-color);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn--ghost:hover {
  background: var(--hover-color);
  color: var(--text-primary);
  border-color: var(--border-light);
}

.btn--outline {
  background: transparent;
  color: var(--primary-color);
  border: 1px solid rgba(139, 92, 246, 0.4);
}

.btn--outline:hover {
  background: var(--team-color-light);
}

.btn--sm {
  font-size: 0.78rem;
  padding: 0.35rem 0.85rem;
}

/* Helpers */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.text-purple {
  color: var(--primary-color);
}

.text-green {
  color: var(--success-color);
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

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1024px) {
  .gen-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
