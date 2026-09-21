import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { socket } from '../services/socket'
import { jobService } from '../services/jobService'

const STORAGE_KEY = 'current-job'

export type JobPhase =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

interface PersistedJob {
  jobId: string | null
  progress: number
  jobStatus: JobPhase
  stage: string | null
  error: string | null
  startedAt: number | null
  lastActivity: number | null
}

interface SocketProgress {
  jobId: string
  progress: number
  stage: string
}

const RECONCILE_INTERVAL_MS = 10_000
const NO_RECORD_LOST_AFTER_MS = 5 * 60 * 1000
const TERMINAL_PHASES: JobPhase[] = ['completed', 'failed', 'cancelled']

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

function readPersistedJob(): PersistedJob | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PersistedJob
  } catch {
    return null
  }
}

export const useCurrentJobStore = defineStore('jobs/current', () => {
  const jobId = ref<string | null>(null)
  const progress = ref(0)
  const jobStatus = ref<JobPhase>('idle')
  const stage = ref<string | null>(null)
  const error = ref<string | null>(null)
  const startedAt = ref<number | null>(null)
  const lastActivity = ref<number | null>(null)
  const connectionState = ref<'idle' | 'connected' | 'disconnected'>('idle')
  const isListening = ref(false)

  let reconcileTimer: number | null = null

  /* ─── Derived state ─── */
  const isUploading = computed(() => jobStatus.value === 'uploading')
  const isQueued = computed(() => jobStatus.value === 'queued')
  const isProcessing = computed(
    () => jobStatus.value === 'queued' || jobStatus.value === 'processing',
  )
  const isActive = computed(
    () =>
      jobStatus.value === 'uploading' ||
      jobStatus.value === 'queued' ||
      jobStatus.value === 'processing',
  )
  const isDone = computed(() => jobStatus.value === 'completed')
  const isFailed = computed(() => jobStatus.value === 'failed')
  const isCancelled = computed(() => jobStatus.value === 'cancelled')
  const hasActiveJob = computed(() => jobId.value !== null)

  /* ─── Persistence ─── */
  function persist() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        jobId: jobId.value,
        progress: progress.value,
        jobStatus: jobStatus.value,
        stage: stage.value,
        error: error.value,
        startedAt: startedAt.value,
        lastActivity: lastActivity.value,
      } satisfies PersistedJob),
    )
  }

  /* ─── State transitions ─── */
  function setPhase(phase: JobPhase) {
    jobStatus.value = phase
  }

  function markCompleted() {
    progress.value = 100
    stage.value = 'Completed'
    error.value = null
    setPhase('completed')
    lastActivity.value = Date.now()
    stopSocketListening()
    persist()
  }

  function failJob(message?: string | null) {
    error.value = message || 'The job failed on the processing server.'
    stage.value = 'Failed'
    setPhase('failed')
    lastActivity.value = Date.now()
    stopSocketListening()
    persist()
  }

  function cancelJob() {
    if (!isActive.value) return
    stopSocketListening()
    error.value = null
    stage.value = 'Cancelled'
    setPhase('cancelled')
    lastActivity.value = Date.now()
    persist()
  }

  /* ─── Socket event handling ─── */
  function handleSocketProgress(data: SocketProgress) {
    if (!data || data.jobId !== jobId.value) return

    const rawStage = String(data.stage || '').toLowerCase()
    const pct = clampProgress(data.progress)

    // Backend queue reports failure / stall through the stage field with
    // progress reset to 0. Without this, the UI stuck on "generating".
    if (rawStage.includes('fail')) {
      failJob('The job failed on the processing server.')
      return
    }

    if (rawStage.includes('stall')) {
      failJob('The job stalled in the queue and could not continue.')
      return
    }

    // Busy workers re-sync the stage text whenever a progress event lands.
    stage.value = data.stage || 'Processing'
    progress.value = pct
    lastActivity.value = Date.now()

    if (pct >= 100) {
      markCompleted()
      return
    }

    // A job is only marked as "started / processing" once the backend queue
    // actually starts delivering progress. Before that it stays "queued".
    setPhase('processing')
    error.value = null
    persist()
  }

  function onSocketConnect() {
    connectionState.value = 'connected'
    // Re-attach in case the socket dropped and reconnected; handlers on the
    // fresh socket need the listener to be registered again.
    if (isListening.value && jobId.value) {
      socket.off('job-progress', handleSocketProgress)
      socket.on('job-progress', handleSocketProgress)
    }
  }

  function onSocketDisconnect() {
    connectionState.value = 'disconnected'
  }

  function startSocketListening() {
    if (isListening.value) return

    socket.on('job-progress', handleSocketProgress)
    socket.on('connect', onSocketConnect)
    socket.on('disconnect', onSocketDisconnect)
    socket.on('connect_error', onSocketDisconnect)

    isListening.value = true
    connectionState.value =
      socket.connected ? 'connected' : 'disconnected'

    if (!socket.connected) socket.connect()

    startReconcileTimer()
  }

  function stopSocketListening() {
    socket.off('job-progress', handleSocketProgress)
    socket.off('connect', onSocketConnect)
    socket.off('disconnect', onSocketDisconnect)
    socket.off('connect_error', onSocketDisconnect)
    if (socket.connected) socket.disconnect()

    isListening.value = false
    connectionState.value = 'idle'
    stopReconcileTimer()
  }

  /* ─── Queue reconciliation ───
   * Socket events can be missed (job finished / failed while the tab was
   * closed, or the connection dropped). Reconcile against the REST job list
   * by queue job id so the progress panel never spins forever.
   */
  async function reconcile(): Promise<'running' | 'terminal' | 'missing' | 'error'> {
    const id = jobId.value
    if (!id || !isProcessing.value) return 'running'

    try {
      const jobs = await jobService.getJobForVideo()
      const match = jobs.find((entry) => entry.queueJobId === id)

      if (!match) return 'missing'

      if (match.status === 'FAILED') {
        failJob(match.errorMessage || 'The job failed on the processing server.')
        return 'terminal'
      }

      if (match.status === 'COMPLETED') {
        markCompleted()
        return 'terminal'
      }

      // PENDING / QUEUED / PROCESSING all mean the worker has the job.
      stage.value = 'Processing'
      lastActivity.value = Date.now()
      if (jobStatus.value !== 'processing') setPhase('processing')
      return 'running'
    } catch {
      return 'error'
    }
  }

  async function runReconcileLoop() {
    const result = await reconcile()
    if (result === 'missing') {
      // No DB record yet – the worker may still be picking the job up. Only
      // give up once the job should have been picked up long ago.
      const lastSeen = lastActivity.value ?? startedAt.value ?? 0
      if (lastSeen && Date.now() - lastSeen >= NO_RECORD_LOST_AFTER_MS) {
        failJob('This job is no longer available on the server. It was probably removed or stopped.')
      }
    }
  }

  function startReconcileTimer() {
    stopReconcileTimer()
    reconcileTimer = window.setInterval(() => {
      void runReconcileLoop()
    }, RECONCILE_INTERVAL_MS)
  }

  function stopReconcileTimer() {
    if (reconcileTimer !== null) {
      window.clearInterval(reconcileTimer)
      reconcileTimer = null
    }
  }

  /* ─── Lifecycle ─── */
  function startUpload() {
    stopSocketListening()
    jobId.value = null
    progress.value = 0
    stage.value = 'Uploading'
    error.value = null
    startedAt.value = Date.now()
    lastActivity.value = Date.now()
    setPhase('uploading')
  }

  function startJob(id: string) {
    jobId.value = id
    progress.value = 0
    stage.value = 'Queued'
    error.value = null
    startedAt.value = Date.now()
    lastActivity.value = Date.now()
    // Wait for the backend queue to actually start the job before any
    // progress kicks in – nothing is marked "processing" yet.
    setPhase('queued')
    persist()
    startSocketListening()
  }

  function restore() {
    const saved = readPersistedJob()
    if (!saved?.jobId) return

    jobId.value = String(saved.jobId)
    progress.value = clampProgress(Number(saved.progress) || 0)
    stage.value = saved.stage ?? null
    startedAt.value = saved.startedAt ?? null
    lastActivity.value = saved.lastActivity ?? null

    const phase = saved.jobStatus
    if (TERMINAL_PHASES.includes(phase)) {
      // Surface the final result; nothing to listen for.
      if (phase === 'completed') progress.value = 100
      setPhase(phase)
      error.value = phase === 'failed'
        ? (saved.error ?? 'The job failed on the processing server.')
        : null
      persist()
      return
    }

    if (phase === 'uploading') {
      // An in-flight upload cannot be resumed after a reload.
      clear()
      return
    }

    // Resume queued / processing jobs and immediately reconcile so a job that
    // already finished while this tab was closed is resolved right away.
    setPhase(phase === 'queued' ? 'queued' : 'processing')
    progress.value = progress.value || 0
    persist()
    void reconcile()
    startSocketListening()
  }

  function clear() {
    stopSocketListening()
    jobId.value = null
    progress.value = 0
    jobStatus.value = 'idle'
    stage.value = null
    error.value = null
    startedAt.value = null
    lastActivity.value = null
    connectionState.value = 'idle'
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    jobId,
    progress,
    jobStatus,
    stage,
    error,
    startedAt,
    lastActivity,
    connectionState,
    isListening,
    isUploading,
    isQueued,
    isProcessing,
    isActive,
    isDone,
    isFailed,
    isCancelled,
    hasActiveJob,
    startUpload,
    startJob,
    startSocketListening,
    stopSocketListening,
    cancelJob,
    failJob,
    markCompleted,
    reconcile,
    restore,
    clear,
  }
})

export { useCurrentJobStore as useJobStore }