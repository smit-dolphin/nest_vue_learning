<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, Check, Clock } from 'lucide-vue-next'

const props = defineProps<{
  progress: number
}>()

const isProcessing = computed(() => props.progress < 100)
const isDone = computed(() => props.progress === 100)

const progressLabel = computed(() => {
  if (props.progress < 30) return 'Uploading media...'
  if (props.progress < 60) return 'Transcribing audio...'
  if (props.progress < 85) return 'burning subtitles...'
  if (props.progress < 100) return 'Formatting output...'
  return 'Complete!'
})

const steps = ['Upload', 'Transcribe', 'Burning', 'Format'] as const

function stepDone(step: string) {
  if (step === 'Upload') return props.progress >= 30
  if (step === 'Transcribe') return props.progress >= 60
  if (step === 'Burning') return props.progress >= 85
  if (step === 'Format') return props.progress >= 100
  return false
}

function stepIcon(step: string) {
  return stepDone(step) ? Check : Clock
}
</script>

<template>
  <div class="progress-card">
    <div class="progress-card__header">
      <div class="progress-card__title-wrap">
        <Loader2 v-if="isProcessing" :size="15" class="spin text-purple" />
        <Check v-else :size="15" class="text-green" />
        <span class="progress-card__title">{{ progressLabel }}</span>
      </div>
      <span class="progress-card__pct">{{ progress }}%</span>
    </div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :style="{ width: progress + '%' }"
        :class="{ 'progress-fill--done': isDone }"
      ></div>
    </div>
    <div class="progress-steps">
      <div
        v-for="step in steps"
        :key="step"
        class="progress-step"
        :class="{ 'progress-step--done': stepDone(step) }"
      >
        <component :is="stepIcon(step)" :size="10" />
        {{ step }}
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
