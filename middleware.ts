import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "ams_session";

/**
 * Real session check at the edge - without this, typing a dashboard URL
 * directly bypasses login entirely (the old mock only gated the UI's
 * *appearance*, not access). Verifies the JWT itself (not just presence)
 * so a tampered/expired cookie still redirects to /login.
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/form-summary/:path*",
    "/forms/:path*",
    "/masters/:path*",
    "/role-management/:path*",
    "/user-management/:path*",
    "/module-images/:path*",
    "/gallery/:path*",
    "/targets/:path*",
    "/log-history/:path*",
    "/notifications/:path*",
    "/reports/:path*",
  ],
};
