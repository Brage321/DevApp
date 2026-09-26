import { FILE_LIMITS, RESERVED_USERNAMES, USERNAME_PATTERN } from '@/lib/config';
import type { UploadKind } from '@/types';

/* ------------------------------------------------------------------ */
/* Security helpers — validation, sanitization, safe file handling.    */
/* The client validates for UX; the database (RLS) is the real guard.  */
/* ------------------------------------------------------------------ */

const SAFE_SCHEMES = new Set(['https:', 'http:', 'mailto:']);

/**
 * Validates a user-provided URL and returns a normalized absolute URL,
 * or null when unsafe. Blocks javascript:, data:, vbscript: and friends,
 * plus embedded credentials.
 */
export function safeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  try {
    const u = new URL(trimmed);
    if (!SAFE_SCHEMES.has(u.protocol)) return null;
    if (u.username || u.password) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Accepts either a full URL or a bare handle and returns a safe URL,
 * given the platform prefix (e.g. "https://github.com/"). Null if unsafe.
 */
export function safeSocialUrl(input: string, prefix: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return safeUrl(trimmed);
  if (!/^[A-Za-z0-9._\-/]{1,100}$/.test(trimmed)) return null;
  if (!prefix) return null;
  return safeUrl(prefix + trimmed);
}

/** Escapes HTML entities (defense in depth for non-React contexts). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* eslint-disable no-control-regex */
function stripControl(s: string): string {
  return s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}
/* eslint-enable no-control-regex */

/** Bio sanitization: length cap + control-char strip. Rendered as text only. */
export function sanitizeBio(bio: string): string {
  return stripControl(bio).slice(0, FILE_LIMITS.bioMax);
}

export function sanitizeText(s: string, max: number): string {
  return stripControl(s).trim().slice(0, max);
}

/* --------------------------- usernames ---------------------------- */

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '-');
}

export function usernameError(raw: string): string | null {
  const u = normalizeUsername(raw);
  if (!u) return 'Username is required.';
  if (!USERNAME_PATTERN.test(u))
    return 'Use 3–24 characters: letters, numbers, underscores or hyphens.';
  if (RESERVED_USERNAMES.includes(u)) return 'That username is reserved.';
  return null;
}

/* ------------------------- file validation ------------------------ */

export interface FileCheck {
  ok: boolean;
  error?: string;
  ext?: string;
  mime?: string;
}

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const AUDIO_MIMES = new Set(['audio/mpeg', 'audio/ogg', 'audio/wav']);

const EXT_FROM_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
};

/** Magic-byte sniffing — never trust MIME or filename alone. */
export function sniffMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return 'image/webp';
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return 'audio/mpeg'; // ID3
  if (bytes[0] === 0xff && (bytes[1] === 0xfb || bytes[1] === 0xf3 || bytes[1] === 0xf2)) return 'audio/mpeg';
  if (bytes[0] === 0x4f && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'audio/ogg'; // OggS
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45
  )
    return 'audio/wav';
  return null;
}

export async function validateUpload(file: File, kind: UploadKind | 'audio'): Promise<FileCheck> {
  const isAudio = kind === 'audio';
  const limit =
    isAudio
      ? FILE_LIMITS.audioBytes
      : kind === 'background'
        ? FILE_LIMITS.videoBytes
        : FILE_LIMITS.imageBytes;
  const kindLabel = isAudio ? 'Audio' : 'Image';

  if (file.size <= 0) return { ok: false, error: `${kindLabel} file is empty.` };
  if (file.size > limit)
    return { ok: false, error: `${kindLabel} is too large (max ${Math.round(limit / 1024 / 1024)} MB).` };

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const sniffed = sniffMime(head);
  if (!sniffed)
    return { ok: false, error: `Unsupported ${kindLabel.toLowerCase()} format or corrupted file.` };

  if (isAudio && !AUDIO_MIMES.has(sniffed))
    return { ok: false, error: 'Unsupported audio format. Use MP3, OGG or WAV.' };
  if (!isAudio && !IMAGE_MIMES.has(sniffed))
    return { ok: false, error: 'Unsupported image format. Use PNG, JPEG, WEBP or GIF.' };

  const ext = EXT_FROM_MIME[sniffed] ?? 'bin';
  return { ok: true, ext, mime: sniffed };
}

/** Generated safe filename — never uses the user's original filename. */
export function safeFileName(ext: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${uuid}.${ext}`;
}
