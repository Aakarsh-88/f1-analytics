import "server-only";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SIGN_IN_PATH } from "@/lib/auth/config";
import type { AuthUser } from "@/lib/auth/types";

/**
 * Server Component / Route Handler equivalent of `useAuthUser()`. Maps
 * Clerk's server-side `currentUser()` onto the same `AuthUser` shape
 * the client hook returns, so a component that renders on both server
 * and client (or gets refactored between the two) never has to change
 * its data shape — only which of these two functions it calls.
 */
export async function getServerAuthUser(): Promise<AuthUser | null> {
  const user = await currentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
  };
}

/**
 * Route guard for Server Components: fetches the current user and
 * redirects to sign-in if there isn't one, returning the resolved
 * `AuthUser` otherwise so the caller never has to null-check it.
 *
 * This is a SECOND, independent layer of protection alongside
 * `middleware.ts` — middleware blocks the request at the edge before
 * the page even renders, but calling this at the top of a protected
 * page's Server Component means the route is still safe even if it's
 * ever reached by a path the middleware matcher doesn't cover (e.g. a
 * new route added to the app without updating the config in
 * `lib/auth/config.ts`).
 */
export async function requireServerAuthUser(): Promise<AuthUser> {
  const user = await getServerAuthUser();
  if (!user) {
    redirect(SIGN_IN_PATH);
  }
  return user;
}
