/**
 * Centralized list of which routes require authentication. Both
 * `middleware.ts` (edge-level enforcement) and any server component
 * using `requireServerAuthUser()` read from THIS list rather than
 * duplicating path logic — add or remove a route here and both layers
 * of protection stay in sync automatically.
 *
 * Most of this app (dashboard, drivers, constructors, races, standings)
 * is intentionally public — it's read-only historical F1 data. Settings
 * is the one route gated behind sign-in in this milestone, as the
 * concrete example of a protected route; add more paths to
 * PROTECTED_ROUTE_PATTERNS as features that need a signed-in user
 * (saved comparisons, personal dashboards, etc.) are built.
 */
export const PROTECTED_ROUTE_PATTERNS = ["/settings"];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some(
    (pattern) => pathname === pattern || pathname.startsWith(`${pattern}/`)
  );
}

export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";
/** Where a user lands after signing in from a non-deep-linked entry point. */
export const DEFAULT_POST_SIGN_IN_PATH = "/";
