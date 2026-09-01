import { NextRequest, NextResponse } from "next/server";
import { assertMutationProtection } from "@/lib/auth/csrf";
import { readSessionLogin } from "@/lib/auth/session";
import { CSRF_COOKIE, SESSION_COOKIE } from "@/lib/config";

export async function POST(request: NextRequest) {
  const login = await readSessionLogin();
  if (login) {
    try {
      assertMutationProtection(request);
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  response.cookies.set(CSRF_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
