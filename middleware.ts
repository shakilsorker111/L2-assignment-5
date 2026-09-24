import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_COOKIE =
  "gearup_user_role";

const ROLE_PATHS = {
  CUSTOMER: "/dashboard/customer",
  PROVIDER: "/dashboard/provider",
  ADMIN: "/dashboard/admin",
} as const;

export function middleware(
  request: NextRequest
) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(
    "gearup_access_token"
  )?.value;

  const role = request.cookies.get(
    ROLE_COOKIE
  )?.value;

  // Not logged in
  if (!token) {
    const loginUrl = new URL(
      "/auth/login",
      request.url
    );

    loginUrl.searchParams.set(
      "redirect",
      pathname
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  // Customer dashboard
  if (
    pathname.startsWith(
      "/dashboard/customer"
    )
  ) {
    if (role !== "CUSTOMER") {
      return redirectToCorrectDashboard(
        request,
        role
      );
    }
  }

  // Provider dashboard
  if (
    pathname.startsWith(
      "/dashboard/provider"
    )
  ) {
    if (role !== "PROVIDER") {
      return redirectToCorrectDashboard(
        request,
        role
      );
    }
  }

  // Admin dashboard
  if (
    pathname.startsWith(
      "/dashboard/admin"
    )
  ) {
    if (role !== "ADMIN") {
      return redirectToCorrectDashboard(
        request,
        role
      );
    }
  }

  return NextResponse.next();
}

function redirectToCorrectDashboard(
  request: NextRequest,
  role: string | undefined
) {
  const path =
    role === "ADMIN"
      ? ROLE_PATHS.ADMIN
      : role === "PROVIDER"
        ? ROLE_PATHS.PROVIDER
        : ROLE_PATHS.CUSTOMER;

  return NextResponse.redirect(
    new URL(path, request.url)
  );
}

export const config = {
  matcher: [
    "/dashboard/:path*",
  ],
};