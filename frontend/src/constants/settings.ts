export interface LanguageOption {
  code: string
  label: string
}

export const SUBTITLE_FORMATS = ['SRT', 'VTT'] as const

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English (en)' },
  { code: 'es', label: 'Spanish (es)' },
  { code: 'fr', label: 'French (fr)' },
  { code: 'de', label: 'German (de)' },
  { code: 'it', label: 'Italian (it)' },
  { code: 'pt', label: 'Portuguese (pt)' },
  { code: 'ru', label: 'Russian (ru)' },
  { code: 'ja', label: 'Japanese (ja)' },
  { code: 'ko', label: 'Korean (ko)' },
  { code: 'zh', label: 'Chinese (zh)' },
  { code: 'ar', label: 'Arabic (ar)' },
  { code: 'hi', label: 'Hindi (hi)' },
  { code: 'bn', label: 'Bengali (bn)' },
  { code: 'nl', label: 'Dutch (nl)' },
  { code: 'pl', label: 'Polish (pl)' },
  { code: 'tr', label: 'Turkish (tr)' },
  { code: 'sv', label: 'Swedish (sv)' },
  { code: 'da', label: 'Danish (da)' },
  { code: 'fi', label: 'Finnish (fi)' },
  { code: 'no', label: 'Norwegian (no)' },
  { code: 'cs', label: 'Czech (cs)' },
  { code: 'el', label: 'Greek (el)' },
  { code: 'th', label: 'Thai (th)' },
  { code: 'vi', label: 'Vietnamese (vi)' },
]