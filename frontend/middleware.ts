import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";

const PUBLIC_ROUTES = [ROUTES.HOME, ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.PRIVACY_POLICY, ROUTES.ADMIN_LOGIN, ROUTES.SUBADMIN_LOGIN];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_ROUTES.some((route) => pathname === route) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/api");

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const allCookies = request.cookies.getAll().map((c) => c.name);
  console.log("[MIDDLEWARE]", pathname, "| token:", token ? "YES" : "NO", "| cookies:", allCookies.join(",") || "NONE");

  if (!token) {
    console.log("[MIDDLEWARE] No token → redirecting to login");
    if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL(ROUTES.ADMIN_LOGIN, request.url));
    if (pathname.startsWith("/subadmin")) return NextResponse.redirect(new URL(ROUTES.SUBADMIN_LOGIN, request.url));
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
  }

  try {
    const jwtKey = process.env.JWT_SECRET_KEY;
    if (!jwtKey) {
      console.error("[MIDDLEWARE] JWT_SECRET_KEY is NOT set! Allowing request through.");
      return NextResponse.next();
    }
    const secret = new TextEncoder().encode(jwtKey);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string | undefined;

    // Role-based route protection
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL(ROUTES.ADMIN_LOGIN, request.url));
    }
    if (pathname.startsWith("/subadmin") && role !== "subadmin") {
      return NextResponse.redirect(new URL(ROUTES.SUBADMIN_LOGIN, request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error("[MIDDLEWARE] JWT verification failed for", pathname, "error:", (err as Error).message);
    const response = NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
