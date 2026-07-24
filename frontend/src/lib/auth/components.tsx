"use client";

import {
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
  SignIn as ClerkSignIn,
  SignInButton as ClerkSignInButton,
  SignUp as ClerkSignUp,
  SignUpButton as ClerkSignUpButton,
  UserButton as ClerkUserButton,
} from "@clerk/nextjs";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/**
 * Thin wrappers around Clerk's own components, re-exported under names
 * that belong to this app rather than to Clerk. Every page/component
 * that needs "sign in", "sign up", "only if signed in", etc. imports
 * from `@/lib/auth/components` — never `@clerk/nextjs` directly. If the
 * provider changes, only the internals below change; call sites don't.
 */

export function SignedIn({ children }: { children: ReactNode }) {
  return <ClerkSignedIn>{children}</ClerkSignedIn>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return <ClerkSignedOut>{children}</ClerkSignedOut>;
}

/** Styled to match this app's Button primitive rather than Clerk's default button markup. */
export function AuthSignInButton() {
  return (
    <ClerkSignInButton mode="modal">
      <Button variant="secondary" size="sm">
        Sign in
      </Button>
    </ClerkSignInButton>
  );
}

export function AuthSignUpButton() {
  return (
    <ClerkSignUpButton mode="modal">
      <Button variant="primary" size="sm">
        Sign up
      </Button>
    </ClerkSignUpButton>
  );
}

/** The signed-in user's avatar menu (profile, manage account, sign out). */
export function AuthUserMenu() {
  return (
    <ClerkUserButton
      appearance={{
        elements: {
          avatarBox: "h-8 w-8",
        },
      }}
    />
  );
}

/** Full sign-in form, used on the dedicated /sign-in page. */
export function AuthSignInForm() {
  return <ClerkSignIn />;
}

/** Full sign-up form, used on the dedicated /sign-up page. */
export function AuthSignUpForm() {
  return <ClerkSignUp />;
}
