"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";

import { DEFAULT_POST_SIGN_IN_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/config";

/**
 * App-wide auth provider. This is the ONLY place `ClerkProvider` itself
 * is referenced — `app/layout.tsx` imports `AuthProvider` from here, not
 * `ClerkProvider` from `@clerk/nextjs` directly. Swapping providers
 * later means rewriting the inside of this component (and the other
 * files in `lib/auth/`) to produce the same `AuthUser`/`AuthState`
 * contract; nothing in `app/` or `components/` needs to know.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInUrl={SIGN_IN_PATH}
      signUpUrl={SIGN_UP_PATH}
      signInFallbackRedirectUrl={DEFAULT_POST_SIGN_IN_PATH}
      signUpFallbackRedirectUrl={DEFAULT_POST_SIGN_IN_PATH}
      appearance={{
        variables: {
          colorPrimary: "#E10600",
          colorBackground: "#14171C",
          colorText: "#F5F6F7",
          colorTextSecondary: "#949CA8",
          colorInputBackground: "#1D2127",
          colorInputText: "#F5F6F7",
          borderRadius: "6px",
          fontFamily: "var(--font-body)",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
