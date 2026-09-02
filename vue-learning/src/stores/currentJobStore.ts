import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { jobService, type JobStatusDto } from '../services/jobService'

const POLL_INTERVAL_MS = 1000 * 10
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
  const isPolling = ref(false)

  let pollTimer: ReturnType<typeof setInterval> | null = null

  const isProcessing = computed(() => isPolling.value && !isDone.value && !isFailed.value)
  const isDone = computed(() => jobStatus.value === 'completed' || progress.value >= 100)
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

    // Only resume polling for in-flight jobs (not already completed/failed)
    const finalStatuses = ['completed', 'failed']
    if (!jobStatus.value || !finalStatuses.includes(jobStatus.value)) {
      startPolling()
    }
  }

  function clear() {
    jobId.value = null
    progress.value = 0
    jobStatus.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  async function pollStatus() {
    if (!jobId.value) return

    try {
      const result = (await jobService.getJobStatus(jobId.value)) as JobStatusDto
      progress.value = Number(result.progress) ?? 0
      jobStatus.value = result.status

      persist()

      if (isDone.value || isFailed.value) {
        stopPolling()
      }
    } catch (err) {
      stopPolling()
    }
  }

  function startPolling() {
    if (pollTimer) return
    isPolling.value = true
    pollStatus()
    pollTimer = setInterval(pollStatus, POLL_INTERVAL_MS)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
  }

  function startJob(id: string) {
    jobId.value = id
    progress.value = 0
    jobStatus.value = 'active'
    persist()
    startPolling()
  }

  return {
    jobId,
    progress,
    jobStatus,
    isPolling,
    isProcessing,
    isDone,
    isFailed,
    hasActiveJob,
    startJob,
    startPolling,
    stopPolling,
    pollStatus,
    restore,
    clear,
  }
})

export { useCurrentJobStore as useJobStore }
