import { CSRF_COOKIE } from "@/lib/config";

export function readCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = (init.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    headers.set("x-csrf-token", readCsrfToken());
    if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  const response = await fetch(url, { ...init, headers, credentials: "same-origin" });
  if (response.status === 401 && !url.includes("/api/admin/login")) {
    throw new Error("Unauthorized");
  }
  return response;
}

export async function adminJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await adminFetch(url, init);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
