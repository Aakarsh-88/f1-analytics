/**
 * Provider-agnostic auth types. Nothing outside `lib/auth/` should ever
 * import a type from `@clerk/nextjs` directly — every component, page,
 * and hook in this app depends on THESE shapes instead. If Clerk is
 * ever swapped for another provider (Auth0, NextAuth, a custom service),
 * only the files inside `lib/auth/` need to change; every consumer of
 * `AuthUser` / `useAuthUser()` / `getServerAuthUser()` keeps working
 * unmodified as long as the new provider's adapter still produces this
 * shape.
 */
export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

/** Returned by the client-side `useAuthUser()` hook. */
export interface AuthState {
  user: AuthUser | null;
  /** True once the provider has finished its initial client-side auth check. */
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}
