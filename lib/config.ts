export const SESSION_COOKIE = "sng_session";
export const CSRF_COOKIE = "sng_csrf";
export const LOCALE_COOKIE = "sng_locale";

export const SESSION_TTL_SECONDS = 60 * 60 * 8;
export const JSON_BODY_LIMIT_BYTES = 512 * 1024;
export const DEFAULT_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const CONTENT_BACKUP_KEEP = 10;

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export function getMaxUploadBytes(): number {
  const raw = process.env.MAX_UPLOAD_BYTES;
  if (!raw) return DEFAULT_MAX_UPLOAD_BYTES;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_UPLOAD_BYTES;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
