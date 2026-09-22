<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, FileText, Loader2, Play, Save, Download, Info, Timer } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { getSubtitleFiles, getSubtitleFileContent, type SubtitleFile } from '../services/subtitleService'
import { useVideoLibraryStore } from '../stores/videoLibraryStore'
import { getVideoStreamUrl } from '../services/videoService'

interface Cue {
  index: number
  start: string
  end: string
  text: string
}

const route = useRoute()
const router = useRouter()
const videoStore = useVideoLibraryStore()

const file = ref<SubtitleFile | null>(null)
const content = ref('')
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const videoEl = ref<HTMLVideoElement | null>(null)
const textareaEl = ref<HTMLTextAreaElement | null>(null)

const videoId = computed(() => String(route.params.videoId))
const subtitleId = computed(() => String(route.params.subtitleId))
const video = computed(() => videoStore.videos.find(item => item.id === videoId.value))
const videoUrl = computed(() => getVideoStreamUrl(videoId.value))

const cues = computed<Cue[]>(() => {
  const parsed: Cue[] = []
  const blocks = content.value.split(/\n\s*\n/)

  for (const block of blocks) {
    const lines = block.split('\n').filter(line => line.trim().length > 0)
    const first = lines[0]
    const second = lines[1]
    if (!first || !second) continue

    const indexMatch = first.match(/^\d+$/)
    if (!indexMatch) continue

    const timeMatch = second.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/)
    if (!timeMatch) continue

    const start = timeMatch[1]
    const end = timeMatch[2]
    if (!start || !end) continue

    parsed.push({
      index: Number(first),
      start,
      end,
      text: lines.slice(2).join(' '),
    })
  }

  return parsed
})

const toSeconds = (ts: string) => {
  const n = ts.replace(',', '.').split(':').map(Number)
  return ((n[0] ?? 0) * 3600) + ((n[1] ?? 0) * 60) + (n[2] ?? 0)
}

const jumpToCue = (cue: Cue) => {
  const seconds = toSeconds(cue.start)
  if (videoEl.value) videoEl.value.currentTime = seconds
  if (textareaEl.value) {
    textareaEl.value.scrollTop = (cue.index - 1) * 22.5
  }
}

const saveDraft = () => {
  toast.info('Save is not available in the preview editor')
}

const exportFile = () => {
  toast.info('Export is not available in the preview editor')
}

onMounted(async () => {
  isLoading.value = true
  loadError.value = null

  try {
    if (!videoStore.videos.length) await videoStore.fetchVideos()

    const files = await getSubtitleFiles(videoId.value)
    file.value = files.find(item => item.id === subtitleId.value) ?? null

    if (!file.value) {
      throw new Error('Subtitle file not found')
    }

    content.value = await getSubtitleFileContent(subtitleId.value)
  } catch {
    loadError.value = 'Could not load the subtitle editor content.'
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="editor-page">
    <header class="editor-page__topbar">
      <button class="back-button" type="button" @click="router.push(`/library/subtitles/${videoId}`)">
        <ArrowLeft :size="16" />
        Back to files
      </button>

      <div class="editor-page__title">
        <p class="eyebrow">Subtitle editor</p>
        <h1>{{ file?.filename ?? 'Editing…' }}</h1>
        <p v-if="file">
          {{ file.subtitleFormat }} · {{ file.languageCode }} · {{ cues.length }} cues
        </p>
      </div>

      <div class="editor-page__actions">
        <span class="demo-badge"><Info :size="12" /> Preview editor</span>
        <button class="save-button" type="button" @click="saveDraft">
          <Save :size="15" />
          Save
        </button>
        <button class="export-button" type="button" @click="exportFile">
          <Download :size="15" />
          Export
        </button>
      </div>
    </header>

    <div v-if="isLoading" class="editor-state">
      <Loader2 :size="28" class="spin" />
      <span>Loading editor…</span>
    </div>

    <div v-else-if="loadError" class="editor-state editor-state--error">
      <FileText :size="28" />
      <span>{{ loadError }}</span>
    </div>

    <template v-else>
      <div class="editor-layout">
        <section class="preview-panel">
          <video
            ref="videoEl"
            class="preview-panel__video"
            :src="videoUrl"
            controls
            playsinline
            preload="metadata"
          ></video>

          <div class="preview-panel__cues">
            <div class="preview-panel__cues-head">
              <Timer :size="14" />
              Cue list
            </div>
            <div v-if="cues.length" class="cue-list">
              <button
                v-for="cue in cues"
                :key="cue.index"
                class="cue-item"
                type="button"
                @click="jumpToCue(cue)"
              >
                <span class="cue-item__index">{{ cue.index }}</span>
                <div class="cue-item__body">
                  <span class="cue-item__time">{{ cue.start }} → {{ cue.end }}</span>
                  <span class="cue-item__text">{{ cue.text }}</span>
                </div>
                <Play :size="13" class="cue-item__play" />
              </button>
            </div>
            <div v-else class="preview-panel__no-cues">No subtitle cues found.</div>
          </div>
        </section>

        <section class="edit-panel">
          <div class="edit-panel__toolbar">
            <span>Raw content</span>
            <span class="edit-panel__hint">Editing is local only — nothing is sent to the server.</span>
          </div>
          <textarea
            ref="textareaEl"
            v-model="content"
            class="edit-panel__textarea"
            spellcheck="false"
          ></textarea>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.editor-page { padding: 1.5rem; color: var(--text-primary); min-height: 100%; }

.editor-page__topbar { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
.back-button { display: inline-flex; align-items: center; gap: 0.45rem; width: fit-content; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 0.75rem; background: var(--secondary-color); color: var(--text-secondary); font-size: 0.8rem; cursor: pointer; }
.back-button:hover { color: var(--text-primary); border-color: var(--border-light); }
.editor-page__title { flex: 1; min-width: 200px; }
.eyebrow { margin: 0 0 0.35rem; color: #f97316; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
.editor-page__title h1 { margin: 0; font-size: clamp(1.2rem, 2vw, 1.6rem); }
.editor-page__title p { margin: 0.35rem 0 0; color: var(--text-muted); font-size: 0.78rem; }
.editor-page__actions { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.demo-badge { display: inline-flex; align-items: center; gap: 0.35rem; border: 1px solid rgba(249,115,22,0.35); border-radius: 20px; padding: 0.25rem 0.6rem; background: rgba(249,115,22,0.08); color: #f97316; font-size: 0.68rem; font-weight: 700; }

.save-button, .export-button { display: inline-flex; align-items: center; gap: 0.4rem; border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
.save-button { border: 1px solid rgba(16,185,129,0.4); background: rgba(16,185,129,0.1); color: #10b981; }
.save-button:hover { background: rgba(16,185,129,0.18); }
.export-button { border: 1px solid var(--border-color); background: var(--secondary-color); color: var(--text-secondary); }
.export-button:hover { color: var(--text-primary); border-color: var(--border-light); }

.editor-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.7rem; min-height: 320px; color: var(--text-muted); font-size: 0.9rem; }
.editor-state--error { color: #ef4444; }

.editor-layout { display: grid; grid-template-columns: minmax(320px, 42%) 1fr; gap: 1.25rem; align-items: stretch; }

.preview-panel { display: flex; flex-direction: column; gap: 1rem; }
.preview-panel__video { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 12px; border: 1px solid var(--border-color); }
.preview-panel__cues { background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; min-height: 220px; }
.preview-panel__cues-head { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem; }

.cue-list { display: flex; flex-direction: column; gap: 0.35rem; max-height: 360px; overflow-y: auto; }
.cue-item { display: flex; align-items: center; gap: 0.6rem; width: 100%; text-align: left; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.5rem 0.6rem; background: var(--card-color); cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.cue-item:hover { border-color: #f97316; background: rgba(249,115,22,0.05); }
.cue-item__index { flex-shrink: 0; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 6px; background: rgba(249,115,22,0.12); color: #f97316; font-size: 0.68rem; font-weight: 700; }
.cue-item__body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.cue-item__time { font-size: 0.66rem; color: var(--text-muted); }
.cue-item__text { font-size: 0.78rem; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cue-item__play { color: var(--text-muted); flex-shrink: 0; }
.preview-panel__no-cues { color: var(--text-muted); font-size: 0.8rem; padding: 1rem 0; }

.edit-panel { display: flex; flex-direction: column; background: var(--secondary-color); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
.edit-panel__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.7rem 1rem; border-bottom: 1px solid var(--border-color); font-size: 0.78rem; font-weight: 700; }
.edit-panel__hint { font-weight: 400; color: var(--text-muted); font-size: 0.72rem; }
.edit-panel__textarea {
  flex: 1; min-height: 420px; width: 100%; resize: none;
  background: var(--surface-color, #0a0f1e); color: var(--text-primary);
  border: 0; outline: none; padding: 1rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.82rem; line-height: 1.6;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 860px) {
  .editor-page { padding: 1rem; }
  .editor-layout { grid-template-columns: 1fr; }
  .edit-panel__textarea { min-height: 320px; }
}
</style>