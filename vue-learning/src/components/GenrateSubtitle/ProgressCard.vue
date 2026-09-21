<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Check, CheckCircle2, Clock, CloudUpload, Loader2, XCircle } from 'lucide-vue-next'
import type { JobPhase } from '../../stores/currentJobStore'

const props = defineProps<{
  status: JobPhase
  progress: number
  stage?: string | null
  error?: string | null
  connectionState?: 'idle' | 'connected' | 'disconnected'
  cancellable?: boolean
}>()

const emit = defineEmits<{
  cancel: []
}>()

const clampedProgress = computed(() => Math.max(0, Math.min(100, props.progress)))

const phaseLabel = computed(() => {
  if (props.status === 'uploading') return 'Uploading video…'
  if (props.status === 'queued') return 'Waiting in queue…'
  if (props.status === 'completed') return 'Complete!'
  if (props.status === 'failed') return 'Generation failed'
  if (props.status === 'cancelled') return 'Generation cancelled'
  if (props.status === 'processing') {
    if (clampedProgress.value < 30) return 'Extracting audio…'
    if (clampedProgress.value < 100) return 'Processing subtitles…'
    return 'Complete!'
  }
  return 'Idle'
})

const isLive = computed(
  () => props.status === 'uploading' || props.status === 'queued' || props.status === 'processing',
)

const isDisconnected = computed(
  () => props.connectionState === 'disconnected' && isLive.value,
)

const isIndeterminate = computed(() => props.status === 'uploading' || props.status === 'queued')

const fillWidth = computed(() => (isIndeterminate.value ? 40 : `${clampedProgress.value}%`))

const showSteps = computed(() => props.status === 'processing' || props.status === 'completed')

const steps: { label: string; threshold: number }[] = [
  { label: 'Queued', threshold: 1 },
  { label: 'Extracting audio', threshold: 30 },
  { label: 'Processing subtitles', threshold: 85 },
  { label: 'Output', threshold: 100 },
]

const activeStepIndex = computed(() =>
  steps.findIndex((step) => clampedProgress.value < step.threshold),
)

const errorText = computed(
  () =>
    props.error ??
    (props.status === 'failed' ? 'The subtitle job could not be completed.' : ''),
)

const icon = computed(() => {
  switch (props.status) {
    case 'uploading':
      return CloudUpload
    case 'queued':
      return Clock
    case 'processing':
      return Loader2
    case 'completed':
      return CheckCircle2
    case 'failed':
      return AlertTriangle
    case 'cancelled':
      return XCircle
    default:
      return Clock
  }
})
</script>

<template>
  <div class="progress-card" :class="`progress-card--${status}`" role="status" aria-live="polite">
    <div class="progress-card__header">
      <div class="progress-card__title-wrap">
        <component
          :is="icon"
          :size="16"
          class="progress-card__icon"
          :class="{ spin: isLive && !isIndeterminate, 'is-upload': status === 'uploading' }"
        />
        <span class="progress-card__title">{{ phaseLabel }}</span>
        <span
          v-if="stage && status !== 'completed' && stage.toLowerCase() !== 'processing'"
          class="progress-card__stage"
        >
          {{ stage }}
        </span>
      </div>

      <div class="progress-card__actions">
        <span v-if="!isIndeterminate" class="progress-card__pct">{{ clampedProgress }}%</span>
        <button
          v-if="cancellable && isLive"
          class="progress-card__cancel"
          type="button"
          title="Cancel this job"
          @click="emit('cancel')"
        >
          <XCircle :size="13" />
          Cancel
        </button>
      </div>
    </div>

    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{
          'progress-fill--indeterminate': isIndeterminate,
          'progress-fill--done': status === 'completed',
          'progress-fill--error': status === 'failed' || status === 'cancelled',
        }"
        :style="{ width: fillWidth }"
      ></div>
    </div>

    <p v-if="isLive" class="progress-card__sub">
      <template v-if="status === 'uploading'">
        Waiting for the server to confirm the upload before watching the queue…
      </template>
      <template v-else-if="status === 'queued'">
        The job is queued on the server. Progress starts once processing begins.
      </template>
      <template v-else>
        Subtitle job {{ stage && stage.toLowerCase() !== 'processing' ? `· ${stage}` : '' }}
      </template>
    </p>

    <p v-if="isDisconnected" class="progress-card__warn">
      Progress events are temporarily unavailable – reconnecting to the server…
    </p>

    <p v-else-if="status === 'failed' || status === 'cancelled'" class="progress-card__error">
      {{ status === 'cancelled' ? 'This job was cancelled.' : errorText }}
    </p>

    <div v-if="showSteps" class="progress-steps">
      <div
        v-for="(step, index) in steps"
        :key="step.label"
        class="progress-step"
        :class="{
          'progress-step--done': clampedProgress >= step.threshold,
          'progress-step--active': isLive && status === 'processing' && index === activeStepIndex,
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
  transition: border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-card--processing {
  border-color: rgba(139, 92, 246, 0.35);
}

.progress-card--completed {
  border-color: rgba(16, 185, 129, 0.35);
}

.progress-card--failed {
  border-color: rgba(239, 68, 68, 0.35);
}

.progress-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
}

.progress-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex-wrap: wrap;
}

.progress-card__icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.progress-card--completed .progress-card__icon {
  color: var(--success-color);
}

.progress-card--failed .progress-card__icon,
.progress-card--cancelled .progress-card__icon {
  color: var(--danger-color);
}

.is-upload {
  animation: bob 1.6s ease-in-out infinite;
}

.progress-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
}

.progress-card__stage {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.15rem 0.55rem;
  text-transform: capitalize;
}

.progress-card__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.progress-card__pct {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--primary-color);
}

.progress-card--completed .progress-card__pct {
  color: var(--success-color);
}

.progress-card__cancel {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.35rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--card-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.2s;
}

.progress-card__cancel:hover {
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.08);
}

.progress-track {
  height: 7px;
  background: var(--card-color);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-fill {
  height: 100%;
  background: var(--team-gradient);
  border-radius: 6px;
  transition: width 0.4s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill--indeterminate {
  transition: none;
  animation: slide 1.4s ease-in-out infinite;
}

.progress-fill--done {
  background: var(--success-color);
}

.progress-fill--error {
  background: var(--danger-color);
}

.progress-fill--done::after,
.progress-fill--error::after {
  display: none;
}

.progress-card__sub {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  color: var(--text-muted);
  line-height: 1.45;
}

.progress-card__error {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  color: var(--danger-color);
  line-height: 1.45;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
}

.progress-card__warn {
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
  color: var(--warning-color);
  line-height: 1.45;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
}

.progress-steps {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
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
  padding: 0.22rem 0.65rem;
  transition: all 0.3s;
}

.progress-step--done {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--success-color);
}

.progress-step--active {
  border-color: rgba(139, 92, 246, 0.45);
  color: var(--primary-color);
  background: var(--team-color-light);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slide {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(220%); }
}

@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}
</style>