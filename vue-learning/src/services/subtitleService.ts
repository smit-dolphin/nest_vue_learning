import { baseApi } from '../api/baseApi'

export interface SubtitleSegment {
  id: number
  startTime: string // "00:00:01,200"
  endTime: string   // "00:00:04,500"
  startSeconds: number
  endSeconds: number
  text: string
  speaker?: string
}

export interface GenerationOptions {
  language: string
  model: string
  presetStyle: string
  wordTimestamps: boolean
  autoTranslate: boolean
  removeFillers: boolean
}

// Converts seconds into SRT timestamp format HH:MM:SS,mmm
export function formatSecondsToSrt(seconds: number): string {
  const pad = (num: number, size = 2) => String(Math.floor(num)).padStart(size, '0')
  const hrs = pad(seconds / 3600)
  const mins = pad((seconds % 3600) / 60)
  const secs = pad(seconds % 60)
  const millis = String(Math.round((seconds % 1) * 1000)).padStart(3, '0')
  return `${hrs}:${mins}:${secs},${millis}`
}

// Converts seconds into VTT timestamp format HH:MM:SS.mmm
export function formatSecondsToVtt(seconds: number): string {
  return formatSecondsToSrt(seconds).replace(',', '.')
}

// Converts SRT timestamp HH:MM:SS,mmm to seconds
export function parseSrtTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0
  const normalized = timeStr.replace(',', '.')
  const parts = normalized.split(':')
  if (parts.length === 3) {
    const [h, m, s] = parts
    return (parseFloat(h) || 0) * 3600 + (parseFloat(m) || 0) * 60 + (parseFloat(s) || 0)
  }
  return parseFloat(timeStr) || 0
}

export const sampleSubtitles: SubtitleSegment[] = [
  {
    id: 1,
    startTime: '00:00:00,500',
    endTime: '00:00:03,200',
    startSeconds: 0.5,
    endSeconds: 3.2,
    text: 'Welcome to the next generation of AI-powered subtitle creation.',
    speaker: 'Speaker 1',
  },
  {
    id: 2,
    startTime: '00:00:03,500',
    endTime: '00:00:06,800',
    startSeconds: 3.5,
    endSeconds: 6.8,
    text: 'Automatically convert speech to accurate, beautifully styled captions in seconds.',
    speaker: 'Speaker 1',
  },
  {
    id: 3,
    startTime: '00:00:07,100',
    endTime: '00:00:10,400',
    startSeconds: 7.1,
    endSeconds: 10.4,
    text: 'Support for over 90 languages with precision timing and customizable styling presets.',
    speaker: 'Speaker 1',
  },
  {
    id: 4,
    startTime: '00:00:10,800',
    endTime: '00:00:14,200',
    startSeconds: 10.8,
    endSeconds: 14.2,
    text: 'Export directly to SRT, VTT, or burn animated captions straight onto your video.',
    speaker: 'Speaker 1',
  },
]

export const subtitleService = {
  // Upload video to backend
  async uploadVideo(file: File, userId = 'user_demo_123'): Promise<{ id: string; filename: string; path: string }> {
    const formData = new FormData()
    formData.append('video', file)
    const response = await baseApi.post(`/videos/upload/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Trigger subtitle generation on backend
  async generateSubtitleFromApi(videoId: string): Promise<any> {
    const response = await baseApi.post(`/subtitle/${videoId}`)
    return response.data
  },

  // Export as SRT
  exportSrt(segments: SubtitleSegment[]): string {
    return segments
      .map((seg, idx) => {
        return `${idx + 1}\n${seg.startTime} --> ${seg.endTime}\n${seg.text}\n`
      })
      .join('\n')
  },

  // Export as WebVTT
  exportVtt(segments: SubtitleSegment[]): string {
    const body = segments
      .map((seg, idx) => {
        const vttStart = seg.startTime.replace(',', '.')
        const vttEnd = seg.endTime.replace(',', '.')
        return `${idx + 1}\n${vttStart} --> ${vttEnd}\n${seg.text}\n`
      })
      .join('\n')
    return `WEBVTT\n\n${body}`
  },

  // Export as Plain Text
  exportTxt(segments: SubtitleSegment[]): string {
    return segments.map((s) => s.text).join('\n\n')
  },

  // Download helper
  downloadFile(content: string, filename: string, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
