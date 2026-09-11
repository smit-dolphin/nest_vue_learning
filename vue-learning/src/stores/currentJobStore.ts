import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { socket } from '../services/socket'

const STORAGE_KEY = 'current-job'

function readPersistedJob(): Record<string, string | number> | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Record<string, string | number>
  } catch {
    return null
  }
}

export const useCurrentJobStore = defineStore('jobs/current', () => {
  const jobId = ref<string | null>(null)
  const progress = ref(0)
  const jobStatus = ref<string | null>(null)
  const error = ref<string | null>(null)
  const isListening = ref(false)

  function handleSocketProgress(data: { jobId: string; progress: number; stage: string }) {
    if (data.jobId !== jobId.value) return

    progress.value = Math.max(0, Math.min(100, Number(data.progress) || 0))
    jobStatus.value = progress.value >= 100 ? 'completed' : 'active'
    error.value = null
    persist()

    if (isDone.value) {
      stopSocketListening()
    }
  }

  function startSocketListening() {
    if (isListening.value) return
    socket.on('job-progress', handleSocketProgress)
    isListening.value = true
    if (!socket.connected) socket.connect()
  }

  function stopSocketListening() {
    socket.off('job-progress', handleSocketProgress)
    if (socket.connected) socket.disconnect()
    isListening.value = false
  }

  const isProcessing = computed(() => isListening.value && !isDone.value && !isFailed.value)
  const isDone = computed(() => !isFailed.value && (jobStatus.value === 'completed' || progress.value >= 100))
  const isFailed = computed(() => jobStatus.value === 'failed')
  const hasActiveJob = computed(() => jobId.value !== null)

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ jobId: jobId.value, progress: progress.value, jobStatus: jobStatus.value }))
  }

  function restore() {
    const saved = readPersistedJob()
    if (!saved?.jobId) return

    jobId.value = String(saved.jobId)
    progress.value = Number(saved.progress) || 0
    jobStatus.value = saved.jobStatus ? String(saved.jobStatus) : null

    // Only listen for progress from in-flight jobs.
    const finalStatuses = ['completed', 'failed']
    if (!jobStatus.value || !finalStatuses.includes(jobStatus.value)) {
      startSocketListening()
    }
  }

  function clear() {
    stopSocketListening()
    jobId.value = null
    progress.value = 0
    jobStatus.value = null
    error.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function startJob(id: string) {
    jobId.value = id
    progress.value = 0
    jobStatus.value = 'active'
    error.value = null
    persist()
    startSocketListening()
  }

  return {
    jobId,
    progress,
    jobStatus,
    isListening,
    isProcessing,
    isDone,
    isFailed,
    error,
    hasActiveJob,
    startJob,
    startSocketListening,
    stopSocketListening,
    restore,
    clear,
  }
})

export { useCurrentJobStore as useJobStore }
