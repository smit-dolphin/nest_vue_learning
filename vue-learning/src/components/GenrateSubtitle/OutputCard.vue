<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Clock, Copy, Download, FileText } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const props = defineProps<{
  format: string
  language: string
  content: string
  filename?: string
}>()

const emit = defineEmits<{
  export: []
}>()

const copied = ref(false)

interface Segment {
  time: string
  text: string
}

const segments = computed<Segment[]>(() => parseSegments(props.content))

function parseSegments(content: string): Segment[] {
  const trimmed = content.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data: unknown = JSON.parse(trimmed)
      const entries = Array.isArray(data) ? data : ((data as { segments?: unknown[] }).segments ?? [])
      return entries.map((entry) => {
        const item = entry as { timestamp?: string; start?: string; text?: string; content?: string }
        return {
          time: item.timestamp ?? item.start ?? '',
          text: String(item.text ?? item.content ?? ''),
        }
      })
    } catch {
      return []
    }
  }

  return trimmed
    .split(/\n\s*\n/)
    .filter((block) => block.trim())
    .map((block) => {
      const lines = block.split('\n').filter((line) => line.trim())
      const timeLine = lines.find((line) => line.includes('-->')) ?? ''
      const textLines = lines.filter(
        (line) =>
          line.trim() !== 'WEBVTT' &&
          !line.includes('-->') &&
          !/^\d+$/.test(line.trim()),
      )
      return {
        time: timeLine.replace(/\s{2,}/g, ' ').trim(),
        text: textLines.join(' ').trim(),
      }
    })
    .filter((segment) => segment.time || segment.text)
}

const exportLabel = computed(() => props.format.toLowerCase().replace('.', ''))

async function copyOutput() {
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    toast.success('Subtitle output copied to clipboard.')
    window.setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.error('Could not copy the subtitle output.')
  }
}
</script>

<template>
  <div class="output-card">
    <div class="output-card__header">
      <div>
        <h3 class="output-card__title">Subtitle Output</h3>
        <p class="output-card__sub">{{ format }} · {{ language }} · {{ segments.length }} segment{{ segments.length === 1 ? '' : 's' }}</p>
      </div>
      <div class="output-card__actions">
        <button class="btn btn--sm btn--ghost" type="button" @click="copyOutput">
          <Check v-if="copied" :size="14" />
          <Copy v-else :size="14" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button class="btn btn--sm btn--primary" type="button" title="Download subtitle file" @click="emit('export')">
          <Download :size="14" />
          Export .{{ exportLabel }}
        </button>
      </div>
    </div>

    <div v-if="content" class="output-card__content">
      <pre class="output-card__pre">{{ content }}</pre>
    </div>
    <div v-else class="output-card__empty">
      <FileText :size="22" />
      <p>Subtitle content is not available yet.</p>
    </div>

    <div v-if="segments.length" class="subtitle-blocks">
      <h4 class="subtitle-blocks__title">Preview</h4>
      <div class="subtitle-block-list">
        <div v-for="(segment, index) in segments" :key="index" class="subtitle-block">
          <div class="subtitle-block__meta">
            <span class="subtitle-block__num">#{{ index + 1 }}</span>
            <span v-if="segment.time" class="subtitle-block__time">
              <Clock :size="11" />
              {{ segment.time }}
            </span>
          </div>
          <p class="subtitle-block__text">{{ segment.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  gap: 1rem;
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

.output-card__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1.25rem;
  padding: 2rem 1rem;
  color: var(--text-muted);
  background: var(--tertiary-color);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  text-align: center;
  font-size: 0.8rem;
}

.output-card__empty p {
  margin: 0;
}

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

.btn--sm {
  font-size: 0.78rem;
  padding: 0.35rem 0.85rem;
}
</style>