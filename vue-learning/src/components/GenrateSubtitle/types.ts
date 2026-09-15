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
  language: string
  format: string
  timestamps: boolean
  speakerLabels: boolean
  autoTranslate: boolean
  burnVideo: boolean
  punctuation: boolean
  wordLevel: boolean
  subtitleStyle: SubtitleStyleSettings
}
