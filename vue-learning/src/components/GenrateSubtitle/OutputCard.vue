<script setup lang="ts">
import { ref, computed } from 'vue'
import { Copy, Check, Download, Clock } from 'lucide-vue-next'

const props = defineProps<{
  subtitleOutput: string
  format: string
  language: string
}>()

const copied = ref(false)

const blocks = computed(() => props.subtitleOutput.trim().split('\n\n'))
const segmentCount = computed(() => blocks.value.length)

const copyOutput = async () => {
  await navigator.clipboard.writeText(props.subtitleOutput)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div class="output-card">
    <div class="output-card__header">
      <div>
        <h3 class="output-card__title">Subtitle Output</h3>
        <p class="output-card__sub">{{ format }} · {{ language }} · {{ segmentCount }} segments</p>
      </div>
      <div class="output-card__actions">
        <button class="btn btn--sm btn--ghost" @click="copyOutput">
          <component :is="copied ? Check : Copy" :size="14" />
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button class="btn btn--sm btn--primary">
          <Download :size="14" />
          Export .{{ format.toLowerCase().split('/')[0] }}
        </button>
      </div>
    </div>
    <div class="output-card__content">
      <pre class="output-card__pre">{{ subtitleOutput }}</pre>
    </div>

    <div class="subtitle-blocks">
      <h4 class="subtitle-blocks__title">Preview</h4>
      <div class="subtitle-block-list">
        <div v-for="(block, i) in blocks" :key="i" class="subtitle-block">
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
