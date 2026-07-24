"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { useCallback } from "react";

import type { AuthState, AuthUser } from "@/lib/auth/types";

/**
 * The single hook every client component should use to read auth state
 * or sign out — never `useUser()`/`useClerk()` from `@clerk/nextjs`
 * directly outside this file. Maps Clerk's user object onto our own
 * `AuthUser` shape so the rest of the app has zero knowledge of Clerk's
 * specific field names (`firstName` vs `first_name`, `imageUrl` vs
 * `profileImageUrl`, etc. — exactly the kind of detail that changes
 * between providers).
 */
export function useAuthUser(): AuthState {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();

  const mappedUser: AuthUser | null = user
    ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      }
    : null;

  const signOut = useCallback(async () => {
    await clerkSignOut();
  }, [clerkSignOut]);

  return {
    user: mappedUser,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    signOut,
  };
}
