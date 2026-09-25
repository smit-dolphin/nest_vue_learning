import { io, type Socket } from 'socket.io-client'

/**
 * Progress events pushed by the backend BullMQ queue listener.
 * Mirrors `job.gateway.ts` -> `sendProgress()`.
 */
export interface JobProgressEvent {
  jobId: string
  progress: number
  stage: string
}

export const JOB_PROGRESS_EVENT = 'job-progress'

/**
 * In development the API is reached through the Vite proxy on the same origin,
 * but socket.io is a separate handshake that the proxy does not forward, so we
 * talk to the Nest gateway directly. Production is served from one origin.
 */
function resolveSocketUrl(): string {
  const configured = import.meta.env.VITE_SOCKET_URL
  if (typeof configured === 'string' && configured.trim()) return configured.trim()
  return import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin
}

let socket: Socket | null = null

/**
 * Lazily created singleton so the socket is only opened when a job actually
 * needs tracking, and never during app boot.
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
  }
  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}
