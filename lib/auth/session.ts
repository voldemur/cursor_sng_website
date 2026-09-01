import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CSRF_COOKIE, isProduction, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/config";
import { HttpError } from "@/lib/errors";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new HttpError(500, "Server configuration error");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(login: string): Promise<string> {
  return new SignJWT({ sub: login })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function csrfCookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function readSessionLogin(): Promise<string | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireSession(): Promise<string> {
  const login = await readSessionLogin();
  if (!login) throw new HttpError(401, "Unauthorized");
  return login;
}

export function createCsrfToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCsrfFromCookies(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}
