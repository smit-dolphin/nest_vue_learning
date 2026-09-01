export const whisperOutputFormats = {
  SRT: {
    flag: '-osrt',
    extension: '.srt',
    mimeType: 'application/x-subrip',
  },

  WebVTT: {
    flag: '-ovtt',
    extension: '.vtt',
    mimeType: 'text/vtt',
  },

  JSON: {
    flag: '-oj',
    extension: '.json',
    mimeType: 'application/json',
  },

  'Plain Text': {
    flag: '-otxt',
    extension: '.txt',
    mimeType: 'text/plain',
  },
};

/**
 * Safely resolve a format string (from query param) to its whisperOutputFormats entry.
 * Falls back to SRT if the value is missing or unrecognised.
 *
 * Accepted values (case-insensitive):
 *   "SRT", "WebVTT", "vtt", "JSON", "Plain Text", "plaintext", "txt"
 */
export function getWhisperOutputFormat(format?: string) {
  if (!format) return whisperOutputFormats.SRT;

  // Exact-key match first (handles 'SRT', 'WebVTT', 'JSON', 'Plain Text')
  if (format in whisperOutputFormats) {
    return whisperOutputFormats[format as keyof typeof whisperOutputFormats];
  }

  // Case-insensitive fallback
  const normalized = format.trim().toLowerCase();
  if (normalized === 'srt') return whisperOutputFormats.SRT;
  if (normalized === 'webvtt' || normalized === 'vtt') return whisperOutputFormats.WebVTT;
  if (normalized === 'json') return whisperOutputFormats.JSON;
  if (normalized === 'plain text' || normalized === 'plaintext' || normalized === 'txt' || normalized === 'text') {
    return whisperOutputFormats['Plain Text'];
  }

  // Unknown → default to SRT so the process never crashes
  return whisperOutputFormats.SRT;
}