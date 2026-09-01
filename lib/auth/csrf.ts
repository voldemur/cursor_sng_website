import { timingSafeEqual } from "crypto";
import { CSRF_COOKIE } from "@/lib/config";
import { HttpError } from "@/lib/errors";

function equal(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function originHost(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function assertSameOrigin(request: Request): void {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const origin = originHost(request.headers.get("origin"));
  const referer = originHost(request.headers.get("referer"));
  const incoming = origin || referer;
  if (!host || !incoming) {
    throw new HttpError(403, "Forbidden");
  }
  if (incoming !== host) {
    throw new HttpError(403, "Forbidden");
  }
}

export function assertCsrf(request: Request): void {
  const headerToken = request.headers.get("x-csrf-token");
  const cookieHeader = request.headers.get("cookie");
  const match = cookieHeader?.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  const cookieToken = match ? decodeURIComponent(match[1]) : null;
  if (!headerToken || !cookieToken || !equal(headerToken, cookieToken)) {
    throw new HttpError(403, "Forbidden");
  }
}

export function assertMutationProtection(request: Request): void {
  if (request.method === "GET" || request.method === "HEAD") return;
  assertSameOrigin(request);
  assertCsrf(request);
}
