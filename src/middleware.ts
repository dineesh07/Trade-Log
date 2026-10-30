import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tradelog_session";
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "tradelog-super-secure-secret-key-change-in-production-32chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static assets and internals bypass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.id && payload.email) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // If visiting /login or /api/auth/login
  if (pathname === "/login" || pathname === "/api/auth/login") {
    if (isAuthenticated && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    // If it's an API route, return 401 Unauthorized
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
