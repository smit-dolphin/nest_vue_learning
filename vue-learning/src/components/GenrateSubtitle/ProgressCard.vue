<script setup lang="ts">
import { computed } from 'vue'
import { Check, CheckCircle2, Clock, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  progress: number
}>()

const clampedProgress = computed(() => Math.max(0, Math.min(100, props.progress)))
const isProcessing = computed(() => clampedProgress.value < 100)
const isDone = computed(() => clampedProgress.value === 100)

const progressLabel = computed(() => {
  if (clampedProgress.value < 30) return 'Uploading media…'
  if (clampedProgress.value < 60) return 'Transcribing audio…'
  if (clampedProgress.value < 85) return 'Burning subtitles…'
  if (clampedProgress.value < 100) return 'Formatting output…'
  return 'Complete!'
})

const steps: { label: string; threshold: number }[] = [
  { label: 'Upload', threshold: 30 },
  { label: 'Transcribe', threshold: 60 },
  { label: 'Burning', threshold: 85 },
  { label: 'Format', threshold: 100 },
]

const activeStepIndex = computed(() =>
  steps.findIndex((step) => clampedProgress.value < step.threshold),
)
</script>

<template>
  <div class="progress-card" role="status" aria-live="polite">
    <div class="progress-card__header">
      <div class="progress-card__title-wrap">
        <Loader2 v-if="isProcessing" :size="15" class="spin text-purple" />
        <CheckCircle2 v-else :size="15" class="text-green" />
        <span class="progress-card__title">{{ progressLabel }}</span>
      </div>
      <span class="progress-card__pct">{{ clampedProgress }}%</span>
    </div>

    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{ 'progress-fill--done': isDone }"
        :style="{ width: clampedProgress + '%' }"
      ></div>
    </div>

    <div class="progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.label"
        class="progress-step"
        :class="{
          'progress-step--done': clampedProgress >= step.threshold,
          'progress-step--active': isProcessing && index === activeStepIndex,
        }"
      >
        <Check v-if="clampedProgress >= step.threshold" :size="10" />
        <Clock v-else :size="10" />
        {{ step.label }}
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
  0% { left: -100%; }
  100% { left: 100%; }
}

.progress-fill--done::after {
  display: none;
}

.progress-steps {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.progress-step--active {
  border-color: rgba(139, 92, 246, 0.4);
  color: var(--primary-color);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text-purple {
  color: var(--primary-color);
}

.text-green {
  color: var(--success-color);
}
</style>