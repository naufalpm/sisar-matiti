import { NextResponse, type NextRequest } from "next/server";

/**
 * Cek optimistik: tanpa cookie sesi → arahkan ke /login.
 * Validasi sesi sebenarnya tetap dilakukan di server (lib/auth/user.ts).
 */
export function proxy(request: NextRequest) {
  const punyaSesi = request.cookies.has("sm_session");
  if (!punyaSesi) {
    const url = new URL("/login", request.url);
    if (request.nextUrl.pathname !== "/") url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico|logo-bps|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
