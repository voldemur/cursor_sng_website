import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE, SESSION_COOKIE } from "@/lib/config";
import { verifySessionToken } from "@/lib/auth/session";
import { isLocale, parseLocale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/types/content";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);

  const localeFromPath = pathname.split("/")[1];
  const locale = isLocale(localeFromPath)
    ? localeFromPath
    : parseLocale(request.cookies.get(LOCALE_COOKIE)?.value || DEFAULT_LOCALE);
  requestHeaders.set("x-locale", locale);

  if (pathname === "/" || pathname === "") {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLoginPage = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const isLoginApi = pathname === "/api/admin/login";

  if ((isAdminPage && !isLoginPage) || (isAdminApi && !isLoginApi && pathname !== "/api/admin/session")) {
    const login = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!login) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (isLocale(localeFromPath)) {
    response.cookies.set(LOCALE_COOKIE, localeFromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|ico)$).*)"],
};
