export interface LanguageOption {
  name: string
  code: string
}

export const LANGUAGES: LanguageOption[] = [
  { name: 'English', code: 'en' },
  { name: 'Chinese', code: 'zh' },
  { name: 'German', code: 'de' },
  { name: 'Spanish', code: 'es' },
  { name: 'Russian', code: 'ru' },
  { name: 'Korean', code: 'ko' },
  { name: 'French', code: 'fr' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Polish', code: 'pl' },
  { name: 'Catalan', code: 'ca' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Swedish', code: 'sv' },
  { name: 'Italian', code: 'it' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Finnish', code: 'fi' },
  { name: 'Vietnamese', code: 'vi' },
  { name: 'Hebrew', code: 'he' },
  { name: 'Ukrainian', code: 'uk' },
  { name: 'Greek', code: 'el' },
  { name: 'Malay', code: 'ms' },
  { name: 'Czech', code: 'cs' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Danish', code: 'da' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Tamil', code: 'ta' },
  { name: 'Norwegian', code: 'no' },
  { name: 'Thai', code: 'th' },
  { name: 'Urdu', code: 'ur' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'Lithuanian', code: 'lt' },
  { name: 'Latin', code: 'la' },
  { name: 'Maori', code: 'mi' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Persian', code: 'fa' },
  { name: 'Latvian', code: 'lv' },
  { name: 'Bengali', code: 'bn' },
  { name: 'Serbian', code: 'sr' },
  { name: 'Azerbaijani', code: 'az' },
  { name: 'Slovenian', code: 'sl' },
  { name: 'Estonian', code: 'et' },
  { name: 'Macedonian', code: 'mk' },
  { name: 'Nepali', code: 'ne' },
  { name: 'Mongolian', code: 'mn' },
  { name: 'Bosnian', code: 'bs' },
  { name: 'Kazakh', code: 'kk' },
  { name: 'Albanian', code: 'sq' },
  { name: 'Swahili', code: 'sw' },
  { name: 'Galician', code: 'gl' },
  { name: 'Marathi', code: 'mr' },
  { name: 'Punjabi', code: 'pa' },
  { name: 'Sinhala', code: 'si' },
  { name: 'Khmer', code: 'km' },
  { name: 'Welsh', code: 'cy' },
  { name: 'Armenian', code: 'hy' },
  { name: 'Lao', code: 'lo' },
  { name: 'Myanmar', code: 'my' },
  { name: 'Telugu', code: 'te' },
  { name: 'Tagalog', code: 'tl' },
  { name: 'Maltese', code: 'mt' },
  { name: 'Icelandic', code: 'is' },
  { name: 'Malayalam', code: 'ml' },
  { name: 'Basque', code: 'eu' },
]

export const LANGUAGE_CODES = new Set(LANGUAGES.map((language) => language.code))

export const FORMATS = ['SRT', 'WebVTT', 'JSON', 'Plain Text'] as const

export const BURN_COMPATIBLE_FORMATS = ['SRT', 'WebVTT'] as const

export const DEFAULT_LANGUAGE = 'en'

export const DEFAULT_FORMAT = 'SRT'

export function languageNameFromCode(code: string): string {
  return LANGUAGES.find((language) => language.code === code)?.name ?? code
}

export function normalizeLanguage(code: string): string {
  return LANGUAGE_CODES.has(code) ? code : DEFAULT_LANGUAGE
}