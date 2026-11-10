import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = "/dashboard";
const bursarProtectedRoutes = "/bursar-dashboard";
const donarProtectedRoutes = "/donar-dashboard";
const restrictedPages = [
  "/login",
  "/register",
  "/bursar-login",
  "/admin-login",
  "/forget-reset",
];

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64").toString("utf-8")
    );
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export default async function proxy(req: NextRequest) {
  const jwt = req.cookies.get("jwt")?.value;
  const isEdudropUserValid = req.cookies.get("isEdudropUserValid")?.value;
  const edudropUserRole = req.cookies.get("edudropUserRole")?.value;
  const requestedPath = req.nextUrl.pathname;

  const isTokenValid = Boolean(jwt && !isJwtExpired(jwt));

  // Check if authenticated user is trying to access login/register pages
  if (isTokenValid && isEdudropUserValid === "true" && restrictedPages.includes(requestedPath)) {
    const targetUrl =
      edudropUserRole === "admin"
        ? "/dashboard"
        : edudropUserRole === "bursar"
        ? "/bursar-dashboard"
        : edudropUserRole === "donar"
        ? "/donar-dashboard"
        : "/";
    return NextResponse.redirect(new URL(targetUrl, req.nextUrl.origin));
  }

  // Admin dashboard guard
  if (requestedPath.startsWith(protectedRoutes)) {
    if (!isTokenValid || edudropUserRole !== "admin") {
      return NextResponse.redirect(new URL("/admin-login", req.nextUrl.origin));
    }
  }

  // Bursar dashboard guard
  if (requestedPath.startsWith(bursarProtectedRoutes)) {
    if (!isTokenValid || edudropUserRole !== "bursar") {
      return NextResponse.redirect(new URL("/bursar-login", req.nextUrl.origin));
    }
  }

  // Donor dashboard guard
  if (requestedPath.startsWith(donarProtectedRoutes)) {
    if (!isTokenValid || edudropUserRole !== "donar") {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bursar-dashboard/:path*",
    "/donar-dashboard/:path*",
    "/login",
    "/register",
    "/bursar-login",
    "/admin-login",
    "/forget-reset",
  ],
};
