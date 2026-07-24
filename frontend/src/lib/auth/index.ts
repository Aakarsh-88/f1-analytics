/**
 * Single entry point for the auth module. Prefer importing from
 * `@/lib/auth` over reaching into individual files here — it keeps
 * every consumer decoupled from this module's internal file layout,
 * which matters even more than usual given the whole point of this
 * directory is to isolate a swappable dependency (Clerk).
 *
 * Note: `server.ts` is intentionally NOT re-exported here. It's marked
 * `server-only` and importing it from a client component would throw
 * at build time — keeping it out of this barrel means a client
 * component that does `import { useAuthUser } from "@/lib/auth"` can
 * never accidentally pull in server-only code through the barrel.
 * Server Components should import `@/lib/auth/server` directly.
 */
export { AuthProvider } from "@/lib/auth/provider";
export { useAuthUser } from "@/lib/auth/hooks";
export { AuthSignInButton, AuthSignUpButton, AuthUserMenu, AuthSignInForm, AuthSignUpForm, SignedIn, SignedOut } from "@/lib/auth/components";
export { isProtectedRoute, PROTECTED_ROUTE_PATTERNS, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/config";
export type { AuthState, AuthUser } from "@/lib/auth/types";
