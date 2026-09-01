import { NextResponse } from "next/server";
import { usingDevelopmentPassword } from "@/lib/auth/password";
import { createCsrfToken, csrfCookieOptions, readSessionLogin } from "@/lib/auth/session";
import { CSRF_COOKIE } from "@/lib/config";

export async function GET() {
  const login = await readSessionLogin();
  if (!login) {
    return NextResponse.json({ authenticated: false });
  }
  const response = NextResponse.json({
    authenticated: true,
    developmentPassword: usingDevelopmentPassword(),
  });
  response.cookies.set(CSRF_COOKIE, createCsrfToken(), csrfCookieOptions());
  return response;
}
