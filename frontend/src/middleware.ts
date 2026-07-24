import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { PROTECTED_ROUTE_PATTERNS, SIGN_IN_PATH } from "@/lib/auth/config";

/**
 * `clerkMiddleware` itself is the one Clerk-specific piece here — a
 * different provider's middleware would replace just this call. The
 * route list it enforces comes entirely from `lib/auth/config.ts`, so
 * swapping providers (or just adding a newly-protected page) never
 * requires touching the matching logic below.
 */
const isProtectedRoute = createRouteMatcher(
  PROTECTED_ROUTE_PATTERNS.map((pattern) => `${pattern}(.*)`)
);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({ unauthenticatedUrl: new URL(SIGN_IN_PATH, req.url).toString() });
  }
});

export const config = {
  matcher: [
    // Run on every route except Next.js internals and static assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
