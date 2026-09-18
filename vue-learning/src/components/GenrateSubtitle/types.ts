export interface SubtitleStyleSettings {
  fontSize: number
  fontColor: string
  background: boolean
  backgroundColor: string
  backgroundOpacity: number
  position: 'bottom' | 'top' | 'middle'
  outline: number
}

export interface SubtitleSettings {
  /** Target / translation language code (e.g. "en"). Only used as the AI translation target. */
  language: string
  /** Output subtitle format. Must be one of SRT | WebVTT | JSON | Plain Text. */
  format: string
  /** Transcribe in the source language first, then translate to `language` via the AI agent. */
  autoTranslate: boolean
  /** Emit word-level timing data (whisper .wts sidecar). */
  wordLevel: boolean
  /** Render subtitles directly into the video. Requires SRT or WebVTT format. */
  burnVideo: boolean
  /** Burn-in subtitle styling — only sent to the backend when burnVideo is enabled. */
  subtitleStyle: SubtitleStyleSettings
}