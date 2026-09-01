import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { usingDevelopmentPassword, verifyAdminCredentials } from "@/lib/auth/password";
import { clientIp, consumeRateLimit } from "@/lib/auth/rate-limit";
import {
  createCsrfToken,
  createSessionToken,
  csrfCookieOptions,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { CSRF_COOKIE, SESSION_COOKIE } from "@/lib/config";
import { readJsonBody } from "@/lib/http/json";
import { logError } from "@/lib/logger";

const schema = z.object({
  login: z.string().min(1).max(80),
  password: z.string().min(1).max(200),
});

const GENERIC = "Invalid login or password";

export async function POST(request: NextRequest) {
  try {
    if (!consumeRateLimit(`login:${clientIp(request)}`, 8, 15 * 60 * 1000)) {
      return NextResponse.json({ error: GENERIC }, { status: 429 });
    }
    const body = schema.parse(await readJsonBody(request));
    const ok = await verifyAdminCredentials(body.login, body.password);
    if (!ok) {
      return NextResponse.json({ error: GENERIC }, { status: 401 });
    }
    const token = await createSessionToken(body.login);
    const csrf = createCsrfToken();
    const response = NextResponse.json({
      ok: true,
      developmentPassword: usingDevelopmentPassword(),
    });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    response.cookies.set(CSRF_COOKIE, csrf, csrfCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: GENERIC }, { status: 401 });
    }
    logError("login", error);
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }
}
