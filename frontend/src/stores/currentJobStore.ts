import { defineStore } from 'pinia'

import { getSocket, JOB_PROGRESS_EVENT, type JobProgressEvent } from '@/lib/socket'
import { getJobs } from '@/services/jobService'

export type JobPhase =
  | 'idle'
  | 'uploading'
  | 'queued'
  | 'processing'
  | 'finalizing'
  | 'completed'
  | 'failed'

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected'

/** Context kept alongside the job so the UI can describe it after completion. */
export interface JobContext {
  videoId: string | null
  videoName: string | null
  language: string
  format: string
  burnVideo: boolean
}

const TERMINAL_PHASES: JobPhase[] = ['completed', 'failed']
const RECONCILE_INTERVAL_MS = 10_000
const VERIFY_INTERVAL_MS = 2_000
/** How long to wait for the worker to persist `COMPLETED` before trusting the socket. */
const MAX_VERIFY_ATTEMPTS = 15
/** Give the worker this long to create a DB row before declaring the job lost. */
const NO_RECORD_LOST_AFTER_MS = 5 * 60 * 1000

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

interface CurrentJobState {
  /** BullMQ queue job id – the value the gateway emits in `job-progress`. */
  jobId: string | null
  progress: number
  phase: JobPhase
  stage: string | null
  error: string | null
  startedAt: number | null
  lastActivity: number | null
  context: JobContext
  connection: ConnectionState
  reconcileTimer: number | null
  verifyTimer: number | null
  verifyAttempts: number
}

export const useCurrentJobStore = defineStore('currentJob', {
  state: (): CurrentJobState => ({
    jobId: null,
    progress: 0,
    phase: 'idle',
    stage: null,
    error: null,
    startedAt: null,
    lastActivity: null,
    context: {
      videoId: null,
      videoName: null,
      language: 'en',
      format: 'SRT',
      burnVideo: false,
    },
    connection: 'idle',
    reconcileTimer: null,
    verifyTimer: null,
    verifyAttempts: 0,
  }),

  getters: {
    isUploading: (state): boolean => state.phase === 'uploading',
    isQueued: (state): boolean => state.phase === 'queued',
    isProcessing: (state): boolean => state.phase === 'queued' || state.phase === 'processing',
    isActive: (state): boolean =>
      state.phase === 'uploading' ||
      state.phase === 'queued' ||
      state.phase === 'processing' ||
      state.phase === 'finalizing',
    isCompleted: (state): boolean => state.phase === 'completed',
    isFailed: (state): boolean => state.phase === 'failed',
    hasJob: (state): boolean => state.jobId !== null,
    /** 0–100 for the progress bar, forced to 100 on a completed job. */
    percent: (state): number => (state.phase === 'completed' ? 100 : clampProgress(state.progress)),
  },

  actions: {
    /** Called before the upload request so the UI shows the upload step. */
    startUpload(context: JobContext) {
      this.teardown()
      this.jobId = null
      this.progress = 0
      this.phase = 'uploading'
      this.stage = 'Uploading video'
      this.error = null
      this.startedAt = Date.now()
      this.lastActivity = Date.now()
      this.context = context
    },

    /** Called with the queue job id returned by the API. */
    startJob(jobId: string, context: JobContext) {
      this.teardown()
      this.jobId = jobId
      this.progress = 0
      this.phase = 'queued'
      this.stage = 'Queued'
      this.error = null
      this.startedAt = Date.now()
      this.lastActivity = Date.now()
      this.context = context
      this.listen()
    },

    listen() {
      if (!this.jobId) return
      const socket = getSocket()

      socket.off(JOB_PROGRESS_EVENT, this.onProgress)
      socket.on(JOB_PROGRESS_EVENT, this.onProgress)
      socket.on('connect', this.onConnect)
      socket.on('disconnect', this.onDisconnect)
      socket.on('connect_error', this.onDisconnect)

      if (!socket.connected) {
        this.connection = 'connecting'
        socket.connect()
      } else {
        this.connection = 'connected'
      }

      this.startReconcileTimer()
    },

    teardown() {
      const socket = getSocket()
      socket.off(JOB_PROGRESS_EVENT, this.onProgress)
      socket.off('connect', this.onConnect)
      socket.off('disconnect', this.onDisconnect)
      socket.off('connect_error', this.onDisconnect)
      if (socket.connected) socket.disconnect()

      this.stopReconcileTimer()
      this.stopVerifyTimer()
      this.connection = 'idle'
    },

    onConnect() {
      this.connection = 'connected'
    },

    onDisconnect() {
      this.connection = 'disconnected'
    },

    onProgress(data: JobProgressEvent) {
      // The gateway broadcasts every job in the queue, so ignore foreign ids.
      if (!data || data.jobId !== this.jobId) return

      const stage = String(data.stage ?? '')
      const normalized = stage.toLowerCase()
      const percent = clampProgress(data.progress)

      // The queue reports failure and stalls through the stage field with the
      // progress reset to 0, which would otherwise leave the UI spinning.
      if (normalized.includes('fail')) {
        this.fail('The job failed on the processing server.')
        return
      }

      if (normalized.includes('stall')) {
        this.fail('The job stalled in the queue and could not continue.')
        return
      }

      this.stage = stage || 'Processing'
      this.progress = percent
      this.lastActivity = Date.now()
      this.error = null

      if (percent >= 100) {
        this.complete()
        return
      }

      // Only treat the job as running once the worker actually reports progress.
      if (this.phase !== 'processing') this.phase = 'processing'
    },

    /**
     * The worker emits `updateProgress(100)` *before* it writes
     * `status: 'COMPLETED'` to the database, so a job that reports 100 is not
     * yet safe to browse. Park the UI in a `finalizing` stage and poll until the
     * row actually flips, otherwise "view subtitles" would open an empty list.
     */
    complete() {
      this.stopVerifyTimer()
      this.progress = 100
      this.stage = 'Finishing up'
      this.error = null
      this.phase = 'finalizing'
      this.lastActivity = Date.now()
      this.stopReconcileTimer()
      this.startVerifyTimer()
    },

    startVerifyTimer() {
      this.stopVerifyTimer()
      this.verifyAttempts = 0
      this.verifyTimer = window.setInterval(() => {
        void this.verifyCompletion()
      }, VERIFY_INTERVAL_MS)
    },

    stopVerifyTimer() {
      if (this.verifyTimer !== null) {
        window.clearInterval(this.verifyTimer)
        this.verifyTimer = null
      }
    },

    async verifyCompletion() {
      const id = this.jobId
      if (!id || this.phase !== 'finalizing') {
        this.stopVerifyTimer()
        return
      }

      this.verifyAttempts += 1

      try {
        const { items } = await getJobs({ limit: 50 })
        const match = items.find((entry) => entry.queueJobId === id)

        if (match?.status === 'FAILED') {
          this.stopVerifyTimer()
          this.fail(match.errorMessage || 'The job failed on the processing server.')
          return
        }

        if (match?.status === 'COMPLETED') {
          this.stopVerifyTimer()
          this.settle('completed')
          return
        }

        if (match) {
          // The row exists but is still running (a burn job re-reports
          // progress after an intermediate 100). Fall back to live tracking.
          this.stopVerifyTimer()
          this.settle('processing')
          return
        }
      } catch {
        // Network hiccup – keep polling until the attempt budget runs out.
      }

      if (this.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
        this.stopVerifyTimer()
        this.settle('completed')
      }
    },

    settle(phase: JobPhase) {
      this.progress = 100
      this.stage = 'Completed'
      this.error = null
      this.phase = phase
      this.lastActivity = Date.now()
      this.teardown()
    },

    fail(message?: string | null) {
      this.error = message || 'The job failed on the processing server.'
      this.stage = 'Failed'
      this.phase = 'failed'
      this.lastActivity = Date.now()
      this.teardown()
    },

    /**
     * Socket events can be missed — the job may finish while the tab is closed
     * or the connection drops. Reconcile against the REST job list so the
     * progress bar always settles on a terminal state.
     */
    async reconcile(): Promise<'running' | 'terminal' | 'missing' | 'error'> {
      const id = this.jobId
      if (!id || !this.isProcessing) return 'running'

      try {
        const { items } = await getJobs({ limit: 50 })
        const match = items.find((entry) => entry.queueJobId === id)

        if (!match) return 'missing'

        if (match.status === 'FAILED') {
          this.fail(match.errorMessage || 'The job failed on the processing server.')
          return 'terminal'
        }

        if (match.status === 'COMPLETED') {
          this.complete()
          return 'terminal'
        }

        this.stage = 'Processing'
        this.lastActivity = Date.now()
        if (this.phase !== 'processing') this.phase = 'processing'
        return 'running'
      } catch {
        return 'error'
      }
    },

    startReconcileTimer() {
      this.stopReconcileTimer()
      this.reconcileTimer = window.setInterval(() => {
        void this.runReconcile()
      }, RECONCILE_INTERVAL_MS)
    },

    stopReconcileTimer() {
      if (this.reconcileTimer !== null) {
        window.clearInterval(this.reconcileTimer)
        this.reconcileTimer = null
      }
    },

    async runReconcile() {
      const result = await this.reconcile()
      if (result !== 'missing') return

      // No row yet — the worker may still be picking the job up. Only give up
      // once it should have been registered long ago.
      const lastSeen = this.lastActivity ?? this.startedAt ?? 0
      if (lastSeen && Date.now() - lastSeen >= NO_RECORD_LOST_AFTER_MS) {
        this.fail('This job is no longer available on the server. It was probably removed or stopped.')
      }
    },

    /**
     * Re-attach after a reload. Terminal jobs are surfaced as-is, an
     * interrupted upload cannot be resumed, and anything still running is
     * reconciled immediately so a job that finished in the background is
     * resolved without waiting for the next tick.
     */
    restore() {
      if (!this.jobId) return

      if (TERMINAL_PHASES.includes(this.phase)) {
        if (this.phase === 'completed') this.progress = 100
        return
      }

      if (this.phase === 'uploading') {
        this.clear()
        return
      }

      // The page was reloaded while the worker was persisting the result, so
      // re-run the completion check instead of waiting on a progress event.
      if (this.phase === 'finalizing') {
        this.stage = 'Finishing up'
        void this.verifyCompletion()
        this.startVerifyTimer()
        return
      }

      this.phase = this.phase === 'queued' ? 'queued' : 'processing'
      void this.reconcile()
      this.listen()
    },

    clear() {
      this.teardown()
      this.jobId = null
      this.progress = 0
      this.phase = 'idle'
      this.stage = null
      this.error = null
      this.startedAt = null
      this.lastActivity = null
      this.verifyAttempts = 0
      this.context = {
        videoId: null,
        videoName: null,
        language: 'en',
        format: 'SRT',
        burnVideo: false,
      }
    },
  },

  persist: {
    key: 'vue-subs-current-job',
    storage: localStorage,
    // `connection` and the timers are runtime-only and must never be restored.
    pick: ['jobId', 'progress', 'phase', 'stage', 'error', 'startedAt', 'lastActivity', 'context'],
  },
})
