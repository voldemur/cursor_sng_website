const HTTP_URL = /^https?:\/\//i;
const MAILTO = /^mailto:/i;
const TEL = /^tel:/i;
const DANGEROUS_SCHEME = /^(javascript|data|vbscript|file):/i;

export function sanitizeHttpUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (DANGEROUS_SCHEME.test(trimmed)) return "";
  if (!HTTP_URL.test(trimmed)) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export function sanitizeMailto(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const address = MAILTO.test(trimmed) ? trimmed.slice(7) : trimmed;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return "";
  return `mailto:${address}`;
}

export function sanitizeTel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const number = TEL.test(trimmed) ? trimmed.slice(4) : trimmed;
  if (!/^[0-9+()\-\s]{5,32}$/.test(number)) return "";
  return `tel:${number.replace(/\s+/g, "")}`;
}

export function emailHref(email: string): string {
  return sanitizeMailto(email);
}

export function phoneHref(phone: string): string {
  return sanitizeTel(phone);
}

export function safeDocumentHref(fileUrl: string, externalLink: boolean): string {
  const trimmed = fileUrl.trim();
  if (externalLink) return sanitizeHttpUrl(trimmed);
  if (/^\/api\/documents\/[a-zA-Z0-9_-]+$/.test(trimmed)) return trimmed;
  return "";
}
