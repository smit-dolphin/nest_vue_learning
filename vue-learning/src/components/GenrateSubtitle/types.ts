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
  /** Target / translation language code (e.g. "en"). Sent to the backend as `leng`. */
  language: string
  /** Output subtitle format. Sent to the backend as `formate`. */
  format: string
  /** Transcribe in the source language first, then translate to `language` via the AI agent. */
  autoTranslate: boolean
  /** Emit word-level timing data (whisper .wts sidecar). Sent as `wordLevelTiming`. */
  wordLevel: boolean
  /** Restore punctuation in the generated transcript. Sent as `autoPunctuation`. */
  autoPunctuation: boolean
  /** Detect speakers and prefix each segment with a speaker label. Sent as `lables`. */
  speakerLabels: boolean
  /** Render subtitles directly into the video. Requires SRT or WebVTT format. */
  burnVideo: boolean
  /** Burn-in subtitle styling — only sent to the backend when burnVideo is enabled. */
  subtitleStyle: SubtitleStyleSettings
}