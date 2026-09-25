import { extname } from 'path';

/** Strip quotes / control characters so a name is safe in a Content-Disposition header. */
export function safeFilename(name: string, fallback = 'file'): string {
  const cleaned = name.replace(/["\r\n]/g, '').trim();
  return cleaned || fallback;
}

/** Prefer the user's original name, falling back to the stored (storage) filename. */
export function displayName(
  original: string | null | undefined,
  storage: string,
): string {
  return original?.trim() ? original.trim() : storage;
}

/** Name without its final extension, e.g. "My.Video.mp4" -> "My.Video". */
export function stripExtension(name: string): string {
  const ext = extname(name);
  return ext ? name.slice(0, -ext.length) : name;
}