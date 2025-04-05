import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplifying the middleware to avoid auth issues
export async function middleware(request: NextRequest) {
  try {
    console.log("Middleware running for:", request.nextUrl.pathname);

    // Only redirect login pages if a user is already logged in
    // All other auth checks will happen client-side
    if (request.nextUrl.pathname === "/login") {
      // Check if we have auth cookies that indicate a logged-in user
      const hasAuthCookies = request.cookies
        .getAll()
        .some(
          (cookie) =>
            cookie.name.startsWith("sb-") &&
            cookie.name !== "sb-auth-token-nonce"
        );

      // If they have auth cookies and are trying to access login page,
      // redirect them to the home page instead
      if (hasAuthCookies) {
        console.log(
          "User appears to be logged in, redirecting from login page"
        );

        // If they were trying to access a specific page, redirect there
        const redirectTo = request.nextUrl.searchParams.get("redirectTo");
        if (redirectTo) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }

        // Otherwise redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // For all other routes, allow access by default
    // Authentication will be checked client-side
    console.log("Middleware allowing access");
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, default to allowing the request to continue
    return NextResponse.next();
  }
}

// Apply middleware to all routes except public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files in the root (robots.txt, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
